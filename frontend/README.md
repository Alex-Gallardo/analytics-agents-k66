# K66 Analytics — prototipo web

Prototipo de dashboard comercial inspirado en el diseño oscuro seleccionado. **No está conectado a SAP Business One HANA** y contiene datos ilustrativos de las capturas de la conversación, junto con registros de ejemplo explícitamente identificados como tales.

## Abrir

1. Descomprimir el ZIP.
2. Abrir `index.html` en Google Chrome o Microsoft Edge. No requiere instalación ni servidor.
3. Seleccionar **Todas**, **GRACO**, **FAES** o **BOLIK**. El tema cambia automáticamente:
   - Todas: negro con azul discreto.
   - GRACO: negro con verde claro.
   - FAES / ESCOCESA: negro con rojo.
   - BOLIK: negro con gris plateado.
4. Elegir fechas y pulsar **Aplicar**; se actualizan las vistas con cálculos de demostración. Las fechas no consultan SAP.
5. Consultar las secciones de venta general, agentes, clientes, productos y producto-agente.
6. Utilizar **Exportar CSV** para guardar la vista actual, compatible con Excel (CSV con separador `;`).

## Archivos

- `index.html`: estructura y navegación de la página.
- `styles.css`: diseño responsive glassmorphism y temas de empresa.
- `app.js`: datos de muestra, tablas, filtros, gráficos SVG y exportación.

## Advertencias sobre los datos

- La base original es un conjunto de capturas, **no un extracto íntegro de SAP**.
- Los filtros temporales distribuyen los valores base de forma sintética entre meses; **no constituyen ventas reales**.
- Las cifras demostrativas de clientes, productos y agentes son muestras parciales y **no cuadran necesariamente** con venta general.
- Los gráficos de tendencia son ilustrativos; se deben alimentar con agregados mensuales reales al conectar SAP.
- Los porcentajes de variación cuando el año anterior es cero se presentan como `N/D`, no como 100%.
- El dashboard no incluye credenciales ni conexión directa desde el navegador.

## Conectar a SAP HANA en producción

Arquitectura propuesta: `React (o este frontend) → API Node.js/Express → SAP HANA (solo lectura)`.

Endpoints sugeridos: `GET /api/dashboard`, `/api/ventas/general`, `/api/ventas/agentes`, `/api/ventas/clientes`, `/api/ventas/productos`, `/api/ventas/producto-agente`. Parámetros: `fechaInicio`, `fechaFin`, `empresa`.

El servidor debe validar fechas y permisos, parametrizar SQL y acceder mediante usuario técnico de solo lectura. Nunca se deben insertar contraseñas de HANA en `app.js`. Es necesario añadir autenticación, autorización por empresa, paginación en servidor, manejo de monedas y verificación contable de totales.

Para producción, sustituir los arreglos `generalSeed`, `agentSeed`, `customerSeed`, `productSeed` y `productAgentSeed` y el cálculo `periodFactor` por respuestas reales de la API. Revisar las consultas originales y su interpretación contable antes del despliegue.
