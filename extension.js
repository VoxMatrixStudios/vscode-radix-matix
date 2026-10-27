const vscode = require('vscode');
const path = require('path');
const { spawn } = require('child_process');

let versionDocumentoActiva = new Map();

function validarDocumento(documento, coleccionDiagnosticos, rutaScript) {
    if (documento.languageId !== 'radixmatix') {
        return;
    }

    // E13: No ejecutar análisis automático si el espacio de trabajo no es de confianza
    if (vscode.workspace.isTrusted === false) {
        return;
    }

    const uriStr = documento.uri.toString();
    const versionActual = documento.version;
    versionDocumentoActiva.set(uriStr, versionActual);

    const texto = documento.getText();

    // Obtener ruta personalizada del núcleo si el usuario la configuró
    const config = vscode.workspace.getConfiguration('radixmatix');
    const customCorePath = config.get('corePath') || '';
    const pythonPath = config.get('pythonPath') || 'python';

    const args = [rutaScript];
    if (customCorePath) {
        args.push('-');
        args.push(customCorePath);
    }

    let proceso;
    try {
        proceso = spawn(pythonPath, args, {
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        });
    } catch (err) {
        // E5: Manejar error síncrono si spawn falla inmediatamente
        return;
    }

    let salida = '';
    let procesoFinalizado = false;

    // E7 / E5: Timeout de seguridad (5 segundos) para matar el proceso si se cuelga
    const timeoutId = setTimeout(() => {
        if (!procesoFinalizado) {
            procesoFinalizado = true;
            try {
                proceso.kill();
            } catch (_) {}
        }
    }, 5000);

    // E5: Manejo seguro de errores del proceso
    proceso.on('error', (err) => {
        procesoFinalizado = true;
        clearTimeout(timeoutId);
    });

    if (proceso.stdin) {
        proceso.stdin.on('error', (_) => {});
        try {
            proceso.stdin.write(texto);
            proceso.stdin.end();
        } catch (_) {}
    }

    proceso.stdout.on('data', (datos) => {
        salida += datos.toString();
    });

    proceso.on('close', () => {
        procesoFinalizado = true;
        clearTimeout(timeoutId);

        // E6: Descartar respuestas si el usuario ya siguió escribiendo una versión más reciente
        if (versionDocumentoActiva.get(uriStr) !== versionActual) {
            return;
        }

        try {
            const errores = JSON.parse(salida);
            const listaDiagnosticos = [];

            for (const err of errores) {
                const linea = Math.max(0, (err.linea || 1) - 1);
                const columna = Math.max(0, (err.columna || 1) - 1);

                // E10: Calcular longitud de subrayado basada en el token en esa posición
                let longitudSubrayado = 5;
                if (linea < documento.lineCount) {
                    const lineaTexto = documento.lineAt(linea).text;
                    const restoLinea = lineaTexto.slice(columna);
                    const matchPalabra = restoLinea.match(/^[a-zA-Z_áéíóúÁÉÍÓÚñÑ0-9]+/);
                    if (matchPalabra && matchPalabra[0].length > 0) {
                        longitudSubrayado = matchPalabra[0].length;
                    } else if (restoLinea.length > 0) {
                        const primerChar = restoLinea.charAt(0);
                        longitudSubrayado = primerChar === ' ' ? 1 : 1;
                    }
                }

                const rango = new vscode.Range(linea, columna, linea, columna + longitudSubrayado);

                const severidad = err.gravedad === 'Warning'
                    ? vscode.DiagnosticSeverity.Warning
                    : vscode.DiagnosticSeverity.Error;

                const diagnostico = new vscode.Diagnostic(rango, `[Radix Matix] ${err.mensaje}`, severidad);
                listaDiagnosticos.push(diagnostico);
            }

            coleccionDiagnosticos.set(documento.uri, listaDiagnosticos);
        } catch (e) {
            // E1: Si no hay salida JSON válida (ej. core no disponible), silenciar limpiamente
            coleccionDiagnosticos.set(documento.uri, []);
        }
    });
}

