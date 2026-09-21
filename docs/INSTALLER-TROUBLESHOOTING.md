# Diagnostico del instalador

- **Administrador:** vuelva a abrir PowerShell como administrador.
- **Release incompleto:** reconstruya el payload; requiere JAR, `bin\java.exe`, WinSW y setup scanner.
- **PostgreSQL payload FAIL:** debe contener `postgresql\postgresql-18.6-1-windows-x64.exe`, con firma Authenticode valida de EnterpriseDB.
- **Cluster INCOMPATIBLE/INCOMPLETE:** el instalador se detiene sin borrar datos. Respalde y haga diagnostico PostgreSQL antes de continuar.
- **Servicio/puerto:** confirme `postgresql-x64-18` Running y `127.0.0.1:5432`. Restos de PostgreSQL 16 no se consideran una instalacion 18.
- **Puerto 8080 ocupado:** identifique el PID informado antes de detenerlo.
- **Servicio no inicia:** revise `C:\ProgramData\InventarioPixel\logs` y la configuracion PROD.
- **Keystore/HTTPS:** ejecute Repair; conserva la CA y repara certificado/regla 8443.
- **Celular:** confirme misma Wi-Fi, IP actual y CA publica instalada.

Nunca comparta passwords, JWT, claves privadas ni archivos PKCS#12.
