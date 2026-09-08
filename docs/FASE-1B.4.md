# FASE 1B.4 ? Contratos expl?citos de inventario

## Alcance y estado

Se conservan los cambios que ya estaban en ambos repositorios al iniciar: fases 1B.1?1B.3.1, incluyendo InventoryStockService y sus tests sin seguimiento en Git. No se hicieron commit ni push. No se inici? 1B.5, no se agreg? Flyway ni se modificaron licencias, ARCA o caja. Dashboard, reportes y bajo stock global conservan su implementaci?n.

## Contrato

| Campo | Sem?ntica |
|---|---|
| availableStock: BigDecimal / number | Producto normal: getEffectiveStock. Con variantes: suma activa resuelta por ese mismo servicio y su consulta agregada; cero sin variantes activas. |
| minimumStock: BigDecimal / number | getEffectiveMinimumStock: minimumStockQuantity y fallback stockMin encapsulado en InventoryStockService. |
| variantStockManaged | Distingue stock de producto y de variantes. |
| fractionable | Conserva la pol?tica del producto; no se deduce de valores legacy. |
| baseUnit / unit | Se mantienen los nombres existentes seg?n DTO para no agregar otro alias. |
| variants[].stock | Stock individual BigDecimal; nunca se sustituye por el total. |
| stock / stockMin de respuesta | Alias temporales @Deprecated, para clientes anteriores y m?dulos excluidos. |

No se agreg? totalVariantStock: duplicar?a availableStock en listados. El carrito conserva variantStock como snapshot de la variante seleccionada, separado del total del producto.

DTOs modificados: SupermarketResponse, TicketSupermarketResponse y ProductSaleConfigurationResponse. Listado paginado, consulta por ID, listado gen?rico, b?squeda textual y barcode pasan por los mappers modernos. ProductResponse y TiendaDeRopaResponse fueron auditados: no se encontraron consumidores Angular ni controladores activos para esos DTOs. Los endpoints hist?ricos que devuelven entidades por proveedor y los de precios masivos siguen siendo contratos administrativos legacy; no son fuente de disponibilidad de venta.

## JSON y precisi?n

Jackson no tiene un serializador de stock/BigDecimal personalizado en la aplicaci?n: las nuevas cantidades salen como n?meros JSON. ModernProductStockContractTest verifica el nodo num?rico y 10.5. No hay conversi?n a int/double en los campos nuevos; doubleValue aparece exclusivamente al poblar alias antiguos. Angular conserva number y no usa parseInt ni Math.floor en disponibilidad.

La base admite numeric(19,6), cuyo rango completo NO es exactamente representable en JavaScript. La validaci?n del navegador es preliminar y tiene tolerancia aritm?tica de 1e-9 en el carrito; el backend sigue siendo autoridad BigDecimal. Para cantidades extremas cercanas al l?mite de la columna habr? que adoptar strings/aritm?tica decimal en una fase posterior. El formato visual admite seis decimales.

## Comportamiento implementado

- Lista: una sola clasificaci?n stockStatus: <=0 sin stock, >0 y <=m?nimo bajo stock, >m?nimo normal. Decimales y unidad base conservados; un producto con variantes muestra ?13 un. en variantes? cuando el backend devuelve 13.
- Formulario: la edici?n carga availableStock/minimumStock en controles hist?ricos internos. El payload de edici?n elimina stock/stockMin. El backend conserva ambos campos legacy y ambos modernos bajo bloqueo del producto durante la transacci?n de edici?n general.
- Alta: el DTO antiguo sigue aceptado; Angular crea con stock legacy cero y env?a las cantidades iniciales originales al endpoint moderno de inventario, evitando truncarlas en el DTO int.
- Inventory Config: estado interno stockQuantity/minimumStock; toma exclusivamente valores resueltos por backend, sin fallback del di?logo. Se quit? la segunda escritura al endpoint general. El stock agregado queda deshabilitado al administrar variantes; se editan sus stocks individuales. El endpoint conserva el par?metro HTTP stock por compatibilidad, aunque persiste stockQuantity para productos normales. Guardar configuraci?n de un producto con variantes no copia su suma a stockQuantity.
- Venta: configuraci?n normal usa availableStock; con variantes s?lo usa la variante activa seleccionada, y devuelve cero mientras falte selecci?n. Presentaciones/unidades convierten a baseQuantity.
- Carrito: agrega y aumenta comparando cantidad base acumulada por productId+variantId, incluso entre distintas presentaciones. Mantiene la identidad de l?nea completa. Una falla de configuraci?n impide continuar con informaci?n incompleta. Disminuir una l?nea fraccionable menor o igual a una unidad la elimina, evitando cantidades negativas. El restante se formatea sin truncar el c?lculo.
- Sin barcode: selecci?n textual y carrito conservan identidad por ID. No cambi? la exigencia preexistente de c?digo interno en el guardado manual de productos.
- Facturas proveedor: s?lo se propagaron campos nuevos en el adaptador ProductItemBuy y se cambi? el texto de stock en el selector compartido. No se alter? su l?gica de recepci?n ni Purchase Orders.