let temporizadorDiagnostico = null;

// E11: Catálogo completo de autocompletado organizado por nivel e idioma
const ELEMENTOS_ALTO_ES = [
    { label: 'imprimir', kind: vscode.CompletionItemKind.Function, detail: 'imprimir(mensaje)', doc: 'Imprime un valor o texto en pantalla.' },
    { label: 'leer', kind: vscode.CompletionItemKind.Function, detail: 'leer(mensaje)', doc: 'Lee una entrada del usuario desde la terminal.' },
    { label: 'ingresar', kind: vscode.CompletionItemKind.Function, detail: 'ingresar(mensaje)', doc: 'Alias pedagógico para leer entrada del usuario.' },
    { label: 'despejar', kind: vscode.CompletionItemKind.Function, detail: 'despejar(ecuacion, variable)', doc: 'Despeja analíticamente una incógnita en una ecuación lineal.' },
    { label: 'raiz', kind: vscode.CompletionItemKind.Function, detail: 'raiz(numero, [indice])', doc: 'Calcula la raíz de un número (por defecto cuadrada).' },
    { label: 'potencia', kind: vscode.CompletionItemKind.Function, detail: 'potencia(base, exponente)', doc: 'Eleva la base al exponente dado.' },
    { label: 'factorial', kind: vscode.CompletionItemKind.Function, detail: 'factorial(n)', doc: 'Calcula el factorial de un número entero positivo.' },
    { label: 'absoluto', kind: vscode.CompletionItemKind.Function, detail: 'absoluto(x)', doc: 'Devuelve el valor absoluto o módulo de un número.' },
    { label: 'fraccion', kind: vscode.CompletionItemKind.Function, detail: 'fraccion(num, den)', doc: 'Crea una fracción matemática exacta.' },
    { label: 'aleatorio', kind: vscode.CompletionItemKind.Function, detail: 'aleatorio(min, max)', doc: 'Genera un número entero aleatorio dentro del rango.' },
    { label: 'promedio', kind: vscode.CompletionItemKind.Function, detail: 'promedio(lista)', doc: 'Calcula la media aritmética de una lista.' },
    { label: 'mediana', kind: vscode.CompletionItemKind.Function, detail: 'mediana(lista)', doc: 'Calcula el valor central de una lista ordenada.' },
    { label: 'moda', kind: vscode.CompletionItemKind.Function, detail: 'moda(lista)', doc: 'Encuentra el valor más frecuente en una lista.' },
    { label: 'frecuencia', kind: vscode.CompletionItemKind.Function, detail: 'frecuencia(lista)', doc: 'Genera la tabla de frecuencias de los elementos.' },
    { label: 'suma', kind: vscode.CompletionItemKind.Function, detail: 'suma(lista)', doc: 'Suma todos los elementos de una lista.' },
    { label: 'minimo', kind: vscode.CompletionItemKind.Function, detail: 'minimo(lista)', doc: 'Obtiene el valor mínimo de una lista.' },
    { label: 'maximo', kind: vscode.CompletionItemKind.Function, detail: 'maximo(lista)', doc: 'Obtiene el valor máximo de una lista.' },
    { label: 'rango', kind: vscode.CompletionItemKind.Function, detail: 'rango(inicio, fin, [paso])', doc: 'Genera una secuencia aritmética de números.' },
    { label: 'agregar', kind: vscode.CompletionItemKind.Function, detail: 'agregar(lista, elemento)', doc: 'Añade un nuevo elemento al final de la lista.' },
    { label: 'longitud', kind: vscode.CompletionItemKind.Function, detail: 'longitud(coleccion)', doc: 'Devuelve la cantidad de elementos o caracteres.' },
    { label: 'quitar', kind: vscode.CompletionItemKind.Function, detail: 'quitar(lista, indice)', doc: 'Elimina el elemento en el índice indicado.' },
    { label: 'contiene', kind: vscode.CompletionItemKind.Function, detail: 'contiene(coleccion, elemento)', doc: 'Verifica si el elemento está en la colección.' },
    { label: 'copiar', kind: vscode.CompletionItemKind.Function, detail: 'copiar(lista)', doc: 'Crea una copia independiente de la lista.' },
    { label: 'ordenar', kind: vscode.CompletionItemKind.Function, detail: 'ordenar(lista)', doc: 'Ordena los elementos de menor a mayor.' },
    { label: 'si', kind: vscode.CompletionItemKind.Keyword, detail: 'si condicion:', doc: 'Estructura condicional si.' },
    { label: 'sino', kind: vscode.CompletionItemKind.Keyword, detail: 'sino:', doc: 'Rama alternativa de un condicional.' },
    { label: 'mientras', kind: vscode.CompletionItemKind.Keyword, detail: 'mientras condicion:', doc: 'Bucle mientras la condición sea verdadera.' },
    { label: 'para', kind: vscode.CompletionItemKind.Keyword, detail: 'para elemento en coleccion:', doc: 'Bucle que recorre una secuencia o rango.' },
    { label: 'en', kind: vscode.CompletionItemKind.Keyword, detail: 'en', doc: 'Operador de pertenencia en bucles para.' },
    { label: 'funcion', kind: vscode.CompletionItemKind.Keyword, detail: 'funcion nombre(params):', doc: 'Declara una función en español.' },
    { label: 'devolver', kind: vscode.CompletionItemKind.Keyword, detail: 'devolver valor', doc: 'Retorna un valor desde una función.' },
    { label: 'romper', kind: vscode.CompletionItemKind.Keyword, detail: 'romper', doc: 'Termina el bucle actual inmediatamente.' },
    { label: 'continuar', kind: vscode.CompletionItemKind.Keyword, detail: 'continuar', doc: 'Salta a la siguiente iteración del bucle.' },
    { label: 'cada', kind: vscode.CompletionItemKind.Keyword, detail: 'cada 1s:', doc: 'Temporizador repetitivo nativo.' },
    { label: 'despues', kind: vscode.CompletionItemKind.Keyword, detail: 'despues de 1s:', doc: 'Temporizador postergado nativo.' },
    { label: 'detener', kind: vscode.CompletionItemKind.Keyword, detail: 'detener', doc: 'Detiene un temporizador activo.' },
    { label: 'verdad', kind: vscode.CompletionItemKind.Constant, detail: 'verdad', doc: 'Valor booleano verdadero.' },
    { label: 'falso', kind: vscode.CompletionItemKind.Constant, detail: 'falso', doc: 'Valor booleano falso.' },
    { label: 'nada', kind: vscode.CompletionItemKind.Constant, detail: 'nada', doc: 'Valor nulo o vacío.' },
    { label: 'pi', kind: vscode.CompletionItemKind.Constant, detail: 'pi = 3.14159...', doc: 'Constante matemática Pi.' },
    { label: 'e', kind: vscode.CompletionItemKind.Constant, detail: 'e = 2.71828...', doc: 'Constante matemática de Euler.' }
];

