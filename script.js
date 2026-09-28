
const app=document.getElementById('app'),bar=document.getElementById('progress');
let s={},i=0,branch=[];

const data={
 brickwork:[
  ['length','Approximately how long will the wall be?','number'],
  ['height','Approximately how high will the wall be?',['Up to 600mm','1m','1.2m','1.5m','1.8m','2m+','Not sure']],
  ['construction','What type of wall construction are you looking for?',['Single-skin brickwork','Face brickwork both sides','Decorative / feature brickwork','Not sure']],
  ['brick','What type of brick are you using?',['Standard facing brick','Engineering brick','Not sure']],
  ['piers','Will the wall include piers?',['No piers','Incorporated piers','Feature / gate piers','Not sure']],
  ['foundations','What foundation situation are you expecting?',['Standard foundations','Deep foundations','Not sure']],
  ['access','How is access to the work area?',['Easy access','Restricted access','Very difficult access','Not sure']],
  ['waste','Will there be existing material or spoil to remove?',['No / minimal waste','Some waste or spoil','Significant waste / excavation','Not sure']],
  ['retaining','Will the wall retain soil or a change in ground level?',['No','Yes','Not sure']]
 ],
 blockwork:[
  ['area','Approximate blockwork area (m²)?','number'],
  ['type','What type of blockwork?',['100mm standard','140mm','215mm','Inner leaf cavity wall','Below DPC','Foundation blockwork','Retaining blockwork']],
  ['laying','How will the blocks be laid?',['Normal','Laid flat','Not sure']],
  ['access','How is access?',['Easy access','Restricted access','Very difficult access','Not sure']]
 ],
 extension:[
  ['area','Approximate extension floor area (m²)?','number'],
  ['spec','What build level are you looking for?',['Basic','Mid / standard','High-end / complex']],
  ['scope','What would you like estimated?',['Shell to wall plate','Full build including materials']],
  ['ground','How straightforward are the foundations and drainage?',['Straightforward','Potentially complex / unknown']],
  ['access','How is site access?',['Easy access','Restricted access','Very difficult access']]
 ],
 driveway:[
  ['area','Approximate driveway area (m²)?','number'],
  ['surface','What surface do you want?',['Gravel','Block paving','Tarmac','Resin','Premium block paving']],
  ['excavation','How much excavation is expected?',['Standard dig-out','Heavy dig-out / extra excavation','Not sure']],
  ['access','How is access?',['Easy access','Restricted access','Very difficult access']],
  ['drainage','Is additional drainage required?',['No / not known','Drainage channels / ACO','Drainage solution unknown']]
 ],
 patio:[
  ['area','Approximate patio / landscaping area (m²)?','number'],
  ['surface','What finish are you looking for?',['Budget slabs','Indian sandstone','Porcelain','Premium / detailed porcelain']],
  ['access','How is access?',['Easy access','Restricted access','Very difficult access']],
  ['extras','Any major extras?',['None','Steps','Retaining wall','Drainage','Steps + retaining + drainage']]
 ]
};

