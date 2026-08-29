# Integración LAN con Spring Boot

## Estado validado

- Rama conservada: `deploy/frontend-prod`.
- Angular CLI/Core: `17.3.x`.
- Comando de desarrollo: `npm start` (`ng serve`).
- Comando reproducible: `npm ci` seguido de `npm run build`.
- Build de producción validado correctamente el 29/08/2026.
- Artefacto validado con `index.html`, JavaScript, CSS, favicon, assets e iconos locales.
- `base href` final: `/`.

## Requisitos de compilación

- Node.js 20 LTS recomendado (Angular 17 también admite Node 18 compatible).
- npm y el archivo `package-lock.json` presentes.

Para generar un artefacto reproducible desde la raíz del frontend:

```powershell
.\scripts\build-production.ps1
```

El artefacto que debe consumir el backend es el contenido completo de:

```text
dist/inventario-pixels/browser
```

`dist` está ignorado por Git; no debe versionarse.

Los archivos de Material Icons se incluyen en `assets/fonts`; la interfaz no
necesita Google Fonts para mostrar sus iconos en una instalación sin Internet.

## API y red local

El build de producción usa la base relativa `/api/v1/`. Si el servidor se abre en
`http://IP_DEL_SERVIDOR:PUERTO`, el navegador solicitará automáticamente
`http://IP_DEL_SERVIDOR:PUERTO/api/v1/...`. No hay IP ni puerto de backend
hardcodeados en producción.

En desarrollo `npm start` conserva la URL `http://localhost:8080/api/v1/`.

Todos los servicios importan `environments.ts`. El reemplazo configurado en
`angular.json` aplica `environments.prod.ts` exclusivamente durante el build de
producción. De esta manera `ng serve` conserva el backend local y producción usa
la API relativa.

## Integración en Spring Boot

1. Copiar **el contenido** de `dist/inventario-pixels/browser` a
   `src/main/resources/static/` del repositorio backend.
2. Configurar Spring Boot para que las rutas del frontend (por ejemplo
   `/dashboard/product-list` o `/dashboard/client-list`) que no sean `/api/**`
   ni recursos estáticos reenvíen a `index.html`.
3. Servir Spring Boot en la interfaz de red LAN del servidor.

El backend debe implementar fallback SPA: una ruta Angular solicitada directamente
o recargada con F5 debe reenviarse a `/index.html`, excepto `/api/**` y los archivos
estáticos existentes.

No usar `ng serve` en producción. Las PC cliente solo necesitan un navegador.

## Rama

La preparación se mantiene en la rama `deploy/frontend-prod`.

## Observación

El tablero consulta la cotización mediante `dolarapi.com`. Esa función puede no
actualizarse sin Internet, pero no interviene en el inicio, las ventas ni el resto
de la operación local. El frontend y sus iconos sí quedan empaquetados localmente.

## Resultado y advertencias

```text
FRONTEND READY FOR BACKEND INTEGRATION
Artifact: dist/inventario-pixels/browser
API producción: /api/v1/
API desarrollo: http://localhost:8080/api/v1/
```

- El entorno usado para la última validación tenía Node `24.18.0`; el build fue
  exitoso, pero para instalaciones repetibles se recomienda Node 20 LTS.
- Angular informó que el bundle inicial mide `2.01 MB`, aproximadamente `12 kB`
  sobre el presupuesto de advertencia. No bloquea el build ni el despliegue.
- `npm ci` informó vulnerabilidades transitivas de dependencias existentes. No se
  ejecutó `npm audit fix` ni se actualizaron paquetes para evitar cambios de versión
  fuera del alcance de estabilización LAN.
- El enlace al portfolio de la pantalla de login es externo y opcional; no participa
  en la operación del sistema.
