# FASE 1B.5 — Dashboard y reportes con stock efectivo

## Resultado y alcance

Se migraron dashboard, bajo stock, sin stock, stock valorizado e inmovilizado al contrato availableStock/minimumStock. Se conservaron los cambios existentes de las fases anteriores. No se hicieron commit ni push. No se inició la FASE 1B.6.

No hubo cambios funcionales en Purchase Orders, facturas proveedor, ventas, caja, ARCA, licencias, importadores, ProductSupplier comercial ni listas de precios. En reportes de proveedores sólo cambió la visualización del stock en su buscador compartido. No se eliminaron columnas legacy, no se cambió application.properties ni se agregó Flyway.

## Auditoría previa y decisiones

| Punto auditado | Hallazgo anterior | Resolución |
|---|---|---|
| DashboardServiceImpl / countLowStockProducts | Conteo con stock < stockMin | COUNT nativo con stock efectivo <= mínimo efectivo, sin cargar productos. |
| getAllPoductLowStock | findAll + filtro Java de enteros; devolvía entidades | Proyección escalar en SQL; DTO explícito y endpoint paginado nuevo para la portada. |
| getAllLowStock por proveedor | DTO con constructor vacío y agrupación por nombre | DTO de grupo real con ID/nombre, productos modernos y soporte de proveedor ausente. |
| findPurchaseCandidates | Consulta legacy sin llamadores de producción | No impacta dashboard; queda para retiro de compatibilidad, sin tocar pedidos. |
| InventarioReporteServiceImpl | Enteros y paginación posterior a cargar todo el catálogo | Cantidades BigDecimal; filtro, orden y páginas de bajo/sin stock en SQL. |
| Bajo stock | Incluía stock <= mínimo, etiquetando <=0 como CRITICO | Se conserva explícitamente esa intención de reposición; sin stock sigue disponible como subconjunto separado. |
| Stock valorizado | price y salePrice del producto; redondeo monetario preexistente | Se conserva la política; sólo se corrige la cantidad. |
| Inmovilizado | Stock positivo y última venta ausente o antigüedad >= días | Se conserva la regla temporal, incluida la fecha de actualización como referencia visual si nunca se vendió. |
| Históricos de inventario | Carga de todos los tickets y facturas | Agregados por IDs de la página/lote; cantidades vendidas en unidad base y BigDecimal. |
| Frontend | Stock legacy y límite visual arbitrario 2; reportes genéricos | Campos canónicos, clasificación compartida con lista y formato argentino hasta seis decimales. |

## Lectura masiva y rendimiento

InventoryStockSql contiene la única expresión SQL de stock efectivo para estos módulos. No crea vistas, tablas ni funciones:

1. Agrupa ProductVariant por product_id, sumando sólo active=true.
2. Une ese resultado una sola vez con supermarket.
3. Para variante administrada usa la suma activa, o cero si no hay filas activas. Para producto normal usa stock_quantity y sólo si es null el stock histórico.
4. minimum_stock_quantity tiene prioridad; stock_min es fallback únicamente si el moderno es null.
5. Respeta deleted=false como las lecturas JPA preexistentes. Las presentaciones no participan del stock.

Esta proyección es una implementación masiva equivalente de InventoryStockService dentro del paquete de autoridad de inventario; una prueba compara ambos caminos con datos modernos, históricos y variantes. El conteo del dashboard reutiliza exactamente la misma constante SQL que los reportes.

| Operación | Consultas de stock / alcance |
|---|---|
| Conteo bajo stock | 1 COUNT, devuelve sólo un número. |
| Página dashboard | 2: COUNT + SELECT con LIMIT/OFFSET; Angular pide 10 filas. |
| Página bajo/sin stock de reporte | 2 de stock + hasta 2 agregados históricos para los IDs de esa página. |
| Stock valorizado | 1 SELECT escalar con filtros de categoría, marca y proveedor en SQL. |
| Inmovilizado | 1 SELECT de stock positivo; históricos en lotes de hasta 1.000 IDs, nunca una consulta por producto. |

Prueba de rendimiento estructural: 1.000 productos adicionales con variantes mantienen exactamente dos consultas por página. PostgreSQL real: 8.067 productos bajo stock, página de 50, conteo y consultas de históricos ejecutados en aproximadamente 141 ms en la ejecución específica local. Es una observación de este entorno, no una garantía de latencia en otras instalaciones.

Stock valorizado e inmovilizado ya devolvían todo el detalle sin paginación: se conserva ese contrato. Sus exportaciones todavía requieren memoria proporcional al resultado, pero ya no cargan entidades ni grafos completos de ventas/facturas. Una futura paginación/exportación por streaming requerirá evolucionar esos contratos. El N+1 preexistente del listado general de productos de 1B.4 no se amplió a dashboard/reportes.

