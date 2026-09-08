# FASE 1B.6 — Cierre operativo de compatibilidad de stock

FASE 1B queda CERRADA en su alcance de estabilización operativa. El retiro físico de columnas y contratos históricos queda para una migración versionada posterior; no se inició otra fase.

## 1. Archivos creados en esta fase

Backend, bajo src/main/java/com/api/inventariopixels/service/inventory:
- InventoryLegacyCompatibility.java: adaptación conservadora de altas antiguas.
- InventoryStockJpql.java: frontera explícita de compatibilidad para consultas JPQL.

Backend, bajo src/test/java/com/api/inventariopixels/service/inventory:
- InventoryCompatibilityInitializerTest.java.
- InventoryStockBoundaryTest.java.

Frontend:
- src/app/pages/crud-supplier/registrar-factura-proveedor/registrar-detalle-factura-proveedor/registrar-detalle-factura-proveedor.stock.spec.ts.
- docs/FASE-1B.6.md y docs/FASE-1B.6-referencias.md.

## 2. Archivos modificados en esta fase

Backend, rutas relativas a src/main/java/com/api/inventariopixels:
- service/inventory/InventoryStockService.java.
- service/inventory/InventoryCompatibilityInitializer.java.
- service/inventory/ProviderProductExcelImportService.java.
- service/Product/Excel/ExcelServiceImpl.java.
- service/Supermarket/SupermarketServiceImpl.java.
- service/Ticket/TicketServiceImpl.java.
- repository/SupermarketRepository.java.
- repository/ProductSupplierRepository.java.
- model/dto/request/SupermarketRequest.java.

Backend, rutas relativas a src/test/java/com/api/inventariopixels:
- service/inventory/InventoryStockServiceTest.java.
- service/inventory/ProviderProductExcelImportServiceTest.java.
- service/Supermarket/ModernProductStockContractTest.java.

Frontend, rutas relativas a src/app:
- pages/crud-product/form-product/form-product.component.ts y .spec.ts.
- pages/crud-supplier/registrar-factura-proveedor/registrar-factura-proveedor.component.ts.
- pages/crud-supplier/registrar-factura-proveedor/registrar-detalle-factura-proveedor/registrar-detalle-factura-proveedor.component.ts.
- pages/crud-supplier/register-income-supplier/register-income-supplier/register-income-supplier.component.ts.

El estado Git contiene además cambios previos de 1B.1–1B.5, preservados. Algunos archivos anteriores siguen sin seguimiento en Git; esta lista distingue el trabajo de 1B.6, no representa un diff contra HEAD de toda la estabilización.

## 3. Seis clases antiguas revisadas

InventarioPixelsApplicationTests, PurchaseOrderQueryIntegrationTest, ReporteConsultaRepositoryTest, AuthSessionIntegrationTest, PermissionConstraintIntegrationTest y SupplierPriceListCreationIntegrationTest se leyeron antes de modificar. La tabla previa, riesgos y decisiones están en [la auditoría](FASE-1B.6-referencias.md). No se ejecutaron estas seis clases: levantan el contexto completo con runners; algunas escriben datos reales y una ejecuta ALTER explícito.

## 4. Lecturas legacy eliminadas

- Método privado sin llamadas TicketServiceImpl.procesarStock: retirado completo, sin modificar el flujo activo de tickets/caja/ARCA.
- Comparación directa s.stock <= s.stockMin: sustituida por consulta compatible moderna que contempla variantes activas.
- Copias de stock/stockMin en el inicializador de cantidades: retiradas.
- Facturas proveedor frontend: datos de producto, configuración y previsualización ahora leen availableStock/minimumStock.
- El fallback JPQL comercial existente se trasladó sin alterar su semántica a InventoryStockJpql.

## 5. Escrituras eliminadas

Se retiraron los cuatro setStock del helper muerto de tickets y la asignación de cero a la entidad variante durante una consulta. Consultar una variante nula devuelve cero sin mutar la entidad ni guardarla. El arranque deja intactas las cantidades modernas nulas y no nulas.