const ELEMENTOS_ALTO_EN = [
    { label: 'print', kind: vscode.CompletionItemKind.Function, detail: 'print(message)', doc: 'Prints a value or message to the screen.' },
    { label: 'input', kind: vscode.CompletionItemKind.Function, detail: 'input(prompt)', doc: 'Reads user input from the terminal.' },
    { label: 'enter', kind: vscode.CompletionItemKind.Function, detail: 'enter(prompt)', doc: 'Pedagogical alias to read user input.' },
    { label: 'solve', kind: vscode.CompletionItemKind.Function, detail: 'solve(equation, variable)', doc: 'Analytically solves for an unknown in a linear equation.' },
    { label: 'root', kind: vscode.CompletionItemKind.Function, detail: 'root(number, [index])', doc: 'Calculates the root of a number.' },
    { label: 'power', kind: vscode.CompletionItemKind.Function, detail: 'power(base, exponent)', doc: 'Raises base to the specified exponent.' },
    { label: 'abs', kind: vscode.CompletionItemKind.Function, detail: 'abs(x)', doc: 'Returns the absolute value of a number.' },
    { label: 'fraction', kind: vscode.CompletionItemKind.Function, detail: 'fraction(num, den)', doc: 'Creates an exact mathematical fraction.' },
    { label: 'random', kind: vscode.CompletionItemKind.Function, detail: 'random(min, max)', doc: 'Generates a random integer within range.' },
    { label: 'mean', kind: vscode.CompletionItemKind.Function, detail: 'mean(list)', doc: 'Calculates arithmetic mean of a list.' },
    { label: 'median', kind: vscode.CompletionItemKind.Function, detail: 'median(list)', doc: 'Calculates median value of a list.' },
    { label: 'mode', kind: vscode.CompletionItemKind.Function, detail: 'mode(list)', doc: 'Finds most frequent value in a list.' },
    { label: 'frequency', kind: vscode.CompletionItemKind.Function, detail: 'frequency(list)', doc: 'Generates frequency table for elements.' },
    { label: 'sum', kind: vscode.CompletionItemKind.Function, detail: 'sum(list)', doc: 'Sums all elements of a list.' },
    { label: 'min', kind: vscode.CompletionItemKind.Function, detail: 'min(list)', doc: 'Gets minimum value in a list.' },
    { label: 'max', kind: vscode.CompletionItemKind.Function, detail: 'max(list)', doc: 'Gets maximum value in a list.' },
    { label: 'range', kind: vscode.CompletionItemKind.Function, detail: 'range(start, end, [step])', doc: 'Generates an arithmetic progression.' },
    { label: 'append', kind: vscode.CompletionItemKind.Function, detail: 'append(list, item)', doc: 'Appends a new item to end of list.' },
    { label: 'length', kind: vscode.CompletionItemKind.Function, detail: 'length(collection)', doc: 'Returns number of items or characters.' },
    { label: 'remove', kind: vscode.CompletionItemKind.Function, detail: 'remove(list, index)', doc: 'Removes item at given index.' },
    { label: 'contains', kind: vscode.CompletionItemKind.Function, detail: 'contains(collection, item)', doc: 'Checks if item exists in collection.' },
    { label: 'copy', kind: vscode.CompletionItemKind.Function, detail: 'copy(list)', doc: 'Creates an independent copy of list.' },
    { label: 'sort', kind: vscode.CompletionItemKind.Function, detail: 'sort(list)', doc: 'Sorts elements in ascending order.' },
    { label: 'if', kind: vscode.CompletionItemKind.Keyword, detail: 'if condition:', doc: 'If conditional statement.' },
    { label: 'else', kind: vscode.CompletionItemKind.Keyword, detail: 'else:', doc: 'Alternative branch of a conditional.' },
    { label: 'while', kind: vscode.CompletionItemKind.Keyword, detail: 'while condition:', doc: 'While loop.' },
    { label: 'for', kind: vscode.CompletionItemKind.Keyword, detail: 'for element in collection:', doc: 'For loop over collection.' },
    { label: 'in', kind: vscode.CompletionItemKind.Keyword, detail: 'in', doc: 'Membership operator in for loops.' },
    { label: 'func', kind: vscode.CompletionItemKind.Keyword, detail: 'func name(params):', doc: 'Declares a function in English.' },
    { label: 'return', kind: vscode.CompletionItemKind.Keyword, detail: 'return value', doc: 'Returns a value from function.' },
    { label: 'break', kind: vscode.CompletionItemKind.Keyword, detail: 'break', doc: 'Terminates loop immediately.' },
    { label: 'continue', kind: vscode.CompletionItemKind.Keyword, detail: 'continue', doc: 'Jumps to next iteration.' },
    { label: 'every', kind: vscode.CompletionItemKind.Keyword, detail: 'every 1s:', doc: 'Repetitive native timer.' },
    { label: 'after', kind: vscode.CompletionItemKind.Keyword, detail: 'after 1s:', doc: 'Delayed single-shot timer.' },
    { label: 'stop', kind: vscode.CompletionItemKind.Keyword, detail: 'stop', doc: 'Stops active timer.' },
    { label: 'true', kind: vscode.CompletionItemKind.Constant, detail: 'true', doc: 'Boolean true.' },
    { label: 'false', kind: vscode.CompletionItemKind.Constant, detail: 'false', doc: 'Boolean false.' },
    { label: 'null', kind: vscode.CompletionItemKind.Constant, detail: 'null', doc: 'Null value.' }
];

