# K66 Analytics — Dashboard individual de agentes

Actualización basada en el proyecto K66 Analytics con filtros avanzados y Excel.

## Novedades
- Nuevo elemento **Dashboard de agentes** en el menú lateral.
- Selector de agente para ver ventas netas actuales y anteriores, crecimiento, clientes distintos y productos distintos.
- Gráfica mensual real por agente mediante el endpoint `GET /api/ventas/agente-tendencia`.
- Ventas por empresa, Top 10 clientes, Top 10 productos y tabla de productos ordenable.
- Exportación del perfil a Excel usando las hojas Agentes, Clientes y Producto-Agente filtradas por el vendedor seleccionado.
- Filtros de empresa y fecha sincronizados con el resto del sistema; colores GRACO verde, FAES rojo, BOLIK gris, Todas azul.

## Instalación
1. Realizar copia del proyecto actual.
2. Copiar las carpetas `frontend` y `backend` de esta entrega a `K66-Analytics-web` (reemplazar archivos de código).
3. **Conservar el `.env` original del backend; no está incluido en la entrega.**
4. Cerrar el proceso Node.js anterior que ocupa el puerto 3005, si estuviera activo.
5. En `backend`, ejecutar `npm install` y `npm start`.
6. Abrir `http://127.0.0.1:3005/`, seleccionar **Dashboard de agentes**.

## Datos y límites
Los resultados requieren conexión real a SAP HANA. El dashboard combina los endpoints existentes de agentes, clientes y producto-agente; el gráfico temporal consulta el nuevo endpoint agente-tendencia. Los datos del agente son comerciales, no información personal (teléfono/correo), pues no se consultan esos campos. El conteo de clientes/productos distingue también la empresa. El comparativo utiliza fecha documental y neto de facturas menos notas de crédito según el SQL base. La información de `Quantity` puede estar en distintas unidades de venta.

**Seguridad pendiente antes de publicar:** no exponer el servidor con el usuario administrativo SYSTEM, crear un usuario de solo lectura, corregir la cadena de certificados TLS para reactivar `HANA_VALIDATE_CERTIFICATE=true`, e implementar autenticación y autorización por rol/empresa/agente. La vista no restringe el acceso a agentes; es para uso administrativo interno hasta implementar permisos.

## Verificaciones
Se verificó sintaxis de JavaScript con `node --check`. No se ejecutó contra el HANA de la empresa ni se hizo una prueba end-to-end; validar que se carguen los datos y Excel en el servidor local.
# analytics-agents-k66
