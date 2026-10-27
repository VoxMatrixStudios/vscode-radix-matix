import sys
import os
import json
import io
import contextlib
import re

# Configuración de rutas para encontrar el núcleo de Radix Matix
# 1. Si se pasa una ruta explícita por argumento o variable de entorno
# 2. O en una carpeta hermana '../Radix Matix/src' (típico clon de desarrollo)
rutas_candidatas = []
if len(sys.argv) > 2 and sys.argv[2]:
    rutas_candidatas.append(sys.argv[2])

env_core = os.environ.get("RADIXMATIX_CORE_PATH")
if env_core:
    rutas_candidatas.append(env_core)

rutas_candidatas.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Radix Matix", "src"))
)

for ruta in rutas_candidatas:
    if ruta and os.path.exists(ruta) and ruta not in sys.path:
        sys.path.insert(0, ruta)


def extraer_mensaje_limpio(err) -> tuple[str, str | None]:
    """
    Extrae (mensaje, consejo) limpios sin la caja ASCII decorativa.
    Si err es ErrorRadix o similar, usa sus atributos directos.
    Si es un str con caja ASCII, extrae "¿Qué pasó?" y "Cómo fijar:".
    """
    mensaje = getattr(err, "mensaje", None)
    consejo = getattr(err, "consejo", None)

    if mensaje:
        return str(mensaje).strip(), str(consejo).strip() if consejo else None

    texto = str(err)
    # Si viene con la caja ╔═══════════════════ ... ╚═══════════════════╝
    if "¿Qué pasó?" in texto:
        match_paso = re.search(r"¿Qué pasó\?\s*(.*?)(?=\n\s*Cómo fijar:|\n\s*Ejemplo correcto:|\n╚|\Z)", texto, re.DOTALL)
        match_fijar = re.search(r"Cómo fijar:\s*(.*?)(?=\n\s*Ejemplo correcto:|\n╚|\Z)", texto, re.DOTALL)
        
        msg_limpio = match_paso.group(1).strip() if match_paso else texto.strip()
        consejo_limpio = match_fijar.group(1).strip() if match_fijar else None
        return msg_limpio, consejo_limpio

    return texto.strip(), None


