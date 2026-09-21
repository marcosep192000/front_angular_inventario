# Smoke test de producción: Lector Pixels

Marcar evidencia, dispositivo, SO/navegador, fecha y resultado.

## Windows e instalación

- [ ] Instalación limpia Windows 10 y 11 sin pasos técnicos del usuario.
- [ ] Reinicio: PostgreSQL, `InventarioPixel` y proxy arrancan automáticamente.
- [ ] Directorios/ACL en ProgramData; ningún secreto mutable en Program Files.
- [ ] Regla firewall TCP 8443, perfil Private, LocalSubnet; sin 8080/WAN/UPnP.
- [ ] Health indica HTTPS/certificado válidos y no expone secretos.
- [ ] Actualización conserva installationId, CA local, claves y certificado.
- [ ] Fallo de Scanner no impide venta, lector USB ni startup.

## Flujo funcional

- [ ] Nueva Venta → Usar celular → QR contiene exactamente scannerUrl/token.
- [ ] PC y móvil en el mismo Wi-Fi; conexión observada a IP LAN, no cloud.
- [ ] Estado PC: conectando, listo, código recibido, pérdida y expiración.
- [ ] EAN-13, EAN-8, UPC-A/E, CODE-128, CODE-39, ITF y QR según alcance.
- [ ] Lectura reutiliza `code` → `onSubmit()` → `searchForSale()`.
- [ ] Repetición legítima posterior se acepta; rebote inmediato se filtra.
- [ ] Finalizar invalida sesión; QR viejo no funciona.
- [ ] Dos móviles con el mismo QR cumplen política documentada y no mezclan cajas.

## Android Chrome

- [ ] Instala CA pública desde `/scanner/setup` y abre HTTPS sin warning; permite acceso LAN si Chrome lo solicita.
- [ ] Pide cámara, usa trasera, enfoca y lee EAN-13.
- [ ] BarcodeDetector funciona; prueba forzada de fallback ZXing.
- [ ] Linterna/cambio de cámara cuando el hardware lo admite.
- [ ] Background detiene cámara; regreso permite reanudar.

## iOS Safari

- [ ] Instala perfil CA, activa confianza total y abre HTTPS sin warning.
- [ ] Cámara trasera y ZXing leen EAN-13 y envían a Nueva Venta.
- [ ] Background, retorno, permiso denegado y sesión expirada son claros.

## Red y recuperación

- [ ] DHCP cambia 192.168.1.x → 192.168.0.x: detecta, conserva CA, regenera SAN y recupera.
- [ ] Reinicio del router y cambio de IP no requieren edición manual.
- [ ] Internet desconectado tras instalar CA: nueva sesión, cámara, scan y STOMP siguen funcionando.
- [ ] Certificado servidor próximo a vencer se regenera con la misma CA.

## Automatización

- [ ] Backend: `mvnw.cmd test` y `mvnw.cmd package`.
- [ ] Frontend: tests headless y `npm run build`.
- [ ] `git diff --check` en ambos repositorios.

Los ítems físicos Android/iOS, DNS público, certificado y cambio real de red no pueden darse por aprobados mediante tests unitarios.
