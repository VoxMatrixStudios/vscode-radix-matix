const vscode = require('vscode');
const path = require('path');
const { validarDocumento } = require('./validador');

let temporizadorDiagnostico = null;

// ── Catálogos por nivel ──────────────────────────────────────────────────────
// E11: IntelliSense filtrado contextualmente según la cabecera del módulo.

// Módulo Alto (ES + EN): funciones y keywords disponibles en cualquier archivo.
const ELEMENTOS_ALTO = [
    // I/O
    { label: 'imprimir', kind: vscode.CompletionItemKind.Function, detail: 'imprimir(mensaje)',          doc: 'Imprime un valor o texto en pantalla.' },
    { label: 'print',    kind: vscode.CompletionItemKind.Function, detail: 'print(message)',             doc: 'Prints a value or message to the screen.' },
    { label: 'leer',     kind: vscode.CompletionItemKind.Function, detail: 'leer(mensaje)',              doc: 'Lee una entrada del usuario desde la terminal.' },
    { label: 'input',    kind: vscode.CompletionItemKind.Function, detail: 'input(prompt)',              doc: 'Reads user input from the terminal.' },
    { label: 'ingresar', kind: vscode.CompletionItemKind.Function, detail: 'ingresar(mensaje)',          doc: 'Alias pedagógico de leer.' },
    { label: 'enter',    kind: vscode.CompletionItemKind.Function, detail: 'enter(prompt)',              doc: 'Pedagogical alias for input.' },
    // Matemáticas
    { label: 'despejar',  kind: vscode.CompletionItemKind.Function, detail: 'despejar(ecuacion, variable)',      doc: 'Despeja analíticamente una incógnita en una ecuación lineal.' },
    { label: 'solve',     kind: vscode.CompletionItemKind.Function, detail: 'solve(equation, variable)',         doc: 'Analytically solves for an unknown in a linear equation.' },
    { label: 'raiz',      kind: vscode.CompletionItemKind.Function, detail: 'raiz(numero, [indice])',            doc: 'Calcula la raíz de un número (por defecto cuadrada).' },
    { label: 'root',      kind: vscode.CompletionItemKind.Function, detail: 'root(number, [index])',             doc: 'Calculates the root of a number (square root by default).' },
    { label: 'potencia',  kind: vscode.CompletionItemKind.Function, detail: 'potencia(base, exponente)',         doc: 'Eleva la base al exponente dado.' },
    { label: 'power',     kind: vscode.CompletionItemKind.Function, detail: 'power(base, exponent)',             doc: 'Raises base to the specified exponent.' },
    { label: 'factorial', kind: vscode.CompletionItemKind.Function, detail: 'factorial(n)',                      doc: 'Calcula el factorial de un número entero positivo.' },
    { label: 'absoluto',  kind: vscode.CompletionItemKind.Function, detail: 'absoluto(x)',                       doc: 'Devuelve el valor absoluto o módulo de un número.' },
    { label: 'abs',       kind: vscode.CompletionItemKind.Function, detail: 'abs(x)',                            doc: 'Returns the absolute value or magnitude of a number.' },
    { label: 'fraccion',  kind: vscode.CompletionItemKind.Function, detail: 'fraccion(numerador, denominador)',  doc: 'Crea una fracción matemática exacta.' },
    { label: 'fraction',  kind: vscode.CompletionItemKind.Function, detail: 'fraction(numerator, denominator)', doc: 'Creates an exact mathematical fraction.' },
    { label: 'aleatorio', kind: vscode.CompletionItemKind.Function, detail: 'aleatorio(min, max)',               doc: 'Genera un número entero aleatorio dentro del rango.' },
    { label: 'random',    kind: vscode.CompletionItemKind.Function, detail: 'random(min, max)',                  doc: 'Generates a random integer within the given range.' },
    { label: 'seno',      kind: vscode.CompletionItemKind.Function, detail: 'seno(x)',                           doc: 'Seno de un ángulo en radianes.' },
    { label: 'sin',       kind: vscode.CompletionItemKind.Function, detail: 'sin(x)',                            doc: 'Sine of an angle in radians.' },
    { label: 'coseno',    kind: vscode.CompletionItemKind.Function, detail: 'coseno(x)',                         doc: 'Coseno de un ángulo en radianes.' },
    { label: 'cos',       kind: vscode.CompletionItemKind.Function, detail: 'cos(x)',                            doc: 'Cosine of an angle in radians.' },
    { label: 'tangente',  kind: vscode.CompletionItemKind.Function, detail: 'tangente(x)',                       doc: 'Tangente de un ángulo en radianes.' },
    { label: 'tan',       kind: vscode.CompletionItemKind.Function, detail: 'tan(x)',                            doc: 'Tangent of an angle in radians.' },
    { label: 'log',       kind: vscode.CompletionItemKind.Function, detail: 'log(x, [base])',                    doc: 'Logaritmo (base 10 por defecto).' },
    { label: 'ln',        kind: vscode.CompletionItemKind.Function, detail: 'ln(x)',                             doc: 'Logaritmo natural (base e).' },
    // Estadística y listas
    { label: 'promedio',   kind: vscode.CompletionItemKind.Function, detail: 'promedio(lista)',                  doc: 'Calcula la media aritmética de una lista.' },
    { label: 'mean',       kind: vscode.CompletionItemKind.Function, detail: 'mean(list)',                       doc: 'Calculates arithmetic mean of a list.' },
    { label: 'mediana',    kind: vscode.CompletionItemKind.Function, detail: 'mediana(lista)',                   doc: 'Calcula el valor central de una lista ordenada.' },
    { label: 'median',     kind: vscode.CompletionItemKind.Function, detail: 'median(list)',                     doc: 'Calculates median value of a sorted list.' },
    { label: 'moda',       kind: vscode.CompletionItemKind.Function, detail: 'moda(lista)',                      doc: 'Encuentra el valor más frecuente en una lista.' },
    { label: 'mode',       kind: vscode.CompletionItemKind.Function, detail: 'mode(list)',                       doc: 'Finds most frequent value in a list.' },
    { label: 'frecuencia', kind: vscode.CompletionItemKind.Function, detail: 'frecuencia(lista)',                doc: 'Genera la tabla de frecuencias de los elementos.' },
    { label: 'frequency',  kind: vscode.CompletionItemKind.Function, detail: 'frequency(list)',                  doc: 'Generates frequency table for elements.' },
    { label: 'suma',       kind: vscode.CompletionItemKind.Function, detail: 'suma(lista)',                      doc: 'Suma todos los elementos de una lista.' },
    { label: 'sum',        kind: vscode.CompletionItemKind.Function, detail: 'sum(list)',                        doc: 'Sums all elements of a list.' },
    { label: 'minimo',     kind: vscode.CompletionItemKind.Function, detail: 'minimo(lista)',                    doc: 'Obtiene el valor mínimo de una lista.' },
    { label: 'min',        kind: vscode.CompletionItemKind.Function, detail: 'min(list)',                        doc: 'Gets minimum value in a list.' },
    { label: 'maximo',     kind: vscode.CompletionItemKind.Function, detail: 'maximo(lista)',                    doc: 'Obtiene el valor máximo de una lista.' },
    { label: 'max',        kind: vscode.CompletionItemKind.Function, detail: 'max(list)',                        doc: 'Gets maximum value in a list.' },
    { label: 'rango',      kind: vscode.CompletionItemKind.Function, detail: 'rango(inicio, fin, [paso])',       doc: 'Genera una secuencia aritmética de números.' },
    { label: 'range',      kind: vscode.CompletionItemKind.Function, detail: 'range(start, end, [step])',        doc: 'Generates an arithmetic progression.' },
    { label: 'agregar',    kind: vscode.CompletionItemKind.Function, detail: 'agregar(lista, elemento)',         doc: 'Añade un nuevo elemento al final de la lista.' },
    { label: 'append',     kind: vscode.CompletionItemKind.Function, detail: 'append(list, item)',               doc: 'Appends a new item to end of list.' },
    { label: 'longitud',   kind: vscode.CompletionItemKind.Function, detail: 'longitud(coleccion)',              doc: 'Devuelve la cantidad de elementos o caracteres.' },
    { label: 'length',     kind: vscode.CompletionItemKind.Function, detail: 'length(collection)',               doc: 'Returns number of items or characters.' },
    { label: 'len',        kind: vscode.CompletionItemKind.Function, detail: 'len(collection)',                  doc: 'Alias for length.' },
    { label: 'quitar',     kind: vscode.CompletionItemKind.Function, detail: 'quitar(lista, indice)',            doc: 'Elimina el elemento en el índice indicado.' },
    { label: 'remove',     kind: vscode.CompletionItemKind.Function, detail: 'remove(list, index)',              doc: 'Removes item at given index.' },
    { label: 'contiene',   kind: vscode.CompletionItemKind.Function, detail: 'contiene(coleccion, elemento)',   doc: 'Verifica si el elemento está en la colección.' },
    { label: 'contains',   kind: vscode.CompletionItemKind.Function, detail: 'contains(collection, item)',      doc: 'Checks if item exists in collection.' },
    { label: 'copiar',     kind: vscode.CompletionItemKind.Function, detail: 'copiar(lista)',                    doc: 'Crea una copia independiente de la lista.' },
    { label: 'copy',       kind: vscode.CompletionItemKind.Function, detail: 'copy(list)',                       doc: 'Creates an independent copy of list.' },
    { label: 'ordenar',    kind: vscode.CompletionItemKind.Function, detail: 'ordenar(lista)',                   doc: 'Ordena los elementos de menor a mayor.' },
    { label: 'sort',       kind: vscode.CompletionItemKind.Function, detail: 'sort(list)',                       doc: 'Sorts elements in ascending order.' },
    // Conversión de tipos
    { label: 'entero',  kind: vscode.CompletionItemKind.Function, detail: 'entero(x)',  doc: 'Convierte un valor a entero.' },
    { label: 'int',     kind: vscode.CompletionItemKind.Function, detail: 'int(x)',     doc: 'Converts a value to integer.' },
    { label: 'decimal', kind: vscode.CompletionItemKind.Function, detail: 'decimal(x)', doc: 'Convierte un valor a número decimal.' },
    { label: 'float',   kind: vscode.CompletionItemKind.Function, detail: 'float(x)',   doc: 'Converts a value to float.' },
    { label: 'texto',   kind: vscode.CompletionItemKind.Function, detail: 'texto(x)',   doc: 'Convierte un valor a texto.' },
    { label: 'str',     kind: vscode.CompletionItemKind.Function, detail: 'str(x)',     doc: 'Converts a value to string.' },
    // Control de flujo ES
    { label: 'si',        kind: vscode.CompletionItemKind.Keyword, detail: 'si condicion:',           doc: 'Estructura condicional si.' },
    { label: 'sino',      kind: vscode.CompletionItemKind.Keyword, detail: 'sino:',                   doc: 'Rama alternativa de un condicional.' },
    { label: 'mientras',  kind: vscode.CompletionItemKind.Keyword, detail: 'mientras condicion:',     doc: 'Bucle que se repite mientras la condición sea verdadera.' },
    { label: 'para',      kind: vscode.CompletionItemKind.Keyword, detail: 'para elemento en col:',   doc: 'Bucle que recorre una secuencia o rango.' },
    { label: 'en',        kind: vscode.CompletionItemKind.Keyword, detail: 'en',                       doc: 'Operador de pertenencia en bucles para.' },
    { label: 'funcion',   kind: vscode.CompletionItemKind.Keyword, detail: 'funcion nombre(params):', doc: 'Declara una función en español.' },
    { label: 'devolver',  kind: vscode.CompletionItemKind.Keyword, detail: 'devolver valor',          doc: 'Retorna un valor desde una función.' },
    { label: 'romper',    kind: vscode.CompletionItemKind.Keyword, detail: 'romper',                  doc: 'Termina el bucle actual inmediatamente.' },
    { label: 'continuar', kind: vscode.CompletionItemKind.Keyword, detail: 'continuar',               doc: 'Salta a la siguiente iteración del bucle.' },
    { label: 'cada',      kind: vscode.CompletionItemKind.Keyword, detail: 'cada 1s:',                doc: 'Temporizador repetitivo nativo.' },
    { label: 'despues',   kind: vscode.CompletionItemKind.Keyword, detail: 'despues de 1s:',          doc: 'Temporizador postergado nativo.' },
    { label: 'detener',   kind: vscode.CompletionItemKind.Keyword, detail: 'detener',                 doc: 'Detiene un temporizador activo.' },
    // Control de flujo EN
    { label: 'if',       kind: vscode.CompletionItemKind.Keyword, detail: 'if condition:',            doc: 'If conditional statement.' },
    { label: 'else',     kind: vscode.CompletionItemKind.Keyword, detail: 'else:',                    doc: 'Alternative branch of a conditional.' },
    { label: 'while',    kind: vscode.CompletionItemKind.Keyword, detail: 'while condition:',         doc: 'While loop.' },
    { label: 'for',      kind: vscode.CompletionItemKind.Keyword, detail: 'for element in col:',      doc: 'For loop over collection.' },
    { label: 'in',       kind: vscode.CompletionItemKind.Keyword, detail: 'in',                       doc: 'Membership operator in for loops.' },
    { label: 'func',     kind: vscode.CompletionItemKind.Keyword, detail: 'func name(params):',       doc: 'Declares a function in English.' },
    { label: 'return',   kind: vscode.CompletionItemKind.Keyword, detail: 'return value',             doc: 'Returns a value from function.' },
    { label: 'break',    kind: vscode.CompletionItemKind.Keyword, detail: 'break',                    doc: 'Terminates loop immediately.' },
    { label: 'continue', kind: vscode.CompletionItemKind.Keyword, detail: 'continue',                 doc: 'Jumps to next iteration.' },
    { label: 'every',    kind: vscode.CompletionItemKind.Keyword, detail: 'every 1s:',                doc: 'Repetitive native timer.' },
    { label: 'after',    kind: vscode.CompletionItemKind.Keyword, detail: 'after 1s:',                doc: 'Delayed single-shot timer.' },
    { label: 'stop',     kind: vscode.CompletionItemKind.Keyword, detail: 'stop',                     doc: 'Stops active timer.' },
    // Constantes
    { label: 'verdad', kind: vscode.CompletionItemKind.Constant, detail: 'verdad',          doc: 'Valor booleano verdadero.' },
    { label: 'falso',  kind: vscode.CompletionItemKind.Constant, detail: 'falso',           doc: 'Valor booleano falso.' },
    { label: 'nada',   kind: vscode.CompletionItemKind.Constant, detail: 'nada',            doc: 'Valor nulo o vacío.' },
    { label: 'true',   kind: vscode.CompletionItemKind.Constant, detail: 'true',            doc: 'Boolean true.' },
    { label: 'false',  kind: vscode.CompletionItemKind.Constant, detail: 'false',           doc: 'Boolean false.' },
    { label: 'null',   kind: vscode.CompletionItemKind.Constant, detail: 'null',            doc: 'Null value.' },
    { label: 'pi',     kind: vscode.CompletionItemKind.Constant, detail: 'pi = 3.14159...', doc: 'Constante matemática Pi.' },
    { label: 'e',      kind: vscode.CompletionItemKind.Constant, detail: 'e = 2.71828...',  doc: 'Constante matemática de Euler.' },
];

