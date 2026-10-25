export const emptyState = () => ({people:[],deliveries:[]});
export const uid = () => crypto.randomUUID();
export const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const personKey = p => norm(p.name)+'|'+p.phone.replace(/[^\d+]/g,'');
const fail = s => {throw new Error(s);};
const string = (s,max=2000) => typeof s==='string' && s.length<=max;
function photos(xs){return Array.isArray(xs)&&xs.length<=100&&xs.every(x=>string(x,16000000)&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(x));}
export function validateState(s){
 if(!s||!Array.isArray(s.people)||!Array.isArray(s.deliveries))fail('La copia no contiene datos válidos.');
 const ids=new Set();
 for(const p of s.people){if(!p||!string(p.id,100)||!p.id||ids.has(p.id)||!string(p.name,200)||!p.name.trim()||!string(p.phone,100)||!string(p.notes))fail('Hay un destinatario no válido.');ids.add(p.id);}
 const deliveries=new Set();
 for(const d of s.deliveries){
  if(!d||!string(d.id,100)||!d.id||deliveries.has(d.id)||!ids.has(d.personId)||!Number.isInteger(d.year)||d.year<1900||d.year>2200||!['pending','delivered'].includes(d.status)||!string(d.notes)||!photos(d.photos)||!Array.isArray(d.tickets)||!d.tickets.length)fail('Hay una entrega no válida o sin destinatario.');
  deliveries.add(d.id);const ticketIds=new Set();
  for(const t of d.tickets){if(!t||!string(t.id,100)||!t.id||ticketIds.has(t.id)||!/^\d{5}$/.test(t.number)||typeof t.number!=='string'||!Number.isSafeInteger(t.quantity)||t.quantity<1||t.quantity>100000||!string(t.series,30)||!string(t.fraction,30)||!photos(t.photos))fail('Cada décimo necesita cinco cifras y una cantidad entera positiva (máximo 100.000).');ticketIds.add(t.id);}
 }
 return s;
}
export function makeBackup(state){validateState(state);return {app:'control-de-decimos',version:1,exportedAt:new Date().toISOString(),state};}
export function parseBackup(text){let b;try{b=JSON.parse(text);}catch{fail('El archivo no es una copia JSON legible.');}if(b?.app!=='control-de-decimos'||b.version!==1)fail('Formato o versión de copia no compatible.');return validateState(b.state);}
export function summary(state,year){const ds=state.deliveries.filter(d=>!year||d.year===Number(year));const count=status=>ds.filter(d=>!status||d.status===status).reduce((n,d)=>n+d.tickets.reduce((v,t)=>v+t.quantity,0),0);return {total:count(),pending:count('pending'),delivered:count('delivered'),deliveries:ds.length};}
export function filtered(state,{year='',status='',search=''}={}){const q=norm(search);return state.deliveries.filter(d=>{const p=state.people.find(p=>p.id===d.personId);return (!year||d.year===Number(year))&&(!status||d.status===status)&&norm([p?.name,p?.phone,d.notes,...d.tickets.map(t=>[t.number,t.series,t.fraction].join(' '))].join(' ')).includes(q);});}
const unescapeVcf=s=>s.replace(/\\n/gi,'\n').replace(/\\([,;\\])/g,'$1');
export function parseVcf(text){
 if(text.length>5000000)fail('El VCF supera 5 MB.');
 const warnings=[];const people=[];
 const unfolded=text.replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'');
 for(const card of unfolded.match(/BEGIN:VCARD[\s\S]*?END:VCARD/gi)||[]){
  if(/ENCODING=(QUOTED-PRINTABLE|BASE64)/i.test(card)){warnings.push('Se omitió una tarjeta con codificación antigua. Exporta como vCard 3.0 o 4.0 UTF-8.');continue;}
  let name='',fallback='',phone='';
  for(const line of card.split('\n')){const i=line.indexOf(':');if(i<0)continue;const key=line.slice(0,i).split(';')[0].split('.').pop().toUpperCase();const value=line.slice(i+1);
   if(key==='FN')name=unescapeVcf(value).trim();
   if(key==='N')fallback=value.split(';').map(unescapeVcf).filter(Boolean).reverse().join(' ');
   if(key==='TEL'&&!phone)phone=unescapeVcf(value).replace(/^tel:/i,'').trim();
  }
  name=name||fallback;if(name)people.push({id:uid(),name:name.slice(0,200),phone:phone.slice(0,100),notes:''});else warnings.push('Se omitió una tarjeta sin nombre.');
 }
 if(!people.length)fail(warnings[0]||'No se encontraron contactos en este VCF.');
 return {people,warnings};
}
export function contactFromUrl(value){const u=new URL(value);const p=new URLSearchParams(u.hash.slice(1)||u.search.slice(1));if(p.get('action')!=='contact')return null;const name=(p.get('name')||'').trim().slice(0,200);if(!name)fail('El enlace del contacto no contiene nombre.');return {id:uid(),name,phone:(p.get('phone')||'').slice(0,100),notes:''};}
