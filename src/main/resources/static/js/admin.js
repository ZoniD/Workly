(() => {
  'use strict';

  const TOKEN_KEY = 'worklyToken';
  const AUTH_KEY = 'worklyAuth';
  const token = localStorage.getItem(TOKEN_KEY) || '';
  let auth = null;
  try { auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { auth = null; }

  const state = { professionals: [], news: [], categories: [], dashboard: null, panel: 'dashboard' };
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    if (!token || !auth?.role?.includes('ADMIN')) return renderGate();
    $('#adminName').textContent = auth.name || 'Workly Admin';
    $('#adminEmail').textContent = auth.email || 'admin';
    bindNavigation();
    bindModals();
    bindToolbar();
    bindForms();
    refreshAll();
  }

  function renderGate() {
    document.body.innerHTML = `<div class="auth-gate"><div class="auth-gate-card">
      <a href="/" class="brand" style="justify-content:center"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>Workly</span></a>
      <h1>Admin-adgang krævet</h1><p>Log ind som administrator på forsiden for at åbne kontrolpanelet.</p>
      <a class="btn btn-primary" href="/" style="margin-top:14px">Til forsiden</a>
    </div></div>`;
  }

  async function api(path, options={}) {
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type','application/json');
    const response = await fetch(path, { ...options, headers });
    const type = response.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await response.json() : (await response.text() || null);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(AUTH_KEY);
        setTimeout(() => location.href='/', 650);
      }
      throw new Error(typeof body === 'object' && body?.message ? body.message : typeof body === 'string' && body ? body : `Request failed (${response.status})`);
    }
    return body;
  }

  function bindNavigation() {
    $$('[data-panel]').forEach(btn => btn.addEventListener('click', () => setPanel(btn.dataset.panel)));
    $$('[data-go-panel]').forEach(btn => btn.addEventListener('click', () => setPanel(btn.dataset.goPanel)));
    $('#adminLogout')?.addEventListener('click', () => {
      localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(AUTH_KEY); location.href='/';
    });
    $('#refreshAdmin')?.addEventListener('click', refreshAll);
    $('#openCreateProfessional')?.addEventListener('click', () => openModal('professionalModal'));
    $('#openCreateNews')?.addEventListener('click', () => resetNewsForm());
  }

  function setPanel(name) {
    state.panel = name;
    $$('.admin-panel').forEach(panel => panel.classList.toggle('active', panel.id === `panel-${name}`));
    $$('[data-panel]').forEach(btn => btn.classList.toggle('active', btn.dataset.panel === name));
    const copy = {
      dashboard:['Overblik','Et hurtigt billede af hvad der sker på Workly lige nu.'],
      professionals:['Fagpersoner','Godkend, afvis, suspender, deaktiver eller gendan profiler.'],
      news:['Nyheder','Skriv og styr opslag der vises på Worklys offentlige side.']
    }[name];
    if (copy) { $('#panelTitle').textContent=copy[0]; $('#panelSubtitle').textContent=copy[1]; }
  }

  function bindModals() {
    $$('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.closeModal)));
    $$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('mousedown', e => e.target===backdrop && closeModal(backdrop.id)));
    document.addEventListener('keydown', e => { if(e.key==='Escape') $$('.modal-backdrop.open').forEach(m=>closeModal(m.id)); });
  }
  function openModal(id){ document.getElementById(id)?.classList.add('open'); document.body.classList.add('modal-open'); }
  function closeModal(id){ document.getElementById(id)?.classList.remove('open'); if(!document.querySelector('.modal-backdrop.open')) document.body.classList.remove('modal-open'); }

  function bindToolbar() {
    $('#adminProfessionalSearch')?.addEventListener('input', renderProfessionals);
    $('#statusFilter')?.addEventListener('change', renderProfessionals);
    $('#adminNewsSearch')?.addEventListener('input', renderNews);
  }

  function bindForms() {
    $('#createProfessionalForm')?.addEventListener('submit', createProfessional);
    $('#newsForm')?.addEventListener('submit', saveNews);
  }

  async function refreshAll() {
    const button = $('#refreshAdmin'); setBusy(button,true,'Opdaterer…');
    try {
      const [dashboard, professionals, news, categories] = await Promise.all([
        api('/api/admin/dashboard'), api('/api/admin/entrepreneurs'), api('/api/admin/news'), api('/api/categories')
      ]);
      state.dashboard=dashboard; state.professionals=professionals||[]; state.news=news||[]; state.categories=categories||[];
      renderDashboard(); renderProfessionals(); renderNews(); fillCategoryOptions();
      toast('Admin-data opdateret.','success');
    } catch(error){ toast(error.message,'error'); }
    finally { setBusy(button,false,'↻ Opdater'); }
  }

  function renderDashboard() {
    const d=state.dashboard||{};
    $('#metricPending').textContent=d.pendingEntrepreneurs ?? '0';
    $('#metricApproved').textContent=d.approvedEntrepreneurs ?? '0';
    $('#metricActive').textContent=d.activeEntrepreneurs ?? '0';
    $('#metricUsers').textContent=d.registeredUsers ?? '0';
    $('#metricNews').textContent=d.publishedNews ?? '0';

    const counts = state.professionals.reduce((a,p)=>{a[p.status]=(a[p.status]||0)+1; return a;},{});
    ['Pending','Approved','Rejected','Suspended'].forEach(label => {
      const el=$(`#status${label}`); if(el) el.textContent=counts[label.toUpperCase()]||0;
    });

    const recent=[...state.professionals].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,5);
    const target=$('#recentProfessionals');
    if(!recent.length){ target.innerHTML='<div class="empty-state">Ingen profiler endnu.</div>'; return; }
    target.innerHTML=`<div class="status-list">${recent.map(p=>`<div class="status-line"><div><strong style="font-family:var(--body);font-size:.76rem">${esc(p.companyName)}</strong><span style="display:block;margin-top:2px">${esc(p.ownerName||p.loginEmail)}</span></div><span class="status-pill ${esc(p.status)}">${esc(p.status)}</span></div>`).join('')}</div>`;
  }

  function renderProfessionals() {
    const table=$('#professionalTable'); if(!table) return;
    const q=($('#adminProfessionalSearch')?.value||'').trim().toLowerCase();
    const status=$('#statusFilter')?.value||'';
    let list=state.professionals.filter(p=>!status||p.status===status);
    if(q) list=list.filter(p=>[p.companyName,p.ownerName,p.loginEmail,p.location,p.categoryName,p.businessEmail].some(v=>String(v||'').toLowerCase().includes(q)));
    const header='<div class="data-row header"><div>Virksomhed / ejer</div><div>Kategori</div><div class="hide-tablet">Område</div><div class="hide-tablet">Status</div><div>Handlinger</div></div>';
    if(!list.length){table.innerHTML=header+'<div class="empty-state">Ingen profiler matcher.</div>';return;}
    table.innerHTML=header+list.map(p=>`<div class="data-row" data-id="${p.id}">
      <div class="data-main"><strong>${esc(p.companyName)}</strong><small>${esc(p.ownerName||'')} · ${esc(p.loginEmail||'')}</small></div>
      <div class="data-cell">${esc(p.categoryName||'—')}</div>
      <div class="data-cell hide-tablet hide-mobile">${esc(p.location||'—')}</div>
      <div class="hide-tablet"><span class="status-pill ${esc(p.status)}">${esc(p.status)}</span>${!p.active?'<span class="status-pill ARCHIVED" style="margin-left:5px">INACTIVE</span>':''}</div>
      <div class="row-actions">
        ${p.status!=='APPROVED'?`<button class="btn btn-primary btn-sm" data-status="APPROVED" data-id="${p.id}" type="button">Godkend</button>`:''}
        ${p.status!=='REJECTED'?`<button class="btn btn-ghost btn-sm" data-status="REJECTED" data-id="${p.id}" type="button">Afvis</button>`:''}
        ${p.status!=='SUSPENDED'?`<button class="btn btn-ghost btn-sm" data-status="SUSPENDED" data-id="${p.id}" type="button">Suspendér</button>`:''}
        ${p.active?`<button class="btn btn-coral btn-sm" data-deactivate="${p.id}" type="button">Deaktivér</button>`:`<button class="btn btn-ghost btn-sm" data-restore="${p.id}" type="button">Gendan</button>`}
      </div>
    </div>`).join('');
    $$('[data-status]',table).forEach(b=>b.addEventListener('click',()=>updateProfessionalStatus(b.dataset.id,b.dataset.status)));
    $$('[data-deactivate]',table).forEach(b=>b.addEventListener('click',()=>deactivateProfessional(b.dataset.deactivate)));
    $$('[data-restore]',table).forEach(b=>b.addEventListener('click',()=>restoreProfessional(b.dataset.restore)));
  }

  async function updateProfessionalStatus(id,status){
    try{ await api(`/api/admin/entrepreneurs/${id}/status`,{method:'PATCH',body:JSON.stringify({status})}); toast(`Status ændret til ${status}.`,'success'); await reloadProfessionals(); }
    catch(e){toast(e.message,'error')}
  }
  async function deactivateProfessional(id){
    if(!confirm('Deaktivér denne fagperson?')) return;
    try{await api(`/api/admin/entrepreneurs/${id}`,{method:'DELETE'});toast('Profil deaktiveret.','success');await reloadProfessionals();}catch(e){toast(e.message,'error')}
  }
  async function restoreProfessional(id){
    try{await api(`/api/admin/entrepreneurs/${id}/restore`,{method:'PATCH'});toast('Profil gendannet.','success');await reloadProfessionals();}catch(e){toast(e.message,'error')}
  }
  async function reloadProfessionals(){ state.professionals=await api('/api/admin/entrepreneurs')||[]; state.dashboard=await api('/api/admin/dashboard'); renderProfessionals();renderDashboard(); }

  function fillCategoryOptions(){
    const select=$('#createCategory'); if(!select)return;
    select.innerHTML='<option value="">Vælg kategori</option>'+state.categories.map(c=>`<option value="${c.id}">${esc(c.icon||'')} ${esc(c.name)}</option>`).join('');
  }

  async function createProfessional(e){
    e.preventDefault(); const submit=e.currentTarget.querySelector('button[type="submit"]'); setBusy(submit,true,'Opretter…');
    try{
      await api('/api/admin/entrepreneurs',{method:'POST',body:JSON.stringify({
        userName:$('#createOwnerName').value.trim(), userEmail:$('#createLoginEmail').value.trim(), temporaryPassword:$('#createTempPassword').value,
        companyName:$('#createCompanyName').value.trim(), description:$('#createDescription').value.trim(), phone:$('#createPhone').value.trim(),
        businessEmail:$('#createBusinessEmail').value.trim(), location:$('#createLocation').value.trim(), categoryId:Number($('#createCategory').value)
      })});
      setMessage('professionalMessage','Fagpersonen er oprettet.','success'); e.currentTarget.reset(); toast('Fagperson oprettet.','success'); await reloadProfessionals(); setTimeout(()=>closeModal('professionalModal'),650);
    }catch(error){setMessage('professionalMessage',error.message,'error')}finally{setBusy(submit,false,'Opret fagperson')}
  }

  function renderNews(){
    const grid=$('#adminNewsGrid'); if(!grid)return;
    const q=($('#adminNewsSearch')?.value||'').trim().toLowerCase();
    const list=state.news.filter(n=>!q||[n.title,n.summary,n.content,n.authorName].some(v=>String(v||'').toLowerCase().includes(q)));
    if(!list.length){grid.innerHTML='<div class="empty-state">Ingen nyheder matcher.</div>';return;}
    grid.innerHTML=list.map(n=>`<article class="admin-news-card">
      <div class="admin-news-image">${n.imageUrl?`<img src="${attr(n.imageUrl)}" alt="">`:''}</div>
      <div class="admin-news-body"><div><span class="status-pill ${esc(n.status)}">${esc(n.status)}</span>${n.featured?'<span class="status-pill APPROVED" style="margin-left:5px">FEATURED</span>':''}</div>
      <h3>${esc(n.title)}</h3><p>${esc(n.summary||n.content||'')}</p>
      <div class="admin-news-actions">
        <button class="btn btn-ghost btn-sm" data-edit-news="${n.id}" type="button">Redigér</button>
        ${n.status!=='PUBLISHED'?`<button class="btn btn-primary btn-sm" data-news-status="PUBLISHED" data-id="${n.id}" type="button">Publicér</button>`:''}
        ${n.status!=='DRAFT'?`<button class="btn btn-ghost btn-sm" data-news-status="DRAFT" data-id="${n.id}" type="button">Kladde</button>`:''}
        <button class="btn btn-coral btn-sm" data-archive-news="${n.id}" type="button">Arkivér</button>
      </div></div>
    </article>`).join('');
    $$('[data-edit-news]',grid).forEach(b=>b.addEventListener('click',()=>editNews(b.dataset.editNews)));
    $$('[data-news-status]',grid).forEach(b=>b.addEventListener('click',()=>updateNewsStatus(b.dataset.id,b.dataset.newsStatus)));
    $$('[data-archive-news]',grid).forEach(b=>b.addEventListener('click',()=>archiveNews(b.dataset.archiveNews)));
  }

  function resetNewsForm(){
    $('#newsForm')?.reset(); $('#newsId').value=''; $('#newsModalTitle').textContent='Nyt Workly-opslag'; setMessage('newsMessage','',''); openModal('newsModal');
  }
  function editNews(id){
    const n=state.news.find(x=>String(x.id)===String(id)); if(!n)return;
    $('#newsId').value=n.id; $('#newsTitle').value=n.title||''; $('#newsSummary').value=n.summary||''; $('#newsContent').value=n.content||''; $('#newsImageUrl').value=n.imageUrl||''; $('#newsFeatured').checked=!!n.featured; $('#newsModalTitle').textContent='Redigér opslag'; setMessage('newsMessage','',''); openModal('newsModal');
  }
  async function saveNews(e){
    e.preventDefault(); const id=$('#newsId').value; const submit=e.currentTarget.querySelector('button[type="submit"]'); setBusy(submit,true,'Gemmer…');
    const payload={title:$('#newsTitle').value.trim(),summary:$('#newsSummary').value.trim(),content:$('#newsContent').value.trim(),imageUrl:$('#newsImageUrl').value.trim(),featured:$('#newsFeatured').checked};
    try{await api(id?`/api/admin/news/${id}`:'/api/admin/news',{method:id?'PUT':'POST',body:JSON.stringify(payload)});setMessage('newsMessage','Opslaget er gemt.','success');toast('Nyhed gemt.','success');await reloadNews();setTimeout(()=>closeModal('newsModal'),550);}catch(error){setMessage('newsMessage',error.message,'error')}finally{setBusy(submit,false,'Gem opslag')}
  }
  async function updateNewsStatus(id,status){try{await api(`/api/admin/news/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});toast(`Nyhedsstatus: ${status}.`,'success');await reloadNews()}catch(e){toast(e.message,'error')}}
  async function archiveNews(id){if(!confirm('Arkivér dette opslag?'))return;try{await api(`/api/admin/news/${id}`,{method:'DELETE'});toast('Nyhed arkiveret.','success');await reloadNews()}catch(e){toast(e.message,'error')}}
  async function reloadNews(){state.news=await api('/api/admin/news')||[];state.dashboard=await api('/api/admin/dashboard');renderNews();renderDashboard()}

  function setBusy(button,busy,label){if(!button)return;if(busy){button.dataset.label=button.textContent;button.disabled=true;button.textContent=label}else{button.disabled=false;button.textContent=button.dataset.label||label}}
  function setMessage(id,msg,type){const el=document.getElementById(id);if(!el)return;el.textContent=msg||'';el.className=`inline-message${msg?` show ${type||''}`:''}`}
  function toast(message,type=''){const stack=$('#toastStack');if(!stack)return;const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;stack.appendChild(el);setTimeout(()=>el.remove(),3600)}
  function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function attr(v){return esc(v)}
})();
