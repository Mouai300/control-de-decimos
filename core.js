export const emptyState = () => ({people:[],deliveries:[]});
export const uid = () => crypto.randomUUID();
export const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const personKey = p => norm(p.name)+'|'+p.phone.replace(/[^\d+]/g,'');
const fail = s => {throw new Error(s);};
const string = (s,max=2000) => typeof s==='string' && s.length<=max;
function photos(xs){return Array.isArray(xs)&&xs.length<=100&&xs.every(x=>string(x,16000000)&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(x));}
export function validateState(s){
 if(!s||!Array.isArray(s.people)||!Array.isArray(s.deliveries))fail('La copia no contiene datos válidos.');
 if(s.people.length>5000||s.deliveries.length>10000)fail('Máximo 5.000 destinatarios y 10.000 entregas.');
 let photoBytes=0,photoCount=0,ticketCount=0;
 const ids=new Set();
 for(const p of s.people){if(!p||!string(p.id,100)||!p.id||ids.has(p.id)||!string(p.name,200)||!p.name.trim()||!string(p.phone,100)||!string(p.notes))fail('Hay un destinatario no válido.');ids.add(p.id);}
 const deliveries=new Set();
 for(const d of s.deliveries){
  if(!d||!string(d.id,100)||!d.id||deliveries.has(d.id)||!ids.has(d.personId)||!Number.isInteger(d.year)||d.year<1900||d.year>2200||!['pending','delivered'].includes(d.status)||!string(d.notes)||!photos(d.photos)||!Array.isArray(d.tickets)||!d.tickets.length)fail('Hay una entrega no válida o sin destinatario.');
  deliveries.add(d.id);const ticketIds=new Set();
  ticketCount+=d.tickets.length;if(d.tickets.length>200||ticketCount>20000)fail('Máximo 200 registros de décimos por entrega y 20.000 en total.');
  for(const owner of [d,...d.tickets]){if(!owner||!Array.isArray(owner.photos))fail('Fotos no válidas.');for(const photo of owner.photos){photoBytes+=typeof photo==='string'?photo.length:0;photoCount++;}}
  if(photoBytes>48000000||photoCount>1000)fail('Máximo 48 MB de fotos codificadas y 1.000 fotos en total.');
  for(const t of d.tickets){if(!t||!string(t.id,100)||!t.id||ticketIds.has(t.id)||!/^\d{5}$/.test(t.number)||typeof t.number!=='string'||!Number.isSafeInteger(t.quantity)||t.quantity<1||t.quantity>100000||!string(t.series,30)||!string(t.fraction,30)||!photos(t.photos))fail('Cada décimo necesita cinco cifras y una cantidad entera positiva (máximo 100.000).');ticketIds.add(t.id);}
 }
 return s;
}
export function makeBackup(state){validateState(state);return {app:'control-de-decimos',version:1,exportedAt:new Date().toISOString(),state};}
export function parseBackup(text){if(text.length>67108864)fail('Copia demasiado grande (64 MiB).');let b;try{b=JSON.parse(text);}catch{fail('El archivo no es una copia JSON legible.');}if(b?.app!=='control-de-decimos'||b.version!==1)fail('Formato o versión de copia no compatible.');return validateState(b.state);}
export function summary(state,year){const ds=state.deliveries.filter(d=>!year||d.year===Number(year));const count=status=>ds.filter(d=>!status||d.status===status).reduce((n,d)=>n+d.tickets.reduce((v,t)=>v+t.quantity,0),0);return {total:count(),pending:count('pending'),delivered:count('delivered'),deliveries:ds.length};}
export function filtered(state,{year='',status='',search=''}={}){const q=norm(search);return state.deliveries.filter(d=>{const p=state.people.find(p=>p.id===d.personId);return (!year||d.year===Number(year))&&(!status||d.status===status)&&norm([p?.name,p?.phone,d.notes,...d.tickets.map(t=>[t.number,t.series,t.fraction].join(' '))].join(' ')).includes(q);});}
const unescapeVcf=s=>s.replace(/\\n/gi,'\n').replace(/\\([,;\\])/g,'$1');
export function parseVcf(text){
 if(text.length>5000000)fail('El VCF supera 5 MB.');
 const warnings=[];const people=[];
 const unfolded=text.replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'');
 const cards=[];let lines=null;for(const line of unfolded.split('\n')){if(/^BEGIN:VCARD\s*$/i.test(line)){lines=[];}else if(/^END:VCARD\s*$/i.test(line)){if(lines){cards.push(lines.join('\n'));if(cards.length>5000)fail('Máximo 5.000 contactos por importación.');}lines=null;}else if(lines)lines.push(line);}
 for(const card of cards){
  let name='',fallback='',phone='',unsupported=false;
  for(const line of card.split('\n')){const i=line.indexOf(':');if(i<0)continue;const key=line.slice(0,i).split(';')[0].split('.').pop().toUpperCase();const value=line.slice(i+1);
   if(['FN','N','TEL'].includes(key)&&/ENCODING=(QUOTED-PRINTABLE|BASE64|B)(;|$)/i.test(line.slice(0,i))){unsupported=true;continue;}
   if(key==='FN')name=unescapeVcf(value).trim();
   if(key==='N'){const fields=[];let field='';for(let j=0;j<value.length;j++){if(value[j]==='\\'&&j+1<value.length){field+=value[j]+value[++j];}else if(value[j]===';'){fields.push(unescapeVcf(field));field='';}else field+=value[j];}fields.push(unescapeVcf(field));fallback=[fields[3],fields[1],fields[2],fields[0],fields[4]].filter(Boolean).join(' ');}
   if(key==='TEL'&&!phone)phone=unescapeVcf(value).replace(/^tel:/i,'').trim();
  }
  name=name||fallback;if(unsupported)warnings.push('Se omitieron campos con codificación antigua. Exporta como vCard 3.0 o 4.0 UTF-8.');if(name)people.push({id:uid(),name:name.slice(0,200),phone:phone.slice(0,100),notes:''});else warnings.push('Se omitió una tarjeta sin nombre.');
 }
 if(!people.length)fail(warnings[0]||'No se encontraron contactos en este VCF.');
 return {people,warnings};
}
export function contactFromUrl(value,expected){if(value.length>4000)fail('Enlace demasiado largo.');const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)fail('Enlace no permitido.');if(u.search)fail('Usa un enlace con #, sin parámetros ? que expongan el contacto al alojamiento.');if(expected){const base=new URL(expected);if(u.origin!==base.origin||u.pathname.replace(/index\.html$/,'')!==base.pathname.replace(/index\.html$/,''))fail('El enlace no corresponde a esta aplicación.');}const p=new URLSearchParams(u.hash.slice(1));if(p.get('action')!=='contact')return null;for(const key of ['action','name','phone'])if(p.getAll(key).length>1)fail('El enlace contiene campos repetidos.');const name=(p.get('name')||'').trim();const phone=p.get('phone')||'';if(!name||name.length>200||phone.length>100)fail('Nombre o teléfono no válido.');return {id:uid(),name,phone,notes:''};}

