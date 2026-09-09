# Smoke test comercial — Release Candidate

**Fecha:** 9 de septiembre de 2026  
**Alcance:** frontend Angular, backend Spring Boot, PostgreSQL 18 y API local de Inventario Pixels.  
**Restricciones respetadas:** sin ventas ni movimientos sobre datos reales, sin llamadas reales a ARCA, sin commit y sin push.

## Veredicto

**B) APTO CON VALIDACIONES MANUALES PENDIENTES**

No quedaron defectos críticos conocidos. Los dos defectos altos reproducidos durante este smoke test fueron corregidos y validados. Antes de instalar en un cliente deben completarse el recorrido visual/operativo del checklist y las tres resoluciones responsive. La instalación comercial debe activar el perfil `prod` y aportar sus variables de base de datos; ese perfil arranca con `ddl-auto=validate`.

## Resumen ejecutivo

| Área | Estado | Evidencia principal |
|---|---|---|
| Backend | Aprobado | 340/340 pruebas en PostgreSQL |
| Frontend | Aprobado | 213/213 pruebas en Chrome Headless |
| Build backend | Aprobado | JAR ejecutable generado |
| Build frontend | Aprobado con advertencias | Build production generado; presupuesto inicial excedido y dos dependencias CommonJS |
| API local | Aprobado | Auth, productos, proveedores, caja, tickets, PDFs, compras y reportes respondieron correctamente |
| Responsive | **PENDIENTE VALIDACIÓN MANUAL** | Debe revisarse a 1366, 390 y 360 px |
| ARCA | Sin ejecución real | Validado exclusivamente por código y pruebas automatizadas |

## VALIDADO AUTOMÁTICAMENTE

### Backend y empaquetado

- `mvn clean test` contra una base PostgreSQL 18 descartable: **340 pruebas, 0 fallos, 0 errores, 0 omitidas**.
- `mvn package -DskipTests`: **BUILD SUCCESS**; se generó `target/inventario-pixels-0.0.1-SNAPSHOT.jar`.
- El intento previo con H2 produjo errores de entorno: sintaxis y funciones propias de PostgreSQL (`to_regclass`), palabras reservadas y tipos incompatibles. La misma suite completa pasa en PostgreSQL. No se alteró producción para acomodar H2.
- Arranque de producción probado en una base descartable: health HTTP 200 con `ddl-auto=validate` y licencia habilitada.
- Se repitió el arranque y los datos base permanecieron idempotentes: una empresa, un administrador, un PuntoCaja principal, una caja semilla, categoría/marca “Varios”, proveedor anónimo y consumidor final.

### Frontend y build

- Suite Angular completa: **213 pruebas, 213 exitosas**.
- Build production: **exitoso**, salida en `dist/inventario-pixels`.
- Advertencias no bloqueantes: bundle inicial de 2,68 MB frente al presupuesto de 2 MB; `qrcode` y `@stomp/stompjs` se empaquetan como CommonJS.

### API smoke sobre la instancia local

- Autenticación: login correcto, refresh 200, logout 204 y token invalidado; credenciales erróneas y acceso sin sesión devuelven 401.
- Productos: listado operativo (17.610 productos), consulta de proveedores por producto y configuración de venta.
- Búsqueda: `0101` conserva los ceros y devuelve primero la coincidencia exacta de `barCode`.
- Proveedores, puntos de caja, caja abierta, histórico, auditoría, órdenes de compra, productos de compra y unidades de inventario: HTTP 200.
- Estado real leído sin modificar: un PuntoCaja activo y una sola sesión abierta asociada. Existe una fila histórica legada sin PuntoCaja, contemplada por compatibilidad.
- Tickets e impresión: listado operativo y PDFs A4, ticket 58 mm, ticket 80 mm y cierre de caja con HTTP 200 y `application/pdf`.
- Reportes: dashboard, ventas por día, últimas ventas, resumen, top de productos, rentabilidad, alertas de costo y listas de precios respondieron correctamente.
- La reimpresión se ejecutó sobre comprobantes existentes. Antes y después se mantuvieron iguales: 8 tickets, 12 movimientos, 0 documentos fiscales y stock total 347. No se creó venta, movimiento, cambio de stock ni operación ARCA.
- En una copia descartable se verificó el listado de movimientos (HTTP 200, 12 registros) y un egreso en efectivo deliberadamente imposible (HTTP 409, sin insertar movimiento).

## VALIDADO POR CÓDIGO/TESTS

