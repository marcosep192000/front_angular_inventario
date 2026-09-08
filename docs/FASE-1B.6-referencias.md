# FASE 1B.6 — Auditoría de compatibilidad

Se revisaron fuentes Java, TypeScript y plantillas; se excluyeron artefactos compilados. Las referencias de pruebas son fixtures y comprobaciones de compatibilidad, no consumidores operativos.

## Clasificación previa a modificar

| Archivo | Operación | Lee/escribe | Legacy/moderna | Riesgo | Acción propuesta |
|---|---|---|---|---|---|
| InventarioPixelsApplicationTests | Arranque completo | Escrituras indirectas | Mixta | Ejecuta runners | Excluir de suite segura |
| PurchaseOrderQueryIntegrationTest | Consultas y conversión SQL | Ambas | Mixta | CREATE/INSERT/ALTER explícitos, además del arranque | No ejecutar; actualizar consulta compatible |
| ReporteConsultaRepositoryTest | Consultar reportes | Lectura y arranque | Mixta | Runners pueden escribir | Usar slice aislado de lectura |
| AuthSessionIntegrationTest | Login/refresh/logout | Ambas | No stock | Escribe sesiones reales | No ejecutar |
| PermissionConstraintIntegrationTest | Persistir permisos | Ambas | No stock | Escribe usuario/permisos, sincronizador DDL | No ejecutar |
| SupplierPriceListCreationIntegrationTest | Crear listas y proveedores | Ambas | No stock | Escrituras comerciales | No ejecutar |
| InventoryStockService | Fallback, movimientos, diagnóstico | Ambas | Autoridad y compatibilidad | Resolver variante nula modifica entidad al consultar | Consulta sin setters |
| InventoryCompatibilityInitializer | Completar productos históricos | Ambas | Transición | Copia cantidades al iniciar | Retirar copias de cantidades |
| ExcelServiceImpl / ProviderProductExcelImportService | Alta importada | Escritura | Moderna y espejo cero | Debe seguir inicializando los dos campos modernos | Documentar y verificar |
| SupermarketServiceImpl | Alta/edición | Ambas | Mixta | Alta podía depender del fallback | Alta moderna, edición conserva inventario |
| TicketServiceImpl.procesarStock | Restar/sumar enteros | Ambas | Privado muerto | Reutilización accidental | Retirar tras búsqueda sin llamadas |
| SupermarketRepository | Candidatos antiguos | Lectura | Legacy | Comparaba enteros | Consulta moderna compatible y deprecación |
| ProductSupplierRepository | Candidatos actuales | Lectura | Moderna con fallback | Fallback JPQL disperso | Extraer texto sin cambio comercial |
| Frontend facturas proveedor | Disponibilidad/previsualización | Lectura | Alias antiguos | Stock divergente | Usar contrato moderno |
| RegisterIncomeSupplierComponent | Formulario antiguo | Lectura | Histórico sin consumidores | Reactivación sin migrar | Marcar deprecado |

## Referencias restantes clasificadas

Los nombres de archivo backend son relativos a src/main/java/com/api/inventariopixels; los frontend a src/app.

