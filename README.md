<p align="center">
  <img src="icons/logo-presentacion.png" alt="Radix Matix Logo" width="220" />
</p>

<h1 align="center">Radix Matix for Visual Studio Code</h1>

<p align="center">
  <strong>Official Visual Studio Code extension for the Radix Matix programming language (<code>.rm</code>).</strong><br>
  <em>Syntax highlighting, bilingual snippets, and real-time inline pedagogical diagnostics.</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT"></a>
  <img src="https://img.shields.io/badge/Version-1.0.0-cyan.svg" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/Language-Bilingual%20(es%2Fen)-brightgreen.svg" alt="Bilingual">
</p>

<p align="center">
  <a href="#-versión-en-español">Versión en Español abajo 🇪🇸</a>
</p>

---

## 🇺🇸 English

### ✨ Features

- 🎨 **Official Syntax Highlighting:** Full TextMate grammar for `.rm` files, covering keywords, math operators, strings, and language headers (`#! es` / `#! en`).
- ⚡ **Real-Time Inline Diagnostics (Error Lens style):** Detects syntax and lexical errors as you type, highlighting the exact token and providing pedagogical advice on how to fix it.
- ⌨️ **Bilingual Snippets:** Quick auto-complete snippets for both Spanish and English workflows.
- 📁 **File & Language Icons:** Custom brand icons for Radix Matix files in the VS Code explorer.

### ⌨️ Snippets Cheat Sheet

| Prefix     | Description               | Expands to                    |
| :--------- | :------------------------ | :---------------------------- |
| `es`       | Spanish Header            | `#! es`                       |
| `en`       | English Header            | `#! en`                       |
| `si`       | If conditional (ES)       | `si condicion:`               |
| `if`       | If conditional (EN)       | `if condition:`               |
| `sisi`     | If-Else statement (ES)    | `si condicion: ... sino: ...` |
| `ifelse`   | If-Else statement (EN)    | `if condition: ... else: ...` |
| `mientras` | While loop (ES)           | `mientras condicion:`         |
| `while`    | While loop (EN)           | `while condition:`            |
| `fun`      | Function declaration (ES) | `funcion nombre(args):`       |
| `def`      | Function declaration (EN) | `function name(args):`        |
| `imp`      | Print statement (ES)      | `imprimir(...)`               |
| `pr`       | Print statement (EN)      | `print(...)`                  |
| `despejar` | Linear solver (ES)        | `despejar("eq", "var")`       |
| `solve`    | Linear solver (EN)        | `solve("eq", "var")`          |

### 🛠️ Requirements

- Python 3.11 or higher installed on your system.
- The Radix Matix core repository cloned alongside this extension.

---

## 🇪🇸 Versión en Español

### ✨ Características

- 🎨 **Resaltado de Sintaxis Oficial:** Gramática TextMate completa para archivos `.rm`, con soporte para palabras clave, operadores matemáticos, cadenas de texto y cabeceras bilingües (`#! es` / `#! en`).
- ⚡ **Diagnósticos en Tiempo Real (Estilo Error Lens):** Detección de errores sintácticos y léxicos mientras escribes, subrayando el punto exacto y mostrando consejos pedagógicos para corregirlos.
- ⌨️ **Snippets Bilingües:** Plantillas rápidas con autocompletado con tecla `Tab` tanto en español como en inglés.
- 📁 **Icono Personalizado:** Iconos oficiales de Radix Matix para reconocer tus archivos en el explorador de VS Code.

### ⌨️ Tabla de Atajos (Snippets)

Escribe el prefijo y presiona `Tab` o `Enter`:

- `es` → Inserta la cabecera `#! es`
- `en` → Inserta la cabecera `#! en`
- `si` → Estructura condicional `si`
- `sisi` → Estructura `si - sino`
- `mientras` → Bucle `mientras`
- `fun` → Declaración de `funcion`
- `imp` → Llamada a `imprimir()`
- `despejar` → Llamada analítica a `despejar()`

### 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más información.
