# Changelog - Radix Matix para VS Code

Todos los cambios notables de la extensión se documentan en este archivo.

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