def analizar(codigo: str) -> list:
    diagnosticos = []

    # E1: Si no se encuentra el núcleo, desactivar diagnósticos en silencio
    try:
        from lexer import Lexer
        from parser import Parser
        from errores import ErrorRadix
    except ImportError:
        # Modo silencioso: no pintar error rojo en todo el archivo a quien no tenga el compilador instalado
        return []

    # E2: Redirigir stdout para capturar avisos sin romper la salida JSON
    buffer_stdout = io.StringIO()
    tokens = None
    lexer = None

    with contextlib.redirect_stdout(buffer_stdout):
        # 1. Análisis Léxico
        lexer = Lexer(codigo)
        try:
            tokens = lexer.tokenize()
        except ErrorRadix as err:
            msg, cons = extraer_mensaje_limpio(err)
            diagnosticos.append({
                "linea": getattr(err, "linea", 1),
                "columna": getattr(err, "columna", 1),
                "mensaje": f"{msg} (Consejo: {cons})" if cons else msg,
                "tipo": getattr(err, "tipo", "Error Léxico"),
                "gravedad": "Error",
            })
            return diagnosticos
        except Exception as err:
            msg, cons = extraer_mensaje_limpio(err)
            diagnosticos.append({
                "linea": getattr(lexer, "line", 1),
                "columna": getattr(lexer, "column", 1),
                "mensaje": f"{msg} (Consejo: {cons})" if cons else msg,
                "tipo": "Error Léxico",
                "gravedad": "Error",
            })
            return diagnosticos

    # E2: Procesar avisos capturados de stdout (ej. 'print' en español) y del lexer
    salida_avisos = buffer_stdout.getvalue()
    if salida_avisos:
        for linea_aviso in salida_avisos.strip().splitlines():
            linea_aviso = linea_aviso.strip()
            if not linea_aviso:
                continue
            # Intentar extraer línea y columna si viene en formato "Aviso [linea:columna]: ..."
            match_pos = re.search(r"Aviso\s*\[(\d+):(\d+)\]:\s*(.*)", linea_aviso)
            if match_pos:
                lin = int(match_pos.group(1))
                col = int(match_pos.group(2))
                txt = match_pos.group(3)
            else:
                lin, col, txt = 1, 1, linea_aviso

            diagnosticos.append({
                "linea": lin,
                "columna": col,
                "mensaje": txt,
                "tipo": "Aviso de Idioma",
                "gravedad": "Warning",
            })

    if hasattr(lexer, "avisos") and isinstance(lexer.avisos, list):
        for aviso in lexer.avisos:
            diagnosticos.append({
                "linea": 1,
                "columna": 1,
                "mensaje": aviso,
                "tipo": "Aviso de Idioma",
                "gravedad": "Warning",
            })

    # 3. Análisis Sintáctico (Parser)
    parser = None
    ast = None
    buffer_parser = io.StringIO()
    with contextlib.redirect_stdout(buffer_parser):
        try:
            parser = Parser(tokens)
            ast = parser.parse()
        except Exception as err:
            linea = 1
            columna = 1
            if parser is not None:
                tok = parser.current_token() if callable(parser.current_token) else parser.current_token
                if tok:
                    linea = getattr(tok, "line", 1)
                    columna = getattr(tok, "column", 1)

            # E3: Extraer mensaje limpio sin la caja ASCII
            msg, cons = extraer_mensaje_limpio(err)
            diagnosticos.append({
                "linea": linea,
                "columna": columna,
                "mensaje": f"{msg} (Consejo: {cons})" if cons else msg,
                "tipo": getattr(err, "tipo", "Error de Sintaxis"),
                "gravedad": "Error",
            })
            return diagnosticos

    # 4. Verificación estática de niveles de abstracción
    try:
        from niveles import CARACTERISTICAS, exigir_nivel
        from ast_nodes import (
            DeclaracionTipada, DeclaracionConstante, DefinicionEstructura,
            Variable, LlamadaFuncion, OperacionBinaria, OperacionUnaria
        )

        nivel_doc = getattr(lexer, "nivel", None)
        if nivel_doc is not None and ast is not None:
            def verificar_nodo(nodo):
                if isinstance(nodo, DeclaracionTipada):
                    caract = nodo.tipo_nombre if nodo.tipo_nombre in CARACTERISTICAS else "constante"
                    exigir_nivel(nivel_doc, caract, idioma=getattr(lexer, "language", "es"))
                elif isinstance(nodo, DeclaracionConstante):
                    exigir_nivel(nivel_doc, "constante", idioma=getattr(lexer, "language", "es"))
                elif isinstance(nodo, DefinicionEstructura):
                    exigir_nivel(nivel_doc, "estructura", idioma=getattr(lexer, "language", "es"))
                elif isinstance(nodo, Variable):
                    if nodo.nombre in CARACTERISTICAS:
                        exigir_nivel(nivel_doc, nodo.nombre, idioma=getattr(lexer, "language", "es"))
                elif isinstance(nodo, LlamadaFuncion):
                    if nodo.nombre in CARACTERISTICAS:
                        exigir_nivel(nivel_doc, nodo.nombre, idioma=getattr(lexer, "language", "es"))
                elif isinstance(nodo, OperacionBinaria):
                    if nodo.operador in CARACTERISTICAS:
                        exigir_nivel(nivel_doc, nodo.operador, idioma=getattr(lexer, "language", "es"))
                elif isinstance(nodo, OperacionUnaria):
                    if nodo.operador in CARACTERISTICAS:
                        exigir_nivel(nivel_doc, nodo.operador, idioma=getattr(lexer, "language", "es"))

                for attr, val in getattr(nodo, "__dict__", {}).items():
                    if isinstance(val, list):
                        for item in val:
                            if hasattr(item, "__dict__"):
                                verificar_nodo(item)
                    elif hasattr(val, "__dict__"):
                        verificar_nodo(val)

            verificar_nodo(ast)
    except ErrorRadix as err:
        msg, cons = extraer_mensaje_limpio(err)
        diagnosticos.append({
            "linea": getattr(err, "linea", 1),
            "columna": getattr(err, "columna", 1),
            "mensaje": f"{msg} (Consejo: {cons})" if cons else msg,
            "tipo": getattr(err, "tipo", "Nivel"),
            "gravedad": "Error",
        })
    except Exception:
        pass

    return diagnosticos


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] != "-" and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            contenido = f.read()
    else:
        contenido = sys.stdin.read()

    resultados = analizar(contenido)
    print(json.dumps(resultados, ensure_ascii=False))
