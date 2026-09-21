# Smoke test comercial

## Instalacion limpia

- Windows x64, PostgreSQL existente y DB de prueba respaldada.
- Ejecutar DryRun y luego instalar elevado.
- Confirmar servicio Running, login, venta, HTTP 8080, HTTPS 8443, health, setup y scanner.

## Reinstalacion y update

- Registrar huellas de CA/config y conteos DB; reinstalar y confirmar que no cambian ni se duplican servicio/reglas.
- Ejecutar `-Update`; comprobar backup, DB intacta y health. Probar rollback solo en ambiente aislado.

## IP, Repair y Uninstall

- Cambiar IP, ejecutar Repair, comprobar nuevo SAN y misma CA.
- Borrar regla 8443 en laboratorio; Repair debe recrearla sin tocar DB.
- Desinstalar y confirmar binarios/servicio ausentes, con ProgramData, DB, backups y CA preservados.
