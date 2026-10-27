// validador.js — ejecuta server/rm_check.py y pinta los diagnósticos.
// Reemplaza a la función validarDocumento() que estaba en extension.js (E1, E2, E3, E5, E6, E7).
const vscode = require('vscode');
const { spawn } = require('child_process');

const TIEMPO_MAXIMO_MS = 5000;
const versiones = new Map();      // uri -> contador, para descartar respuestas viejas (E6)
let avisoSinMotorMostrado = false;

function validarDocumento(documento, coleccionDiagnosticos, rutaScript) {
    if (documento.languageId !== 'radixmatix') {
        return;
    }
    // E13: en carpetas no confiables no se ejecuta Python
    if (!vscode.workspace.isTrusted) {
        coleccionDiagnosticos.delete(documento.uri);
        return;
    }

    const config = vscode.workspace.getConfiguration('radixmatix');
    if (!config.get('diagnosticos', true)) {
        coleccionDiagnosticos.delete(documento.uri);
        return;
    }
    const python = config.get('pythonPath', '') || (process.platform === 'win32' ? 'python' : 'python3');
    const ruta = config.get('corePath', '');

    const clave = documento.uri.toString();
    const miVersion = (versiones.get(clave) || 0) + 1;
    versiones.set(clave, miVersion);

    const args = [rutaScript];
    if (ruta) {
        args.push('--core', ruta);
    }

    let proceso;
    try {
        proceso = spawn(python, args, { env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
    } catch (e) {
        coleccionDiagnosticos.set(documento.uri, []);
        return;
    }

    let salida = '';
    let terminado = false;

    const limpiar = () => {
        terminado = true;
        clearTimeout(reloj);
    };

    // E7: si el análisis se cuelga, se corta y no se muestra nada
    const reloj = setTimeout(() => {
        if (!terminado) {
            proceso.kill();
        }
    }, TIEMPO_MAXIMO_MS);

    // E5: sin Python o con error de ejecución, la extensión sigue viva y callada
    proceso.on('error', () => {
        limpiar();
        coleccionDiagnosticos.set(documento.uri, []);
    });
    proceso.stdin.on('error', () => { /* el proceso terminó antes de leer: ignorar */ });

    proceso.stdout.on('data', (datos) => { salida += datos.toString(); });

    proceso.on('close', () => {
        limpiar();
        if (versiones.get(clave) !== miVersion) {
            return; // llegó una respuesta vieja: ya hay una más reciente (E6)
        }
        let respuesta;
        try {
            respuesta = JSON.parse(salida);
        } catch (e) {
            coleccionDiagnosticos.set(documento.uri, []);
            return;
        }

        // E1: sin núcleo del lenguaje no hay diagnósticos, pero tampoco errores falsos
        if (!respuesta.motor) {
            coleccionDiagnosticos.set(documento.uri, []);
            if (!avisoSinMotorMostrado) {
                avisoSinMotorMostrado = true;
                vscode.window.showInformationMessage(
                    'Radix Matix: para ver errores mientras escribes, indica la carpeta src del lenguaje en el ajuste "radixmatix.corePath". El resaltado y las plantillas funcionan sin eso.'
                );
            }
            return;
        }

        const lista = [];
        for (const err of respuesta.diagnosticos || []) {
            const linea = Math.max(0, (err.linea || 1) - 1);
            const columna = Math.max(0, (err.columna || 1) - 1);
            // E10 (parcial): subrayar la palabra que está en esa posición
            const rangoPalabra = documento.getWordRangeAtPosition(new vscode.Position(linea, columna));
            const rango = rangoPalabra || new vscode.Range(linea, columna, linea, columna + 1);
            const severidad = err.gravedad === 'Warning'
                ? vscode.DiagnosticSeverity.Warning
                : vscode.DiagnosticSeverity.Error;
            lista.push(new vscode.Diagnostic(rango, `[Radix Matix] ${err.mensaje}`, severidad));
        }
        coleccionDiagnosticos.set(documento.uri, lista);
    });

    try {
        proceso.stdin.write(documento.getText());
        proceso.stdin.end();
    } catch (e) { /* ya lo maneja el evento 'error' */ }
}

module.exports = { validarDocumento };
