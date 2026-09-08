# Referencias restantes — FASE 1B.5

La búsqueda final de getStock(), getStockMin(), .stock y .stockMin no devolvió usos operativos en DashboardServiceImpl, InventarioReporteServiceImpl, ReporteConsultaRepository, frontend de dashboard o frontend de reportes. Las coincidencias en fixtures no son autoridades de producción.

| ARCHIVO | REFERENCIA | RAZÓN | LEGACY/COMPATIBILIDAD | FASE DE RETIRO |
|---|---|---|---|---|
| Backend service/inventory/InventoryStockSql.java | SUM(stock) de product_variant | Stock individual moderno de variantes activas. | No es legacy | Permanece |
| Backend service/inventory/InventoryStockSql.java | COALESCE(s.stock_quantity, s.stock, 0) / COALESCE(s.minimum_stock_quantity, s.stock_min, 0) | Fallback histórico central del camino masivo, equivalente a InventoryStockService y probado contra él. | Compatibilidad sólo si moderno es null | 1B.6, después de sanear datos |
| Backend model/dto/response/LowStockProductResponse.java | @JsonProperty stock/stockMin; id | Alias deprecated para clientes antiguos; proceden del dato moderno. | Sí | 1B.6 o al retirar consumidores antiguos |
| Backend reportes/dto/InventarioReporteDto.java | @JsonProperty stock/stockActual/stockMinimo | Alias deprecated de las cantidades BigDecimal modernas. | Sí | 1B.6 o al retirar consumidores antiguos |
| Frontend modules/reportes/inventory-report.utils.ts | Lista stock, stockMin, stockActual, stockMinimo | Oculta alias recibidos; nunca los usa para calcular ni mostrar disponibilidad. | Filtro de transición | Junto con retiro de alias |
| Backend repository/SupermarketRepository.java | findPurchaseCandidates: s.stock <= s.stockMin | Método antiguo sin llamadores de producción; ya no interviene en dashboard ni en Purchase Orders moderno. | Legacy inactivo | 1B.6, tras revisar API/tests antiguos |
| Backend service/inventory/InventoryStockService.java | getStock/getStockMin y espejo entero exacto | Autoridad individual preexistente: fallback, diagnóstico y compatibilidad. | Sí | 1B.6, no modificado aquí |
| Backend model/entity/Supermarket.java | stock / stockMin | Columnas históricas expresamente conservadas. | Sí | 1B.6 o posterior según dependencias |
| Backend service/Supermarket/SupermarketServiceImpl.java | setStock/setStockMin en protección de edición y aliases | Protecciones de 1B.4 y serialización compatible; bajo stock ahora usa proyección moderna. | Sí | Cierre de compatibilidad |
| Backend service/Ticket/TicketServiceImpl.java | procesarStock deprecated | Método privado inactivo conservado por fases anteriores; ventas fuera de alcance. | Legacy inactivo | 1B.6, revisar antes de retirar |
| Backend initializers/importadores | Inicialización de stock/stockMin | Fuera del alcance funcional de 1B.5; no se ejecutaron inicializadores contra la base instalada. | Sí | 1B.6 o fase de importación |
| Frontend facturas/ingreso antiguo de proveedor | stock/stockMin en controles y vistas | Módulos excluidos de esta fase; validación backend moderna ya implementada en fases anteriores. | Sí | Cierre específico de UI legacy |
| Frontend interfaces/Product.ts, ProductItemSale.ts, ProductItemBuy.ts, inventory.ts | Alias de contratos compartidos | Compatibilidad preexistente de 1B.4; dashboard/reportes usan sus interfaces modernas. | Sí | 1B.6 tras revisar todos los consumidores |
| Backend ProductSupplierRepository.java | Fallback SQL en filtro comercial de reposición | Implementación moderna previa de Purchase Orders; no se alteró ProductSupplier comercial. | Fallback central de ese flujo previo | Auditar en 1B.6 |
| Backend InventarioReporteController.java y frontend servicios/rutas | stock-valorizado, bajo-stock, sin-stock | Nombres de endpoints, no campos operativos. | No | Permanece |
| Frontend dashboard HTML/CSS | stock-container, stock-table, stock-bajo, sin-stock y clase stock | Presentación visual, imports o selectores de componentes. | No | Permanece |
| Tests nuevos | stock/stockMin divergentes, setStock y fixtures SQL H2 | Comprueban prioridad moderna y sólo modifican memoria aislada. | Diagnóstico/test | Mantener mientras exista fallback |

La auditoría de 1B.4 sigue como registro histórico; sus entradas de dashboard/reportes quedaron resueltas por esta fase. Esta tabla no autoriza borrar todas las coincidencias.
