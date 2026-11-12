# Changelog - Radix Matix para VS Code

Todos los cambios notables de la extensión se documentan en este archivo.

## [2.2.6] - 2026-11-12

### Añadido

- **Cabecera de la v3:** la línea `#! version 3.0` se colorea como el resto de la cabecera, y hay un fragmento nuevo (`version`) para escribirla.

### Cambiado

- El autocompletado por módulo (`#! modulo medio|bajo`) lee ahora toda la cabecera hasta la primera línea de código, no solo las primeras 4 líneas, porque en la v3 las líneas `#!` pueden ir en cualquier orden.

## [2.2.5] - 2026-11-11

### Añadido

- Al pulsar Enter después de una línea que termina en `:` (`si`, `para`, `funcion`...) el editor sangra automáticamente.

### Cambiado

- Los errores se subrayan completos (el token entero), no solo 1 carácter o una palabra.
- Los errores de nivel (por ejemplo usar `<<` en el módulo alto) se marcan en su línea real y no en la línea 1. Requiere el lenguaje 2.2.6 o superior.
- La gramática ya no pinta `entero(...)` como tipo cuando se usa como función, ni una variable llamada `e` como constante matemática. Se quitó `function`, que no es palabra clave.

## [2.2.4] - 2026-11-10

### Añadido

- Resaltado de textos con comillas simples: `'hola'`, `'dijo "hola"'`.
- Resaltado de textos con variables con comillas simples: `r'Hola {nombre}'`.
- Cierre automático y envoltura (`surroundingPairs`) de la comilla simple, sin duplicarla dentro de textos y comentarios.
- Secciones de instalación, solución de problemas y enlaces en el README.

### Cambiado

- `.gitignore` ignora todos los `*.vsix` (el paquete ya no se guarda en el repositorio).

## [2.2.3]

### Cambiado

- Corrección del README y de los campos del `package.json`.
- Los diagnósticos se desactivan en carpetas no confiables.

## [2.2.2]

### Añadido

- Autocompletado filtrado por la cabecera `#! modulo alto|medio|bajo`.

## [2.2.1]

### Añadido

- Diagnósticos en tiempo real con `rm_check.py` (validados por documento, con tiempo límite de 5 s).
- Ajustes `radixmatix.corePath`, `radixmatix.pythonPath` y `radixmatix.diagnosticos`.

### Corregido

- Snippets bilingües (`func`, marcadores en `para`, `for`, `cada`, `every`, `despues`).
