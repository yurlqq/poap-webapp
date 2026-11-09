// Standalone local adapter; never connects to POAP production services.
const KEY='poap-local-v1';
const sample={id:1001,name:'A shared moment · Seoul',fancy_id:'a-shared-moment-seoul',description:'One POAP, two ways to distribute. Local sample for exploring the original UI.',city:'Seoul',country:'South Korea',event_url:'https://example.com',event_template_id:0,from_admin:true,image_url:'/images/badges/ethdenver2019_512.png',year:2026,start_date:'09-Nov-2026',end_date:'09-Nov-2026',expiry_date:'09-Dec-2026',virtual_event:false,email:'local@example.test',secret_code:123456};
const seed={events:[sample],deliveries:[{id:1,slug:'seoul-delivery',event_ids:'1001',card_title:'A shared moment · Delivery',card_text:'For invited participants',page_title:'Thank you for joining us',page_text:'Collect your memory from Seoul.',metadata_title:'Seoul POAP',metadata_description:'Our shared moment',image:sample.image_url,page_title_image:'',active:true,approved:false}],addresses:{'1':[{address:'0x1111111111111111111111111111111111111111',claimed:false,event_ids:'1001'},{address:'0x2222222222222222222222222222222222222222',claimed:true,event_ids:'1001'}]},websites:[{claim_name:'seoul-shared-link',event_id:1001,active:true,captcha:false,created:new Date().toISOString(),from:'2026-11-09T00:00:00Z',to:'2026-11-10T00:00:00Z',timezone:9,deliveriesCount:{total:100,claimed:2}}],requests:[]};
let db:any=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(seed);
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
save();
const originalFetch=window.fetch.bind(window);
const json=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const date=(value:any)=>{const d=new Date(value);return isNaN(+d)?value:`${String(d.getDate()).padStart(2,'0')}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`};
window.fetch=async(input,init={})=>{
 const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,location.origin);
 if(url.origin!==location.origin) throw new Error('External requests are disabled in local preview');
 if(!url.pathname.startsWith('/local-api/')) return originalFetch(input,init);
 const p=url.pathname.replace('/local-api',''),q=url.searchParams,method=init.method||'GET';
 let b:any=typeof init.body==='string'?JSON.parse(init.body):{};
 if(init.body instanceof FormData){b=Object.fromEntries(init.body);if(b.image instanceof Blob){const blob=b.image;b.image_url=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)});}delete b.image;}
 const list=(rows:any[],field:string)=>{const offset=Number(q.get('offset')||0),limit=Number(q.get('limit')||100);return json({[field]:rows.slice(offset,offset+limit),total:rows.length,offset,limit})};
 const finish=(data:any)=>{save();return json(data)};
 const failure=(message:string)=>json({message},400);
 if(p==='/events'&&method==='GET')return json(db.events);
 if(p==='/paginated-events'){
  let rows=db.events.filter((e:any)=>!q.get('name')||e.name.toLowerCase().includes(q.get('name')!.toLowerCase()));
  const field=q.get('sort_field')||'name',dir=q.get('sort_dir')==='desc'?-1:1;rows.sort((a:any,b:any)=>String(a[field]).localeCompare(String(b[field]))*dir);return list(rows,'items');
 }
 if(p==='/event-templates')return json({event_templates:[],total:0});
 if(p==='/event/validate')return json({valid:db.events.some((e:any)=>e.id===Number(b.event_id)&&String(e.secret_code)===String(b.secret_code))});
 if(p==='/qr-requests/active/count')return json({count:db.requests.filter((r:any)=>r.event_id===Number(q.get('event_id'))).length});
 if(p==='/qr-requests'&&method==='POST'){db.requests.push(b);return finish({});}
 if((p==='/events'&&method==='POST')||(p.startsWith('/events/')&&method==='PUT')){
  const previous=db.events.find((e:any)=>e.fancy_id===p.split('/').pop());const id=previous?.id||Math.max(...db.events.map((e:any)=>e.id))+1;
  const record={...previous,...b,id,fancy_id:previous?.fancy_id||`local-poap-${id}`,year:new Date(b.start_date).getFullYear(),start_date:date(b.start_date),end_date:date(b.end_date),expiry_date:date(b.expiry_date),virtual_event:b.virtual_event==='true'};
  if(previous)db.events=db.events.map((e:any)=>e.id===id?record:e);else db.events.push(record);return finish(record);
 }
 if(p.startsWith('/events/id/'))return json(db.events.find((e:any)=>e.id===Number(p.split('/').pop()))||null);
 if(p.startsWith('/events-admin/')||p.startsWith('/events/'))return json(db.events.find((e:any)=>e.fancy_id===p.split('/').pop())||null);
 if((p==='/deliveries'||p==='/admin/deliveries')&&method==='GET')return list(db.deliveries.filter((d:any)=>!q.get('event_id')||d.event_ids.split(',').includes(q.get('event_id'))),'deliveries');
 if(p.startsWith('/delivery-addresses/'))return list(db.addresses[p.split('/').pop()!]||[],'items');
 if(p.startsWith('/delivery/'))return json(db.deliveries.find((d:any)=>d.id===Number(p.split('/').pop()))||null);
 if(p==='/deliveries'&&method==='POST'){
  if(db.deliveries.some((d:any)=>d.slug===b.slug))return failure('Delivery URL already exists');
  if(b.event_ids.split(',').some((id:string)=>!db.events.some((e:any)=>e.id===Number(id))))return failure('Unknown Event ID');
  const id=Math.max(0,...db.deliveries.map((d:any)=>d.id))+1;db.deliveries.push({...b,id,active:true,approved:false});db.addresses[id]=b.addresses.map((a:any)=>({address:a.address,event_ids:a.events.join(','),claimed:false}));return finish(db.deliveries.at(-1));
 }
 if(/^\/deliveries\/\d+\/address\/add$/.test(p)){const id=p.split('/')[2];db.addresses[id]||=[];for(const a of b.addresses)if(!db.addresses[id].some((x:any)=>x.address.toLowerCase()===a.address.toLowerCase()))db.addresses[id].push({address:a.address,event_ids:a.events.join(','),claimed:false});return finish({});}
 if(/^\/deliveries\/\d+$/.test(p)&&method==='PUT'){const id=Number(p.split('/').pop());db.deliveries=db.deliveries.map((d:any)=>d.id===id?{...d,...b}:d);return finish(db.deliveries.find((d:any)=>d.id===id));}
 if(p==='/websites')return list(db.websites.filter((w:any)=>{const active=q.get('active'),time=q.get('timeframe'),now=Date.now();return (!active||w.active===(active==='true'))&&(!time||(time==='future'?+new Date(w.from)>now:time==='past'?+new Date(w.to)<now:+new Date(w.from)<=now&&+new Date(w.to)>=now))}),'websites');
 if(p.startsWith('/website/event/id/'))return json(db.websites.find((w:any)=>w.event_id===Number(p.split('/').pop()))||null);
 if(p.startsWith('/admin/website/'))return json(db.websites.find((w:any)=>w.claim_name===p.split('/').pop())||null);
 if(p==='/website-requests'){
  const previous=db.websites.find((w:any)=>w.event_id===b.event_id);
  if(db.websites.some((w:any)=>w.claim_name===b.claim_name&&w.event_id!==b.event_id))return failure('Website name already exists');
  const record={...previous,...b,created:previous?.created||new Date().toISOString(),deliveriesCount:previous?.deliveriesCount||{total:b.requested_codes,claimed:0}};
  db.websites=db.websites.filter((w:any)=>w.event_id!==b.event_id);db.websites.push(record);return finish(record);
 }
 return json({message:`Not implemented in local preview: ${method} ${p}`},501);
};