const ELEMENTOS_MEDIO = [
    { label: 'constante', kind: vscode.CompletionItemKind.Keyword, detail: 'constante NOMBRE = valor', doc: 'Declara una constante inmutable (Módulo Medio).' },
    { label: 'const', kind: vscode.CompletionItemKind.Keyword, detail: 'const NAME = value', doc: 'Declares an immutable constant (Medium Module).' },
    { label: 'estructura', kind: vscode.CompletionItemKind.Class, detail: 'estructura Nombre:\n    campo: tipo', doc: 'Declara una estructura con campos tipados (Módulo Medio).' },
    { label: 'struct', kind: vscode.CompletionItemKind.Class, detail: 'struct Name:\n    field: type', doc: 'Declares a structure with typed fields (Medium Module).' },
    { label: 'byte', kind: vscode.CompletionItemKind.TypeParameter, detail: 'byte (0-255)', doc: 'Tipo de dato entero de un solo byte (Módulo Medio).' },
    { label: 'xor', kind: vscode.CompletionItemKind.Function, detail: 'xor(a, b)', doc: 'Operación XOR bit a bit entre dos enteros (Módulo Medio).' },
    { label: 'hexadecimal', kind: vscode.CompletionItemKind.Function, detail: 'hexadecimal(n)', doc: 'Convierte un número a cadena hexadecimal (ej. 0xFF).' },
    { label: 'hex', kind: vscode.CompletionItemKind.Function, detail: 'hex(n)', doc: 'Converts a number to hexadecimal string (Medium Module).' },
    { label: 'binario', kind: vscode.CompletionItemKind.Function, detail: 'binario(n)', doc: 'Convierte un número a cadena binaria (ej. 0b1010).' },
    { label: 'bin', kind: vscode.CompletionItemKind.Function, detail: 'bin(n)', doc: 'Converts a number to binary string (Medium Module).' }
];