## Reglas definitivas

- Conteo y consulta de reposición: availableStock <= minimumStock; se cuenta cada producto una sola vez, no cada variante.
- Clasificación visual SIN STOCK: availableStock <= 0.
- Clasificación visual BAJO: availableStock > 0 y availableStock <= minimumStock.
- Clasificación NORMAL: availableStock > minimumStock, priorizando antes el caso sin stock.
- Variantes: 5 + 8 activas e inactiva 100 producen 13; ninguna activa produce cero. Un total histórico negativo se muestra, sin corregir datos.
- Stock valorizado: cantidad efectiva × costo base price; venta potencial conserva salePrice. Aunque la variante tenga purchasePrice, no se introdujo una política de costo por variante ni promedio ponderado.
- Resúmenes de cantidades y ventas recientes son BigDecimal: 5.5 + 2.25 = 7.75. Contadores de productos, páginas y días siguen siendo enteros por su semántica.
- Históricos de compra: producto asociado por ID; sólo líneas antiguas sin product_id usan barcode. No se usa supplierProductCode como código interno. Los productos sin barcode siguen siendo válidos.

## DTOs y frontend

LowStockProductResponse contiene productId, name, barCode nullable, availableStock, minimumStock, variantStockManaged y referencias simples de categoría/proveedor. ByProvider contiene ID/nombre y lista de DTOs. /supermarket/low-stock es paginado; las rutas antiguas de lista y agrupación mantienen forma de array y alias transitorios para clientes anteriores.

StockDetalle, BajoStock, SinStock e InmovilizadoDetalle exponen campos canónicos BigDecimal y variantStockManaged. Los resúmenes unidadesStock/unidadesInmovilizadas también son BigDecimal. Los alias stock/stockActual/stockMinimo son @Deprecated y se calculan desde los nuevos valores; Angular los excluye de sus columnas. No son lecturas de Supermarket.stock.

Dashboard consume sólo diez resultados modernos en portada, muestra stock/mínimo con decimales y ofrece navegación a la lista completa. La lista por proveedor y su PDF usan availableStock/minimumStock. ReporteDetalle aplica el mismo formato a pantalla y PDF y no confunde ventasUltimos30Dias (cantidad) con un importe monetario. Se agregaron interfaces explícitas de inventario y retornos tipados del servicio.

## Seguridad de base y validación

No se modificó stock ni el esquema PostgreSQL. No se ejecutaron sincronizaciones de legacy. Las tablas de fixtures nuevas se crean únicamente en bases H2 efímeras en memoria, una por prueba; H2 es dependencia de test.

La integración PostgreSQL nueva usa @DataJpaTest sin inicializadores de aplicación, ddl-auto=none, spring.sql.init.mode=never y una conexión configurada con default_transaction_read_only=on. La prueba exige que SHOW transaction_read_only devuelva on antes de consultar. No hubo ALTER TABLE de Hibernate ni del inicializador de permisos.

Se detectó que ddl-auto=none por sí solo no basta para la suite antigua: PermissionConstraintSynchronizer puede ejecutar DDL y otros runners escriben datos. Por eso la selección segura excluye seis clases @SpringBootTest: InventarioPixelsApplicationTests, PurchaseOrderQueryIntegrationTest, ReporteConsultaRepositoryTest, AuthSessionIntegrationTest, PermissionConstraintIntegrationTest y SupplierPriceListCreationIntegrationTest. Una de ellas prueba explícitamente una migración con ALTER; no se ejecutó. La suite completa sin exclusiones queda pendiente de una base desechable aislada. No se modificaron esos tests, inicializadores ni licencias para forzar un resultado verde.

| Validación | Resultado |
|---|---|
| InventoryStockReadRepositoryTest | 11 OK: decimales, fallback, variantes activas/inactivas, cero, negativos, igualdad, conteo único, paginación y consultas constantes. |
| InventoryStockPostgresReadTest | 1 OK: consultas reales y modo read-only verificado. |
| DashboardStockTest | 2 OK. |
| InventarioReporteServiceImplTest | 8 OK: valorización, mínimos, variantes, sin stock, inmovilizado, decimales, códigos ausentes e históricos por lote. |
| InventoryStockServiceTest / ProductQuantityServiceTest | 19 + 11 OK. |
| Selección backend segura | 288 pruebas, 0 fallos, 0 errores. |
| Suite frontend completa | 172 pruebas OK en ChromeHeadless. |
| Build backend | mvn -DskipTests package OK. |
| Build Angular producción | OK; advertencia preexistente de bundle inicial: 2.39 MB frente al aviso de 2 MB (límite de error 5 MB). |
| git diff --check | OK en ambos repositorios. |

Comando backend seguro:

