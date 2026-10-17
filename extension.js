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
    { label: 'e', kind: vscode.CompletionItemKind.Constant, detail: 'e = 2.71828...', doc: 'Constante matemática de Euler.' }
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