## Archivos creados

- Frontend: src/app/pages/crud-product/list-product/product-stock.utils.ts
- Frontend: src/app/pages/crud-product/list-product/product-stock.utils.spec.ts
- Frontend: src/app/pages/crud-product/list-product/list-product.component.spec.ts
- Frontend: src/app/pages/crud-sale/sale-configuration/cart-stock.utils.ts
- Frontend: src/app/pages/crud-sale/sale-configuration/cart-stock.utils.spec.ts
- Frontend: src/app/pages/crud-sale/sale-configuration/sale-configuration.component.spec.ts
- Frontend: src/app/pages/crud-sale/new-sale/new-sale.component.spec.ts
- Backend: src/test/java/com/api/inventariopixels/service/Supermarket/ModernProductStockContractTest.java
- Documentaci?n: docs/FASE-1B.4.md y docs/FASE-1B.4-referencias.md

## Archivos modificados en esta fase

- Frontend: src/app/interfaces/Product.ts
- Frontend: src/app/interfaces/ProductItemSale.ts
- Frontend: src/app/interfaces/ProductItemBuy.ts
- Frontend: src/app/interfaces/inventory.ts
- Frontend: src/app/pages/crud-product/form-product/form-product.component.ts
- Frontend: src/app/pages/crud-product/form-product/form-product.component.spec.ts
- Frontend: src/app/pages/crud-product/inventory-config/inventory-config.component.ts
- Frontend: src/app/pages/crud-product/inventory-config/inventory-config.component.html
- Frontend: src/app/pages/crud-product/inventory-config/inventory-config.utils.ts
- Frontend: src/app/pages/crud-product/inventory-config/inventory-config.utils.spec.ts
- Frontend: src/app/pages/crud-product/list-product/list-product.component.ts
- Frontend: src/app/pages/crud-sale/new-sale/new-sale.component.ts
- Frontend: src/app/pages/crud-sale/new-sale/new-sale.component.html
- Frontend: src/app/pages/crud-sale/sale-configuration/sale-configuration.component.ts
- Frontend: src/app/pages/crud-supplier/registrar-factura-proveedor/link-existing-product-dialog/link-existing-product-dialog.component.html
- Frontend: src/app/pages/crud-supplier/registrar-factura-proveedor/registrar-detalle-factura-proveedor/registrar-detalle-factura-proveedor.component.ts
- Backend: src/main/java/com/api/inventariopixels/model/dto/response/SupermarketResponse.java
- Backend: src/main/java/com/api/inventariopixels/model/dto/response/TicketSupermarketResponse.java
- Backend: src/main/java/com/api/inventariopixels/model/dto/response/ProductSaleConfigurationResponse.java
- Backend: src/main/java/com/api/inventariopixels/service/Supermarket/SupermarketServiceImpl.java
- Backend: src/main/java/com/api/inventariopixels/service/inventory/ProductCatalogService.java
- Backend: src/test/java/com/api/inventariopixels/service/inventory/ProductCatalogServiceTest.java

Los otros archivos modificados que aparecen en git status pertenec?an al trabajo previo y no deben atribuirse a esta fase.

## Validaci?n

