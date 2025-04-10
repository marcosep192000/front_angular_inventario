const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;


const fs = require('fs');


// 🔍 Función para buscar la ubicación de Java instalada
function findJavaExecutable() {
  const possiblePaths = [
    process.env.JAVA_HOME && path.join(process.env.JAVA_HOME, 'bin', 'java.exe'),
    'C:\\Program Files\\Java\\jdk-19\\bin\\java.exe',
    'C:\\Program Files\\Java\\jre-19\\bin\\java.exe',
    'C:\\Program Files (x86)\\Java\\jre-19\\bin\\java.exe',
    'java' // fallback si está en PATH
  ];

  for (const javaPath of possiblePaths) {
    if (javaPath && fs.existsSync(javaPath)) {
      return javaPath;
    }
  }

  return null;
}

// 🚀 Función para iniciar el backend
function startBackend() {
  const java = findJavaExecutable();

  if (!java) {
    dialog.showErrorBox("Error", "No se encontró Java en el sistema. Por favor, instale Java o agréguelo al PATH.");
    return;
  }

  let jarPath;

  if (process.defaultApp || /[\\/]electron[\\/]/.test(process.execPath)) {
    jarPath = path.join(__dirname, '..', 'backend', 'inventario-pixels-0.0.1-SNAPSHOT.jar');
  } else {
    jarPath = path.join(process.resourcesPath, 'inventario-pixels-0.0.1-SNAPSHOT.jar');
  }

  console.log(`🟡 Iniciando backend con Java en: ${jarPath} usando: ${java}`);

  const javaProcess = spawn(java, ['-jar', jarPath], {
    cwd: path.dirname(jarPath),
    shell: false
  });

  javaProcess.stdout.on('data', (data) => {
    console.log(`🟢 Backend stdout: ${data}`);
  });

  javaProcess.stderr.on('data', (data) => {
    console.error(`🔴 Backend stderr: ${data}`);
  });

  javaProcess.on('close', (code) => {
    console.log(`🔵 Backend terminó con código: ${code}`);
  });

  javaProcess.on('error', (err) => {
    console.error(`🔴 Error al iniciar Java: ${err}`);
  });
}


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true
    }
  });

  // Ruta al frontend Angular compilado
  const frontendPath = path.join(__dirname, '..', 'dist', 'inventario-pixels', 'browser', 'index.html');
  mainWindow.loadFile(frontendPath);
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