### Bugs recientes

- **Saldo insuficiente:** responde 409 con `INSUFFICIENT_CASH_BALANCE` y conserva un mensaje humano. El rechazo ocurre antes de persistir el movimiento.
- **Empleados:** el modal no los solicita en `ngOnInit`; sólo llama al endpoint al elegir `PAGO_SUELDO` o `ADELANTO`.
- **Proveedor de producto:** crear o editar asegura la relación `ProductSupplier`, evita duplicados y conserva los demás proveedores existentes.
- **Nueva Venta:** la búsqueda da prioridad al `barCode` exacto, preserva ceros iniciales y evita que respuestas antiguas de debounce/Enter sustituyan la búsqueda vigente.

### Caja 2.0

- Resolución automática cuando existe un único PuntoCaja activo.
- Selección obligatoria cuando hay varios puntos y rechazo de puntos inactivos.
- La sesión abierta se resuelve por PuntoCaja; varios puntos pueden trabajar simultáneamente sin compartir sesión.
- Apertura, cierre, usuario de apertura, usuario de cierre, `usuarioOperacion`, `usuarioVenta` y registros históricos con referencias `NULL` están contemplados por servicios, DTO y pruebas.
- Los movimientos se proyectan a DTO dentro de una transacción de sólo lectura para evitar proxies lazy fuera de sesión.

### Impresión, Cuenta Corriente y ARCA

- Los servicios de A4 y tickets térmicos 58/80 son de sólo lectura; descarga y reimpresión no llaman a persistencia de venta, stock, Caja ni fiscalización.
- Cobros y reportes de Cuenta Corriente tienen pruebas de servicio dentro de la suite completa.
- Mapeos fiscales, notas de crédito/débito, validaciones previas, CAE y QR están cubiertos por pruebas. **No se contactó ARCA real.**

## Bugs reales encontrados

| Severidad | Módulo | Reproducción y estado anterior | Resultado esperado | Causa | Corrección/estado | Riesgo pendiente |
|---|---|---|---|---|---|---|
| ALTA | Caja / movimientos | Un egreso mayor al saldo devolvía 400 con texto genérico | 409 con explicación utilizable | Un handler genérico de `RuntimeException` interceptaba `SaldoInsuficienteException` | **Corregido y probado:** 409, código estable y mensaje humano | Ninguno conocido |
| ALTA | Caja / historial de movimientos | `GET /api/v1/cajas/movimiento` fallaba con 400 al serializar datos reales | 200 con el historial | Se devolvían entidades JPA con relaciones lazy y `open-in-view=false` | **Corregido y probado:** DTO armado dentro de transacción read-only | Ninguno conocido |
| BAJA | Caja | `GET /api/v1/cajas/ventas-diarias` devuelve cuerpo vacío y no tiene consumidor frontend localizado | Un contrato implementado o endpoint retirado | Método incompleto legado | **Pendiente**, fuera del flujo usado y sin impacto observado | Puede confundir a un integrador externo |

No se encontraron bugs críticos. Los dos bugs altos quedaron corregidos con alcance pequeño y pruebas de regresión. El endpoint legado de ventas diarias no bloquea este RC porque el dashboard usa su endpoint específico y probado.

## Estado funcional por módulo

- **Caja:** API, apertura contextual, históricos, auditoría, saldo insuficiente y PDF validados. Falta el recorrido visual y un cierre controlado manual.
- **Productos:** API, búsqueda, código exacto y reglas de proveedores validados. Falta confirmar el formulario completo en navegador.
- **Nueva Venta:** búsqueda y estado de caja validados por tests; falta una venta manual controlada en el entorno elegido por el responsable.
- **Impresión:** generación HTTP y ausencia de mutaciones validadas; falta revisar legibilidad y corte físico/visual.
- **Proveedores:** endpoints, ProductSupplier, reportes y listas de precios validados.
- **Cuenta Corriente:** servicios y pruebas aprobados; falta un circuito visual controlado de venta/cobro.
- **Responsive:** **PENDIENTE VALIDACIÓN MANUAL**.

## PENDIENTE VALIDACIÓN MANUAL

Ejecutar en un entorno de prueba o sobre registros creados expresamente para el smoke. Los pasos que crean venta, cobro o movimientos modifican ese entorno.

