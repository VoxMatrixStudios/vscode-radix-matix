import sys
import os
import json


posibles_rutas = [
    r"c:\Proyectos\Radix Matix\Radix Matix\src",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Radix Matix", "src")),
]

for ruta in posibles_rutas:
    if os.path.exists(ruta) and ruta not in sys.path:
        sys.path.insert(0, ruta)


def analizar(codigo: str) -> list:
    diagnosticos = []

    try:
        from lexer import Lexer
        from parser import Parser
        from errores import ErrorRadix
    except ImportError as e:
        return [
            {
                "linea": 1,
                "columna": 1,
                "mensaje": f"No se pudo cargar el motor de Radix Matix: {e}",
                "tipo": "Error de Configuración",
                "gravedad": "Error",
            }
        ]

    # 1. Análisis Léxico
    lexer = Lexer(codigo)
    try:
        tokens = lexer.tokenize()
    except ErrorRadix as err:
        diagnosticos.append(
            {
                "linea": err.linea,
                "columna": err.columna,
                "mensaje": (
                    f"{err.mensaje} (Consejo: {err.consejo})"
                    if getattr(err, "consejo", None)
                    else err.mensaje
                ),
                "tipo": err.tipo,
                "gravedad": "Error",
            }
        )
        return diagnosticos
    except Exception as err:
        diagnosticos.append(
            {
                "linea": getattr(lexer, "line", 1),
                "columna": getattr(lexer, "column", 1),
                "mensaje": str(err),
                "tipo": "Error Léxico",
                "gravedad": "Error",
            }
        )
        return diagnosticos

    # 2. Avisos detectados por el lexer (ej. palabras en otro idioma)
    if hasattr(lexer, "avisos") and isinstance(lexer.avisos, list):
        for aviso in lexer.avisos:
            diagnosticos.append(
                {
                    "linea": 1,
                    "columna": 1,
                    "mensaje": aviso,
                    "tipo": "Aviso de Idioma",
                    "gravedad": "Warning",
                }
            )

    # 3. Análisis Sintáctico (Parser)
    parser = None
    ast = None
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
        diagnosticos.append(
            {
                "linea": linea,
                "columna": columna,
                "mensaje": str(err),
                "tipo": "Error de Sintaxis",
                "gravedad": "Error",
            }
        )
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
        diagnosticos.append(
            {
                "linea": getattr(err, "linea", 1),
                "columna": getattr(err, "columna", 1),
                "mensaje": (
                    f"{err.mensaje} (Consejo: {err.consejo})"
                    if getattr(err, "consejo", None)
                    else err.mensaje
                ),
                "tipo": err.tipo,
                "gravedad": "Error",
            }
        )
    except Exception:
        pass

    return diagnosticos


if __name__ == "__main__":
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            contenido = f.read()
    else:
        contenido = sys.stdin.read()

    resultados = analizar(contenido)
    print(json.dumps(resultados, ensure_ascii=False))