function start(){
 s={};
 const lf=document.getElementById('lead-form'); if(lf) lf.hidden=true;
 const ls=document.getElementById('lead-status'); if(ls) ls.textContent=''; i=0; branch=[];
 app.innerHTML='<h3>What are you looking to have done?</h3><p class="muted">Choose the project closest to what you are planning.</p><div class="options">'+
 ['Brickwork & Walls','Blockwork','Extensions','Driveways','Patios & Landscaping'].map(x=>`<button class="option" onclick="cat('${x}')">${x}</button>`).join('')+'</div>';
 bar.style.width='0%';
}
function cat(x){
 const map={'Brickwork & Walls':'brickwork','Blockwork':'blockwork','Extensions':'extension','Driveways':'driveway','Patios & Landscaping':'patio'};
 branch=map[x]; s={}; i=0; question();
}
function question(){
 const q= data[branch][i], [k,label,type]=q;
 bar.style.width=(i/data[branch].length*100)+'%';
 let body;
 if(type==='number'){
  body=`<div class="field"><label>${label}</label><input id="ans" type="number" min="0" step=".1" placeholder="e.g. 25"></div><button class="btn gold" onclick="next(document.getElementById('ans').value)">Continue</button>`;
 }else{
  body=`<h3>${label}</h3><div class="options">${type.map(v=>`<button class="option" onclick="next('${v.replaceAll("'","\\'")}')">${v}</button>`).join('')}</div>`;
 }
 app.innerHTML=`<small>${branchLabel()} · ${i+1}/${data[branch].length}</small>${body}`;
}
function branchLabel(){return {brickwork:'BRICKWORK & WALLS',blockwork:'BLOCKWORK',extension:'EXTENSIONS',driveway:'DRIVEWAYS',patio:'PATIOS & LANDSCAPING'}[branch]}
function next(v){
 if(v===undefined || v==='') return;
 s[data[branch][i][0]]=v;
 i++;
 i<data[branch].length ? question() : estimate();
}
function money(n){return '£'+Math.round(n/100)*100 .toLocaleString('en-GB')}
function estimate(){
 bar.style.width='100%';
 let low=0,high=0,notes=[];
 const add=(lo,hi)=>{low+=lo;high+=hi};
 const access=()=>s.access==='Restricted access'?[1.10,1.15]:s.access==='Very difficult access'?[1.20,1.25]:[1,1];

 if(branch==='brickwork'){
  const m=+s.length||0, h=s.height;
  const rates={basic:[100,140],face:[140,180],decorative:[180,250]};
  let key=s.construction==='Single-skin brickwork'?'basic':s.construction==='Face brickwork both sides'?'face':'decorative';
  let r=rates[key]||rates.basic;
  let mult={ 'Up to 600mm':.75,'1m':1,'1.2m':1.15,'1.5m':1.35,'1.8m':1.6,'2m+':1.9,'Not sure':1.15}[h];
  low=m*r[0]*mult; high=m*r[1]*mult;
  if(s.brick==='Engineering brick'){low*=1.10;high*=1.20;notes.push('Engineering brick allowance applied.');}
  if(s.piers==='Incorporated piers'){low+=m*40;high+=m*80;notes.push('Incorporated pier allowance applied.');}
  if(s.piers==='Feature / gate piers'){low+=250;high+=500;notes.push('Feature/gate pier allowance applied.');}
  if(s.foundations==='Deep foundations'){low+=m*20;high+=m*50;notes.push('Deep footing allowance applied.');}
  const a=access();low*=a[0];high*=a[1];
  if(a[0]>1)notes.push('Restricted-access allowance applied.');
  if(s.retaining==='Yes' || s.retaining==='Not sure')notes.push('Retaining work needs a site/structural assessment.');
  if(s.waste==='Significant waste / excavation')notes.push('Significant excavation/waste may need a separate allowance.');
  // Indicative all-in uplift for materials/waste/known extras; guide labour rates are the base.
  low*=1.35; high*=1.55;
 }
 if(branch==='blockwork'){
  const m=+s.area||0;
  const rates={'100mm standard':[80,120],'140mm':[90,130],'215mm':[110,160],'Inner leaf cavity wall':[90,130],'Below DPC':[100,150],'Foundation blockwork':[120,180],'Retaining blockwork':[150,300]};
  let r=rates[s.type]||[80,120];
  if(s.laying==='Laid flat' && s.type==='100mm standard')r=[60,90];
  if(s.laying==='Laid flat' && s.type==='140mm')r=[70,100];
  if(s.laying==='Laid flat' && s.type==='215mm')r=[80,120];
  low=m*r[0];high=m*r[1];
  const a=access();low*=a[0];high*=a[1];
  if(a[0]>1)notes.push('Restricted-access allowance applied.');
  if(s.type==='Foundation blockwork'||s.type==='Retaining blockwork')notes.push('Foundation/retaining requirements depend on ground and structural conditions.');
 }
 if(branch==='extension'){
  const m=+s.area||0;
  let r;
  if(s.scope==='Shell to wall plate')r={Basic:[450,550],'Mid / standard':[600,750],'High-end / complex':[800,1000]}[s.spec];
  else r={Basic:[2000,2800],'Mid / standard':[2800,3800],'High-end / complex':[4000,6000]}[s.spec];
  low=m*r[0];high=m*r[1];
  const a=access();low*=a[0];high*=a[1];
  if(a[0]>1)notes.push('Restricted-access allowance applied.');
  notes.push('Steels, glazing, roof complexity, foundations and drainage are subject to site assessment.');
  if(s.ground!=='Straightforward')notes.push('Unknown groundwork/drainage is not fixed in this estimate.');
 }
 if(branch==='driveway'){
  const m=+s.area||0;
  const r={Gravel:[60,100],'Block paving':[100,160],Tarmac:[80,140],Resin:[120,180],'Premium block paving':[160,250]}[s.surface];
  low=m*r[0];high=m*r[1];
  if(s.excavation==='Heavy dig-out / extra excavation'){low*=1.10;high*=1.20;notes.push('Heavy excavation allowance applied.');}
  const a=access();low*=a[0];high*=a[1];
  if(a[0]>1)notes.push('Restricted-access allowance applied.');
  if(s.drainage==='Drainage channels / ACO'){}
  if(s.drainage==='Drainage channels / ACO'){low+=m*40;high+=m*80;notes.push('Drainage-channel allowance applied.');}
  if(s.drainage==='Drainage solution unknown')notes.push('Drainage solution needs confirming on site.');
 }
 if(branch==='patio'){
  const m=+s.area||0;
  const r={'Budget slabs':[90,130],'Indian sandstone':[110,160],Porcelain:[140,220],'Premium / detailed porcelain':[220,300]}[s.surface];
  low=m*r[0];high=m*r[1];
  const a=access();low*=a[0];high*=a[1];
  if(a[0]>1)notes.push('Restricted-access allowance applied.');
  if(s.extras==='Steps'){low+=250;high+=500;notes.push('Basic steps allowance applied.');}
  if(s.extras==='Retaining wall'){low+=180;high+=450;notes.push('Retaining wall allowance applied.');}
  if(s.extras==='Drainage'){low+=500;high+=1500;notes.push('Drainage/soakaway allowance applied.');}
  if(s.extras==='Steps + retaining + drainage'){low+=930;high+=2450;notes.push('Combined provisional allowances applied.');}
 }
 // Small allowance for waste/delivery/consumables where the guide supports all-in installed pricing.
 if(branch==='brickwork'){} else if(branch==='blockwork'){low*=1.05;high*=1.08;}

 const round=n=>Math.round(n/100)*100;
 const customerLow=round(low), customerHigh=round(high);
// Internal working figure: a private planning figure based on the lower customer range,
// without the customer-facing uplift. It is never rendered in the customer UI.
const internalLow=round(low/(branch==='brickwork'?1.35:1.05));
const internalHigh=round(high/(branch==='brickwork'?1.55:1.08));
window.latestEstimate={
  category:branchLabel(), answers:{...s},
  customerLow, customerHigh, internalLow, internalHigh,
  notes:[...notes]
};
app.innerHTML=`<h3>Indicative project estimate</h3>
<div class="range">£${customerLow.toLocaleString('en-GB')} – £${customerHigh.toLocaleString('en-GB')}</div>
<p class="muted">This is an indicative all-in project range based on your answers and the G.S Building Services pricing guide. It is <strong>not a formal quotation</strong>.</p>
${notes.length?`<div class="warning"><ul>${notes.map(n=>`<li>${n}</li>`).join('')}</ul></div>`:''}
<p class="muted">We'll review the project, confirm measurements and current merchant prices, inspect site conditions and then provide the formal quote.</p>
<button class="btn gold" type="button" onclick="showLead()">Request a formal quote</button>
<button class="btn outline" onclick="start()">Start another estimate</button>`;
}
function showLead(){
  const f=document.getElementById('lead-form');
  f.hidden=false;
  f.scrollIntoView({behavior:'smooth',block:'start'});
}
window.leadFormLoadedAt=window.leadFormLoadedAt||Date.now();
async function submitLead(){
  const name=document.getElementById('lead-name').value.trim();
  const phone=document.getElementById('lead-phone').value.trim();
  const email=document.getElementById('lead-email').value.trim();
  const area=document.getElementById('lead-area').value.trim();
  const message=document.getElementById('lead-message').value.trim();
  const honeypot=document.getElementById('website')?.value.trim()||'';
  const status=document.getElementById('lead-status');
  const sendButton=document.querySelector('#lead-form .btn.gold');

  if(honeypot){ status.textContent='Thanks — your enquiry has been received.'; return; }
  if(!name||!phone||!email){
    status.textContent='Please enter your name, phone number and email address.';
    return;
  }
  if(Date.now()-window.leadFormLoadedAt < 2500){ status.textContent='Please take a moment to check your details before sending.'; return; }

  const e=window.latestEstimate;
  if(!e){
    status.textContent='Please complete the estimate first.';
    return;
  }

  // Web3Forms access key. Replace this placeholder with the key generated for
  // g.sbuildingserviceswv@gmail.com. Do not put your email password here.
  const WEB3FORMS_ACCESS_KEY='8a518c73-86aa-494e-933b-74cf206626d2';

  if(WEB3FORMS_ACCESS_KEY==='YOUR_WEB3FORMS_ACCESS_KEY'){
    status.innerHTML='The lead form is ready, but the Web3Forms access key still needs adding. See <strong>WEB3FORMS-SETUP.txt</strong> in this website package.';
    return;
  }

  const answers=Object.entries(e.answers).map(([k,v])=>`${k}: ${v}`).join('\n');

  // Private internal planning figure. This is sent to the business only and
  // is deliberately never rendered in the customer-facing estimate.
  const internal=`£${e.internalLow.toLocaleString('en-GB')} – £${e.internalHigh.toLocaleString('en-GB')}`;

  const formData=new FormData();
  formData.append('access_key',WEB3FORMS_ACCESS_KEY);
  formData.append('subject',`NEW WEBSITE LEAD – ${e.category} – ${name}`);
  formData.append('from_name','G.S Building Services Website');
  formData.append('replyto',email);
  formData.append('botcheck','');
  formData.append('website','');
  formData.append('Customer Name',name);
  formData.append('Phone',phone);
  formData.append('Email',email);
  formData.append('Area / Postcode',area||'Not provided');
  formData.append('Project',e.category);
  formData.append('Customer Estimate',`£${e.customerLow.toLocaleString('en-GB')} – £${e.customerHigh.toLocaleString('en-GB')}`);
  formData.append('PRIVATE INTERNAL PLANNING FIGURE',internal);
  formData.append('Estimator Answers',answers);
  formData.append('Customer Notes',message||'None');
  formData.append('Important','Private internal planning figure — G.S Building Services only. Do not show to customer.');

  sendButton.disabled=true;
  status.textContent='Sending your enquiry…';

  try{
    const response=await fetch('https://api.web3forms.com/submit',{
      method:'POST',
      body:formData
    });
    const data=await response.json();
    if(data.success){
      status.textContent='Thanks — your enquiry has been sent. G.S Building Services will be in touch.';
      sendButton.style.display='none';
    }else{
      throw new Error(data.message||'Submission failed');
    }
  }catch(err){
    sendButton.disabled=false;
    status.textContent='We could not send the enquiry just now. Please try again or contact G.S Building Services directly.';
  }
}
document.getElementById('year').textContent=new Date().getFullYear();
start();