const ELEMENTOS_BAJO = [
    { label: 'reservar', kind: vscode.CompletionItemKind.Function, detail: 'reservar(bytes)', doc: 'Reserva memoria en el montón simulado (Módulo Bajo).' },
    { label: 'allocate', kind: vscode.CompletionItemKind.Function, detail: 'allocate(bytes)', doc: 'Allocates memory in simulated heap (Low Module).' },
    { label: 'liberar', kind: vscode.CompletionItemKind.Function, detail: 'liberar(dir)', doc: 'Libera un bloque de memoria (Módulo Bajo).' },
    { label: 'free', kind: vscode.CompletionItemKind.Function, detail: 'free(addr)', doc: 'Frees a memory block (Low Module).' },
    { label: 'guardar_entero', kind: vscode.CompletionItemKind.Function, detail: 'guardar_entero(dir, valor, bytes)', doc: 'Guarda entero little-endian en memoria (Módulo Bajo).' },
    { label: 'store_int', kind: vscode.CompletionItemKind.Function, detail: 'store_int(addr, val, bytes)', doc: 'Stores little-endian integer in memory (Low Module).' },
    { label: 'cargar_entero', kind: vscode.CompletionItemKind.Function, detail: 'cargar_entero(dir, bytes)', doc: 'Carga entero little-endian desde memoria (Módulo Bajo).' },
    { label: 'load_int', kind: vscode.CompletionItemKind.Function, detail: 'load_int(addr, bytes)', doc: 'Loads little-endian integer from memory (Low Module).' },
    { label: 'volcar', kind: vscode.CompletionItemKind.Function, detail: 'volcar(dir, cantidad)', doc: 'Imprime volcado hexadecimal (Módulo Bajo).' },
    { label: 'dump', kind: vscode.CompletionItemKind.Function, detail: 'dump(addr, count)', doc: 'Prints hexadecimal memory dump (Low Module).' },
    { label: 'empujar', kind: vscode.CompletionItemKind.Function, detail: 'empujar(byte)', doc: 'Empuja un byte en la pila LIFO (Módulo Bajo).' },
    { label: 'push', kind: vscode.CompletionItemKind.Function, detail: 'push(byte)', doc: 'Pushes byte onto LIFO stack (Low Module).' },
    { label: 'sacar', kind: vscode.CompletionItemKind.Function, detail: 'sacar()', doc: 'Extrae un byte de la pila LIFO (Módulo Bajo).' },
    { label: 'pop', kind: vscode.CompletionItemKind.Function, detail: 'pop()', doc: 'Pops byte from LIFO stack (Low Module).' },
    { label: 'puntero_pila', kind: vscode.CompletionItemKind.Function, detail: 'puntero_pila()', doc: 'Devuelve puntero de pila SP (Módulo Bajo).' },
    { label: 'stack_pointer', kind: vscode.CompletionItemKind.Function, detail: 'stack_pointer()', doc: 'Returns stack pointer SP (Low Module).' },
    { label: 'memoria', kind: vscode.CompletionItemKind.Variable, detail: 'memoria[direccion]', doc: 'Arreglo de memoria física simulada de 64 KiB (Módulo Bajo).' },
    { label: 'memory', kind: vscode.CompletionItemKind.Variable, detail: 'memory[address]', doc: 'Simulated physical 64 KiB memory array (Low Module).' }
];

