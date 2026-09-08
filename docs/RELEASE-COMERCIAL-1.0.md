# Checklist final de release comercial — Inventario Pixels 1.0

Fecha de auditoría: 7 de septiembre de 2026  
Alcance: código fuente actual, ejecución local disponible, artefactos instalados en este equipo y comprobaciones no destructivas sobre la base existente.

## Decisión

**NOT RELEASE READY** para instalar y dejar operando en la PC de un cliente real.

La aplicación web y sus módulos funcionales principales tienen una base estable: compilan, las pruebas automatizadas pasan y el catálogo real de más de 8.000 productos responde con paginación. El release comercial queda detenido por el proceso de operación e instalación: no existe un backup automático verificado con prueba de restauración, el servicio instalado no está operativo en la auditoría, la vía Electron declarada no puede arrancar correctamente y la configuración de producción conserva `ddl-auto=update` como valor por defecto.

## Resultado ejecutivo

| Área | Estado | Evidencia principal |
|---|---|---|
| Build frontend | APROBADO CON ADVERTENCIA | Build de producción correcto; bundle inicial 2,60 MB, 618,29 kB por encima del presupuesto. |
| Build backend | APROBADO | JAR Spring Boot generado correctamente. |
| Pruebas frontend | APROBADO | 180/180. |
| Pruebas backend seguras | APROBADO | 299/299, sin DDL de Hibernate ni inicialización SQL. |
| Aplicación web local | APROBADO CON OBSERVACIÓN | Frontend en 4200 y backend de desarrollo en 8080; `/actuator/health` respondió `UP`. |
| Servicio Windows instalado | NO APROBADO | `InventarioPixel` está detenido; el log confirma reinicios fallidos porque 8080 estaba ocupado. |
| Inicio automático | NO CERTIFICADO | El servicio está configurado como automático y con recuperación, pero no se verificó un reinicio completo exitoso. |
| Licencia local | APROBADO EN PRUEBAS | Archivo, identificador y estado persistido presentes; 22 pruebas cubren vigencia, firma, instalación y cuotas. |
| Backup y restauración | NO APROBADO | No se encontró tarea automática ni copia de la aplicación; no existe restauración ensayada. |
| Catálogo grande | APROBADO | 8.077 productos observados; consultas de bajo stock y candidatos están paginadas. |
| Seguridad de secretos | NO APROBADO PARA DISTRIBUCIÓN DEL FUENTE | Producción usa archivo externo, pero la configuración de desarrollo conserva credenciales y fallback JWT en texto plano. |
| ARCA | APROBADO EN PRUEBAS | Cobertura automatizada sin emitir comprobantes reales. |

## Hallazgos clasificados antes de cambios

### BLOCKER

1. **No hay backup automático ni restauración validada.** No se encontró una tarea programada específica, archivos de respaldo en `C:\ProgramData\InventarioPixel` ni evidencia de una restauración de ensayo. Para una instalación comercial, la pérdida del disco o una corrupción dejarían al cliente sin recuperación demostrada.
2. **La instalación no quedó certificada de extremo a extremo.** El servicio `InventarioPixel` figura detenido. Está configurado en inicio automático y recuperación, pero sus últimos intentos entraron en reintentos y fallaron con `Web server failed to start. Port 8080 was already in use`. Durante la auditoría el puerto pertenecía al backend de desarrollo, por lo que no se inició el servicio instalado para evitar dos instancias contra la misma base.
3. **La vía Electron configurada en `package.json` tiene un error de arranque.** `electron/main.js` usa `ipcMain` sin importarlo. También usa `dialog` sin importarlo si falla Java, y su supuesto fallback `java` por PATH se valida con `fs.existsSync('java')`, por lo cual se descarta. Esa vía de paquete no puede aprobarse como instalador comercial.
4. **Producción permite cambios implícitos de esquema.** `application-prod.properties` usa `${HIBERNATE_DDL_AUTO:update}` y el archivo externo instalado no lo reemplaza. Esto contradice la condición de operar sin DDL inesperado. No se modificó esta política porque el alcance prohíbe cambios de `ddl-auto` y estructura de base.

### CRITICAL