| Verificaci?n | Resultado |
|---|---|
| Suite backend completa: mvn -q test -Dspring.jpa.hibernate.ddl-auto=none | 275 pruebas, 0 fallos, 0 errores, 0 omitidas. |
| InventoryStockServiceTest | 19 OK. |
| ProductQuantityServiceTest | 11 OK. |
| ProductCatalogServiceTest | 8 OK. |
| ModernProductStockContractTest | 5 OK, incluyendo JSON num?rico, lista/ID/barcode/texto, fallback y edici?n protegida. |
| SupermarketServiceImplTest | 2 OK. |
| TicketServiceImplTest | 3 OK. |
| PurchaseOrderServiceTest | 21 OK; integraci?n de consultas incluida en la suite completa. |
| Maven package con las 7 clases afectadas | 69 pruebas OK y JAR generado. |
| Revalidaci?n final de contratos tras proteger la ruta gen?rica de edici?n | 13 pruebas OK y Maven package OK. |
| Suite frontend completa final | 166 pruebas OK en ChromeHeadless. |
| Angular producci?n: npm run build | OK; advertencia de bundle inicial 2.39 MB frente a presupuesto de aviso de 2 MB (l?mite de error 5 MB). |
| TypeScript app y spec: tsc --noEmit | OK. |
| git diff --check, ambos repositorios | OK. |

La suite completa backend se ejecut? antes de los ?ltimos ajustes menores; despu?s se reejecutaron las pruebas afectadas y el empaquetado. Aparecieron mensajes de diagn?stico de rutas de licencia en Windows durante el arranque de tests, pero no causaron fallos. No se modific? el sistema de licencias.

Pruebas frontend nuevas: stockStatus, render de lista decimal y total de variantes, configuraci?n normal/variante/presentaci?n, helpers de reserva acumulada y pruebas directas del carrito. Se actualizaron fixtures de formulario e inventario para incluir campos can?nicos y verificar que no se escriban campos legacy al editar.

## Riesgos y compatibilidad pendientes

- El frontend moderno requiere desplegar tambi?n los DTOs backend nuevos; deliberadamente no vuelve a stock legacy si falta availableStock.
- La suma activa ejecuta una consulta por producto con variantes en listas. No se introdujo una segunda autoridad para optimizarla; si el volumen lo exige, conviene sumar en lote dentro de la autoridad de inventario.
- Dashboard/reportes/bajo stock global a?n pueden diferir del inventario moderno: es el alcance pendiente de 1B.5.
- Los alias de facturas proveedor y administraci?n hist?rica siguen documentados en la tabla de referencias. La validaci?n final de compras ya pertenece a InventoryStockService por fases anteriores.
- Alta y configuraci?n inicial siguen siendo dos solicitudes: si falla la segunda, el producto queda creado con stock cero y requiere completar Inventory Config.
- La primera ejecuci?n de tests de integraci?n arranc? con la configuraci?n Hibernate existente y emiti? ALTER TABLE invoice_details_provider ALTER COLUMN quantity SET DATA TYPE numeric(19,6). No fue una migraci?n agregada por esta fase. La suite completa posterior se ejecut? con -Dspring.jpa.hibernate.ddl-auto=none. No se revirti? el esquema autom?ticamente.

La tabla por archivo, referencia, m?dulo, motivo y fase de eliminaci?n est? en [FASE-1B.4-referencias.md](FASE-1B.4-referencias.md).

## Confirmaciones de cierre

- El frontend migrado (lista, formulario, configuraci?n, venta y carrito) ya no usa Supermarket.stock como autoridad.
- Producto normal usa availableStock.
- Producto con variantes muestra la suma de variantes activas resuelta por backend.
- La venta de variante usa exclusivamente su stock individual.
- Presentaciones comparan baseQuantity contra stock efectivo, acumulado por producto/variante.
- Las cantidades fraccionables no se truncan.
- Los campos legacy permanecen para compatibilidad, m?dulos excluidos e inicializaci?n hist?rica; la tabla detalla cada caso.
- No se modificaron funcionalmente dashboard/reportes, ni se agreg? Flyway.
- No se hizo commit ni push.
- Queda preparada la base de contratos para FASE 1B.5 (dashboard + bajo stock + reportes), que no se inici?.