function activate(context) {
    console.log('Extensión Radix Matix activada.');

    const coleccionDiagnosticos = vscode.languages.createDiagnosticCollection('radixmatix');
    context.subscriptions.push(coleccionDiagnosticos);

    const rutaScript = path.join(context.extensionPath, 'server', 'rm_check.py');

    if (vscode.window.activeTextEditor) {
        validarDocumento(vscode.window.activeTextEditor.document, coleccionDiagnosticos, rutaScript);
    }

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((doc) => {
            validarDocumento(doc, coleccionDiagnosticos, rutaScript);
        }),
        vscode.workspace.onDidSaveTextDocument((doc) => {
            validarDocumento(doc, coleccionDiagnosticos, rutaScript);
        }),
        vscode.workspace.onDidChangeTextDocument((evento) => {
            if (temporizadorDiagnostico) {
                clearTimeout(temporizadorDiagnostico);
            }
            temporizadorDiagnostico = setTimeout(() => {
                validarDocumento(evento.document, coleccionDiagnosticos, rutaScript);
            }, 300);
        }),
        vscode.workspace.onDidCloseTextDocument((doc) => {
            versionDocumentoActiva.delete(doc.uri.toString());
            coleccionDiagnosticos.delete(doc.uri);
        })
    );

    // E11: Proveedor de autocompletado contextual filtrado por cabecera de módulo
    const proveedorAutocompletado = vscode.languages.registerCompletionItemProvider(
        'radixmatix',
        {
            provideCompletionItems(documento, posicion) {
                const primerTexto = documento.getText(new vscode.Range(0, 0, 4, 0));
                const esMedio = primerTexto.includes('modulo medio') || primerTexto.includes('module medium');
                const esBajo = primerTexto.includes('modulo bajo') || primerTexto.includes('module low');
                const esIngles = primerTexto.includes('#! en');

                let catalogo = esIngles 
                    ? [...ELEMENTOS_ALTO_EN, ...ELEMENTOS_ALTO_ES]
                    : [...ELEMENTOS_ALTO_ES, ...ELEMENTOS_ALTO_EN];

                if (esMedio || esBajo) {
                    catalogo = catalogo.concat(ELEMENTOS_MEDIO);
                }
                if (esBajo) {
                    catalogo = catalogo.concat(ELEMENTOS_BAJO);
                }

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
    versionDocumentoActiva.clear();
}

module.exports = {
    activate,
    deactivate
};
