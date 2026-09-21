# Instalador de Lector Pixels LOCAL_LAN

El instalador principal debe ejecutar elevado y automáticamente:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<ruta instalada>\setup-scanner-production.ps1"
```

El cliente final no ejecuta este comando. El script es idempotente y realiza:

1. Crea directorios `scanner`, `certs` y `config` en ProgramData.
2. Genera o reutiliza installationId UUID.
3. Detecta IPv4 LAN por ruta predeterminada.
4. Genera password aleatorio, CA local y CA pública si faltan.
5. Genera `scanner-server.p12` con SAN localhost/127.0.0.1/IP LAN.
6. Escribe atómicamente `scanner-production.properties` en modo LOCAL_LAN.
7. Aplica ACL a secretos para SYSTEM y Administradores.
8. Reemplaza idempotentemente la regla firewall TCP 8443/Private/LocalSubnet.
9. Registra `Inventario Pixels - Monitor Scanner LAN` al startup y cada cinco minutos.
10. Reinicia `InventarioPixel` cuando la preparación inicial o un cambio de IP lo requiere.

El perfil `prod` importa automáticamente el archivo externo. WinSW debe conservar:

```text
--spring.profiles.active=prod
--spring.config.additional-location=optional:file:C:/ProgramData/InventarioPixel/config/
```

En una actualización se reemplazan binarios/scripts, nunca `C:\ProgramData\InventarioPixel`. Backup mínimo: `scanner/`, `certs/` y `config/scanner-production.properties`; debe protegerse como secreto porque contiene CA privada y keystore.

Para diagnóstico sin tocar firewall/servicio/tareas existen switches de prueba `-SkipFirewall -SkipMonitorRegistration -SkipServiceRestart -SkipAcl`. No deben usarse en la instalación comercial.
