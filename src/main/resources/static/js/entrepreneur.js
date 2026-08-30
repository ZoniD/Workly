(() => {
  'use strict';

  const TOKEN_KEY='worklyToken', AUTH_KEY='worklyAuth';
  const token=localStorage.getItem(TOKEN_KEY)||'';
  let auth=null; try{auth=JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{auth=null}
  let profile=null;
  const $=s=>document.querySelector(s);

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    if(!token || !auth?.role?.includes('ENTREPRENEUR')) return renderGate();
    $('#portalUserEmail').textContent=auth.email||'';
    $('#portalLogout').addEventListener('click', logout);
    $('#availabilityToggle').addEventListener('change', updateAvailability);
    $('#profileForm').addEventListener('submit', updateProfile);
    loadProfile();
  }

  function renderGate(){
    document.body.innerHTML=`<div class="portal-gate"><div class="portal-gate-card"><a href="/" class="brand" style="justify-content:center"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>Workly</span></a><h1>Fagperson-adgang krævet</h1><p>Log ind med en godkendt fagpersonkonto for at se profilen.</p><a class="btn btn-primary" href="/" style="margin-top:14px">Til forsiden</a></div></div>`;
  }

  function logout(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(AUTH_KEY);location.href='/'}

  async function api(path,options={}){
    const headers=new Headers(options.headers||{}); headers.set('Authorization',`Bearer ${token}`); if(options.body)headers.set('Content-Type','application/json');
    const r=await fetch(path,{...options,headers}); const type=r.headers.get('content-type')||''; const body=type.includes('application/json')?await r.json():(await r.text()||null);
    if(!r.ok){if(r.status===401||r.status===403)setTimeout(logout,650);throw new Error(typeof body==='object'&&body?.message?body.message:typeof body==='string'&&body?body:`Request failed (${r.status})`)} return body;
  }

  async function loadProfile(){
    try{profile=await api('/api/entrepreneur/profile');renderProfile()}catch(e){toast(e.message,'error')}
  }

  function renderProfile(){
    if(!profile)return;
    $('#identityIcon').textContent=profile.categoryIcon||'◼';
    $('#identityCompany').textContent=profile.companyName||'Din virksomhed';
    $('#identityCategory').textContent=(profile.categoryName||'Fagperson').toUpperCase();
    $('#identityOwner').textContent=`${profile.ownerName||''}${profile.loginEmail?` · ${profile.loginEmail}`:''}`;
    $('#identityDescription').textContent=profile.description||'Tilføj en kort beskrivelse af de opgaver du hjælper kunder med.';
    $('#identityLocation').textContent=profile.location||'—';
    $('#identityBusinessEmail').textContent=profile.businessEmail||'—';
    $('#identityPhone').textContent=profile.phone||'—';
    $('#profileRating').textContent=`${Number(profile.rating||0).toFixed(1)} ★`;
    $('#profileCategoryMetric').textContent=profile.categoryName||'—';
    $('#profileId').textContent=`#${profile.id??'—'}`;

    const status=$('#profileStatus'); status.textContent=profile.status||'—'; status.className=`status-pill ${profile.status||''}`;
    const active=$('#profileActive'); active.textContent=profile.active?'ACTIVE':'INACTIVE'; active.className=`status-pill ${profile.active?'APPROVED':'ARCHIVED'}`;
    $('#availabilityToggle').checked = !!profile.availableForWork;

    $('#availabilityTitle').textContent =
        profile.availableForWork
            ? 'Jeg tager imod nye opgaver'
            : 'Tager ikke imod opgaver i øjeblikket';

    $('#availabilityText').textContent =
        profile.availableForWork
            ? 'Din profil er synlig som tilgængelig for nye opgaver.'
            : 'Din profil viser kunderne, at du ikke er tilgængelig lige nu.';
    $('#portalCompanyName').value=profile.companyName||'';
    $('#portalBusinessEmail').value=profile.businessEmail||'';
    $('#portalPhone').value=profile.phone||'';
    $('#portalLocation').value=profile.location||'';
    $('#portalDescription').value=profile.description||'';
    renderCompletion();
  }

  function renderCompletion(){
    const values=[profile.companyName,profile.businessEmail,profile.phone,profile.location,profile.description,profile.categoryName];
    const filled=values.filter(v=>String(v||'').trim()).length;
    const pct=Math.round(filled/values.length*100);
    $('#profileCompletion').style.width=`${pct}%`;
    $('#profileCompletionText').textContent=`${pct}% af de centrale profilfelter er udfyldt.`;
  }

  async function updateAvailability(e){
    const checked=e.target.checked; e.target.disabled=true;
    try{profile=await api('/api/entrepreneur/availability',{method:'PATCH',body:JSON.stringify({availableForWork:checked})});renderProfile();toast(checked?'Du tager nu imod nye opgaver.':'Tilgængelighed sat på pause.','success')}
    catch(error){e.target.checked=!checked;toast(error.message,'error')}
    finally{e.target.disabled=false}
  }

  async function updateProfile(e){
    e.preventDefault(); const submit=e.currentTarget.querySelector('button[type="submit"]'); busy(submit,true,'Gemmer…'); setMessage('','');
    try{
      profile=await api('/api/entrepreneur/profile',{method:'PUT',body:JSON.stringify({
        companyName:$('#portalCompanyName').value.trim(), businessEmail:$('#portalBusinessEmail').value.trim(), phone:$('#portalPhone').value.trim(), location:$('#portalLocation').value.trim(), description:$('#portalDescription').value.trim()
      })});
      renderProfile(); setMessage('Profilen er opdateret.','success'); toast('Dine ændringer er gemt.','success');
    }catch(error){setMessage(error.message,'error')}finally{busy(submit,false,'Gem ændringer')}
  }

  function setMessage(message,type){const el=$('#profileMessage');el.textContent=message||'';el.className=`inline-message${message?` show ${type}`:''}`}
  function busy(b,on,label){if(on){b.dataset.label=b.textContent;b.disabled=true;b.textContent=label}else{b.disabled=false;b.textContent=b.dataset.label||label}}
  function toast(message,type=''){const stack=$('#toastStack');const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;stack.appendChild(el);setTimeout(()=>el.remove(),3600)}
})();
