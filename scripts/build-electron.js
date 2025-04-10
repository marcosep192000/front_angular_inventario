const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

// 📌 Paso 1: Limpiar carpeta release
const releasePath = path.join(__dirname, "release");
fs.removeSync(releasePath);
console.log("🧹 Carpeta 'release' limpia.");

// 📌 Paso 2: Compilar Angular
console.log("🏗️ Compilando Angular...");
execSync("ng build --configuration=production", { stdio: "inherit" });

// 📌 Paso 3: Copiar archivos adicionales (si tenés algún script como 'copy-angular.js', podés llamarlo acá)
console.log("📁 Archivos listos para empaquetar.");

// 📌 Paso 4: Ejecutar electron-builder
console.log("📦 Empaquetando con electron-builder...");
execSync("electron-builder", { stdio: "inherit" });

console.log("✅ Build completo. El instalador se encuentra en /release");
