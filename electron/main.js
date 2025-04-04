const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow;
let springProcess;
let angularProcess;

// Ruta del JAR de Spring Boot (corregida)
const springJarPath = "D:/proyectos BACKEND/inventario_Final/Inventario-pixel/target/inventario-pixels-0.0.1-SNAPSHOT.jar";

// Función para verificar si Angular está listo
function checkAngularReady(callback) {
  const check = () => {
    http
      .get("http://localhost:4200", (res) => {
        if (res.statusCode === 200) {
          console.log("✅ Angular está listo");
          callback();
        } else {
          console.log("🔄 Esperando Angular...");
          setTimeout(check, 2000);
        }
      })
      .on("error", () => {
        console.log("🔄 Angular aún no está disponible...");
        setTimeout(check, 2000);
      });
  };
  check();
}

app.whenReady().then(() => {
  console.log("🚀 Iniciando aplicación...");

  // 1️⃣ Iniciar Spring Boot
  console.log("🔹 Iniciando Spring Boot...");
  springProcess = spawn("java", ["-jar", springJarPath]);

  springProcess.stdout.on("data", (data) =>
    console.log(`Spring Boot: ${data}`)
  );
  springProcess.stderr.on("data", (data) =>
    console.error(`Error en Spring Boot: ${data}`)
  );

  // 2️⃣ Iniciar Angular
  console.log("🔹 Iniciando Angular...");
  angularProcess = spawn("cmd", ["/c", "npm", "start"], { shell: true });

  angularProcess.stdout.on("data", (data) => console.log(`Angular: ${data}`));
  angularProcess.stderr.on("data", (data) =>
    console.error(`Error en Angular: ${data}`)
  );

  // 3️⃣ Esperar hasta que Angular esté listo y abrir Electron
  checkAngularReady(() => {
    console.log("✅ Creando ventana Electron...");
    mainWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      frame: true,
      resizable: false,
      webPreferences: { nodeIntegration: false },
    });

    mainWindow.loadURL("http://localhost:4200");

    mainWindow.on("closed", () => {
      mainWindow = null;
      cerrarProcesos();
    });
  });
});

// Cerrar procesos al cerrar la ventana
app.on("window-all-closed", () => {
  cerrarProcesos();
  if (process.platform !== "darwin") app.quit();
});

function cerrarProcesos() {
  if (springProcess) {
    console.log("🛑 Cerrando Spring Boot...");
    springProcess.kill();
  }
  if (angularProcess) {
    console.log("🛑 Cerrando Angular...");
    angularProcess.kill();
  }
}