~~~powershell
mvn '-Dtest=*,!InventarioPixelsApplicationTests,!PurchaseOrderQueryIntegrationTest,!ReporteConsultaRepositoryTest,!AuthSessionIntegrationTest,!PermissionConstraintIntegrationTest,!SupplierPriceListCreationIntegrationTest' test '-Dspring.jpa.hibernate.ddl-auto=none' '-Dspring.sql.init.mode=never'
~~~

## Archivos creados

- Backend: src/main/java/com/api/inventariopixels/service/inventory/InventoryStockSql.java
- Backend: src/main/java/com/api/inventariopixels/service/inventory/InventoryStockRow.java
- Backend: src/main/java/com/api/inventariopixels/service/inventory/InventoryStockReadRepository.java
- Backend: src/main/java/com/api/inventariopixels/model/dto/response/LowStockProductResponse.java
- Backend: src/test/java/com/api/inventariopixels/service/inventory/InventoryStockReadRepositoryTest.java
- Backend: src/test/java/com/api/inventariopixels/service/inventory/InventoryStockPostgresReadTest.java
- Backend: src/test/java/com/api/inventariopixels/service/Dashboard/DashboardStockTest.java
- Backend: src/test/java/com/api/inventariopixels/reportes/InventarioReporteServiceImplTest.java
- Frontend: src/app/modules/reportes/inventory-report.utils.ts
- Frontend: src/app/modules/reportes/reporte-detalle.component.spec.ts
- Frontend: src/app/services/dashboard.service.spec.ts
- Frontend: src/app/shared/dasboard/dashboard/inicio/cards-info/inicio-bajo-stock/inicio-bajo-stock.component.spec.ts
- Documentación: docs/FASE-1B.5.md y docs/FASE-1B.5-referencias.md.

## Archivos modificados en esta fase

- Backend: pom.xml
- Backend: src/main/java/com/api/inventariopixels/controller/SupermarketController.java
- Backend: src/main/java/com/api/inventariopixels/repository/SupermarketRepository.java
- Backend: src/main/java/com/api/inventariopixels/service/Supermarket/SupermarketServiceImpl.java
- Backend: src/main/java/com/api/inventariopixels/service/Dashboard/DashboardServiceImpl.java
- Backend: src/main/java/com/api/inventariopixels/reportes/dto/InventarioReporteDto.java
- Backend: src/main/java/com/api/inventariopixels/reportes/repository/ReporteConsultaRepository.java
- Backend: src/main/java/com/api/inventariopixels/reportes/service/impl/InventarioReporteServiceImpl.java
- Frontend: src/app/interfaces/producto-bajo-stock.ts
- Frontend: src/app/services/dashboard.service.ts
- Frontend: src/app/modules/reportes/interfaces/reportes.ts
- Frontend: src/app/modules/reportes/services/reportes.service.ts
- Frontend: src/app/modules/reportes/reporte-detalle.component.ts
- Frontend: src/app/modules/reportes/supplier-reports.component.html
- Frontend: src/app/shared/dasboard/dashboard/inicio/bajo-stock/bajo-stock.component.ts
- Frontend: src/app/shared/dasboard/dashboard/inicio/bajo-stock/bajo-stock.component.html
- Frontend: src/app/shared/dasboard/dashboard/inicio/cards-info/inicio-bajo-stock/inicio-bajo-stock.component.ts
- Frontend: src/app/shared/dasboard/dashboard/inicio/cards-info/inicio-bajo-stock/inicio-bajo-stock.component.html

Los demás cambios visibles en git status ya estaban al comenzar y pertenecen a fases anteriores.

## Compatibilidad, riesgos y cierre

La tabla de referencias restantes está en [FASE-1B.5-referencias.md](FASE-1B.5-referencias.md). No quedan lecturas operativas de getStock/getStockMin o product.stock/product.stockMin en dashboard y reportes migrados. Los aliases de JSON, el filtro que los oculta, las rutas y las clases CSS son deliberados.

Se deben desplegar backend y frontend juntos. TypeScript conserva number: cantidades extremadamente grandes del rango completo numeric(19,6) todavía pueden exceder su precisión representable; backend y agregados conservan BigDecimal. No se cambió esa decisión de 1B.4.

Confirmado: dashboard ya no usa Supermarket.stock/stockMin como autoridad; bajo stock usa <=; variantes suman sólo activas; los reportes no truncan fraccionables; la valorización usa stock efectivo; no se introdujo N+1 de variantes; dashboard/reportes consumen availableStock/minimumStock; no se modificó stock ni hubo cambios estructurales automáticos en la base instalada; no se introdujo Flyway; no se hizo commit ni push.

Inventario Pixels queda preparado para FASE 1B.6, cierre de compatibilidad legacy de stock. Esa fase no se inició.
