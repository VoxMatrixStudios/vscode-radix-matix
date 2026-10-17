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
}

function deactivate() {
    // Limpieza al apagar la extensión
}
module.exports = {
    activate,
    deactivate
};