import ExcelJS from 'exceljs';

const allowed = {
  general: ['company', 'type', 'previous', 'current', 'diff', 'growth', 'participation', 'rank'],
  agentes: ['agent', 'company', 'previous', 'current', 'diff', 'growth', 'indicator'],
  clientes: ['code', 'name', 'agent', 'qtyPrevious', 'previous', 'qtyCurrent', 'current', 'diff', 'growth', 'participation'],
  productos: ['code', 'name', 'company', 'qtyPrevious', 'previous', 'qtyCurrent', 'current', 'diff', 'growth', 'participation'],
  'producto-agente': ['code', 'name', 'agent', 'company', 'qtyPrevious', 'previous', 'qtyCurrent', 'current', 'diff', 'growth', 'participation']
};
const names = { general: 'Venta General', agentes: 'Agentes', clientes: 'Clientes', productos: 'Productos', 'producto-agente': 'Producto-Agente' };
const themes = { all: '3B82F6', GRACO: '9AE68F', FAES: 'F05C67', BOLIK: 'B5BBC4' };
const colWidths = { company: 18, type: 18, code: 19, name: 53, agent: 28, indicator: 17, qtyPrevious: 19, qtyCurrent: 19, previous: 23, current: 23, diff: 23, growth: 19, participation: 20, rank: 12 };
const numeric = new Set(['previous', 'current', 'diff', 'qtyPrevious', 'qtyCurrent', 'growth', 'participation', 'rank']);
const safeText = v => {
  const s = String(v ?? '').slice(0, 30000);
  return /^[=+@\-\t\r]/.test(s) ? `'${s}` : s;
};
export async function createExcel({ empresa, fechaInicio, fechaFin, sheets }) {
  if (!themes[empresa] || !Array.isArray(sheets) || !sheets.length || sheets.length > 5) throw Error('Exportación inválida');
  const wb = new ExcelJS.Workbook(); wb.creator = 'K66 Analytics'; wb.title = 'Análisis comercial K66'; wb.created = new Date();
  const accent = themes[empresa];
  for (const sheet of sheets) {
    const keys = allowed[sheet.view];
    if (!keys || !Array.isArray(sheet.columns) || !Array.isArray(sheet.rows) || sheet.rows.length > 40000) throw Error('Datos de exportación inválidos');
    if (sheet.columns.length !== keys.length || sheet.columns.some((c, i) => c.key !== keys[i])) throw Error('Columnas de exportación no coinciden');
    const ws = wb.addWorksheet(names[sheet.view], { views: [{ state: 'frozen', ySplit: 7 }], pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 } });
    ws.properties.defaultRowHeight = 19;
    ws.mergeCells(1, 1, 2, keys.length);
    const title = ws.getCell(1, 1); title.value = `ANALISIS K66  |  ${names[sheet.view].toUpperCase()}`;
    title.font = { name: 'Aptos Display', size: 19, bold: true, color: { argb: 'FFFFFFFF' } };
    title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF12171C' } }; title.alignment = { vertical: 'middle', indent: 1 };
    ws.getRow(1).height = 26; ws.getRow(2).height = 18;
    ws.mergeCells(3, 1, 3, keys.length); const meta = ws.getCell(3, 1);
    meta.value = `EMPRESA: ${empresa === 'all' ? 'TODAS' : empresa}      PERÍODO: ${fechaInicio} al ${fechaFin}      COMPARATIVO: AÑO ANTERIOR`;
    meta.font = { name: 'Aptos', size: 11, bold: true, color: { argb: 'FF22272E' } };
    meta.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + accent } }; meta.alignment = { indent: 1, vertical: 'middle' }; ws.getRow(3).height = 27;
    ws.mergeCells(4, 1, 4, keys.length); ws.getCell(4, 1).value = 'VENTAS NETAS · FACTURAS MENOS NOTAS DE CRÉDITO · IMPORTES EN Q · PORCENTAJES EN PUNTOS %';
    ws.getCell(4, 1).font = { size: 9, italic: true, color: { argb: 'FF68707C' } }; ws.getCell(4, 1).alignment = { indent: 1 };
    ws.getRow(5).height = 9; ws.getRow(6).height = 9;
    ws.columns = keys.map((key, i) => ({ key, width: colWidths[key] || 22 }));
    const header = ws.getRow(7);
    sheet.columns.forEach((col, i) => {
      const cell = header.getCell(i + 1); cell.value = safeText(col.title);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF222B34' } };
      cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: numeric.has(col.key) ? 'right' : 'left' };
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF' + accent } } };
    }); header.height = 31;
    for (let idx = 0; idx < sheet.rows.length; idx++) {
      const source = sheet.rows[idx]; if (!source || typeof source !== 'object' || Array.isArray(source)) throw Error('Fila inválida');
      const row = ws.getRow(idx + 8);
      keys.forEach((key, i) => {
        const cell = row.getCell(i + 1); let value = source[key];
        if (numeric.has(key)) { value = value == null || value === '' ? null : Number(value); if (value !== null && !Number.isFinite(value)) value = null; }
        else value = safeText(value);
        cell.value = value;
        cell.font = { name: 'Aptos', size: 10, color: { argb: 'FF1D2933' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFF7F9FC' : 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: numeric.has(key) ? 'right' : 'left' };
        if (['previous', 'current', 'diff'].includes(key)) cell.numFmt = '"Q "#,##0.00;[Red]("Q "#,##0.00)';
        else if (['growth', 'participation'].includes(key)) cell.numFmt = '0.00"%";[Red](0.00"%")';
        else if (numeric.has(key)) cell.numFmt = '#,##0.00;[Red](#,##0.00)';
        if ((key === 'diff' || key === 'growth') && Number(value) < 0) cell.font = { ...cell.font, color: { argb: 'FFCC3344' } };
      }); row.height = 21;
    }
    const last = 7 + sheet.rows.length;
    if (sheet.rows.length) ws.autoFilter = { from: { row: 7, column: 1 }, to: { row: last, column: keys.length } };
    // Barra de total: suma solo las columnas aditivas (no porcentajes/rankings).
    const trow = ws.getRow(last + 2); trow.height = 28;
    keys.forEach((key, i) => {
      const c = trow.getCell(i + 1);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF222B34' } }; c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      if (i === 0) c.value = 'TOTAL';
      if (['previous', 'current', 'diff', 'qtyPrevious', 'qtyCurrent'].includes(key) && sheet.rows.length) {
        const letter = ws.getColumn(i + 1).letter; c.value = { formula: `SUM(${letter}8:${letter}${last})` };
        c.numFmt = ['previous', 'current', 'diff'].includes(key) ? '"Q "#,##0.00' : '#,##0.00';
      }
    });
    ws.headerFooter.oddFooter = 'K66 Analytics · Uso interno | Página &P de &N';
  }
  return wb.xlsx.writeBuffer();
}
