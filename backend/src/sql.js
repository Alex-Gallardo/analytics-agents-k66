/** Empresas en allowlist: nunca se interpolan esquemas suministrados por usuario. */
const SCHEMAS = Object.freeze({ GRACO: 'SBO_GRACO', FAES: 'SBOESCOCESA', BOLIK: 'SBOBOLIK' });

export function buildQuery(view, company = 'all') {
  const selected = company === 'all' ? Object.entries(SCHEMAS) : [[company, SCHEMAS[company]]];
  if (selected.some(([, schema]) => !schema)) throw new Error('Empresa no válida');
  const unions = selected.flatMap(([name, schema]) => [
    movement(schema, name, false), movement(schema, name, true)
  ]).join('\n UNION ALL \n');

  // Parámetros reutilizados para todos los movimientos: fecha inicio y fecha fin, y rango del año anterior.
  const cte = `WITH P AS (
    SELECT CAST(? AS DATE) AS "Inicio", CAST(? AS DATE) AS "Fin" FROM DUMMY
  ), MOV AS (
    ${unions}
  ), PER AS (
    SELECT M.*,
      CASE WHEN M."Fecha" BETWEEN P."Inicio" AND P."Fin" THEN M."Monto" ELSE 0 END AS "Actual",
      CASE WHEN M."Fecha" BETWEEN ADD_YEARS(P."Inicio", -1) AND ADD_YEARS(P."Fin", -1) THEN M."Monto" ELSE 0 END AS "Anterior",
      CASE WHEN M."Fecha" BETWEEN P."Inicio" AND P."Fin" THEN M."Cantidad" ELSE 0 END AS "CantidadActual",
      CASE WHEN M."Fecha" BETWEEN ADD_YEARS(P."Inicio", -1) AND ADD_YEARS(P."Fin", -1) THEN M."Cantidad" ELSE 0 END AS "CantidadAnterior",
      CASE WHEN M."Fecha" BETWEEN P."Inicio" AND P."Fin" THEN M."Fecha" ELSE ADD_YEARS(M."Fecha", 1) END AS "FechaComparativa"
    FROM MOV M CROSS JOIN P
    WHERE M."Fecha" BETWEEN P."Inicio" AND P."Fin"
      OR M."Fecha" BETWEEN ADD_YEARS(P."Inicio", -1) AND ADD_YEARS(P."Fin", -1)
  )`;
  const dims = {
    general: ['"Empresa"', '"Tipo"'],
    agentes: ['"Empresa"', '"Agente"'],
    clientes: ['"Empresa"', '"ClienteCodigo"', '"Agente"'],
    productos: ['"Empresa"', '"ProductoCodigo"'],
    'producto-agente': ['"Empresa"', '"ProductoCodigo"', '"Agente"'],
    tendencia: ['"Empresa"', 'YEAR("FechaComparativa")', 'MONTH("FechaComparativa")'],
    'agente-tendencia': ['"Empresa"', '"Agente"', 'YEAR("FechaComparativa")', 'MONTH("FechaComparativa")']
  };
  if (!dims[view]) throw new Error('Vista no válida');
  const grouping = dims[view].join(', ');
  const extras = {
    general: '"Empresa" AS "company", "Tipo" AS "type",',
    agentes: '"Empresa" AS "company", "Agente" AS "agent",',
    clientes: '"Empresa" AS "company", "ClienteCodigo" AS "code", MAX("ClienteNombre") AS "name", "Agente" AS "agent",',
    productos: '"Empresa" AS "company", "ProductoCodigo" AS "code", MAX("ProductoNombre") AS "name",',
    'producto-agente': '"Empresa" AS "company", "ProductoCodigo" AS "code", MAX("ProductoNombre") AS "name", "Agente" AS "agent",',
    tendencia: '"Empresa" AS "company", YEAR("FechaComparativa") AS "year", MONTH("FechaComparativa") AS "month",',
    'agente-tendencia': '"Empresa" AS "company", "Agente" AS "agent", YEAR("FechaComparativa") AS "year", MONTH("FechaComparativa") AS "month",'
  };
  const detailQty = ['clientes','productos','producto-agente'].includes(view)
    ? 'SUM("CantidadAnterior") AS "qtyPrevious", SUM("CantidadActual") AS "qtyCurrent",'
    : '';
  const sql = `${cte}
    SELECT ${extras[view]}
      ${detailQty}
      SUM("Anterior") AS "previous", SUM("Actual") AS "current"
    FROM PER
    GROUP BY ${grouping}
    ORDER BY "current" DESC`;
  return sql;
}

function movement(schema, name, isCredit) {
  const head = isCredit ? 'ORIN' : 'OINV';
  const line = isCredit ? 'RIN1' : 'INV1';
  const sign = isCredit ? '-' : '';
  return `SELECT '${name}' AS "Empresa", H."DocDate" AS "Fecha",
      H."CardCode" AS "ClienteCodigo", H."CardName" AS "ClienteNombre",
      S."SlpName" AS "Agente",
      CASE WHEN H."CardCode" LIKE 'CL%' THEN 'LOCAL' ELSE 'EXPORTACION' END AS "Tipo",
      L."ItemCode" AS "ProductoCodigo",
      COALESCE(I."ItemName", L."Dscription") AS "ProductoNombre",
      ${sign}L."Quantity" AS "Cantidad", ${sign}L."LineTotal" AS "Monto"
    FROM "${schema}"."${head}" H
    INNER JOIN "${schema}"."${line}" L ON H."DocEntry" = L."DocEntry"
    INNER JOIN "${schema}"."OSLP" S ON H."SlpCode" = S."SlpCode"
    LEFT JOIN "${schema}"."OITM" I ON L."ItemCode" = I."ItemCode"
    WHERE H."CANCELED" = 'N' AND H."DocType" = 'I'
      AND H."CardCode" <> 'CL0149'
      AND S."SlpName" NOT IN ('OTROS', 'EMPLEADOS')`;
}
