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
  <img src="https://img.shields.io/badge/Version-2.2.3-cyan.svg" alt="Version 2.2.3">
  <img src="https://img.shields.io/badge/Language-Bilingual%20(es%2Fen)-brightgreen.svg" alt="Bilingual">
</p>

<p align="center">
  <a href="#-versión-en-español">Versión en Español abajo 🇪🇸</a>
</p>

---

## 🇺🇸 English

### ✨ Features

- 🎨 **Official Syntax Highlighting:** Full TextMate grammar for `.rm` files, covering keywords, math operators, strings, language headers (`#! es` / `#! en`) and module headers (`#! modulo medio` / `#! modulo bajo`).
- ⚡ **Real-Time Inline Diagnostics (Error Lens style):** Detects syntax and lexical errors as you type, underlines the problem and gives pedagogical advice on how to fix it. Requires the Radix Matix core (see Requirements).
- ⌨️ **Bilingual Snippets:** Quick auto-complete snippets for both Spanish and English workflows.
- 📁 **Language icon:** Radix Matix icon for `.rm` files (some file-icon themes override it).
- 🔵 **Module-aware highlighting:** Keywords for Medium module (`constante`, `estructura`, `byte`, `xor`) and Low module (`reservar`, `liberar`, `memoria`, `empujar`, `sacar`) are highlighted when their module header is present.
- 🖋️ **Text with variables (`r"..."`):** Formatted strings `r"Hello {name}"` are highlighted with embedded expression coloring.
- ♿ **Accessible mode:** `#! accesible` header is recognized and highlighted.

### ⌨️ Snippets Cheat Sheet

| Prefix       | Description                  | Expands to                            |
| :----------- | :--------------------------- | :------------------------------------ |
| `es`         | Spanish header               | `#! es`                               |
| `en`         | English header               | `#! en`                               |
| `modmedium`  | Medium module header         | `#! module medium`                    |
| `modlow`     | Low module header            | `#! module low`                       |
| `if`         | If conditional               | `if condition:`                       |
| `ifelse`     | If-else statement            | `if condition: ... else: ...`         |
| `while`      | While loop                   | `while condition:`                    |
| `for`        | For loop over range          | `for i in range(1, 10):`              |
| `def`        | Function declaration         | `func name(args):`                    |
| `every`      | Repeating timer              | `every 1s:`                           |
| `after`      | One-shot timer               | `after 1s:`                           |
| `pr`         | Print                        | `print(...)`                          |
| `solve`      | Linear solver                | `solve("eq", "var")`                  |
| `const`      | Constant (medium module)     | `const NAME = value`                  |
| `struct`     | Structure (medium module)    | `struct Name:\n    field: type`      |
| `allocate`   | Allocate memory (low module) | `ptr = allocate(n) ... free(ptr)`     |

> Tip: type the prefix and press `Ctrl+Space` (or `Enter` on the suggestion). To expand with `Tab`, enable `"editor.tabCompletion": "on"` in your VS Code settings.

### 🛠️ Requirements

- Python 3.11 or higher installed on your system.
- Highlighting and snippets work on their own. To get real-time diagnostics, set `radixmatix.corePath` to the `src` folder of the Radix Matix language (where `lexer.py` is). Without it, diagnostics stay off and you see a one-time notice.
- Optional: `radixmatix.pythonPath` (Python executable, e.g. `python`, `python3` or `py`) and `radixmatix.diagnosticos` (turn diagnostics on/off).
- Diagnostics are disabled in untrusted workspaces.

---

## 🇪🇸 Versión en Español

### ✨ Características

- 🎨 **Resaltado de Sintaxis Oficial:** Gramática TextMate completa para archivos `.rm`, con soporte para palabras clave, operadores matemáticos, cadenas de texto, cabeceras bilingües (`#! es` / `#! en`) y cabeceras de módulo (`#! modulo medio` / `#! modulo bajo`).
- ⚡ **Diagnósticos en Tiempo Real (Estilo Error Lens):** Detección de errores sintácticos y léxicos mientras escribes, subrayando el problema y mostrando consejos pedagógicos para corregirlos. Requiere el núcleo de Radix Matix (ver Requisitos).
- ⌨️ **Snippets Bilingües:** Plantillas rápidas en español y en inglés.
- 📁 **Ícono del lenguaje:** ícono de Radix Matix para los archivos `.rm` (algunos temas de íconos lo reemplazan).
- 🔵 **Resaltado por módulo:** Las palabras clave del módulo medio (`constante`, `estructura`, `byte`, `xor`) y del módulo bajo (`reservar`, `liberar`, `memoria`, `empujar`, `sacar`) se resaltan cuando está presente la cabecera del módulo.
- 🖋️ **Texto con variables:** Las cadenas formateadas `r"Hola {nombre}"` se resaltan con coloreo de expresiones embebidas.
- ♿ **Modo accesible:** La cabecera `#! accesible` es reconocida y resaltada.

### ⌨️ Tabla de Atajos (Snippets)

Escribe el prefijo y presiona `Ctrl+Espacio` (o `Enter` sobre la sugerencia). Para expandir con `Tab`, activa `"editor.tabCompletion": "on"` en los ajustes de VS Code.

| Prefijo      | Descripción                      | Resultado                             |
| :----------- | :------------------------------- | :------------------------------------ |
| `es`         | Cabecera en español              | `#! es`                               |
| `en`         | Cabecera en inglés               | `#! en`                               |
| `modmedio`   | Módulo medio                     | `#! modulo medio`                     |
| `modbajo`    | Módulo bajo                      | `#! modulo bajo`                      |
| `si`         | Condicional `si`                 | `si condicion:`                       |
| `sisi`       | Estructura `si - sino`           | `si condicion: ... sino: ...`         |
| `mientras`   | Bucle `mientras`                 | `mientras condicion:`                 |
| `para`       | Bucle `para` con rango           | `para i en rango(1, 10):`             |
| `fun`        | Declaración de `funcion`         | `funcion nombre(args):`               |
| `cada`       | Temporizador repetitivo          | `cada 1s:`                            |
| `despues`    | Temporizador de una sola vez     | `despues de 1s:`                      |
| `imp`        | Llamada a `imprimir()`           | `imprimir(...)`                       |
| `despejar`   | Llamada analítica a `despejar()` | `despejar("ecuacion", "variable")`    |
| `constante`  | Constante (módulo medio)         | `constante NOMBRE = valor`            |
| `estructura` | Estructura (módulo medio)        | `estructura Nombre:\n    campo: tipo` |
| `reservar`   | Reservar memoria (módulo bajo)   | `ptr = reservar(n) ... liberar(ptr)`  |

### 🛠️ Requisitos

- Python 3.11 o superior.
- El resaltado y las plantillas funcionan solos. Para ver errores mientras escribes, indica en `radixmatix.corePath` la carpeta `src` del lenguaje (donde está `lexer.py`). Sin eso los diagnósticos quedan apagados y verás un aviso una sola vez.
- Opcional: `radixmatix.pythonPath` (ejecutable de Python, por ejemplo `python`, `python3` o `py`) y `radixmatix.diagnosticos` (activar o desactivar).
- Los diagnósticos se desactivan en carpetas no confiables.

### 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más información.