| Archivo | Referencia | Por qué queda | Se puede eliminar ahora | Fase futura |
|---|---|---|---|---|
| model/entity/Supermarket.java | stock, stockMin | Columnas históricas conservadas | No | Migración versionada y retiro de compatibilidad |
| service/inventory/InventoryStockService.java | getStock/getStockMin | Fallback sólo ante null y diagnóstico sin reparación | No | Después de migrar datos históricos |
| service/inventory/InventoryStockService.java | setStock + intValueExact | Único espejo de movimientos; entero exacto dentro de Integer | No | Retiro del espejo |
| service/inventory/InventoryStockService.java | ProductVariant.getStock/setStock | Stock canónico de variante; lectura nula devuelve cero sin escribir | No, no es legacy | Ninguna |
| service/inventory/InventoryLegacyCompatibility.java | getStock/getStockMin | Adaptar contrato antiguo exclusivamente al crear producto sin ID; respeta moderno no nulo | No | Retiro del request antiguo |
| service/inventory/InventoryStockSql.java | COALESCE(stock_quantity, stock), mínimo equivalente | Compatibilidad SQL central de lectura masiva | No | Migración de históricos |
| service/inventory/InventoryStockJpql.java | COALESCE de cantidades y mínimos | Compatibilidad JPQL explícita; variantes activas separadas | No | Migración de históricos |
| repository/SupermarketRepository.java | findPurchaseCandidates | API antigua deprecada; consulta ya moderna; consumidor sólo en test antiguo | No se borra API pública en esta fase | Limpieza de APIs |
| repository/ProductSupplierRepository.java | Constante InventoryStockJpql | Conserva exactamente filtro comercial actual | No | Ninguna funcional |
| repository/ProductVariantRepository.java | SUM(v.stock) | Agregado de variantes activas sólo de lectura | No, canónico | Ninguna |
| service/inventory/ProductCatalogService.java | v.stock, request.stock | Cantidad canónica propia de variante y entrada HTTP de configuración | No | Ninguna |
| service/Supermarket/SupermarketServiceImpl.java | Snapshot getStock/getStockMin y restauración setStock/setStockMin | Evita que ModelMapper cambie inventario durante edición general; no decide disponibilidad | Se conserva protección | Mapper explícito en refactor futuro |
| service/Supermarket/SupermarketServiceImpl.java | response.setStock/setStockMin | Alias HTTP calculados desde valores canónicos | No | Retiro coordinado de contratos |
| service/Product/Excel/ExcelServiceImpl.java | setStock(0), setStockMin(0) | Espejo cero explícito; inicializa también ambos BigDecimal modernos | No es necesario retirarlo | Retiro de columnas |
| service/inventory/ProviderProductExcelImportService.java | setStock(0), setStockMin(0) | Igual política inicial cero, sin cambiar productos existentes | No es necesario retirarlo | Retiro de columnas |
| model/dto/request/SupermarketRequest.java | stock/stockMin deprecados | Clientes antiguos; alta admite stockQuantity/minimumStockQuantity | No | Retiro del contrato antiguo |
| model/dto/response/SupermarketResponse.java | stock/stockMin deprecados | Alias HTTP de valores modernos | No | Retiro de aliases |
| model/dto/response/TicketSupermarketResponse.java | stock/stockMin deprecados | Alias HTTP de valores modernos | No | Retiro de aliases |
| model/dto/response/LowStockProductResponse.java | legacyStock/legacyMinimum | Alias JSON modernos de compatibilidad | No | Retiro de aliases |
| model/dto/response/ProductSaleConfigurationResponse.java | stock | Alias de availableStock; variantes llevan su stock propio | No | Retiro del alias agregado |
| reportes/dto/InventarioReporteDto.java | stock/stockActual/stockMinimo | Alias JSON de cantidades modernas | No | Retiro de aliases |
| model/dto/response/ProductResponse.java; TiendaDeRopaResponse.java | enteros stock/stockMin | Contratos antiguos, sin consumidores operativos modernos encontrados | No se rompe contrato histórico | Limpieza de DTO/API |
| service/Product/ProductServiceImpl.java | Mapper genérico a ProductResponse | Servicio antiguo sin consumidores encontrados | No se reactiva ni se elimina API | Limpieza del servicio antiguo |
| interfaces/Product.ts; ProductItemBuy.ts; ProductItemSale.ts | stock/stockMin | Alias deprecados conservados por compatibilidad | No en conjunto | Retiro de contratos |
| interfaces/inventory.ts | Configuración stock y ProductVariant.stock | Alias agregado deprecado; variante canónica; parámetro HTTP moderno | Sólo alias en futuro | Retiro coordinado |
| services/inventory.service.ts | body.stock | Parámetro HTTP para stockQuantity, no lectura de entidad legacy | No | Renombrado de contrato si se decide |
| pages/crud-product/form-product/form-product.component.ts | productPayload.stock/stockMin | Nombres internos de controles de alta; envía cantidades modernas y aliases cero; edición los elimina | No es dependencia de respuesta legacy | Renombrado de controles opcional |
| pages/crud-product/inventory-config/inventory-config.component.ts y .html | variant.stock, v.stock | Cantidad canónica de variante | No | Ninguna |
| pages/crud-sale/new-sale/new-sale.component.ts | variant?.stock | Snapshot de variante para validar carrito | No | Ninguna |
| pages/crud-sale/sale-configuration/sale-configuration.component.ts y .html | variant.stock | Stock propio de variante | No | Ninguna |
| pages/crud-supplier/registrar-factura-proveedor/registrar-detalle-factura-proveedor/registrar-detalle-factura-proveedor.component.ts | Claves stock/stockMin de formulario y salida | Valores alimentados desde availableStock/minimumStock; ningún acceso .stock/.stockMin legacy restante | No es fuente legacy | Simplificación de formulario opcional |
| pages/crud-supplier/register-income-supplier/register-income-supplier/register-income-supplier.component.ts y .html | data.stock, productData.stock | Componente histórico deprecado, sin ruta, import ni selector consumidor encontrado | Puede retirarse en limpieza dedicada | Limpieza de código muerto |
| Tests backend/frontend | Fixtures stock/stockMin y asserts | Prueban divergencias, fallback y ausencia de escrituras | No | Mantener hasta retirar compatibilidad |

## Conversiones numéricas

- Se retiró aritmética Integer del método privado muerto procesarStock.
- No se encontró intValue/longValue/parseInt/floor que trunque stock en flujos modernos auditados.
- intValueExact del espejo conserva la política existente: fracción o desbordamiento dejan el espejo intacto.
- longValue/intValue restantes de reportes/listas corresponden a IDs, conteos, fechas o estadísticas, no cantidades físicas.
- Math.floor de importación calcula índices de filas; Math.round restante calcula precios, progreso o presentación. No se modificó.
- La normalización BigDecimal a seis decimales sigue siendo la política existente; no se convirtió a enteros.

## Arranque y seguridad de integración

InventoryCompatibilityInitializer ya no rellena cantidades históricas. Conserva la inicialización preexistente de unidades, flags y relaciones ProductSupplier, fuera del cambio funcional pedido. Runner mantiene semillas de empresa/usuarios/caja/etc. PermissionConstraintSynchronizer conserva DDL preexistente de permisos, fuera del alcance; NO se ejecutó.

Por eso ddl-auto=none NO basta para ejecutar un SpringBootTest completo contra la BD real. Las seis clases quedan excluidas. InventoryStockPostgresReadTest usa DataJpaTest sin runners, ddl-auto=none, sql.init.mode=never y conexión/transacción PostgreSQL read-only. Los fixtures SQL de InventoryStockReadRepositoryTest usan exclusivamente H2 en memoria.
