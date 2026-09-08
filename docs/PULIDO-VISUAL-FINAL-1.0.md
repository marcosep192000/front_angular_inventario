# Pulido visual y funcional final — Inventario Pixels 1.0

Fecha: 8 de septiembre de 2026

## Resultado

Los siete puntos solicitados quedaron inspeccionados. Se corrigieron los defectos funcionales y visuales pequeños sin cambiar la arquitectura, el stock, ProductSupplier, licencias, ARCA ni la base de datos.

**Inventario Pixels 1.0 queda visualmente apto para release comercial.** Esta conclusión corresponde al frontend y a los flujos revisados en esta fase. Los bloqueantes operativos de instalación, backup y política de esquema documentados en `RELEASE-COMERCIAL-1.0.md` siguen pendientes antes de instalarlo en un cliente real.

## 1. Nueva Venta: búsqueda y scroll

La lista ya tenía `overflow-y:auto`, pero la selección por teclado cambiaba sólo el índice. Cuando el elemento activo salía del área visible, el contenedor no acompañaba la navegación y parecía que el producto había desaparecido.

Se agregó una referencia a cada resultado y, después de Flecha arriba/abajo, se ejecuta `scrollIntoView({block:'nearest'})`. El listado conserva una altura máxima adaptada al viewport, scroll interno, contención del overscroll, canal estable para la barra y margen de scroll para que ningún ítem quede pegado al borde. Búsqueda, clic, selección y configuración de variantes/presentaciones permanecen iguales.

## 2. Pedidos de compra

Se inspeccionaron lista, detalle, formulario y recepción. El módulo ya utiliza Material Icons y las acciones principales incluyen icono y texto: Nuevo pedido, Enviar, Recibir mercadería, PDF y WhatsApp. Se unificó en el CSS del listado el centrado, tamaño de 18 px, altura de línea y separación de los iconos dentro de botones. No se modificaron eventos ni lógica de negocio.

## 3. Caja del día: pagos mixtos

El backend ya devolvía la información correcta en `TicketResponse.pagos`. Los movimientos físicos de caja excluyen deliberadamente `CUENTA_CORRIENTE`, porque esa porción no es un ingreso de efectivo. La pantalla construía “Pagos / movimientos” sólo desde esos movimientos, por eso una venta mixta aparecía únicamente como efectivo.

Ahora la columna “Forma de pago” utiliza primero la lista transaccional real del ticket y muestra cada componente con su monto, por ejemplo `Efectivo $120.835,04` y `Cta. Cte. $100.000,00`. Si un ticket histórico no trae pagos, mantiene como fallback los movimientos reales de caja.

El texto `01` era un sufijo técnico agregado al número de comprobante para separar varios movimientos de una misma venta. Se eliminó de la vista comercial; no se cambió su uso interno.

## 4. Menú Productos

Se retiró únicamente la entrada visible “Importar precios”. Permanecen “Importar productos de proveedor” y “Precios por proveedor”. El componente, ruta y lógica histórica subyacente no se eliminaron.

## 5. Modal de importación de proveedor

El diálogo se abría con 1160 px, mientras el componente interno fijaba su propio ancho a `min(1120px,97vw)`. Esa diferencia dejaba una franja de la superficie blanca del diálogo a la derecha.

El host y el wizard ahora ocupan el 100% del panel asignado por MatDialog, con `box-sizing:border-box`. El wizard usa un layout flex vertical; header, contenido y acciones comparten el mismo ancho, el contenido administra el scroll y el footer conserva su borde y alineación. No se agregaron posiciones absolutas ni anchos mágicos.

## 6. Iconos descentrados

El componente compartido `app-icon` renderizaba la imagen como `inline-block` y añadía `padding:5px 0`; esa combinación desplazaba el dibujo dentro de contenedores con tamaño fijo.

El host ahora es `inline-flex`, centra en ambos ejes y usa línea cero. La imagen es `block`, no tiene padding y conserva proporción con `object-fit:contain`. La compilación y la suite completa verifican que el cambio común no rompe sus consumidores.

