"""
rm_check.py — analizador que usa la extensión de VS Code.

Uso: python rm_check.py [--core RUTA]   (el código llega por stdin)
Imprime SIEMPRE un único objeto JSON:
  {"motor": true|false, "diagnosticos": [ {linea, columna, mensaje, tipo, gravedad}, ... ]}
Si el motor del lenguaje no se encuentra, "motor" es false y no hay diagnósticos:
la extensión sigue funcionando (colores y plantillas) sin mostrar errores falsos.
"""
import contextlib
import io
import json
import os
import re
import sys


def _buscar_nucleo():
    """Devuelve la carpeta con lexer.py, o None. Orden: --core, variable de entorno, carpeta hermana."""
    candidatos = []
    if "--core" in sys.argv:
        i = sys.argv.index("--core")
        if i + 1 < len(sys.argv) and sys.argv[i + 1]:
            candidatos.append(sys.argv[i + 1])
    if os.environ.get("RADIXMATIX_CORE"):
        candidatos.append(os.environ["RADIXMATIX_CORE"])
    aqui = os.path.dirname(os.path.abspath(__file__))
    candidatos.append(os.path.join(aqui, "..", "..", "Radix Matix", "src"))
    for ruta in candidatos:
        ruta = os.path.abspath(os.path.expanduser(ruta))
        if os.path.isfile(os.path.join(ruta, "lexer.py")):
            return ruta
    return None


def _diag(linea, columna, mensaje, tipo, gravedad="Error"):
    return {
        "linea": int(linea or 1),
        "columna": int(columna or 1),
        "mensaje": mensaje,
        "tipo": tipo,
        "gravedad": gravedad,
    }


def _texto(err):
    """Mensaje limpio de un ErrorRadix, sin la caja ASCII."""
    msg = getattr(err, "mensaje", None) or str(err).strip().splitlines()[-1]
    consejo = getattr(err, "consejo", "")
    return f"{msg} ({consejo})" if consejo else msg


_AVISO = re.compile(r"Aviso \[(\d+):(\d+)\]:\s*(.*)")


def _avisos_de_salida(texto):
    """Convierte las líneas 'Aviso [l:c]: ...' que imprime el lexer en diagnósticos."""
    out = []
    for linea in texto.splitlines():
        m = _AVISO.search(linea)
        if m:
            out.append(_diag(m.group(1), m.group(2), m.group(3), "Aviso de Idioma", "Warning"))
    return out


def analizar(codigo, ruta_nucleo):
    sys.path.insert(0, ruta_nucleo)
    from lexer import Lexer  # type: ignore  (el núcleo se carga en tiempo de ejecución)
    from parser import Parser  # type: ignore  (el núcleo se carga en tiempo de ejecución)
    from errores import ErrorRadix  # type: ignore  (el núcleo se carga en tiempo de ejecución)

    diagnosticos = []
    capturado = io.StringIO()

    with contextlib.redirect_stdout(capturado):
        try:
            lexer = Lexer(codigo)
            tokens = lexer.tokenize()
        except ErrorRadix as err:
            return [_diag(err.linea, err.columna, _texto(err), err.tipo)] + _avisos_de_salida(capturado.getvalue())
        except Exception as err:
            return [_diag(1, 1, str(err), "Error Léxico")]

        try:
            ast = Parser(tokens, lineas=codigo.splitlines()).parse()
        except ErrorRadix as err:
            diagnosticos.append(_diag(err.linea, err.columna, _texto(err), err.tipo))
            ast = None
        except Exception as err:
            diagnosticos.append(_diag(1, 1, str(err), "Error de Sintaxis"))
            ast = None

    diagnosticos.extend(_avisos_de_salida(capturado.getvalue()))

    if ast is not None:
        try:
            diagnosticos.extend(_verificar_niveles(ast, lexer))
        except Exception:
            pass
    return diagnosticos


def _verificar_niveles(ast, lexer):
    from errores import ErrorRadix  # type: ignore  (el núcleo se carga en tiempo de ejecución)
    from niveles import CARACTERISTICAS, exigir_nivel  # type: ignore  (el núcleo se carga en tiempo de ejecución)
    from ast_nodes import (DeclaracionTipada, DeclaracionConstante,  # type: ignore
                           DefinicionEstructura, LlamadaFuncion,
                           OperacionBinaria, OperacionUnaria)

    nivel = getattr(lexer, "nivel", None)
    idioma = getattr(lexer, "language", "es")
    if nivel is None:
        return []
    encontrados = []

    def exigir(nombre):
        try:
            exigir_nivel(nivel, nombre, idioma=idioma)
        except ErrorRadix as err:
            # Línea 0 = el AST aún no guarda posiciones (se arregla en la v2.3).
            encontrados.append(_diag(err.linea or 1, err.columna or 1, _texto(err), err.tipo))

    def visitar(nodo):
        if isinstance(nodo, DeclaracionTipada):
            exigir(nodo.tipo_nombre if nodo.tipo_nombre in CARACTERISTICAS else "constante")
        elif isinstance(nodo, DeclaracionConstante):
            exigir("constante")
        elif isinstance(nodo, DefinicionEstructura):
            exigir("estructura")
        elif isinstance(nodo, LlamadaFuncion):
            if nodo.nombre in CARACTERISTICAS:
                exigir(nodo.nombre)
        elif isinstance(nodo, (OperacionBinaria, OperacionUnaria)):
            if nodo.operador in CARACTERISTICAS:
                exigir(nodo.operador)
        # Nota: ya no se revisa `Variable` suelta (daba falsos errores con
        # nombres como `byte` o `pop`). Es el error B2 del lenguaje.
        for val in getattr(nodo, "__dict__", {}).values():
            if isinstance(val, list):
                for item in val:
                    if hasattr(item, "__dict__"):
                        visitar(item)
            elif hasattr(val, "__dict__"):
                visitar(val)

    visitar(ast)
    return encontrados


def main():
    contenido = sys.stdin.read()
    ruta = _buscar_nucleo()
    if ruta is None:
        resultado = {"motor": False, "diagnosticos": []}
    else:
        try:
            resultado = {"motor": True, "diagnosticos": analizar(contenido, ruta)}
        except Exception as err:  # fallo inesperado: no mostrar nada falso
            resultado = {"motor": True, "diagnosticos": [], "fallo": f"{type(err).__name__}: {err}"}
    sys.stdout.write(json.dumps(resultado, ensure_ascii=False))


if __name__ == "__main__":
    main()
