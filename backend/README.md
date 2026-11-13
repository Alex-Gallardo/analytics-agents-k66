# K66 Analytics — API Node.js + SAP HANA

## Qué incluye

Backend inicial de **solo lectura** para SAP Business One HANA, con 6 endpoints: venta general, agentes, clientes, productos, producto-agente y tendencia mensual. Todas las consultas comparten filtros de fecha y empresa. El dashboard puede calcular KPI y rankings a partir de estos endpoints.

> **Importante:** Código verificado sintácticamente con Node 22, pero NO probado contra la instancia SAP HANA real. Los importes son `LineTotal` y las cantidades son `Quantity` (unidad del documento). Revisar conciliación con reportes financieros antes de producción.

## Instalación (desde un servidor con acceso a SAP HANA)

```powershell
cd C:\Proyectos\K66-Analytics-Backend
copy .env.example .env
npm install
npm run check
npm start
```

Editar `.env` con una cuenta técnica de SAP HANA con permisos **SELECT solamente** a los esquemas `SBO_GRACO`, `SBOBOLIK`, `SBOESCOCESA`. No guardar contraseñas en Git ni compartir el `.env`.

Para verificar:

- `http://127.0.0.1:3005/api/health`
- `http://127.0.0.1:3005/api/health/hana`
- `http://127.0.0.1:3005/api/ventas/general?fechaInicio=2026-01-01&fechaFin=2026-10-31&empresa=all`
- `http://127.0.0.1:3005/api/ventas/agentes?fechaInicio=2026-01-01&fechaFin=2026-10-31&empresa=GRACO`
- `http://127.0.0.1:3005/api/ventas/clientes?fechaInicio=2026-01-01&fechaFin=2026-10-31&empresa=FAES`
- `http://127.0.0.1:3005/api/ventas/productos?fechaInicio=2026-01-01&fechaFin=2026-10-31&empresa=BOLIK`
- `http://127.0.0.1:3005/api/ventas/producto-agente?fechaInicio=2026-01-01&fechaFin=2026-10-31&empresa=GRACO`
- `http://127.0.0.1:3005/api/ventas/tendencia?fechaInicio=2026-01-01&fechaFin=2026-10-31&empresa=all`

`empresa`: `all`, `GRACO`, `BOLIK`, `FAES`. FAES corresponde a esquema `SBOESCOCESA`.

## Arquitectura

`Navegador -> Node.js/Express -> @sap/hana-client -> SAP HANA`

Se recomienda ejecutar API dentro de la red corporativa o detrás de acceso VPN, y utilizar un proxy con HTTPS y SSO/autenticación. El backend **no incluye autenticación de usuarios** y solo escucha en `127.0.0.1` por defecto. NO exponerlo como servicio público hasta implementar sesiones, permisos por empresa, logs de auditoría, limitación de solicitudes, controles de exportación, y gestión de certificados.

## Cómo funciona SQL

- `OINV/INV1` agregan montos positivos.
- `ORIN/RIN1` los descuentan.
- Excluye `CANCELED <> 'N'`, servicios, `CL0149`, vendedores OTROS y EMPLEADOS.
- El período anterior se calcula con `ADD_YEARS(...,-1)`.
- Esquemas seleccionados desde allowlist (nunca un nombre libre de la petición) y fechas enviadas mediante parámetros.
- Suma por dimensiones de cada vista, de forma consistente.

### Antes de producción

1. Probar conexión en el servidor y acordar cifrado TLS/certificado válido. `HANA_ENCRYPT` y `HANA_VALIDATE_CERTIFICATE` deben configurarse conforme a la instancia; nunca deshabilitar validación de certificados en entornos productivos con TLS.
2. Comparar ventas generales versus ventas por agente, cliente, producto y producto-agente, cuidando líneas sin ItemCode y nombres históricos.
3. Verificar tratamiento de moneda, descuentos, facturas canceladas, devoluciones y unidades de medida.
4. Conectar el frontend existente: `app.js` contiene `generalSeed`, `agentSeed`, `customerSeed`, `productSeed`, `productAgentSeed` y `periodFactor`; deben reemplazarse por solicitudes `fetch('/api/ventas/...')` y cálculos sobre la respuesta real. **El frontend incluido en el paquete anterior aún usa datos de muestra.**
5. Para grandes volúmenes, aplicar paginación SQL y optimizar rangos de fecha dentro de los movimientos por empresa para reducir carga.

## Compatibilidad

Backend Node 20+, npm, SAP HANA Client nativo. La API se probó sintácticamente en Node 22; la conectividad real queda por verificar en la red empresarial.
