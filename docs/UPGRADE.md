# Actualizacion

Ejecute el instalador con `-Update`. Detiene `InventarioPixel`, respalda el JAR y realiza un backup PostgreSQL custom verificado en `C:\ProgramData\InventarioPixel\backups`. Después aplica, en orden, sólo las migraciones pendientes V8, V9 y V10 mediante la tabla `inventario_schema_migration`. Recién entonces reemplaza recursos, configura WinSW y ejecuta healthchecks.

`ddl-auto` no es el mecanismo de upgrade de V8–V10. El runner comercial usa `psql`, transacciones y `ON_ERROR_STOP`. Si el backup, su verificación o una migración fallan, el proceso aborta y el servicio permanece detenido. No borre ProgramData, su carpeta `backups`, la configuración, licencia ni certificados.

Instalación nueva: el esquema inicial lo crea la aplicación; no se ejecutan migraciones históricas antes del primer inicio.

Actualización existente: revise `install\install.log`, conserve el backup y valide login, productos, clientes, ventas, caja, ARCA y módulos opcionales después del arranque.

Restore de soporte: mantenga el servicio detenido y ejecute `restore-postgresql-backup.ps1` indicando el backup elegido. El script valida primero el formato con `pg_restore --list` y exige confirmación antes de restaurar. Verifique la base y sólo entonces inicie `InventarioPixel`.