| # | Módulo | PASO | RESULTADO ESPERADO |
|---:|---|---|---|
| 1 | Login | Ingresar con usuario válido. | Abre el dashboard sin error y muestra la sesión correcta. |
| 2 | Login | Cerrar sesión e intentar volver con el botón Atrás. | No permite entrar a vistas protegidas; redirige al login. |
| 3 | Productos | Crear un producto de prueba con código `0101` y un proveedor. | Guarda el producto y muestra el proveedor asociado una sola vez. |
| 4 | Productos | Editar el producto y agregar un segundo proveedor. | Conserva el primero, agrega el segundo y no crea duplicados. |
| 5 | Productos | Buscar `0101` en el listado/formulario. | Conserva los ceros y encuentra el producto correcto. |
| 6 | Nueva Venta | Escribir `0101` y pulsar Enter mientras todavía corre la búsqueda. | La coincidencia exacta aparece primero y no es reemplazada por una respuesta anterior. |
| 7 | Nueva Venta | Agregar una cantidad fraccionaria permitida. | Calcula cantidad, precio y total sin redondeos inesperados. |
| 8 | Caja | Con Caja cerrada, entrar a Nueva Venta. | Informa claramente que debe abrirse una Caja y bloquea el cobro. |
| 9 | Caja | Abrir Caja Principal con saldo inicial 0. | Registra una sola sesión abierta, usuario y hora de apertura. |
| 10 | Movimientos | Abrir Registrar movimiento y no elegir categoría. | El modal abre rápido y no dispara carga de empleados. |
| 11 | Movimientos | Elegir `PAGO_SUELDO` o `ADELANTO`. | Recién entonces carga y habilita la selección de empleado. |
| 12 | Movimientos | Intentar un egreso en efectivo superior al saldo. | Muestra mensaje humano de saldo insuficiente y no guarda el movimiento. |
| 13 | Movimientos | Registrar ingreso 2.000 y luego egreso 1.000 en el entorno de prueba. | Ambos aparecen una vez y el saldo efectivo aumenta neto 1.000. |
| 14 | Nueva Venta | Hacer una venta normal de prueba en efectivo. | Genera un ticket, descuenta stock una vez y suma el efectivo una vez. |
| 15 | Nueva Venta | Hacer una venta de prueba con dos medios de pago. | La suma coincide con el total y Caja separa correctamente cada medio. |
| 16 | Cuenta Corriente | Hacer una venta a cuenta corriente a un cliente de prueba. | Aumenta la deuda del cliente sin sumar efectivo. |
| 17 | Cuenta Corriente | Registrar un cobro parcial del cliente. | Reduce la deuda por el importe exacto y refleja el medio en Caja. |
| 18 | Impresión | Abrir un ticket existente y descargar A4, 58 mm y 80 mm. | Los tres PDFs son legibles, completos y no duplican la venta. |
| 19 | Impresión | Reimprimir el mismo ticket. | No cambia stock, saldo, movimientos, CAE ni número del comprobante. |
| 20 | Cierre | Abrir arqueo, comparar esperado/real y descargar el PDF. | Totales por medio coinciden y el PDF identifica punto, apertura y usuarios. |
| 21 | Cierre | Cerrar Caja y volver a Nueva Venta; después reabrirla. | La venta queda bloqueada durante el cierre y la nueva sesión no altera el histórico. |
| 22 | Responsive 1366 | A 1366 px recorrer dashboard, Productos, Nueva Venta, Caja y diálogos. | Sin cortes, solapamientos ni scroll horizontal global; acciones visibles. |
| 23 | Responsive 390 | A 390 px repetir esos módulos y abrir búsqueda, movimiento e impresión. | Controles táctiles utilizables, tablas con scroll propio y diálogos dentro de pantalla. |
| 24 | Responsive 360 | A 360 px completar al menos producto, carrito, cobro y cierre. | Ningún botón crítico queda fuera de alcance y textos/importes siguen legibles. |

## Condiciones antes de volver a cliente

1. Completar y registrar como aprobado el checklist manual, especialmente venta, cobro, cierre e impresión.
2. Aprobar visualmente 1366, 390 y 360 px; hasta entonces responsive permanece pendiente.
3. Instalar con el perfil `prod`, `DB_URL`, `DB_USERNAME` y `DB_PASSWORD`; comprobar health y migraciones antes de habilitar usuarios.
4. Confirmar que el frontend servido corresponde al build production recién generado.

Con esas validaciones registradas, el RC puede promoverse a **A) APTO PARA INSTALACIÓN COMERCIAL** sin cambios funcionales adicionales conocidos.
