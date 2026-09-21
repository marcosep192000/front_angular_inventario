# Lector Pixels: arquitectura LAN

## Modo activo: LOCAL_LAN

La versión actual es gratuita, no usa dominio, DNS, ACME, VPS ni Scanner Cloud. HTTP 8080 sigue siendo el acceso normal del ERP y un segundo conector Tomcat sirve HTTPS 8443 con un certificado firmado por la CA local de esa instalación.

```text
PC / Nueva Venta ──sesión──> Backend HTTP localhost:8080
        │                              │
        └── QR https://IP:8443         └── STOMP ──> Nueva Venta
                     │                      ▲
                     ▼                      │
Celular ──HTTPS / Wi-Fi LAN :8443──> POST /scan
```

El QR contiene únicamente `https://<IPv4-LAN>:8443/scanner/<token-temporal>`. Las lecturas no salen de la LAN y funcionan sin Internet después de instalar la CA pública en el teléfono.

## Certificados

El instalador ejecuta `setup-scanner-production.ps1` como Administrador. La primera ejecución crea:

- CA RSA 4096 autofirmada, válida diez años;
- CA pública DER descargable (`inventario-pixels-local-ca.cer`);
- CA privada PKCS12 protegida (`inventario-pixels-local-ca.p12`);
- certificado servidor RSA 3072, EKU Server Authentication, válido dos años;
- SAN DNS `localhost` e IP `127.0.0.1` más la IPv4 LAN detectada;
- `scanner-server.p12` y password aleatorio de 256 bits.

Todo vive en `C:\ProgramData\InventarioPixel\certs`, fuera de Git. Password, CA privada y keystore reciben ACL para SYSTEM y Administradores. `/scanner/setup/ca.cer` sólo entrega la CA pública; nunca PKCS12, private key ni password.

## Red y cambio de IP

Se elige la IPv4 RFC1918 del adaptador activo con ruta predeterminada. Se descartan loopback, APIPA, VPN y adaptadores virtuales conocidos. Una tarea SYSTEM ejecuta el monitor al arrancar Windows y cada cinco minutos.

Si cambia la IP, conserva installationId y CA, firma un certificado servidor nuevo con el SAN actualizado, reemplaza el keystore/configuración de forma atómica y reinicia sólo `InventarioPixel`. Por eso los teléfonos que ya confían en la CA no reinstalan otra raíz.

Firewall: TCP 8443, perfil Private y `LocalSubnet`. No se abre router, WAN, 8080, PostgreSQL, port forwarding ni UPnP.

## Cliente móvil

La página verifica `window.isSecureContext` antes de `getUserMedia`, prioriza `facingMode: environment`, usa BarcodeDetector cuando existe y ZXing 0.2.1 local como fallback. Incluye entrada manual, vibración/bip, linterna, cambio de cámara, filtro de rebotes y pausa al ir a segundo plano. CSP, Permissions-Policy, no-referrer, nosniff y no-store limitan la página.

Android/iOS requieren instalar y confiar manualmente la CA una vez. Es una concesión explícita de `LOCAL_LAN`, no la arquitectura comercial final. Chrome moderno también puede pedir permiso de acceso a red local.

## Health y degradación

`GET /api/v1/scanner/health` requiere autenticación y devuelve sólo disponibilidad, modo, HTTPS, host, puerto, IP y estado real del keystore/SAN. Certificado ausente, inválido, vencido o con SAN incorrecto deja Scanner no disponible, pero no impide arrancar el ERP HTTP, ventas tradicionales o lector USB. El conector 8443 sólo se agrega cuando existen keystore y password.

## Modo futuro: PUBLIC_TRUSTED

`PUBLIC_TRUSTED` queda reservado y desactivado. En una versión comercial podrá usar hostname aleatorio por instalación, dominio Pixels, DNS público hacia la IP privada y certificado público DNS-01. Evitaría instalar CA en teléfonos sin enviar lecturas por Internet. No se implementaron ni contrataron esos componentes.

| Estrategia | Coste externo | Paso manual teléfono | Offline LAN | Estado |
|---|---:|---:|---:|---|
| CA local + IP SAN | Cero | Instalar CA una vez | Sí | `LOCAL_LAN`, activa |
| Certificado autofirmado servidor | Cero | Warning no seguro | Sí | Descartada |
| Certificado público para IP privada | — | No | Sí | Inviable para CA pública |
| Dominio + DNS-01 | Dominio/infraestructura | No | Depende de resolución | `PUBLIC_TRUSTED`, futuro |
| Túnel cloud | Infraestructura | No | No | Descartado para lecturas LAN |

## Límites y fuentes

Una CA local instalada manualmente es necesaria porque `getUserMedia` exige contexto seguro y una CA pública no firma direcciones IP reservadas. [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), [CA/Browser Forum](https://cabforum.org/working-groups/server/baseline-requirements/requirements/). BarcodeDetector no es universal, de ahí [ZXing Browser](https://github.com/zxing-js/browser). El modo público futuro se apoyaría en [DNS-01](https://letsencrypt.org/docs/challenge-types/).

La validación final requiere prueba física Android e iOS; tests automáticos no pueden instalar la CA ni verificar cámara/enfoque reales.
