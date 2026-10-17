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
    if hasattr(lexer, "avisos"):
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
    try:
        parser = Parser(tokens, idioma=lexer.language)
        parser.parse()
    except Exception as err:
        linea = 1
        columna = 1
        if hasattr(parser, "current_token") and parser.current_token:
            linea = getattr(parser.current_token, "line", 1)
            columna = getattr(parser.current_token, "column", 1)
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


if __name__ == "__main__":
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            contenido = f.read()
    else:
        contenido = sys.stdin.read()

    resultados = analizar(contenido)
    print(json.dumps(resultados, ensure_ascii=False))
