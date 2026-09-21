# Instalacion comercial

El release usa un unico JAR Spring Boot con Angular embebido; no usa Electron. Los binarios quedan en `C:\Program Files\InventarioPixel` y los datos en `C:\ProgramData\InventarioPixel`.

Se requieren el JRE 17 x64, WinSW x64 y el instalador oficial `postgresql-18.6-1-windows-x64.exe`. Construya el payload con `build-commercial-release.ps1`, usando `-PostgreSqlInstaller`; se valida nombre, tamaño, firma Authenticode de EnterpriseDB y, opcionalmente, `-PostgreSqlSha256`. El build normaliza las rutas a `app\inventario-pixel.jar` y `runtime\jre\bin\java.exe`.

En una PC limpia, el instalador EDB se ejecuta mediante un option-file temporal protegido y modo unattended. En Repair, nunca recibe el data existente: se usa `extract-only` en staging y se copian solo binarios, librerias y recursos antes de registrar el servicio contra el cluster preservado. Finalmente se verifica la base `inventario`.
