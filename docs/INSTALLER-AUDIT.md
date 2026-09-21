# Auditoria previa del instalador

## Reutilizable

- Angular produce `dist/inventario-pixels/browser`.
- `build-release.ps1` integra ese dist en el JAR Spring Boot y verifica `static/index.html`.
- El artefacto Maven real es `inventario-pixels-0.0.1-SNAPSHOT.jar`; el release lo normaliza a `app/inventario-pixels.jar`.
- PROD ya usa `C:\ProgramData\InventarioPixel\config`, logs externos y perfil `prod`.
- `scanner-production.properties` esta importado explicitamente y el setup LOCAL_LAN ya es idempotente.
- Icono oficial: `src/assets/icons/ICONOPIXELS.ico`.

## Faltante al auditar

- No habia WinSW ni XML de servicio versionados, JRE redistribuible, layout comercial, instalador maestro, uninstall ni Inno Setup.
- No habia PostgreSQL dentro del payload ni codigo para instalar binarios, registrar el servicio, validar el cluster o crear la base. El instalador solo comprobaba TCP y abortaba.
- El Electron existente inicia otro backend y busca Java 19 del sistema; no es compatible con la estrategia unica de servicio comercial.

## Duplicado o riesgoso

- Habia scripts separados de firewall 8080 y scanner 8443; el maestro los coordina con nombres propios e idempotentes.
- No se debe copiar `application.properties` de desarrollo, porque contiene defaults locales no aptos para clientes.
- No se deben reemplazar ProgramData, DB, licencia o CA durante reinstalacion/update.
- No se descarga PostgreSQL: se incorpora el instalador oficial firmado `postgresql-18.6-1-windows-x64.exe`. Los secretos se pasan en un option-file temporal con ACL, nunca como argumentos ni en el log de Pixels.