## 6. Escrituras legacy que permanecen

- InventoryStockService: espejo sólo con intValueExact representable, nunca truncamiento.
- Ambos importadores: espejo inicial cero explícito junto con cantidades modernas cero.
- Mapper de alta antigua: compatibilidad de entrada, seguida de inicialización moderna dentro de la misma alta.
- Edición general: snapshot/restauración de los cuatro campos para impedir cambios de inventario por ModelMapper.
- DTOs: setters de alias derivados de la autoridad moderna; no escriben cantidades legacy de la entidad.

## 7. Importadores y alta

Ambos importadores ya inicializaban stockQuantity y minimumStockQuantity en cero a escala seis; se documentó el espejo y se verificó el importador proveedor mediante captura del producto persistido. Actualizar productos existentes mediante importación no reinicializa cantidades.

SupermarketRequest ahora admite cantidades BigDecimal modernas, no negativas, y conserva entradas antiguas deprecadas. El formulario de alta envía stockQuantity/minimumStockQuantity, conservando decimales desde la primera persistencia. InventoryLegacyCompatibility sólo adapta un producto nuevo sin ID, completa campos modernos nulos y nunca sobrescribe los presentes. La configuración posterior conserva el contrato HTTP existente para unidad/flags.

## 8. Initializers

InventoryCompatibilityInitializer dejó de materializar stock y mínimo históricos. La lectura compatible cubre esos nulos hasta definir una migración versionada. La prueba ejecuta dos veces el inicializador, verifica idempotencia de productos y que no cambian cantidades históricas ni modernas.

La inicialización preexistente de unidades, flags y ProductSupplier se conserva por alcance. Runner y PermissionConstraintSynchronizer fueron auditados, no modificados ni ejecutados. Ningún arranque completo contra PostgreSQL formó parte de la validación.

## 9. DTOs

Respuestas modernas mantienen availableStock/minimumStock y aliases deprecados ya existentes. Se deprecó stock/stockMin del request de alta y se añadieron campos modernos sin retirar propiedades HTTP. ProductResponse/TiendaDeRopaResponse antiguos permanecen fuera de los flujos modernos encontrados.

## 10. Frontend

Venta/carrito, productos, configuración, dashboard y reportes mantienen el contrato moderno. Se cerraron lecturas de aliases en facturas proveedor y se refresca el snapshot canónico al cargar configuración. Los campos llamados stock propios de variantes y el parámetro HTTP de configuración son modernos y se conservan. El formulario histórico de ingresos, sin consumidores encontrados, queda marcado deprecado.

## 11. Truncamientos

No se encontró truncamiento operativo decimal restante en el alcance auditado. Se retiró aritmética entera del código muerto. El espejo exacto rechaza tanto fracciones como valores fuera del rango Integer sin cambiar el stock moderno. Los redondeos monetarios, índices de Excel y conteos no se modificaron.

## 12. Fallback histórico

Sólo ante null moderno: InventoryStockService para entidades, InventoryStockSql para lectura masiva, InventoryStockJpql para filtros compatibles. InventoryLegacyCompatibility adapta exclusivamente entradas antiguas de nuevas altas. Cero moderno siempre tiene prioridad. Diagnosticar divergencias no repara datos, no lanza errores por divergencia y no bloquea el arranque.

## 13. Tests backend

Suite segura final: **296 tests, 0 failures, 0 errors**.

Incluye InventoryStockServiceTest (24), ProductQuantityServiceTest (11), ModernProductStockContractTest (5), SupermarketServiceImplTest (2), PurchaseOrderServiceTest (21), InvoiceProviderProductSupplierIntegrationTest (12), DashboardStockTest (2), InventarioReporteServiceImplTest (8), InventoryStockReadRepositoryTest (11), InventoryStockPostgresReadTest (1), InventoryCompatibilityInitializerTest (2), InventoryStockBoundaryTest (1), ProviderProductExcelImportServiceTest (3), tests de venta/tickets y resto de la suite segura.

