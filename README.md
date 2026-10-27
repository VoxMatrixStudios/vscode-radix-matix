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
  <img src="https://img.shields.io/badge/Version-2.2.1-cyan.svg" alt="Version 2.2.1">
  <img src="https://img.shields.io/badge/Language-Bilingual%20(es%2Fen)-brightgreen.svg" alt="Bilingual">
</p>

<p align="center">
  <a href="#-versión-en-español">Versión en Español abajo 🇪🇸</a>
</p>

---

## 🇺🇸 English

### ✨ Features

- 🎨 **Official Syntax Highlighting:** Full TextMate grammar for `.rm` files, covering keywords, math operators, strings, language headers (`#! es` / `#! en`) and module headers (`#! modulo medio` / `#! modulo bajo`).
- ⚡ **Real-Time Inline Diagnostics (Error Lens style):** Detects syntax and lexical errors as you type, highlighting the exact token and providing pedagogical advice on how to fix it without displaying raw tracebacks.
- ⌨️ **Bilingual Snippets:** Quick auto-complete snippets with tab stops for both Spanish and English workflows.
- 📁 **File & Language Icons:** Custom brand icons for Radix Matix files in the VS Code explorer.
- 🔵 **Module-aware highlighting & completions:** Keywords for Medium module (`constante`, `estructura`, `byte`, `xor`) and Low module (`reservar`, `liberar`, `memoria`, `empujar`, `sacar`) are suggested and highlighted contextually.
- 🖋️ **Formatted strings (text with variables):** Strings like `r"Hello {name}"` are highlighted with embedded expression coloring.
- ♿ **Accessible mode:** `#! accesible` header is recognized and supported.

### ⌨️ Snippets Cheat Sheet

| Prefix       | Description                  | Expands to                               |
| :----------- | :--------------------------- | :--------------------------------------- |
| `es`         | Spanish Header               | `#! es`                                  |
| `en`         | English Header               | `#! en`                                  |
| `modmedio`   | Medium Module Header (ES)    | `#! modulo medio`                        |
| `modmedium`  | Medium Module Header (EN)    | `#! module medium`                       |
| `modbajo`    | Low Module Header (ES)       | `#! modulo bajo`                         |
| `modlow`     | Low Module Header (EN)       | `#! module low`                          |
| `si`         | If conditional (ES)          | `si condicion:`                          |
| `if`         | If conditional (EN)          | `if condition:`                          |
| `sisi`       | If-Else statement (ES)       | `si condicion: ... sino: ...`            |
| `ifelse`     | If-Else statement (EN)       | `if condition: ... else: ...`            |
| `mientras`   | While loop (ES)              | `mientras condicion:`                    |
| `while`      | While loop (EN)              | `while condition:`                       |
| `para`       | For loop over collection     | `para elemento en coleccion:`            |
| `for`        | For loop over collection     | `for element in collection:`             |
| `fun`        | Function declaration (ES)    | `funcion nombre(args):`                  |
| `def`        | Function declaration (EN)    | `func name(args):`                       |
| `constante`  | Constant declaration (ES)    | `constante NOMBRE = valor`               |
| `const`      | Constant declaration (EN)    | `const NAME = value`                     |
| `estructura` | Structure definition (ES)    | `estructura Nombre:\n    campo: tipo`    |
| `struct`     | Structure definition (EN)    | `struct Name:\n    field: type`          |
| `imp`        | Print statement (ES)         | `imprimir(...)`                          |
| `pr`         | Print statement (EN)         | `print(...)`                             |
| `despejar`   | Linear solver (ES)           | `despejar("eq", "var")`                  |
| `solve`      | Linear solver (EN)           | `solve("eq", "var")`                     |
| `fstr`       | Formatted string             | `r"text {variable}"`                     |

### 🛠️ Configuration Settings

This extension contributes the following settings:

- `radixmatix.corePath`: Absolute path to the `src` directory of the Radix Matix compiler. If empty, diagnostics run silently if no core is detected.
- `radixmatix.pythonPath`: Python executable command or path (defaults to `python`).

---

## 🇪🇸 Versión en Español

### ✨ Características

- 🎨 **Resaltado de Sintaxis Oficial:** Gramática TextMate completa para archivos `.rm`, con soporte para palabras clave, operadores matemáticos, cadenas de texto, cabeceras bilingües (`#! es` / `#! en`) y cabeceras de módulo (`#! modulo medio` / `#! modulo bajo`).
- ⚡ **Diagnósticos en Tiempo Real (Estilo Error Lens):** Detección de errores sintácticos y léxicos mientras escribes, subrayando el punto exacto y mostrando consejos pedagógicos para corregirlos de forma limpia.
- ⌨️ **Snippets Bilingües:** Plantillas rápidas con autocompletado y saltos con `Tab` tanto en español como en inglés.
- 📁 **Icono Personalizado:** Iconos oficiales de Radix Matix para reconocer tus archivos en el explorador de VS Code.
- 🔵 **Resaltado y sugerencias por módulo:** Las palabras clave del módulo medio (`constante`, `estructura`, `byte`, `xor`) y del módulo bajo (`reservar`, `liberar`, `memoria`, `empujar`, `sacar`) se sugieren y resaltan según el nivel.
- 🖋️ **Texto con variables:** Las cadenas formateadas `r"Hola {nombre}"` se resaltan con coloreo de expresiones embebidas.
- ♿ **Modo accesible:** La cabecera `#! accesible` es reconocida y respetada.

### ⌨️ Tabla de Atajos (Snippets)

Escribe el prefijo y presiona `Tab` o `Enter`:

| Prefijo      | Descripción                      | Resultado                                |
| :----------- | :------------------------------- | :--------------------------------------- |
| `es`         | Cabecera en español              | `#! es`                                  |
| `en`         | Cabecera en inglés               | `#! en`                                  |
| `modmedio`   | Módulo medio                     | `#! modulo medio`                        |
| `modbajo`    | Módulo bajo                      | `#! modulo bajo`                         |
| `si`         | Condicional `si`                 | `si condicion:`                          |
| `sisi`       | Estructura `si - sino`           | `si condicion: ... sino: ...`            |
| `mientras`   | Bucle `mientras`                 | `mientras condicion:`                    |
| `para`       | Bucle `para` con colección       | `para elemento en coleccion:`            |
| `fun`        | Declaración de `funcion`         | `funcion nombre(args):`                  |
| `constante`  | Constante inmutable              | `constante NOMBRE = valor`               |
| `estructura` | Definición de `estructura`       | `estructura Nombre:\n    campo: tipo`    |
| `imp`        | Llamada a `imprimir()`           | `imprimir(...)`                          |
| `despejar`   | Llamada analítica a `despejar()` | `despejar("ecuacion", "variable")`       |
| `fstr`       | Texto con variables              | `r"texto {variable}"`                    |

### 🛠️ Configuración de la Extensión

- `radixmatix.corePath`: Ruta absoluta a la carpeta `src` del núcleo de Radix Matix.
- `radixmatix.pythonPath`: Comando o ruta a Python (`python` por defecto).

### 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más información.