// Módulo Medio: constantes, estructuras y operaciones de bits.
const ELEMENTOS_MEDIO = [
    { label: 'constante',   kind: vscode.CompletionItemKind.Keyword,       detail: 'constante NOMBRE = valor',           doc: 'Declara una constante inmutable (Módulo Medio).' },
    { label: 'const',       kind: vscode.CompletionItemKind.Keyword,       detail: 'const NAME = value',                 doc: 'Declares an immutable constant (Medium Module).' },
    { label: 'estructura',  kind: vscode.CompletionItemKind.Class,         detail: 'estructura Nombre:\n    campo: tipo', doc: 'Declara una estructura con campos tipados (Módulo Medio).' },
    { label: 'struct',      kind: vscode.CompletionItemKind.Class,         detail: 'struct Name:\n    field: type',       doc: 'Declares a structure with typed fields (Medium Module).' },
    { label: 'byte',        kind: vscode.CompletionItemKind.TypeParameter, detail: 'byte (0-255)',                        doc: 'Tipo de dato entero de un solo byte (Módulo Medio).' },
    { label: 'xor',         kind: vscode.CompletionItemKind.Function,      detail: 'xor(a, b)',                           doc: 'Operación XOR bit a bit entre dos enteros (Módulo Medio).' },
    { label: 'hexadecimal', kind: vscode.CompletionItemKind.Function,      detail: 'hexadecimal(n)',                      doc: 'Convierte un número a cadena hexadecimal (ej. 0xFF).' },
    { label: 'hex',         kind: vscode.CompletionItemKind.Function,      detail: 'hex(n)',                              doc: 'Converts a number to hexadecimal string (Medium Module).' },
    { label: 'binario',     kind: vscode.CompletionItemKind.Function,      detail: 'binario(n)',                          doc: 'Convierte un número a cadena binaria (ej. 0b1010).' },
    { label: 'bin',         kind: vscode.CompletionItemKind.Function,      detail: 'bin(n)',                              doc: 'Converts a number to binary string (Medium Module).' },
];