1. **El dashboard fallaba cuando la caja estaba cerrada.** El resumen llamaba a una operación que lanzaba excepción si no había caja abierta. Se corrigió para devolver saldo de caja cero y se agregó una prueba de regresión. El fix pasa la suite segura; no se reinició la instancia de desarrollo porque su arranque normal puede ejecutar inicializadores incompatibles con la regla de cero DDL.
2. **El artefacto instalado no contiene el código auditado actual.** El JAR bajo `Program Files` es anterior a los cambios de estabilización y pulido. El build actual se generó en el workspace, pero no se reemplazó ni se publicó como instalador.
3. **Credenciales de desarrollo versionables.** La configuración base contiene contraseña de base y secreto JWT fallback. Deben salir de cualquier entrega de fuentes y rotarse si fueron compartidos.

### IMPORTANT

1. El bundle inicial Angular supera el presupuesto configurado: 2,60 MB frente a 2,00 MB. No impide compilar, pero aumenta tiempo de inicio en equipos modestos.
2. El navegador informa una imagen `assets/logo.png` con dimensiones mayores a las mostradas y advertencias de `disabled` en formularios reactivos.
3. Las pruebas de login/sesión de integración existen, pero se excluyeron de la ejecución contra la base real porque crean y revocan sesiones. La navegación autenticada y la redirección al expirar sesión sí se observaron en la aplicación local.
4. No se ensayó impresión física ni exportación con una impresora real en esta auditoría. Las pruebas de generación de comprobantes PDF pasan.

### COSMETIC

1. Persisten mensajes de consola de algunas pruebas y servicios que podrían reducirse para facilitar soporte.
2. Hay avisos del compilador por APIs obsoletas, operaciones no verificadas y `equals/hashCode` generado sin llamada a la superclase.

### FUTURE

1. Automatizar la instalación limpia en una VM y ejecutar una prueba después de reiniciar Windows.
2. Incorporar monitoreo simple del servicio, rotación de logs y aviso visible si backend o base no están disponibles.
3. Reducir el bundle inicial con carga diferida de módulos de baja frecuencia.

## Matriz funcional

| Flujo | Resultado | Método y límite |
|---|---|---|
| Login, sesión y rutas protegidas | APROBADO PARCIAL | Sesión real y redirección por expiración observadas; integración destructiva de sesiones no ejecutada sobre datos reales. |
| Dashboard | APROBADO TRAS FIX | Gráfico con datos, diez filas de bajo stock y últimas ventas observadas. La caja cerrada ahora es un estado normal en backend y tiene prueba. |
| Productos: alta/edición/listado | APROBADO POR PRUEBAS Y LECTURA | Validaciones y servicios cubiertos; no se creó ni alteró un producto real durante el checklist. |
| Venta y caja | APROBADO PARCIAL | La venta muestra caja cerrada y bloquea el pago. No se registró una venta real para preservar datos. |
| Clientes y proveedores | APROBADO POR COBERTURA EXISTENTE | Navegación y servicios disponibles; no se mutaron registros reales. |
| Compras/facturas proveedor | APROBADO POR PRUEBAS | Cálculos, cantidades decimales y stock cubiertos por la suite. |
| Inventario y variantes | APROBADO | Autoridad moderna, compatibilidad y límites BigDecimal cubiertos; consulta PostgreSQL de sólo lectura aprobada. |
| Listas de precios/importadores | APROBADO POR PRUEBAS | XLS/XLSX, análisis, parsing y comparaciones cubiertos; no se importó sobre la base real. |
| Órdenes de compra | APROBADO | Listado, edición y candidatos paginados observados; 21 pruebas de servicio. |
| Reportes/exportación | APROBADO CON LÍMITE | Servicios y errores humanizados cubiertos; impresión física pendiente. |
| Configuración empresa/usuarios | APROBADO POR PRUEBAS | Configuración de empresa cubierta; no se cambiaron usuarios reales. |
| Licencia | APROBADO EN LÓGICA | 22 pruebas y persistencia local presentes; falta validación dentro de un instalador nuevo. |
| ARCA | APROBADO EN HOMOLOGACIÓN/PRUEBAS | Autenticación, parámetros, QR, mapeos y reconciliación cubiertos; cero emisiones reales. |

