# Soporte de Lector Pixels

Diagnóstico seguro: consultar autenticado `GET /api/v1/scanner/health`. Devuelve disponibilidad, HTTPS, host, puerto, estado de certificado/provisionamiento e IPv4 LAN; no devuelve tokens, claves ni passwords.

| Síntoma | Comprobación | Acción de soporte |
|---|---|---|
| QR no abre | Mismo Wi-Fi, health, DNS del hostname, puerto 8443 | Reprovisionar DNS/firewall; no escribir IP manual |
| Advertencia SSL | CA local confiada, SAN/IP y fecha | Instalar CA pública desde `/scanner/setup` o ejecutar reparación; no continuar warning |
| Cámara no inicia | HTTPS, permiso cámara, otra app usando cámara | Rehabilitar permiso del sitio/cerrar otra app |
| Pide “red local” | Chrome moderno | El usuario debe permitirlo; es independiente de cámara |
| Permiso denegado | Ajustes del sitio en navegador | Permitir cámara y recargar QR vigente |
| Sesión vencida | Estado 410 | Generar nuevo QR desde Nueva Venta |
| STOMP desconectado | Backend 8080 local, JWT y logs por sessionId | Restablecer backend; no copiar JWT a tickets |
| Cambió IP | IP health vs SAN del certificado | Esperar monitor o ejecutar reparación; conserva la misma CA |
| Puerto ocupado | Listener TCP 8443 | Identificar conflicto y reiniciar proxy; no cambiar puerto a mano |
| Sin Internet | Wi-Fi LAN y certificado vigente | Todo el flujo Scanner continúa sin DNS ni Internet |

En `LOCAL_LAN` soporte puede guiar la instalación única de la CA pública. Nunca entregar PKCS12/password/private key, aceptar warnings, abrir puertos WAN, ejecutar flags de Chrome ni enviar tokens completos.
