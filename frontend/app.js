/* K66 Analytics — front-end demo. No SAP credentials or live access. */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => 'Q ' + Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const shortMoney = n => 'Q '+(Math.abs(n)>=1e6?(n/1e6).toFixed(2)+'M':Math.abs(n)>=1000?(n/1000).toFixed(1)+'K':n.toFixed(0));
const number = n => Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2});
const pct = n => (n===null?'N/D':(n>=0?'+':'')+n.toFixed(2)+'%');
const safe = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const companies=['GRACO','FAES','BOLIK'];
// Reference data shown in the supplied screenshots. Demo-only; not a SAP extract.
const generalSeed=[
 {company:'GRACO',type:'LOCAL',previous:168911552.04,current:174252422.95},
 {company:'GRACO',type:'EXPORTACION',previous:53383367.00,current:55973137.54},
 {company:'FAES',type:'LOCAL',previous:51601415.55,current:55663619.12},
 {company:'FAES',type:'EXPORTACION',previous:39168123.84,current:41572064.54},
 {company:'BOLIK',type:'LOCAL',previous:24273216.02,current:25749900.66},
 {company:'BOLIK',type:'EXPORTACION',previous:1842833.61,current:3061594.11}
];
const agentSeed=[
 ['ABEL RIOS','BOLIK',59448.81,385773.88],['ABEL RIOS','FAES',113676.59,49540.59],['ABEL RIOS','GRACO',9774081.87,10925128.21],
 ['ALEJANDRA CALDERON','BOLIK',26788.86,38383.12],['ALEJANDRA CALDERON','FAES',20667.31,14414.42],['ALEJANDRA CALDERON','GRACO',29296729.96,33470048.10],
 ['BERNARDA AGUILAR','BOLIK',1391637.08,1914879.75],['BERNARDA AGUILAR','FAES',2184001.68,2596654.53],['BERNARDA AGUILAR','GRACO',0,0],
 ['EDUARDO CALDERON','BOLIK',5896593.89,6949972.36],['EDUARDO CALDERON','FAES',5051709.97,5571210.27],['EDUARDO CALDERON','GRACO',1380919.18,1781663.43],
 ['ELICEO HERRERA','BOLIK',2777698.56,2754676.26],['ELICEO HERRERA','FAES',536377.24,590883.18],['ELICEO HERRERA','GRACO',2958804.25,4175518.78],
 ['EXPORTACION','BOLIK',1838551.34,3061594.11],['EXPORTACION','FAES',39100296.02,41468873.43],['EXPORTACION','GRACO',53383367.00,55282321.99]
].map(([agent,company,previous,current])=>({agent,company,previous,current}));
const customerSeed=[
 ['GRACO','CL0176','INDUSTRIA DE HAMBURGUESAS, S.A.','GERENCIA',49499,16872960.28,51354,18331018.63],
 ['GRACO','CE0020','DIASA, S.A. DE C.V.','EXPORTACION',112143.48,16133019.42,119190,16201807.77],
 ['GRACO','CL0175','INDUSTRIA DE HAMBURGUESAS S.A.','RODOLFO DIAZ',73632,15473359.94,68903,15504883.29],
 ['GRACO','CL0102','DISAR, S.A.','ALEJANDRA CALDERON',22314,9003242.69,26062,10278556.27],
 ['GRACO','CL0364','SUMINISTROS COMERCIALES DE CENTRO AMERICA, S.A.','PABLO GAITAN',113034.50,11154225.01,87556.50,8844864.30],
 ['GRACO','CL0367','SURTIDOS EN PLASTICOS, S.A.','PABLO GAITAN',98729,9977561.77,89168,8281323.43],
 ['GRACO','CE0013','DISTRIBUIDORA MAYAB, S.A. DE C.V.','EXPORTACION',32687,8685720.57,31855,8247836.51],
 ['GRACO','CL0214','LA PANERIA, S.A.','RODOLFO DIAZ',41552,7190391.57,42860,7725840.20],
 ['GRACO','CE0016','DISTRIBUIDORA INTERNACIONAL, S.A.','EXPORTACION',31204,7095655.71,34578,7440378.25],
 ['GRACO','CL0074','COMERCIOS, S.A.','PABLO GAITAN',81415,7862601.73,69395,7180555.27],
 ['GRACO','CL0303','PATSY, S.A.','ALEJANDRA CALDERON',25828,5797568.88,91461,6940264.69],
 ['GRACO','CL0101','DISAR, S.A.','ALEJANDRA CALDERON',13323,4881512.46,15181,5711199.61],
 ['GRACO','CL0170','IMAGINOVA, SOCIEDAD ANONIMA','RODOLFO DIAZ',33271,4051934.84,39366,4812321.58],
 ['GRACO','CE0008','CORPORACION SYS DE TIBAS, S.A.','EXPORTACION',47007,4112886.03,28569,4571665.81],
 ['GRACO','CL0095','DESARROLLADORA INTERNACIONAL, DCI,S.A.','RODOLFO DIAZ',49917,7892747.17,41521,4089384.99],
 ['GRACO','CE0018','FILM STRETCH PANAMA, S.A.','EXPORTACION',11789,2510395.41,18646,3768780.88],
 ['GRACO','CL0172','INDUSTRIA AVICOLA ROSANDA, S.A.','ALEJANDRA CALDERON',34902,3455929.33,37549,3719896.34],
 ['GRACO','CL0359','SPECIAL FRUIT & VEGETABLE EXPORTS, S.A.','ABEL RIOS',8223,3557801.96,7654,3373711.86],
 ['BOLIK','CL0140','CLIENTE COMERCIAL BOLIK (EJEMPLO)','EDUARDO CALDERON',4200,685300,5100,798500],
 ['BOLIK','CL0141','DISTRIBUIDORA BOLIK (EJEMPLO)','ABEL RIOS',2800,247500,3300,392000],
 ['FAES','CL0220','CLIENTE COMERCIAL FAES (EJEMPLO)','ALEJANDRA CALDERON',8700,1698000,10500,2012000],
 ['FAES','CE0230','CLIENTE EXPORTACION FAES (EJEMPLO)','EXPORTACION',6900,2099000,7300,2294000]
].map(([company,code,name,agent,qtyPrevious,previous,qtyCurrent,current])=>({company,code,name,agent,qtyPrevious,previous,qtyCurrent,current}));
const productSeed=[
 ['PT00470','VASO FOAM GP 08 OZ',89136,12223947.22,77678,10906368.93],
 ['PT00029','BANDEJA GP HUEVO 30 PRO TRANSPARENTE',81091,7753845.34,98113,9552608.21],
 ['PT00536','VASO PAPEL GP FSC DOBLE PARED 12 OZ',3546,1364956.67,22714,8743267.44],
 ['PT00471','VASO FOAM GP 10 OZ',36794,6940942.16,34864,6486157.66],
 ['PT00252','DOMO SCI CLASICO GP 9X100 BASE NEGRO',38438,5275371.40,42122,5901920.81],
 ['PT00271','DOMO SCI PS GP 10X115 BASE NEGRO',22333,5094184.11,22962,5148123.98],
 ['PT00057','BANDEJA FOAM GP F2P',101936,5171885.41,95329,4740008.34],
 ['PT00250','DOMO SCI CLASICO GP 8X85 BASE NEGRO',48163,4777371.88,46072,4609480.27],
 ['PT00889','TAPA VASO GP HIPS 90 MM NEGRO - MC DONALDS',0,0,14360,4277613.28],
 ['PT00541','VASO PAPEL GP FSC DOBLE PARED 16 OZ',2376,1024862.18,8604,3711243.26],
 ['PT00272','DOMO SCI PS GP 10X115 BASE NEGRO - PATSY',12446,2733674.94,16090,3562761.68],
 ['PT00094','ABISAGRADO GP 118 TRANSPARENTE',17170,3320626.16,17503,3399820.25],
 ['PT00855','DOMO SCI CLASICO GP 8X85 BASE NEGRO - SULI',0,0,32216,3215031.91],
 ['PT00243','DOMO SCI CLASICO GP 1/4 RECTANGULAR BASE NEGRO',15146,4969995.06,9526,3173088.23],
 ['PT00135','ABISAGRADO GP 306 TRANSPARENTE',14231,2343216.49,19213,3115919.18],
 ['PT00178','TAPA GP COPA OCTAGONAL - SARITA',7280,2475000,8957,3066921.66],
 ['PT00901','BANDEJA GP DESAYUNO PP NEGRO - MC DONALDS',0,0,8455,2887910.94],
 ['PT00887','TAPA GP DESAYUNO RPET - MC DONALDS',0,0,8119,2823617.09],
 ['PT00244','DOMO SCI CLASICO GP 12X125 BASE NEGRO',7935,2063796.09,9909,2594205.77],
 ['PT00177','TAPA GP COPA 05 OZ - SARITA',4586,1472191.49,7712,2509315.32]
].map(([code,name,qtyPrevious,previous,qtyCurrent,current])=>({company:'GRACO',code,name,qtyPrevious,previous,qtyCurrent,current}));
productSeed.push(
 {company:'BOLIK',code:'PT10001',name:'BANDEJA BOLIK (EJEMPLO)',qtyPrevious:5900,previous:580000,qtyCurrent:7500,current:790000},
 {company:'BOLIK',code:'PT10002',name:'ENVASE BOLIK (EJEMPLO)',qtyPrevious:5200,previous:460000,qtyCurrent:4900,current:420000},
 {company:'FAES',code:'PT20001',name:'PRODUCTO FAES (EJEMPLO)',qtyPrevious:8200,previous:2300000,qtyCurrent:9600,current:2800000},
 {company:'FAES',code:'PT20002',name:'EMPAQUE FAES (EJEMPLO)',qtyPrevious:9800,previous:1900000,qtyCurrent:10400,current:2200000}
);
const productAgentSeed=[
 ['PT00005','(DESCONTINUADO) BANDEJA GP 5X7 NEGRO ALTO','ABEL RIOS',549,136658.22,167,48148.53],
 ['PT00006','(DESCONTINUADO) BANDEJA GP 5X7 NEGRO BAJO','ABEL RIOS',20,4089.29,0,0],
 ['PT00007','BANDEJA GP 5X7 TRANSPARENTE ALTO','ABEL RIOS',10,4650,0,0],
 ['PT00008','BANDEJA GP 5X7 TRANSPARENTE BAJO','ABEL RIOS',6,2476.61,0,0],
 ['PT00010','BANDEJA GP 6.5X5 VERDE','ABEL RIOS',304,52928.58,232,40886.08],
 ['PT00015','BANDEJA GP SUSHI TRANSPARENTE - SUSHIITTO','ABEL RIOS',716,151510.70,661,141272.99],
 ['PT00016','BANDEJA CON TAPA GP 06 4 DIVISIONES VERDULERO','ABEL RIOS',229,77900.91,288,99531.74],
 ['PT00017','BANDEJA CON TAPA GP 06 4 DIVISIONES VERDULERO TRANS','ABEL RIOS',40,13607.15,55,18709.81],
 ['PT00019','BANDEJA CON TAPA GP 08 4 DIVISIONES VERDULERO','ABEL RIOS',0,0,30,9937.50],
 ['PT00029','BANDEJA GP HUEVO 30 PRO TRANSPARENTE','ABEL RIOS',0,0,3073,364086.82],
 ['PT00033','BANDEJA GP HUEVO 06 TRANSPARENTE','ABEL RIOS',0,0,5,1346.50],
 ['PT00034','BANDEJA GP HUEVO 12 TRANSPARENTE','ABEL RIOS',0,0,160,65212.54],
 ['PT00035','BANDEJA GP HUEVO 15 TRANSPARENTE','ABEL RIOS',0,0,294,140756.15],
 ['PT00044','BANDEJA FOAM BIO GP F7','ABEL RIOS',300,36715.18,0,0],
 ['PT00045','BANDEJA FOAM BIO GP F7 3 DIVISIONES','ABEL RIOS',800,97907.14,0,0],
 ['PT00064','BASE FOAM GP NO. 09 PASTELERO','ABEL RIOS',0,0,4,564],
 ['PT00065','BASE FOAM GP NO. 10 PASTELERO','ABEL RIOS',0,0,15,2717.28],
 ['PT00068','BOTE GP 32 OZ TRANSPARENTE','ABEL RIOS',162,86062.52,250,134114.37],
 ['PT00069','TAPA GP BOTE 08/16/32 OZ','ABEL RIOS',162,29651.78,250,46207.67],
 ['PT00071','CLAM SHELL GP 125 PERFORADO TRANSPARENTE','ABEL RIOS',566,185656.06,301,105449.23],
 ['PT00470','VASO FOAM GP 08 OZ','ALEJANDRA CALDERON',4900,671940.27,5800,763428.11]
].map(([code,name,agent,qtyPrevious,previous,qtyCurrent,current])=>({company:'GRACO',code,name,agent,qtyPrevious,previous,qtyCurrent,current}));
productAgentSeed.push({company:'BOLIK',code:'PT10001',name:'BANDEJA BOLIK (EJEMPLO)',agent:'EDUARDO CALDERON',qtyPrevious:1300,previous:165000,qtyCurrent:1600,current:198000},{company:'FAES',code:'PT20001',name:'PRODUCTO FAES (EJEMPLO)',agent:'ALEJANDRA CALDERON',qtyPrevious:1900,previous:450000,qtyCurrent:2200,current:540000});
const state={profileAgent:'',profileSort:'current',profileDesc:true,view:'dashboard',company:'all',from:'2026-01-01',to:'2026-10-31',search:'',sort:null,sortDesc:true,page:1,pageSize:15,agent:'',client:'',code:'',product:''};
const months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const weights=[.087,.078,.096,.089,.097,.089,.104,.101,.101,.158]; const sumWeights=weights.reduce((a,b)=>a+b,0);
function monthFrac(year,month,start,end){const a=new Date(Date.UTC(year,month,1)),b=new Date(Date.UTC(year,month+1,1));const s=new Date(start+'T00:00:00Z'),e=new Date(end+'T00:00:00Z');e.setUTCDate(e.getUTCDate()+1);return Math.max(0,Math.min(b,e)-Math.max(a,s))/(b-a)}
function shiftedYearDate(date,years){const [y,m,d]=date.split('-').map(Number);const last=new Date(Date.UTC(y+years,m,0)).getUTCDate();return `${y+years}-${String(m).padStart(2,'0')}-${String(Math.min(d,last)).padStart(2,'0')}`}
function periodFactor(from,to){let sum=0;for(let y=2025;y<=2027;y++)for(let m=0;m<12;m++){let weight=m<10?weights[m]/sumWeights:.10;sum+=weight*monthFrac(y,m,from,to)}return sum}
function scaled(row){const a=periodFactor(state.from,state.to),b=periodFactor(shiftedYearDate(state.from,-1),shiftedYearDate(state.to,-1));return {...row,current:row.current*a,previous:row.previous*b,qtyCurrent:(row.qtyCurrent||0)*a,qtyPrevious:(row.qtyPrevious||0)*b}}
const liveData={general:[],agentes:[],clientes:[],productos:[],"producto-agente":[],tendencia:[],"agente-tendencia":[]};
let liveLoaded=false, requestSerial=0;
function filtered(seed){
 const v=seed===agentSeed?'agentes':seed===customerSeed?'clientes':seed===productSeed?'productos':'producto-agente';
 return liveData[v].filter(r=>state.company==='all'||r.company===state.company);
}
async function loadSales(){
 const serial=++requestSerial;
 const query=new URLSearchParams({fechaInicio:state.from,fechaFin:state.to,empresa:state.company});
 $('#applyBtn').disabled=true;
 $('#periodLabel').textContent='Consultando SAP HANA…';
 try{
  const names=['general','agentes','clientes','productos','producto-agente','tendencia','agente-tendencia'];
  const responses=await Promise.all(names.map(async name=>{
   const response=await fetch(`/api/ventas/${name}?${query}`,{cache:'no-store'});
   if(!response.ok){const error=await response.json().catch(()=>({}));throw new Error(`${name}: ${error.error||response.status}`)}
   const payload=await response.json();
   if(!Array.isArray(payload.rows))throw new Error(`Respuesta inesperada de ${name}`);
   return payload.rows;
  }));
  if(serial!==requestSerial)return;
  names.forEach((n,i)=>liveData[n]=responses[i].map(r=>({
   ...r, previous:Number(r.previous||0),current:Number(r.current||0),
   qtyPrevious:Number(r.qtyPrevious||0),qtyCurrent:Number(r.qtyCurrent||0),
   month:r.month==null?null:Number(r.month)
  })));
  liveLoaded=true;
  render();
  toast('Datos reales actualizados desde SAP HANA.');
 }catch(error){
  if(serial!==requestSerial)return;
  liveLoaded=false;
  Object.keys(liveData).forEach(k=>liveData[k]=[]);
  render();
  toast('No se pudieron cargar los datos: '+error.message);
 }finally{if(serial===requestSerial)$('#applyBtn').disabled=false}
}
function total(rows,key){return rows.reduce((s,r)=>s+Number(r[key]||0),0)}
function change(row){return row.current-row.previous}
function growth(row){return row.previous===0?null:100*(row.current-row.previous)/row.previous}
function getGeneral(){return liveData.general.filter(r=>state.company==='all'||r.company===state.company)}
function companyName(v){return v==='FAES'?'FAES / ESCOCESA':v}
function renderKpis(){const d=getGeneral();const a=total(d,'current'),b=total(d,'previous'),g=b?100*(a-b)/b:null;const clients=number(new Set(filtered(customerSeed).map(r=>r.company+'|'+r.code)).size);const products=number(new Set(filtered(productSeed).map(r=>r.company+'|'+r.code)).size);const cards=[['▤','Venta total año actual',money(a),pct(g)+' vs. año anterior'],['▥','Venta total año anterior',money(b),'Período comparable'],['↗','Crecimiento',money(a-b),pct(g)+' de variación'],['♧','Clientes con movimientos',clients,'Período seleccionado'],['◇','Productos vendidos',products,'Período seleccionado']];$('#kpis').innerHTML=cards.map((c,i)=>`<article class="kpi"><div class="kpi-head"><span class="kpi-icon">${c[0]}</span>${c[1]}</div><div class="kpi-value">${c[2]}</div><div class="kpi-foot ${i===2?(a-b>=0?'positive':'negative'):''}">${safe(c[3])}</div></article>`).join('')}
function trendData(){
 const rows=liveData.tendencia.filter(r=>state.company==='all'||r.company===state.company);
 return months.map((month,i)=>({month,
  current:rows.filter(r=>r.month===i+1).reduce((a,r)=>a+r.current,0),
  previous:rows.filter(r=>r.month===i+1).reduce((a,r)=>a+r.previous,0)
 }));
}
function renderTrend(){const data=trendData(),W=800,H=270,pad={l:65,r:18,t:20,b:32},wid=W-pad.l-pad.r,hei=H-pad.t-pad.b;const max=Math.max(1,...data.flatMap(r=>[r.current,r.previous]))*1.15;const x=i=>pad.l+i*wid/11,y=v=>pad.t+hei-v/max*hei;const line=k=>data.map((d,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(d[k]).toFixed(1)).join(' ');const lines=[0,.25,.5,.75,1].map(v=>`<line class="gridline" x1="${pad.l}" x2="${W-pad.r}" y1="${y(max*v)}" y2="${y(max*v)}"/><text class="axis-label" text-anchor="end" x="${pad.l-11}" y="${y(max*v)+3}">${shortMoney(max*v)}</text>`).join('');const labels=months.map((m,i)=>`<text class="axis-label" text-anchor="middle" x="${x(i)}" y="${H-4}">${m}</text>`).join('');$('#trendChart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Gráfico de tendencia mensual de ventas"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".26"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>${lines}${labels}<path d="${line('current')} L${x(11)},${y(0)} L${x(0)},${y(0)} Z" fill="url(#chartFill)"/><path d="${line('previous')}" fill="none" stroke="#aeb9c6" stroke-width="2.5" stroke-dasharray="7 8"/><path d="${line('current')}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(11)}" cy="${y(data[11].current)}" r="5" fill="var(--accent)"/></svg>`}
function renderCompanyBars(){const rows=companies.filter(c=>state.company==='all'||state.company===c).map(c=>{let ds=getGeneral().filter(r=>r.company===c);return {name:companyName(c),current:total(ds,'current'),previous:total(ds,'previous')}});let max=Math.max(1,...rows.map(r=>r.current));$('#companyBars').innerHTML=rows.map(r=>`<div class="company-row"><div class="company-info"><strong>${safe(r.name)}</strong><span class="money">${shortMoney(r.current)}</span></div><div class="bar-wrap"><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,r.current/max*100)}%"></div></div><span class="pct-tag ${r.current<r.previous?'negative':''}">${pct(growth(r))}</span></div></div>`).join('')}
function renderDonut(selector,items){let sum=items.reduce((s,x)=>s+Math.max(0,x.value),0);const colors=['var(--accent)','rgba(var(--accent-rgb),.70)','rgba(var(--accent-rgb),.40)','#68707b'];let offset=0;const stops=items.map((x,i)=>{let start=offset;offset+=sum?Math.max(0,x.value)/sum*100:0;return `${colors[i%colors.length]} ${start}% ${offset}%`}).join(',');$(selector).innerHTML=`<div class="donut-content"><div class="donut" style="background:conic-gradient(${stops||'#666 0% 100%'})"><div class="donut-hole"><strong>${shortMoney(sum)}</strong><span>Ventas netas</span></div></div><div class="donut-legend">${items.map((x,i)=>`<div class="donut-row"><span class="legend-name"><i style="background:${colors[i%colors.length]}"></i>${safe(x.name)}</span><b>${sum?(100*x.value/sum).toFixed(1):'0.0'}%</b></div>`).join('')}</div></div>`}
function renderDonuts(){const d=getGeneral();renderDonut('#companyDonut',companies.filter(c=>state.company==='all'||state.company===c).map(c=>({name:companyName(c),value:total(d.filter(r=>r.company===c),'current')})));renderDonut('#typeDonut',['LOCAL','EXPORTACION'].map(t=>({name:t==='LOCAL'?'Local':'Exportación',value:total(d.filter(r=>r.type===t),'current')})))}
function renderAgents(){const m=new Map();for(const a of filtered(agentSeed))m.set(a.agent,(m.get(a.agent)||0)+a.current);const items=[...m].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,5),max=Math.max(1,...items.map(r=>r.value));$('#topAgents').innerHTML=items.map((r,i)=>`<div class="agent-entry"><span class="agent-name" title="${safe(r.name)}">${i+1}. ${safe(r.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,r.value/max*100)}%"></div></div><span class="agent-amount">${shortMoney(r.value)}</span></div>`).join('')||'<p class="subtle">Sin datos</p>'}
function renderProducts(){let list=filtered(productSeed).sort((a,b)=>b.current-a.current).slice(0,5);$('#topProducts').innerHTML=list.map((r,i)=>`<div class="rank-item"><span class="rank-num">${i+1}</span><span class="rank-name" title="${safe(r.name)}">${safe(r.name)}</span><span class="rank-money">${shortMoney(r.current)}</span></div>`).join('')}
function renderOverview(){let d=getGeneral().slice().sort((a,b)=>b.current-a.current),sum=total(d,'current');$('#overviewTable').innerHTML='<thead><tr>'+['Empresa','Tipo','Año anterior','Año actual','Diferencia','Participación'].map((h,i)=>`<th class="${i>1?'number':''}">${h}</th>`).join('')+'</tr></thead><tbody>'+d.map(r=>`<tr><td>${safe(companyName(r.company))}</td><td>${safe(r.type)}</td><td class="number">${money(r.previous)}</td><td class="number">${money(r.current)}</td><td class="number">${money(change(r))}</td><td class="number">${sum?(r.current/sum*100).toFixed(2):'0.00'}%</td></tr>`).join('')+`<tr class="total-row"><td colspan="2">TOTAL</td><td class="number">${money(total(d,'previous'))}</td><td class="number">${money(sum)}</td><td class="number">${money(sum-total(d,'previous'))}</td><td class="number">100.00%</td></tr></tbody>`}
const columns={
 general:[['company','Empresa'],['type','Tipo'],['previous','Venta año anterior','money'],['current','Venta año actual','money'],['diff','Diferencia','money'],['growth','% Diferencia','pct'],['participation','% Participación','pct'],['rank','Ranking','integer']],
 agentes:[['agent','Agente'],['company','Empresa'],['previous','Venta año anterior','money'],['current','Venta año actual','money'],['diff','Diferencia','money'],['growth','% Crecimiento','pct'],['indicator','Indicador']],
 clientes:[['code','Cliente código'],['name','Cliente nombre'],['agent','Agente'],['qtyPrevious','Cantidad anterior','number'],['previous','Venta año anterior','money'],['qtyCurrent','Cantidad actual','number'],['current','Venta año actual','money'],['diff','Diferencia','money'],['growth','% Diferencia','pct'],['participation','% Participación','pct']],
 productos:[['code','Código'],['name','Nombre'],['company','Empresa'],['qtyPrevious','Cantidad anterior','number'],['previous','Venta año anterior','money'],['qtyCurrent','Cantidad actual','number'],['current','Venta año actual','money'],['diff','Diferencia','money'],['growth','% Diferencia','pct'],['participation','% Participación','pct']],
 'producto-agente':[['code','Código'],['name','Nombre'],['agent','Agente'],['company','Empresa'],['qtyPrevious','Cantidad anterior','number'],['previous','Venta año anterior','money'],['qtyCurrent','Cantidad actual','number'],['current','Venta año actual','money'],['diff','Diferencia','money'],['growth','% Diferencia','pct'],['participation','% Participación','pct']]
};
const info={dashboard:['Resumen comercial','Análisis de ventas por empresa, agentes, clientes y productos'],general:['Venta general','Comparativo por empresa y tipo de venta'],agentes:['Análisis por agente–empresa','Venta neta y crecimiento por agente en las tres empresas'],clientes:['Análisis por cliente','Cantidades y ventas por cliente y agente'],productos:['Análisis por producto','Rendimiento y participación de los productos vendidos'],'producto-agente':['Análisis producto–agente','Ventas por producto y vendedor asignado'],'perfil-agente':['Dashboard de agentes','Indicadores, evolución de ventas, mejores clientes y productos por agente']};
function detailData(){const v=state.view;let rows=v==='general'?getGeneral():v==='agentes'?filtered(agentSeed):v==='clientes'?filtered(customerSeed):v==='productos'?filtered(productSeed):filtered(productAgentSeed);const denom=total(rows,'current');return rows.map(r=>({...r,diff:change(r),growth:growth(r),participation:denom?100*r.current/denom:null,indicator:r.current>r.previous?'SUBE':r.current<r.previous?'BAJA':'IGUAL'})).sort((a,b)=>b.current-a.current).map((r,i)=>({...r,rank:i+1,company:companyName(r.company)}))}
function format(v,kind){if(v==null)return '—';if(kind==='money')return money(v);if(kind==='number')return number(v);if(kind==='pct')return pct(v);return safe(v)}
function optionSet(key){
  return [...new Set(detailData().map(r=>r[key]).filter(Boolean).map(String))].sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));
}
function populateAdvancedFilters(){
  const cols=columns[state.view]||[];
  const has=k=>cols.some(c=>c[0]===k);
  const agent=$('#filterAgent'),old=state.agent;
  const agents=optionSet('agent');
  agent.innerHTML='<option value="">Todos los agentes</option>'+agents.map(a=>`<option value="${safe(a)}">${safe(a)}</option>`).join('');
  if(!agents.includes(old))state.agent='';agent.value=state.agent;
  const avail={filterAgent:has('agent'),filterClient:has('name')&&state.view==='clientes'||state.view==='clientes',filterCode:has('code'),filterProduct:has('name')&&state.view!=='clientes'};
  for(const [id,enabled] of Object.entries(avail)){
    $('#'+id).disabled=!enabled;
    if(!enabled&&id==='filterClient'){$('#filterClient').value='';state.client=''}
    if(!enabled&&id==='filterCode'){$('#filterCode').value='';state.code=''}
    if(!enabled&&id==='filterProduct'){$('#filterProduct').value='';state.product=''}
  }
  const sort=$('#sortField');
  sort.innerHTML=cols.map(([key,title])=>`<option value="${key}">${safe(title)}</option>`).join('');
  if(!state.sort||!cols.some(c=>c[0]===state.sort))state.sort='current';
  sort.value=state.sort;$('#sortDirection').value=state.sortDesc?'desc':'asc';
  $('#filtersHint').textContent='Los filtros se combinan y se aplican a todos los registros de esta vista. La exportación incluye todos los resultados filtrados, no solo la página visible.';
}
function visibleRows(){let rows=detailData();
  const contains=(value,term)=>String(value??'').toLocaleLowerCase('es').includes(term.trim().toLocaleLowerCase('es'));
  if(state.agent)rows=rows.filter(r=>r.agent===state.agent);
  if(state.client)rows=rows.filter(r=>contains(r.name,state.client)||contains(r.code,state.client));
  if(state.code)rows=rows.filter(r=>contains(r.code,state.code));
  if(state.product)rows=rows.filter(r=>contains(r.name,state.product));if(state.search){const q=state.search.toLowerCase();rows=rows.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q)))}if(state.sort){const key=state.sort,dir=state.sortDesc?-1:1;rows.sort((a,b)=>{let av=a[key]??'',bv=b[key]??'';return dir*(typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'es'))})}return rows}