// Módulo Bajo: memoria simulada y punteros.
const ELEMENTOS_BAJO = [
    { label: 'reservar',       kind: vscode.CompletionItemKind.Function, detail: 'reservar(bytes)',                    doc: 'Reserva memoria en el montón simulado (Módulo Bajo).' },
    { label: 'allocate',       kind: vscode.CompletionItemKind.Function, detail: 'allocate(bytes)',                    doc: 'Allocates memory in simulated heap (Low Module).' },
    { label: 'liberar',        kind: vscode.CompletionItemKind.Function, detail: 'liberar(direccion)',                 doc: 'Libera un bloque de memoria previamente reservado (Módulo Bajo).' },
    { label: 'free',           kind: vscode.CompletionItemKind.Function, detail: 'free(address)',                      doc: 'Frees a previously allocated memory block (Low Module).' },
    { label: 'guardar_entero', kind: vscode.CompletionItemKind.Function, detail: 'guardar_entero(dir, valor, bytes)',  doc: 'Guarda un entero en little-endian en la memoria (Módulo Bajo).' },
    { label: 'store_int',      kind: vscode.CompletionItemKind.Function, detail: 'store_int(addr, value, bytes)',      doc: 'Stores a little-endian integer in memory (Low Module).' },
    { label: 'cargar_entero',  kind: vscode.CompletionItemKind.Function, detail: 'cargar_entero(dir, bytes)',          doc: 'Carga un entero en little-endian desde la memoria (Módulo Bajo).' },
    { label: 'load_int',       kind: vscode.CompletionItemKind.Function, detail: 'load_int(addr, bytes)',              doc: 'Loads a little-endian integer from memory (Low Module).' },
    { label: 'volcar',         kind: vscode.CompletionItemKind.Function, detail: 'volcar(dir, cantidad)',              doc: 'Imprime un volcado hexadecimal de memoria (Módulo Bajo).' },
    { label: 'dump',           kind: vscode.CompletionItemKind.Function, detail: 'dump(addr, count)',                  doc: 'Prints a hexadecimal memory dump (Low Module).' },
    { label: 'empujar',        kind: vscode.CompletionItemKind.Function, detail: 'empujar(byte)',                      doc: 'Empuja un byte en la pila LIFO (Módulo Bajo).' },
    { label: 'push',           kind: vscode.CompletionItemKind.Function, detail: 'push(byte)',                         doc: 'Pushes a byte onto the LIFO stack (Low Module).' },
    { label: 'sacar',          kind: vscode.CompletionItemKind.Function, detail: 'sacar()',                            doc: 'Extrae un byte de la cima de la pila LIFO (Módulo Bajo).' },
    { label: 'pop',            kind: vscode.CompletionItemKind.Function, detail: 'pop()',                              doc: 'Pops a byte from the top of the LIFO stack (Low Module).' },
    { label: 'puntero_pila',   kind: vscode.CompletionItemKind.Function, detail: 'puntero_pila()',                    doc: 'Devuelve la dirección del registro de pila SP (Módulo Bajo).' },
    { label: 'stack_pointer',  kind: vscode.CompletionItemKind.Function, detail: 'stack_pointer()',                   doc: 'Returns the stack pointer register SP (Low Module).' },
    { label: 'memoria',        kind: vscode.CompletionItemKind.Variable, detail: 'memoria[direccion]',                doc: 'Arreglo de memoria física simulada para lectura y escritura de bytes (Módulo Bajo).' },
    { label: 'memory',         kind: vscode.CompletionItemKind.Variable, detail: 'memory[address]',                   doc: 'Simulated physical memory array for byte read/write (Low Module).' },
];

