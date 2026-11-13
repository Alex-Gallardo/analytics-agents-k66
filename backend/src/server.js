import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { query } from './hana.js';
import { buildQuery } from './sql.js';
import { createExcel } from './excel.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '8mb' }));
const root = dirname(fileURLToPath(import.meta.url));
const frontend = resolve(root, '../../frontend');
app.use(express.static(frontend));

const views = ['general', 'agentes', 'clientes', 'productos', 'producto-agente', 'tendencia', 'agente-tendencia'];
const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0,10) === s;

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'K66 Analytics API', sapConnected: 'not checked' }));
app.get('/api/health/hana', async (_req, res) => {
  try { const rows = await query('SELECT 1 AS "ok" FROM DUMMY'); res.json({ ok: true, rows }); }
  catch (error) { console.error('HANA connection error:', error.message); res.status(503).json({ ok: false, error: 'No fue posible conectar a HANA' }); }
});

app.get('/api/ventas/:vista', async (req, res) => {
  const { vista } = req.params;
  const { fechaInicio, fechaFin, empresa = 'all' } = req.query;
  if (!views.includes(vista)) return res.status(404).json({ error: 'Vista desconocida' });
  if (!['all', 'GRACO', 'FAES', 'BOLIK'].includes(empresa)) return res.status(400).json({ error: 'Empresa inválida' });
  if (!validDate(fechaInicio) || !validDate(fechaFin) || fechaInicio > fechaFin)
    return res.status(400).json({ error: 'Fechas inválidas; formato YYYY-MM-DD y rango ascendente' });
  // Evita superposición año actual/anterior para la comparativa.
  const days = (Date.parse(fechaFin) - Date.parse(fechaInicio)) / 86400000;
  if (days > 365) return res.status(400).json({ error: 'Usá períodos comparables de hasta un año' });
  try {
    const rows = await query(buildQuery(vista, empresa), [fechaInicio, fechaFin]);
    res.set('Cache-Control', 'no-store');
    res.json({ vista, empresa, fechaInicio, fechaFin, rows });
  } catch (error) {
    console.error(`Error ${vista}/${empresa}:`, error);
    res.status(500).json({ error: 'Error consultando ventas en SAP HANA' });
  }
});

app.post('/api/export/excel', async (req,res)=>{
  try{
    const {empresa,fechaInicio,fechaFin,sheets}=req.body||{};
    if(!['all','GRACO','FAES','BOLIK'].includes(empresa)||!validDate(fechaInicio)||!validDate(fechaFin)||fechaInicio>fechaFin)
      return res.status(400).json({error:'Filtros de exportación inválidos'});
    const buffer=await createExcel({empresa,fechaInicio,fechaFin,sheets});
    res.set('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.set('Content-Disposition','attachment; filename="K66-Analytics.xlsx"');
    res.set('Cache-Control','no-store');
    res.send(Buffer.from(buffer));
  }catch(error){console.error('Error Excel:',error.message);res.status(400).json({error:'No fue posible generar el Excel: '+error.message});}
});

const port = Number(process.env.PORT || 3005);
app.listen(port, process.env.HOST || '127.0.0.1', () =>
  console.log(`K66 Analytics: http://${process.env.HOST || '127.0.0.1'}:${port}`)
);