## 7. Login

Se mantuvieron la identidad violeta, logo, panel informativo, Enterprise Edition y tarjeta derecha. Los cambios reducen el protagonismo de la firma del desarrollador, ordenan el ritmo de módulos, eliminan movimientos decorativos al pasar el mouse, afinan sombra/bordes de la tarjeta y equilibran logo, títulos y espacios.

Los iconos de usuario, contraseña, mostrar contraseña, seguridad y botón se centran con flex. El botón conserva el violeta, mejora foco/hover y ahora muestra un estado `Ingresando…`, se deshabilita durante la petición y evita envíos duplicados. Se agregó una etiqueta accesible al control de visibilidad. Para pantallas desktop de poca altura existe una variante compacta sin rehacer el layout responsive existente.

## Archivos modificados en esta fase

- `src/app/pages/crud-sale/new-sale/new-sale.component.ts`
- `src/app/pages/crud-sale/new-sale/new-sale.component.html`
- `src/app/pages/crud-sale/new-sale/new-sale.component.css`
- `src/app/pages/crud-sale/new-sale/new-sale.component.spec.ts`
- `src/app/pages/crud-cash-closing/detalles-ventas-caja/detalles-ventas-caja.component.ts`
- `src/app/pages/crud-cash-closing/detalles-ventas-caja/detalles-ventas-caja.component.html`
- `src/app/pages/crud-cash-closing/detalles-ventas-caja/detalles-ventas-caja.component.css`
- `src/app/pages/crud-cash-closing/detalles-ventas-caja/detalles-ventas-caja.component.spec.ts`
- `src/app/pages/crud-product/list-product/list-product.component.html`
- `src/app/pages/crud-product/provider-product-import/provider-product-import-dialog.component.css`
- `src/app/shared/dasboard/icon/icon.component.css`
- `src/app/pages/purchase-orders/purchase-order-list.polish.css`
- `src/app/pages/login/login.component.ts`
- `src/app/pages/login/login.component.html`
- `src/app/pages/login/login.component.css`
- `src/app/services/movimiento-caja.service.ts`

El último archivo sólo perdió un import Node no utilizado que impedía compilar la suite del navegador.

## Pruebas y builds

- Suite frontend completa: **184 pruebas aprobadas**.
- Casos nuevos: seguimiento visual del resultado activo, efectivo, cuenta corriente, pago mixto, montos reales y ausencia del ID técnico `01`.
- Build Angular de producción: aprobado.
- Warning conocido: bundle inicial **2,61 MB**, 624,25 kB sobre el presupuesto de 2,00 MB. No se optimizó en esta fase.
- Backend: no recibió cambios en esta fase; la suite segura anterior permanece en 299 pruebas aprobadas y el build backend estaba aprobado.
- `git diff --check`: aprobado.
- No se hizo commit ni push.

## Validación visual

Se revisó el login real después de recompilar: marca, panel de producto, firma secundaria, campos, control de contraseña, botón y estado de conexión aparecen completos y accesibles. Nueva Venta se había inspeccionado con datos reales antes del reinicio de dependencias; su estructura no presenta cortes y el comportamiento de scroll quedó cubierto por prueba. Los estilos incluyen ajustes específicos para desktop de altura reducida y los breakpoints existentes de 1100, 768 y 650 px.

No fue posible fijar desde la conexión del navegador dimensiones exactas de 1920×1080, 1366×768 y 1280×720; la API disponible no expuso cambio de viewport. El build, los breakpoints y la revisión del viewport abierto no mostraron barras o overlays inesperados.

## Backlog menor

- El login mantiene “Recordarme” como elemento visual preexistente; no se amplió su funcionalidad en esta fase.
- Continúan mensajes de consola de pruebas antiguas y la advertencia conocida del tamaño del bundle.
- No se hizo una prueba con impresora física ni un recorrido de mouse en hardware distinto.
