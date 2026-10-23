<p align="center">
  <img src="icons/logo-presentacion.png" alt="Radix Matix Logo" width="220" />
</p>

<h1 align="center">Radix Matix for Visual Studio Code</h1>

<p align="center">
  <strong>Official Visual Studio Code extension for the Radix Matix programming language (<code>.rm</code>).</strong><br>
  <em>Syntax highlighting, bilingual snippets, module-aware coloring, and real-time inline pedagogical diagnostics.</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT"></a>
  <img src="https://img.shields.io/badge/Version-2.2.0-cyan.svg" alt="Version 2.2.0">
  <img src="https://img.shields.io/badge/Language-Bilingual%20(es%2Fen)-brightgreen.svg" alt="Bilingual">
</p>

<p align="center">
  <a href="#-versión-en-español">Versión en Español abajo 🇪🇸</a>
</p>

---

## 🇺🇸 English

### ✨ Features

- 🎨 **Official Syntax Highlighting:** Full TextMate grammar for `.rm` files, covering keywords, math operators, strings, language headers (`#! es` / `#! en`) and module headers (`#! modulo medio` / `#! modulo bajo`).
- ⚡ **Real-Time Inline Diagnostics (Error Lens style):** Detects syntax and lexical errors as you type, highlighting the exact token and providing pedagogical advice on how to fix it.
- ⌨️ **Bilingual Snippets:** Quick auto-complete snippets for both Spanish and English workflows.
- 📁 **File & Language Icons:** Custom brand icons for Radix Matix files in the VS Code explorer.
- 🔵 **Module-aware highlighting:** Keywords for Medium module (`constante`, `estructura`, `byte`, `xor`) and Low module (`reservar`, `liberar`, `memoria`, `empujar`, `sacar`) are highlighted when their module header is present.
- 🖋️ **F-string support:** Formatted strings `r"Hello {name}"` are highlighted with embedded expression coloring.
- ♿ **Accessible mode:** `#! accesible` header is recognized and highlighted.

### ⌨️ Snippets Cheat Sheet

| Prefix       | Description                  | Expands to                            |
| :----------- | :--------------------------- | :------------------------------------ |
| `es`         | Spanish Header               | `#! es`                               |
| `en`         | English Header               | `#! en`                               |
| `medio`      | Medium Module Header (ES)    | `#! modulo medio`                     |
| `bajo`       | Low Module Header (ES)       | `#! modulo bajo`                      |
| `si`         | If conditional (ES)          | `si condicion:`                       |
| `if`         | If conditional (EN)          | `if condition:`                       |
| `sisi`       | If-Else statement (ES)       | `si condicion: ... sino: ...`         |
| `ifelse`     | If-Else statement (EN)       | `if condition: ... else: ...`         |
| `mientras`   | While loop (ES)              | `mientras condicion:`                 |
| `while`      | While loop (EN)              | `while condition:`                    |
| `para`       | For loop over range (ES)     | `para i en rango(0, n):`              |
| `for`        | For loop over range (EN)     | `for i in range(0, n):`               |
| `fun`        | Function declaration (ES)    | `funcion nombre(args):`               |
| `def`        | Function declaration (EN)    | `function name(args):`                |
| `struct`     | Structure definition (ES)    | `estructura Nombre:\n    campo: tipo` |
| `imp`        | Print statement (ES)         | `imprimir(...)`                       |
| `pr`         | Print statement (EN)         | `print(...)`                          |
| `despejar`   | Linear solver (ES)           | `despejar("eq", "var")`               |
| `solve`      | Linear solver (EN)           | `solve("eq", "var")`                  |
| `fstr`       | Formatted string             | `r"{variable}"`                       |

### 🛠️ Requirements

- Python 3.11 or higher installed on your system.
- The Radix Matix core repository cloned alongside this extension.

---

## 🇪🇸 Versión en Español

### ✨ Características

- 🎨 **Resaltado de Sintaxis Oficial:** Gramática TextMate completa para archivos `.rm`, con soporte para palabras clave, operadores matemáticos, cadenas de texto, cabeceras bilingües (`#! es` / `#! en`) y cabeceras de módulo (`#! modulo medio` / `#! modulo bajo`).
- ⚡ **Diagnósticos en Tiempo Real (Estilo Error Lens):** Detección de errores sintácticos y léxicos mientras escribes, subrayando el punto exacto y mostrando consejos pedagógicos para corregirlos.
- ⌨️ **Snippets Bilingües:** Plantillas rápidas con autocompletado con tecla `Tab` tanto en español como en inglés.
- 📁 **Icono Personalizado:** Iconos oficiales de Radix Matix para reconocer tus archivos en el explorador de VS Code.
- 🔵 **Resaltado por módulo:** Las palabras clave del módulo medio (`constante`, `estructura`, `byte`, `xor`) y del módulo bajo (`reservar`, `liberar`, `memoria`, `empujar`, `sacar`) se resaltan cuando está presente la cabecera del módulo.
- 🖋️ **Soporte de f-strings:** Las cadenas formateadas `r"Hola {nombre}"` se resaltan con coloreo de expresiones embebidas.
- ♿ **Modo accesible:** La cabecera `#! accesible` es reconocida y resaltada.

### ⌨️ Tabla de Atajos (Snippets)

Escribe el prefijo y presiona `Tab` o `Enter`:

| Prefijo      | Descripción                      | Resultado                             |
| :----------- | :------------------------------- | :------------------------------------ |
| `es`         | Cabecera en español              | `#! es`                               |
| `en`         | Cabecera en inglés               | `#! en`                               |
| `medio`      | Módulo medio                     | `#! modulo medio`                     |
| `bajo`       | Módulo bajo                      | `#! modulo bajo`                      |
| `si`         | Condicional `si`                 | `si condicion:`                       |
| `sisi`       | Estructura `si - sino`           | `si condicion: ... sino: ...`         |
| `mientras`   | Bucle `mientras`                 | `mientras condicion:`                 |
| `para`       | Bucle `para` con rango           | `para i en rango(0, n):`              |
| `fun`        | Declaración de `funcion`         | `funcion nombre(args):`               |
| `struct`     | Definición de `estructura`       | `estructura Nombre:\n    campo: tipo` |
| `imp`        | Llamada a `imprimir()`           | `imprimir(...)`                       |
| `despejar`   | Llamada analítica a `despejar()` | `despejar("ecuacion", "variable")`    |
| `fstr`       | Cadena formateada                | `r"{variable}"`                       |

### 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más información.