function activate(context) {
    console.log('Extensión Radix Matix activada.');

    // 1. Colección de diagnósticos de VS Code
    const coleccionDiagnosticos = vscode.languages.createDiagnosticCollection('radixmatix');
    context.subscriptions.push(coleccionDiagnosticos);

    // 2. Ruta al script de Python
    const rutaScript = path.join(context.extensionPath, 'server', 'rm_check.py');

    // 3. Validar el archivo activo si ya hay uno abierto al iniciar
    if (vscode.window.activeTextEditor) {
        validarDocumento(vscode.window.activeTextEditor.document, coleccionDiagnosticos, rutaScript);
    }

    // 4. Escuchar eventos del editor
    context.subscriptions.push(
        // Al abrir un archivo nuevo
        vscode.workspace.onDidOpenTextDocument((doc) => {
            validarDocumento(doc, coleccionDiagnosticos, rutaScript);
        }),
        // Al guardar el archivo
        vscode.workspace.onDidSaveTextDocument((doc) => {
            validarDocumento(doc, coleccionDiagnosticos, rutaScript);
        }),
        // Al escribir o modificar: esperar 300 ms (debounce) para no saturar
        vscode.workspace.onDidChangeTextDocument((evento) => {
            if (temporizadorDiagnostico) {
                clearTimeout(temporizadorDiagnostico);
            }
            temporizadorDiagnostico = setTimeout(() => {
                validarDocumento(evento.document, coleccionDiagnosticos, rutaScript);
            }, 300);
        }),
        // Al cerrar el archivo, limpiar sus errores
        vscode.workspace.onDidCloseTextDocument((doc) => {
            coleccionDiagnosticos.delete(doc.uri);
        })
    );

    // 5. Proveedor de IntelliSense / Autocompletado — E11: filtrado por módulo
    const proveedorAutocompletado = vscode.languages.registerCompletionItemProvider(
        'radixmatix',
        {
            provideCompletionItems(documento) {
                // Leer las primeras 4 líneas para detectar la cabecera del módulo
                const cabecera = documento.getText(new vscode.Range(0, 0, 4, 0));
                const esMedio = cabecera.includes('modulo medio') || cabecera.includes('module medium');
                const esBajo  = cabecera.includes('modulo bajo')  || cabecera.includes('module low');

                let catalogo = [...ELEMENTOS_ALTO];
                if (esMedio || esBajo) catalogo = catalogo.concat(ELEMENTOS_MEDIO);
                if (esBajo)            catalogo = catalogo.concat(ELEMENTOS_BAJO);

                return catalogo.map(item => {
                    const completion = new vscode.CompletionItem(item.label, item.kind);
                    completion.detail = item.detail;
                    completion.documentation = new vscode.MarkdownString(item.doc);
                    return completion;
                });
            }
        }
    );
    context.subscriptions.push(proveedorAutocompletado);
}

function deactivate() {
    // Limpieza al apagar la extensión
}

module.exports = {
    activate,
    deactivate
};