## Catálogo grande y rendimiento

- El dashboard mostró 8.077 productos y 8.066 con bajo stock en los datos actuales.
- La portada limita bajo stock a diez filas y últimas ventas a diez elementos.
- La consulta de stock masivo usa proyección escalar y paginación SQL; no materializa todo el catálogo ni introduce N+1.
- La selección de productos en órdenes de compra mostró diez candidatos por página sobre 8.066.
- No se ejecutó una prueba de carga concurrente ni un benchmark prolongado; el resultado certifica navegación operable en este equipo, no capacidad multiusuario máxima.

## Backup manual provisional

Esta guía reduce el riesgo mientras se implementa el backup formal; **no levanta el blocker** hasta ejecutar y documentar una restauración de ensayo.

1. Cerrar la aplicación o confirmar que no haya operaciones activas.
2. Crear una carpeta fuera del disco principal o en un medio externo con espacio suficiente.
3. Ejecutar con el PostgreSQL instalado:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\pg_dump.exe' --format=custom --file='E:\Backups\inventario_pixels_YYYYMMDD_HHMM.dump' --dbname='inventario_pixels' --username='<usuario>'
```

4. Verificar que el comando termine con código cero y que el archivo tenga tamaño mayor que cero.
5. Conservar al menos siete copias diarias y una copia externa desconectada.
6. Probar la restauración únicamente en una base separada:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\createdb.exe' --username='<usuario>' inventario_pixels_restore_test
& 'C:\Program Files\PostgreSQL\18\bin\pg_restore.exe' --exit-on-error --clean --if-exists --dbname='inventario_pixels_restore_test' --username='<usuario>' 'E:\Backups\inventario_pixels_YYYYMMDD_HHMM.dump'
```

7. Abrir una instancia aislada contra `inventario_pixels_restore_test`, revisar totales de productos, ventas y stock, y luego eliminar sólo la base de ensayo.

No guardar contraseñas en el script ni dentro del repositorio. Usar el mecanismo seguro de credenciales de PostgreSQL del equipo.

## Cambios mínimos aplicados durante el checklist

- Se agregó una consulta opcional de caja abierta en `CajaService`.
- El resumen del dashboard devuelve `0` cuando la caja está cerrada, en vez de responder con error.
- Se agregó la prueba `dashboardSummaryTreatsClosedCashRegisterAsNormalState`.

No se cambió la arquitectura de stock, `ProductSupplier`, órdenes de compra, ARCA, licencias, importadores, estructura de base, Flyway, `ddl-auto`, migraciones, tienda online, delivery ni IA.

## Validación reproducible

Frontend:

```text
npm test -- --watch=false --progress=false
TOTAL: 180 SUCCESS

npm run build
Application bundle generation complete
Advertencia: bundle inicial 2,60 MB, presupuesto 2,00 MB
```

Backend:

```text
mvn -Dtest=*,!InventarioPixelsApplicationTests,!PurchaseOrderQueryIntegrationTest,!ReporteConsultaRepositoryTest,!AuthSessionIntegrationTest,!PermissionConstraintIntegrationTest,!SupplierPriceListCreationIntegrationTest test -Dspring.jpa.hibernate.ddl-auto=none -Dspring.sql.init.mode=never
Tests run: 299, Failures: 0, Errors: 0, Skipped: 0

mvn package -DskipTests
BUILD SUCCESS
```

`git diff --check` terminó sin errores en frontend y backend. No se hizo commit ni push.

## Condiciones para cambiar la decisión a RELEASE READY

1. Implementar un backup automático, ejecutar una restauración completa en una base aislada y registrar fecha, duración y controles de integridad.
2. Generar un instalador nuevo con los artefactos auditados y validar instalación limpia, primer inicio, licencia, operación sin consola y reinicio de Windows.
3. Resolver y probar una única estrategia de arranque: servicio Windows o Electron. Debe detectar una instancia previa, evitar el conflicto de puerto y mostrar un error recuperable.
4. Definir fuera de esta fase una política de esquema que garantice cero DDL inesperado en producción.
5. Retirar los secretos del material distribuible y rotar los valores que hayan salido del equipo.