La cobertura nueva verifica lectura sin escritura, prioridad de cero moderno, histórico sin materialización, desbordamiento del espejo, movimiento de variante sin tocar ninguno de los dos stocks del padre, inicializador idempotente y alta/importación modernas. La protección de edición se probó enviando valores distintos tanto legacy como modernos. La barrera de arquitectura impide getStock/getStockMin directos en tickets, facturas proveedor, órdenes de compra, dashboard y reportes.

Comando desde backend:

~~~powershell
mvn '-Dtest=*,!InventarioPixelsApplicationTests,!PurchaseOrderQueryIntegrationTest,!ReporteConsultaRepositoryTest,!AuthSessionIntegrationTest,!PermissionConstraintIntegrationTest,!SupplierPriceListCreationIntegrationTest' test '-Dspring.jpa.hibernate.ddl-auto=none' '-Dspring.sql.init.mode=never'
~~~

Log: %TEMP%/pixels-1b6-safe-suite.log. La integración PG usa conexión y transacción read-only; sin runners ni DDL. Los fixtures SQL aislados usan H2 en memoria. No se ejecutó ALTER TABLE.

## 14. Tests frontend

Suite completa ChromeHeadless: **175 tests correctos**. Se añadieron pruebas de alta decimal moderna y de factura proveedor con aliases deliberadamente divergentes, incluido cero canónico. Se mantuvieron las pruebas de ventas, producto, dashboard, reportes y configuración.

Comando: npm test -- --watch=false --browsers=ChromeHeadless.
Log: %TEMP%/pixels-1b6-frontend.log.

## 15. Builds y diferencias

- mvn -DskipTests package: correcto.
- npm run build -- --configuration production: correcto.
- git diff --check: correcto en ambos repositorios.
- Angular conserva advertencia de bundle inicial: 2.39 MB frente al umbral de advertencia de 2 MB.
- Logs: %TEMP%/pixels-1b6-backend-build.log y %TEMP%/pixels-1b6-angular-build.log.

## 16. Referencias restantes

[Tabla completa de referencias, justificación y retiro futuro](FASE-1B.6-referencias.md). Distingue campos históricos, aliases HTTP, snapshots de protección, variantes canónicas, parámetros de entrada modernos, fixtures y código histórico sin consumidores.

## 17. Riesgos pendientes y cierre

- Retiro físico y migración histórica pendientes de versionado; no forman parte de esta fase.
- Se conserva código antiguo sin consumidores encontrados y aliases para compatibilidad HTTP.
- El alta sigue configurando unidad/flags mediante una segunda llamada; un fallo de esa llamada requiere completar configuración, aunque las cantidades modernas ya se conservan en la primera alta.
- La configuración general preexistente de Hibernate todavía permite update y existe un runner DDL de permisos. No se modificaron estos mecanismos ajenos al stock ni se arrancó la aplicación durante las pruebas seguras. No debe confundirse ddl-auto=none con aislamiento de runners.
- Advertencia de tamaño de Angular, sin error de build.

Confirmaciones para esta fase:

1. Supermarket.stock y stockMin ya no son autoridad operativa moderna.
2. Todo fallback histórico de cantidades está encapsulado.
3. Toda escritura legacy restante está clasificada y justificada.
4. Fraccionables no se truncan a enteros.
5. Los movimientos de variantes sólo modifican ProductVariant.stock; no sincronizan sumas hacia stockQuantity ni stock.
6. Nuevas altas/importaciones usan cantidades modernas; datos históricos siguen siendo legibles.
7. No se ejecutaron migraciones automáticas de BD ni conversiones históricas de cantidades.
8. No se borraron columnas, no se ejecutó ALTER TABLE y no se introdujo Flyway en 1B.6.
9. No hubo cambios funcionales en ARCA, caja, licencias, ProductSupplier comercial, listas proveedor, OCR, tienda online, delivery o multitenancy.
10. No se hizo commit ni push.

**FASE 1B: CERRADA operativamente.** No se comenzó otra fase.
