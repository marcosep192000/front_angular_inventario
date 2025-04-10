const fs = require('fs-extra');
const path = require('path');

const source = path.join(__dirname, '../dist/inventario-pixels/browser');
const destination = path.join(__dirname, '../electron/dist/inventario-pixels/browser');

async function copyAngularBuild() {
  try {
    await fs.remove(destination); // eliminar si ya existe
    await fs.copy(source, destination);
    console.log('✅ Build de Angular copiada con éxito para Electron.');
  } catch (err) {
    console.error('❌ Error al copiar la build de Angular:', err);
  }
}

copyAngularBuild();