# Inventario Pixels 1.0 — Pulido comercial y UX

## Cambios realizados

### Dashboard

- Ventas Diarias dejó de depender de un bloque `@defer` cuyo fallo de carga/render mostraba el mensaje genérico antes de que el componente pudiera distinguir el estado HTTP. El componente se renderiza con la pantalla y maneja tres estados propios: carga, período vacío y error real.
- El contrato existente `GET /dashboard/ventas-por-dia` se conserva. La consulta mantiene el mes actual comparado con el mismo mes del año anterior y devuelve día, mes, año y total.
- Bajo Stock ya usaba `GET /supermarket/low-stock?page=0&size=10`: el límite ocurre en SQL mediante `LIMIT/OFFSET`, con suma de variantes activas y orden por `available_stock, product_id`. No se cargan miles de productos en Angular.
- La card y la acción de la lista ahora navegan al reporte real `/dashboard/reportes/inventario/bajo-stock`.
- Últimas Ventas solicita 10 elementos al repositorio, que ordena por `fechaEmision DESC, id DESC`. Incluye empty state, error humano y enlace al reporte completo.

### Nueva Venta y Caja

- La causa del estado incorrecto era texto fijo en el template: `Caja Abierta` no consultaba ningún servicio.
- La autoridad es el endpoint existente `GET /cajas/abierta`, respaldado por `CajaRepository.findByEstadoFalse()`. Una caja histórica cerrada no satisface esa consulta.
- Nueva Venta consulta al entrar y vuelve a consultar inmediatamente antes de abrir el cobro. Con caja cerrada muestra una advertencia, diferencia visualmente el estado y bloquea el botón de cobro. Presupuesto, remito y demás documentos que el flujo existente clasifica sin cobro conservan su comportamiento.
- El backend ya exige caja activa al crear los movimientos de los pagos que pasan por caja. La comprobación frontend anticipa esa regla con un mensaje comprensible.

### Pedidos de compra

- Se conservan endpoints, reglas, `ProductSupplier`, movimientos de stock, variantes, presentaciones, estados, recepción, PDF y WhatsApp.
- El encabezado identifica el módulo con icono y una explicación corta; “Nuevo pedido” mantiene la jerarquía primaria.
- Los estados se muestran en castellano con texto, color e icono: Borrador, Pendiente de aprobación, Enviado, Recepción parcial, Recibido y Cancelado.
- Las acciones siguen exactamente la matriz del backend: editar sólo borrador; enviar borrador o pendiente; recibir enviado o parcial; cancelar salvo recibido/cancelado.
- “Recibir mercadería” ahora es una acción primaria con texto visible. Ver detalle, editar y enviar también dejaron de depender de iconos solos; cancelar conserva `title` y `aria-label`.
- El empty state ofrece “Crear primer pedido”. Los filtros, paginación, detalle y diálogo de recepción existentes se conservan.
- No se agregó un total de recepción al listado porque el resumen no contiene detalles y sumar cantidades con presentaciones/unidades diferentes sería engañoso. El detalle y el diálogo muestran solicitado, recibido y pendiente por línea.

## Auditoría visual y backlog

### Crítico para demo/venta — corregido

- Error genérico de Ventas Diarias.
- Estado de caja hardcodeado y cobro habilitado con caja cerrada.
- Card de Bajo Stock dirigida a una pantalla histórica en lugar del reporte solicitado.
- Acción crítica de recepción escondida detrás de un icono en la lista.
- Fallback de Reportes que podía mostrar un código HTTP técnico.

### Importante — pendiente

- Unificar los componentes antiguos de clientes, proveedores, caja y cuenta corriente con los headers/cards modernos. Requiere una fase visual acotada por módulo para evitar regresiones.
- Reemplazar `confirm()` y `prompt()` nativos en pedidos por diálogos Material reutilizables.
- Incorporar nombres humanos de estado mediante una utilidad compartida entre lista y detalle de pedidos.
- Optimizar `assets/logo.png`; Angular advierte que sus dimensiones intrínsecas superan ampliamente su tamaño renderizado.

### Cosmético

- Normalizar mayúsculas de títulos (`Bajo Stock`, `Ventas Diarias`) y microcopias entre módulos antiguos.
- Homogeneizar tooltips de botones secundarios sólo-icono.
- Revisar espaciado de formularios extensos de caja y facturas proveedor en resoluciones menores.

### Futuro

- Diseñar una vista mobile específica; esta fase sólo asegura comportamiento responsivo básico.
- Añadir un contrato de progreso resumido de pedido si el backend puede expresarlo por líneas comparables, sin sumar unidades heterogéneas.

## Checklist manual de release

### Dashboard

1. Entrar con ventas del mes y comprobar barras, etiquetas y totales.
2. Probar un período/base sin ventas y verificar el empty state.
3. Simular fallo del endpoint y verificar el mensaje humano.
4. Verificar 10 productos como máximo con más de 10 bajo mínimo, y todos cuando hay menos.
5. Revisar variante activa y producto fraccionable (`5`, `5,5`, `0,25`).
6. Abrir la card y “Ver reporte completo”; ambos deben llegar a Reportes → Bajo stock.
7. Confirmar las 10 ventas más recientes y abrir “Ver todas”.

### Caja

1. Con caja cerrada, abrir Nueva Venta: debe verse “Caja Cerrada”, advertencia y cobro bloqueado.
2. Abrir caja y volver a Nueva Venta: debe verse “Caja Abierta” y habilitar cobro cuando haya productos.
3. Cerrar caja y volver: debe actualizarse sin recargar datos guardados localmente.
4. Cambiar el estado de caja con Nueva Venta abierta e intentar cobrar: la verificación previa debe bloquear o permitir según el estado real.

### Pedidos

1. Probar empty state y “Crear primer pedido”.
2. Crear y editar borrador; enviarlo; verificar acciones visibles por estado.
3. Recibir parcialmente y comprobar pendientes por línea y badge de recepción parcial.
4. Completar recepción y confirmar que desaparece la acción de recibir.
5. Cancelar sólo en estados permitidos.
6. Descargar PDF y probar WhatsApp con/sin teléfono válido.
7. Probar variantes, presentaciones y cantidades `0.25` y `1.5` sin truncamiento.

## Límites respetados

No se modificaron InventoryStockService, ProductQuantityService, movimientos de stock de pedidos/facturas proveedor, ARCA, licencias, ProductSupplier ni importadores. No se agregaron endpoints, migraciones o librerías. No hubo Flyway, ALTER TABLE, commit ni push.
