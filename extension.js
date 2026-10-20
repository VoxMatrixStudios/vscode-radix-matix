const vscode = require('vscode');
const path = require('path');
const { spawn } = require('child_process');

function validarDocumento(documento, coleccionDiagnosticos, rutaScript) {
    // Si no es un archivo Radix Matix, no hacemos nada
    if (documento.languageId !== 'radixmatix') {
        return;
    }

    // Obtenemos el texto completo del archivo
    const texto = documento.getText();

    // Ejecutamos Python pasando nuestro script rm_check.py en UTF-8
    const proceso = spawn('python', [rutaScript], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let salida = '';

    // Enviamos el texto del código a Python por stdin
    proceso.stdin.write(texto);
    proceso.stdin.end();

    // Vamos recibiendo la respuesta que imprime Python
    proceso.stdout.on('data', (datos) => {
        salida += datos.toString();
    });

    // Cuando Python termina de analizar
    proceso.on('close', () => {
        try {
            const errores = JSON.parse(salida);
            const listaDiagnosticos = [];

            for (const err of errores) {
                // En VS Code las líneas y columnas empiezan en 0, pero en nuestro parser empiezan en 1
                const linea = Math.max(0, (err.linea || 1) - 1);
                const columna = Math.max(0, (err.columna || 1) - 1);

                // Definimos el rango donde pintar la línea roja
                const rango = new vscode.Range(linea, columna, linea, columna + 5);

                const severidad = err.gravedad === 'Warning' 
                    ? vscode.DiagnosticSeverity.Warning 
                    : vscode.DiagnosticSeverity.Error;

                const diagnostico = new vscode.Diagnostic(rango, `[Radix Matix] ${err.mensaje}`, severidad);
                listaDiagnosticos.push(diagnostico);
            }

            // Aplicamos los diagnósticos al archivo en pantalla
            coleccionDiagnosticos.set(documento.uri, listaDiagnosticos);
        } catch (e) {
            coleccionDiagnosticos.set(documento.uri, []);
        }
    });
}

let temporizadorDiagnostico = null;

const ELEMENTOS_INTELLISENSE = [
    // Funciones matemáticas y del sistema
    { label: 'imprimir', kind: vscode.CompletionItemKind.Function, detail: 'imprimir(mensaje)', doc: 'Imprime un valor o texto en pantalla.' },
    { label: 'print', kind: vscode.CompletionItemKind.Function, detail: 'print(message)', doc: 'Prints a value or message to the screen.' },
    { label: 'leer', kind: vscode.CompletionItemKind.Function, detail: 'leer(mensaje)', doc: 'Lee una entrada del usuario desde la terminal.' },
    { label: 'input', kind: vscode.CompletionItemKind.Function, detail: 'input(prompt)', doc: 'Reads user input from the terminal.' },
    { label: 'despejar', kind: vscode.CompletionItemKind.Function, detail: 'despejar(ecuacion, variable)', doc: 'Despeja analíticamente una incógnita en una ecuación lineal.' },
    { label: 'solve', kind: vscode.CompletionItemKind.Function, detail: 'solve(equation, variable)', doc: 'Analytically solves for an unknown in a linear equation.' },
    { label: 'raiz', kind: vscode.CompletionItemKind.Function, detail: 'raiz(numero, [indice])', doc: 'Calcula la raíz de un número (por defecto cuadrada).' },
    { label: 'root', kind: vscode.CompletionItemKind.Function, detail: 'root(number, [index])', doc: 'Calculates the root of a number (square root by default).' },
    { label: 'potencia', kind: vscode.CompletionItemKind.Function, detail: 'potencia(base, exponente)', doc: 'Eleva la base al exponente dado.' },
    { label: 'power', kind: vscode.CompletionItemKind.Function, detail: 'power(base, exponent)', doc: 'Raises base to the specified exponent.' },
    { label: 'factorial', kind: vscode.CompletionItemKind.Function, detail: 'factorial(n)', doc: 'Calcula el factorial de un número entero positivo.' },
    { label: 'absoluto', kind: vscode.CompletionItemKind.Function, detail: 'absoluto(x)', doc: 'Devuelve el valor absoluto o módulo de un número.' },
    { label: 'abs', kind: vscode.CompletionItemKind.Function, detail: 'abs(x)', doc: 'Returns the absolute value or magnitude of a number.' },
    { label: 'fraccion', kind: vscode.CompletionItemKind.Function, detail: 'fraccion(numerador, denominador)', doc: 'Crea una fracción matemática exacta.' },
    { label: 'fraction', kind: vscode.CompletionItemKind.Function, detail: 'fraction(numerator, denominator)', doc: 'Creates an exact mathematical fraction.' },
    { label: 'aleatorio', kind: vscode.CompletionItemKind.Function, detail: 'aleatorio(min, max)', doc: 'Genera un número entero aleatorio dentro del rango.' },
    { label: 'random', kind: vscode.CompletionItemKind.Function, detail: 'random(min, max)', doc: 'Generates a random integer within the given range.' },
    
    // Palabras clave de control
    { label: 'si', kind: vscode.CompletionItemKind.Keyword, detail: 'si condicion:', doc: 'Estructura condicional si.' },
    { label: 'sino', kind: vscode.CompletionItemKind.Keyword, detail: 'sino:', doc: 'Rama alternativa de un condicional.' },
    { label: 'mientras', kind: vscode.CompletionItemKind.Keyword, detail: 'mientras condicion:', doc: 'Bucle que se repite mientras la condición sea verdadera.' },
    { label: 'para', kind: vscode.CompletionItemKind.Keyword, detail: 'para elemento en coleccion:', doc: 'Bucle que recorre una secuencia o rango.' },
    { label: 'funcion', kind: vscode.CompletionItemKind.Keyword, detail: 'funcion nombre(params):', doc: 'Declara una función en español.' },
    { label: 'devolver', kind: vscode.CompletionItemKind.Keyword, detail: 'devolver valor', doc: 'Retorna un valor desde una función.' },
    { label: 'romper', kind: vscode.CompletionItemKind.Keyword, detail: 'romper', doc: 'Termina el bucle actual inmediatamente.' },
    { label: 'continuar', kind: vscode.CompletionItemKind.Keyword, detail: 'continuar', doc: 'Salta a la siguiente iteración del bucle.' },
    { label: 'detener', kind: vscode.CompletionItemKind.Keyword, detail: 'detener', doc: 'Detiene un temporizador activo.' },
    
    // Constantes
    { label: 'verdad', kind: vscode.CompletionItemKind.Constant, detail: 'verdad', doc: 'Valor booleano verdadero.' },
    { label: 'falso', kind: vscode.CompletionItemKind.Constant, detail: 'falso', doc: 'Valor booleano falso.' },
    { label: 'nada', kind: vscode.CompletionItemKind.Constant, detail: 'nada', doc: 'Valor nulo o vacío.' },
    { label: 'pi', kind: vscode.CompletionItemKind.Constant, detail: 'pi = 3.14159...', doc: 'Constante matemática Pi.' },
    { label: 'e', kind: vscode.CompletionItemKind.Constant, detail: 'e = 2.71828...', doc: 'Constante matemática de Euler.' },

    // Módulo Medio: Tipos, estructuras y bits
    { label: 'constante', kind: vscode.CompletionItemKind.Keyword, detail: 'constante NOMBRE = valor', doc: 'Declara una constante inmutable (Módulo Medio).' },
    { label: 'const', kind: vscode.CompletionItemKind.Keyword, detail: 'const NAME = value', doc: 'Declares an immutable constant (Medium Module).' },
    { label: 'estructura', kind: vscode.CompletionItemKind.Class, detail: 'estructura Nombre:\n    campo: tipo', doc: 'Declara una estructura con campos tipados (Módulo Medio).' },
    { label: 'struct', kind: vscode.CompletionItemKind.Class, detail: 'struct Name:\n    field: type', doc: 'Declares a structure with typed fields (Medium Module).' },
    { label: 'byte', kind: vscode.CompletionItemKind.TypeParameter, detail: 'byte (0-255)', doc: 'Tipo de dato entero de un solo byte (Módulo Medio).' },
    { label: 'xor', kind: vscode.CompletionItemKind.Function, detail: 'xor(a, b)', doc: 'Operación XOR bit a bit entre dos enteros (Módulo Medio).' },
    { label: 'hexadecimal', kind: vscode.CompletionItemKind.Function, detail: 'hexadecimal(n)', doc: 'Convierte un número a cadena hexadecimal (ej. 0xFF).' },
    { label: 'hex', kind: vscode.CompletionItemKind.Function, detail: 'hex(n)', doc: 'Converts a number to hexadecimal string (Medium Module).' },
    { label: 'binario', kind: vscode.CompletionItemKind.Function, detail: 'binario(n)', doc: 'Convierte un número a cadena binaria (ej. 0b1010).' },
    { label: 'bin', kind: vscode.CompletionItemKind.Function, detail: 'bin(n)', doc: 'Converts a number to binary string (Medium Module).' },

    // Módulo Bajo: Memoria simulada y punteros
    { label: 'reservar', kind: vscode.CompletionItemKind.Function, detail: 'reservar(bytes)', doc: 'Reserva memoria en el montón simulado (Módulo Bajo).' },
    { label: 'allocate', kind: vscode.CompletionItemKind.Function, detail: 'allocate(bytes)', doc: 'Allocates memory in simulated heap (Low Module).' },
    { label: 'liberar', kind: vscode.CompletionItemKind.Function, detail: 'liberar(direccion)', doc: 'Libera un bloque de memoria previamente reservado (Módulo Bajo).' },
    { label: 'free', kind: vscode.CompletionItemKind.Function, detail: 'free(address)', doc: 'Frees a previously allocated memory block (Low Module).' },
    { label: 'guardar_entero', kind: vscode.CompletionItemKind.Function, detail: 'guardar_entero(dir, valor, bytes)', doc: 'Guarda un entero en little-endian en la memoria (Módulo Bajo).' },
    { label: 'store_int', kind: vscode.CompletionItemKind.Function, detail: 'store_int(addr, value, bytes)', doc: 'Stores a little-endian integer in memory (Low Module).' },
    { label: 'cargar_entero', kind: vscode.CompletionItemKind.Function, detail: 'cargar_entero(dir, bytes)', doc: 'Carga un entero en little-endian desde la memoria (Módulo Bajo).' },
    { label: 'load_int', kind: vscode.CompletionItemKind.Function, detail: 'load_int(addr, bytes)', doc: 'Loads a little-endian integer from memory (Low Module).' },
    { label: 'volcar', kind: vscode.CompletionItemKind.Function, detail: 'volcar(dir, cantidad)', doc: 'Imprime un volcado hexadecimal de memoria (Módulo Bajo).' },
    { label: 'dump', kind: vscode.CompletionItemKind.Function, detail: 'dump(addr, count)', doc: 'Prints a hexadecimal memory dump (Low Module).' },
    { label: 'empujar', kind: vscode.CompletionItemKind.Function, detail: 'empujar(byte)', doc: 'Empuja un byte en la pila LIFO (Módulo Bajo).' },
    { label: 'push', kind: vscode.CompletionItemKind.Function, detail: 'push(byte)', doc: 'Pushes a byte onto the LIFO stack (Low Module).' },
    { label: 'sacar', kind: vscode.CompletionItemKind.Function, detail: 'sacar()', doc: 'Extrae un byte de la cima de la pila LIFO (Módulo Bajo).' },
    { label: 'pop', kind: vscode.CompletionItemKind.Function, detail: 'pop()', doc: 'Pops a byte from the top of the LIFO stack (Low Module).' },
    { label: 'puntero_pila', kind: vscode.CompletionItemKind.Function, detail: 'puntero_pila()', doc: 'Devuelve la dirección del registro de pila SP (Módulo Bajo).' },
    { label: 'stack_pointer', kind: vscode.CompletionItemKind.Function, detail: 'stack_pointer()', doc: 'Returns the stack pointer register SP (Low Module).' },
    { label: 'memoria', kind: vscode.CompletionItemKind.Variable, detail: 'memoria[direccion]', doc: 'Arreglo de memoria física simulada para lectura y escritura de bytes (Módulo Bajo).' },
    { label: 'memory', kind: vscode.CompletionItemKind.Variable, detail: 'memory[address]', doc: 'Simulated physical memory array for byte read/write (Low Module).' }
];
function activate(context) {
    console.log('Extensión Radix Matix activada.');

    // 1. Creamos la colección de diagnósticos de VS Code
    const coleccionDiagnosticos = vscode.languages.createDiagnosticCollection('radixmatix');
    context.subscriptions.push(coleccionDiagnosticos);
    // 2. Ruta hacia nuestro script de Python
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
        // Al escribir o modificar el archivo
         vscode.workspace.onDidChangeTextDocument((evento) => {
            if (temporizadorDiagnostico) {
                clearTimeout(temporizadorDiagnostico);
            }
            temporizadorDiagnostico = setTimeout(() => {
                validarDocumento(evento.document, coleccionDiagnosticos, rutaScript);
            }, 300);
        }),
        // Al cerrar el archivo, limpiamos sus errores
        vscode.workspace.onDidCloseTextDocument((doc) => {
            coleccionDiagnosticos.delete(doc.uri);
        })
    );
        // 5. Proveedor de IntelliSense / Autocompletado
    const proveedorAutocompletado = vscode.languages.registerCompletionItemProvider(
        'radixmatix',
        {
            provideCompletionItems(documento, posicion) {
                return ELEMENTOS_INTELLISENSE.map(item => {
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