function renderDetail(){const v=state.view,cols=columns[v],rows=visibleRows(),pages=Math.max(1,Math.ceil(rows.length/state.pageSize));state.page=Math.min(state.page,pages);const subset=rows.slice((state.page-1)*state.pageSize,state.page*state.pageSize);$('#detailTitle').textContent=info[v][0];$('#detailDesc').textContent=info[v][1];$('#rowCount').textContent=rows.length+' registros';$('#detailTable').innerHTML='<thead><tr>'+cols.map(([k,name,kind])=>`<th class="${['money','number','pct','integer'].includes(kind)?'number':''}" data-sort="${k}" title="Ordenar por ${safe(name)}">${safe(name)} ${state.sort===k?(state.sortDesc?'↓':'↑'):'↕'}</th>`).join('')+'</tr></thead><tbody>'+(subset.length?subset.map(r=>'<tr>'+cols.map(([key,name,kind])=>`<td class="${['money','number','pct','integer'].includes(kind)?'number':''} ${key==='diff'?(r.diff>=0?'positive':'negative'):''} ${key==='indicator'?(r.indicator==='SUBE'?'positive':r.indicator==='BAJA'?'negative':''):''}">${format(r[key],kind)}</td>`).join('')+'</tr>').join(''):`<tr><td colspan="${cols.length}">No hay resultados para estos filtros.</td></tr>` )+'</tbody>';$('#tableInfo').textContent=`Mostrando ${rows.length?((state.page-1)*state.pageSize+1):0}–${Math.min(state.page*state.pageSize,rows.length)} de ${rows.length}`;$('#pageIndicator').textContent=`Página ${state.page} de ${pages}`;$('#prevPage').disabled=state.page===1;$('#nextPage').disabled=state.page===pages;$$('#detailTable th[data-sort]').forEach(el=>el.onclick=()=>{let key=el.dataset.sort;state.sortDesc=state.sort===key?!state.sortDesc:true;state.sort=key;state.page=1;$('#sortField').value=key;$('#sortDirection').value=state.sortDesc?'desc':'asc';renderDetail()})}
function profileItems(kind){
  return liveData[kind].filter(r=>r.agent===state.profileAgent&&(state.company==='all'||r.company===state.company));
}
function profileTableRows(){
 const grouped=new Map();
 for(const r of profileItems('producto-agente')){
   const key=r.company+'|'+r.code;
   if(!grouped.has(key))grouped.set(key,{company:r.company,code:r.code,name:r.name,current:0,previous:0,qtyCurrent:0,qtyPrevious:0});
   const v=grouped.get(key);for(const col of ['current','previous','qtyCurrent','qtyPrevious'])v[col]+=Number(r[col]||0);
 }
 const result=[...grouped.values()]; const key=state.profileSort,dir=state.profileDesc?-1:1;
 result.sort((x,y)=>dir*(typeof x[key]==='number'&&typeof y[key]==='number'?x[key]-y[key]:String(x[key]??'').localeCompare(String(y[key]??''),'es')));
 return result;
}
function renderProfileTrend(){
 const rows=liveData['agente-tendencia'].filter(r=>r.agent===state.profileAgent&&(state.company==='all'||r.company===state.company));
 const data=months.map((m,i)=>({current:total(rows.filter(r=>r.month===i+1),'current'),previous:total(rows.filter(r=>r.month===i+1),'previous')}));
 const W=780,H=260,pad={l:76,r:20,t:20,b:30},wid=W-pad.l-pad.r,hei=H-pad.t-pad.b,max=Math.max(1,...data.flatMap(r=>[r.current,r.previous]))*1.15;
 const x=i=>pad.l+i*wid/11,y=n=>pad.t+hei-n/max*hei;
 const path=k=>data.map((d,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(d[k]).toFixed(1)).join(' ');
 const grid=[0,.25,.5,.75,1].map(v=>`<line class="gridline" x1="${pad.l}" y1="${y(max*v)}" x2="${W-pad.r}" y2="${y(max*v)}"/><text class="axis-label" text-anchor="end" x="${pad.l-8}" y="${y(max*v)+4}">${shortMoney(max*v)}</text>`).join('');
 const labels=months.map((m,i)=>`<text class="axis-label" text-anchor="middle" x="${x(i)}" y="${H-3}">${m}</text>`).join('');
 $('#profileTrend').innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Ventas mensuales del agente">${grid}${labels}<path d="${path('previous')}" fill="none" stroke="#9aa1a9" stroke-width="2.5" stroke-dasharray="7 7"/><path d="${path('current')}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function renderProfileRank(selector,items,kind){
 const max=Math.max(1,...items.map(r=>r.current));
 $(selector).innerHTML=items.length?items.map((r,i)=>`<div class="profile-rank"><span class="rank-num">${i+1}</span><div class="profile-rank-info"><strong title="${safe(r.name)}">${safe(r.name)}</strong><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,r.current/max*100)}%"></div></div><small>${kind==='product'?safe(r.code)+' · '+number(r.qtyCurrent)+' unidades':'Cliente '+safe(r.code)}</small></div><b>${shortMoney(r.current)}</b></div>`).join(''):'<p class="subtle">Sin movimientos en este período.</p>';
}
function renderAgentProfile(){
 const agents=[...new Set(filtered(agentSeed).map(r=>r.agent).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
 const select=$('#profileAgent');
 select.innerHTML='<option value="">Seleccionar agente</option>'+agents.map(x=>`<option value="${safe(x)}">${safe(x)}</option>`).join('');
 if(!agents.includes(state.profileAgent))state.profileAgent=agents[0]||'';
 select.value=state.profileAgent;
 $('#profileEmpty').hidden=Boolean(state.profileAgent);$('#profileContent').hidden=!state.profileAgent;
 $('#profileExport').disabled=!state.profileAgent||!liveLoaded;
 if(!state.profileAgent)return;
 const sales=profileItems('agentes');const current=total(sales,'current'),previous=total(sales,'previous');
 const clients=profileItems('clientes'),productRows=profileItems('producto-agente');
 const uniqueClients=new Set(clients.filter(r=>r.current!==0).map(r=>r.company+'|'+r.code));
 const uniqueProducts=new Set(productRows.filter(r=>r.current!==0).map(r=>r.company+'|'+r.code));
 $('#profileName').textContent=state.profileAgent;
 $('#profilePeriod').textContent=`${state.from} al ${state.to} · ${state.company==='all'?'Todas las empresas':state.company}`;
 const metrics=[['▤','Venta actual',money(current),'Período seleccionado'],['▥','Venta anterior',money(previous),'Período comparable'],['↗','Crecimiento',pct(growth({current,previous})),money(current-previous)+' de diferencia'],['♧','Clientes con compras',number(uniqueClients.size),'Clientes distintos por empresa'],['◇','Productos vendidos',number(uniqueProducts.size),'Artículos distintos por empresa']];
 $('#profileKpis').innerHTML=metrics.map(([ico,label,value,sub])=>`<article class="kpi"><div class="kpi-head"><span class="kpi-icon">${ico}</span>${label}</div><div class="kpi-value">${value}</div><div class="kpi-foot">${sub}</div></article>`).join('');
 renderProfileTrend();
 const companySales=companies.filter(c=>state.company==='all'||c===state.company).map(c=>({name:companyName(c),current:total(sales.filter(r=>r.company===c),'current'),previous:total(sales.filter(r=>r.company===c),'previous')}));
 const max=Math.max(1,...companySales.map(r=>r.current));
 $('#profileCompanies').innerHTML=companySales.map(r=>`<div class="company-row"><div class="company-info"><strong>${safe(r.name)}</strong><span class="money">${money(r.current)}</span></div><div class="bar-wrap"><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,r.current/max*100)}%"></div></div><span class="pct-tag ${r.current<r.previous?'negative':''}">${pct(growth(r))}</span></div></div>`).join('');
 const topClients=[...clients].sort((a,b)=>b.current-a.current).filter(r=>r.current>0).slice(0,10);
 const topProducts=profileTableRows().slice().sort((a,b)=>b.current-a.current).filter(r=>r.current>0).slice(0,10);
 renderProfileRank('#profileCustomers',topClients.map(r=>({...r,name:r.name+' · '+r.company})),'client');
 renderProfileRank('#profileProducts',topProducts,'product');
 const rows=profileTableRows();$('#profileRowCount').textContent=rows.length+' artículos';
 const fields=[['code','Código'],['name','Producto'],['company','Empresa'],['qtyCurrent','Unidades'],['previous','Año anterior'],['current','Año actual']];
 $('#profileProductsTable').innerHTML='<thead><tr>'+fields.map(([k,label])=>`<th data-profile-sort="${k}" title="Ordenar por ${label}">${label} ${state.profileSort===k?(state.profileDesc?'↓':'↑'):'↕'}</th>`).join('')+'</tr></thead><tbody>'+rows.map(r=>`<tr><td>${safe(r.code)}</td><td>${safe(r.name)}</td><td>${safe(r.company)}</td><td class="number">${number(r.qtyCurrent)}</td><td class="number">${money(r.previous)}</td><td class="number">${money(r.current)}</td></tr>`).join('')+'</tbody>';
 $$('#profileProductsTable th[data-profile-sort]').forEach(th=>th.onclick=()=>{const key=th.dataset.profileSort;state.profileDesc=state.profileSort===key?!state.profileDesc:true;state.profileSort=key;renderAgentProfile()});
}
function render(){document.body.dataset.theme=state.company;$$('.company-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.company===state.company));$$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));$('#pageTitle').textContent=info[state.view][0];$('#pageSubtitle').textContent=info[state.view][1];$('#dashboardView').classList.toggle('active',state.view==='dashboard');$('#agentProfileView').classList.toggle('active',state.view==='perfil-agente');$('#detailView').classList.toggle('active',state.view!=='dashboard'&&state.view!=='perfil-agente');$('#periodLabel').textContent=`Comparando con ${Number(state.from.slice(0,4))-1}`;if(state.view==='dashboard'){renderKpis();renderTrend();renderCompanyBars();renderDonuts();renderAgents();renderProducts();renderOverview()}else if(state.view==='perfil-agente'){renderAgentProfile()}else{populateAdvancedFilters();renderDetail()}}
function toast(message){const e=$('#message');e.textContent=message;e.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.hidden=true,5000)}
async function exportExcel(){
 if(!liveLoaded)return toast('Primero debés cargar los datos desde SAP HANA.');
 const views=state.view==='dashboard'?['general','agentes','clientes','productos','producto-agente']:state.view==='perfil-agente'?['agentes','clientes','producto-agente']:[state.view];
 const sheets=views.map(v=>{
   const old=state.view;
   state.view=v;
   const saved={search:state.search,agent:state.agent,client:state.client,code:state.code,product:state.product};
   if(old==='dashboard'||old==='perfil-agente'){state.search='';state.agent='';state.client='';state.code='';state.product=''}
   let rows=visibleRows();
   if(old==='perfil-agente') rows=rows.filter(r=>r.agent===state.profileAgent);
   state.view=old;Object.assign(state,saved);
   // En dashboard: exportar todas las vistas sin filtros de detalle.
   return {view:v,columns:columns[v].map(([key,title,kind])=>({key,title,kind:kind||'text'})),rows:rows.map(row=>Object.fromEntries(columns[v].map(([key])=>[key,row[key]??null])))};
 });
 const btn=$('#exportBtn');btn.disabled=true;btn.textContent='Generando Excel…';
 try{
   const response=await fetch('/api/export/excel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({empresa:state.company,fechaInicio:state.from,fechaFin:state.to,sheets})});
   if(!response.ok){const r=await response.json().catch(()=>({}));throw new Error(r.error||'No se pudo exportar')}
   const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download=`K66_${state.view}_${state.company}_${state.from}_${state.to}.xlsx`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   toast('Excel generado con formato profesional y todos los registros filtrados.');
 }catch(error){toast('Error exportando Excel: '+error.message)}
 finally{btn.disabled=false;btn.innerHTML='<span>⇩</span> Exportar Excel'}
}
function resetDetailFilters(){state.search='';state.agent='';state.client='';state.code='';state.product='';state.sort='current';state.sortDesc=true;state.page=1;for(const id of ['searchInput','filterClient','filterCode','filterProduct'])$('#'+id).value='';}
$$('.nav-link').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;resetDetailFilters();$('#sidebar').classList.remove('open');render()}));$$('.company-tabs button').forEach(b=>b.onclick=()=>{state.company=b.dataset.company;state.page=1;loadSales()});$$('[data-goto]').forEach(b=>b.onclick=()=>{$(`.nav-link[data-view="${b.dataset.goto}"]`).click()});$('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');$('#applyBtn').onclick=()=>{const from=$('#startDate').value,to=$('#endDate').value;if(!from||!to||from>to)return toast('Revisá el rango: la fecha inicial debe ser anterior o igual a la final.');state.from=from;state.to=to;state.page=1;loadSales()};$('#searchInput').oninput=e=>{state.search=e.target.value;state.page=1;renderDetail()};$('#prevPage').onclick=()=>{state.page--;renderDetail()};$('#nextPage').onclick=()=>{state.page++;renderDetail()};$('#exportBtn').onclick=exportExcel;$('#profileExport').onclick=exportExcel;$('#profileAgent').onchange=e=>{state.profileAgent=e.target.value;renderAgentProfile()};
for(const [id,key] of [['filterClient','client'],['filterCode','code'],['filterProduct','product']]){
 $('#'+id).addEventListener('input',e=>{state[key]=e.target.value;state.page=1;renderDetail()});
}
$('#filterAgent').addEventListener('change',e=>{state.agent=e.target.value;state.page=1;renderDetail()});
$('#sortField').addEventListener('change',e=>{state.sort=e.target.value;state.page=1;renderDetail()});
$('#sortDirection').addEventListener('change',e=>{state.sortDesc=e.target.value==='desc';state.page=1;renderDetail()});
$('#clearFilters').onclick=()=>{resetDetailFilters();populateAdvancedFilters();renderDetail()};
render();
loadSales();
