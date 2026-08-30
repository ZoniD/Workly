(() => {
  'use strict';

  const API = '';
  const TOKEN_KEY = 'worklyToken';
  const AUTH_KEY = 'worklyAuth';

  const state = {
    categories: [],
    professionals: [],
    news: [],
    activeCategoryId: '',
    search: '',
    auth: readAuth(),
    token: localStorage.getItem(TOKEN_KEY) || ''
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    bindNavigation();
    bindModals();
    bindAuth();
    bindApplication();
    bindBrowse();
    syncAuthUi();
    init3DScene();
    Promise.allSettled([loadCategories(), loadProfessionals(), loadNews()]);
  }

  function readAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
    catch { return null; }
  }

  function saveAuth(data) {
    const auth = { name: data.name, email: data.email, role: data.role };
    state.auth = auth;
    state.token = data.token || state.token;
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    syncAuthUi();
  }

  function clearAuth() {
    state.auth = null;
    state.token = '';
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    syncAuthUi();
  }

  async function api(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (state.token) headers.set('Authorization', `Bearer ${state.token}`);

    const response = await fetch(`${API}${path}`, { ...options, headers });
    const type = response.headers.get('content-type') || '';
    let body = null;
    if (type.includes('application/json')) body = await response.json();
    else {
      const text = await response.text();
      body = text || null;
    }

    if (!response.ok) {
      const message = typeof body === 'object' && body?.message
        ? body.message
        : typeof body === 'string' && body
          ? body
          : `Request failed (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return body;
  }

  function bindNavigation() {
    const topbar = $('#topbar');
    const update = () => topbar?.classList.toggle('scrolled', window.scrollY > 14);
    update();
    window.addEventListener('scroll', update, { passive: true });

    $('#primaryNavButton')?.addEventListener('click', () => {
      if (state.auth?.role?.includes('ADMIN')) location.href = '/admin.html';
      else if (state.auth?.role?.includes('ENTREPRENEUR')) location.href = '/entrepreneur.html';
      else document.querySelector('#professionals')?.scrollIntoView({ behavior: 'smooth' });
    });

    $('#heroJoinButton')?.addEventListener('click', openApplicationFlow);
    $('#bottomJoinButton')?.addEventListener('click', openApplicationFlow);
  }

  function syncAuthUi() {
    const loginButton = $('#loginButton');
    const chip = $('#userChip');
    const chipText = $('#userChipText');
    const primary = $('#primaryNavButton');

    if (!state.auth) {
      chip?.classList.remove('visible');
      if (loginButton) {
        loginButton.textContent = 'Log ind';
        loginButton.onclick = () => openModal('authModal');
      }
      if (primary) primary.textContent = 'Find en fagperson';
      return;
    }

    chip?.classList.add('visible');
    if (chipText) chipText.textContent = state.auth.name || state.auth.email || 'Logget ind';
    if (loginButton) {
      loginButton.textContent = 'Log ud';
      loginButton.onclick = () => {
        clearAuth();
        toast('Du er logget ud.', 'success');
      };
    }
    if (primary) {
      primary.textContent = state.auth.role?.includes('ADMIN')
        ? 'Åbn admin'
        : state.auth.role?.includes('ENTREPRENEUR')
          ? 'Min profil'
          : 'Find en fagperson';
    }
  }

  function bindModals() {
    $$('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.closeModal)));
    $$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('mousedown', e => {
      if (e.target === backdrop) closeModal(backdrop.id);
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') $$('.modal-backdrop.open').forEach(modal => closeModal(modal.id));
    });
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => modal.querySelector('input,select,textarea,button')?.focus());
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    modal?.classList.remove('open');
    if (!document.querySelector('.modal-backdrop.open')) document.body.classList.remove('modal-open');
  }

  function bindAuth() {
    $('#loginButton')?.addEventListener('click', () => !state.auth && openModal('authModal'));
    const loginTab = $('#loginTab');
    const registerTab = $('#registerTab');
    const loginForm = $('#loginForm');
    const registerForm = $('#registerForm');

    const setTab = mode => {
      const login = mode === 'login';
      loginTab?.classList.toggle('active', login);
      registerTab?.classList.toggle('active', !login);
      if (loginForm) loginForm.hidden = !login;
      if (registerForm) registerForm.hidden = login;
      setInlineMessage('authMessage', '', '');
    };

    loginTab?.addEventListener('click', () => setTab('login'));
    registerTab?.addEventListener('click', () => setTab('register'));

    loginForm?.addEventListener('submit', async e => {
      e.preventDefault();
      setInlineMessage('authMessage', '', '');
      const submit = e.currentTarget.querySelector('button[type="submit"]');
      setBusy(submit, true, 'Logger ind…');
      try {
        const data = await api('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: $('#loginEmail').value.trim(), password: $('#loginPassword').value })
        });
        saveAuth(data);
        setInlineMessage('authMessage', data.message || 'Du er logget ind.', 'success');
        toast(`Velkommen${data.name ? `, ${data.name}` : ''}.`, 'success');
        setTimeout(() => {
          closeModal('authModal');
          if (data.role?.includes('ADMIN')) location.href = '/admin.html';
          else if (data.role?.includes('ENTREPRENEUR')) location.href = '/entrepreneur.html';
        }, 450);
      } catch (error) {
        setInlineMessage('authMessage', error.message, 'error');
      } finally { setBusy(submit, false, 'Log ind'); }
    });

    registerForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const submit = e.currentTarget.querySelector('button[type="submit"]');
      setBusy(submit, true, 'Opretter…');
      try {
        const data = await api('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: $('#registerName').value.trim(),
            email: $('#registerEmail').value.trim(),
            password: $('#registerPassword').value
          })
        });
        saveAuth(data);
        setInlineMessage('authMessage', data.message || 'Din konto er oprettet.', 'success');
        toast('Konto oprettet.', 'success');
        setTimeout(() => closeModal('authModal'), 550);
      } catch (error) {
        setInlineMessage('authMessage', error.message, 'error');
      } finally { setBusy(submit, false, 'Opret konto'); }
    });
  }

  function openApplicationFlow() {
    if (!state.auth) {
      openModal('authModal');
      setInlineMessage('authMessage', 'Opret eller log ind på din konto først. Derefter kan du sende din fagpersonansøgning.', 'success');
      return;
    }
    if (state.auth.role?.includes('ENTREPRENEUR')) {
      location.href = '/entrepreneur.html';
      return;
    }
    if (state.auth.role?.includes('ADMIN')) {
      location.href = '/admin.html';
      return;
    }
    openModal('applyModal');
  }

  function bindApplication() {

    $('#applyForm')?.addEventListener('submit', async e => {

      e.preventDefault();

      if (!state.token) {
        return openApplicationFlow();
      }

      // Save the form BEFORE await
      const form = e.currentTarget;

      const submit =
          form.querySelector(
              'button[type="submit"]'
          );

      setBusy(
          submit,
          true,
          'Sender…'
      );

      try {

        await api(
            '/api/entrepreneurs',
            {
              method: 'POST',

              body: JSON.stringify({
                companyName:
                    $('#companyName').value.trim(),

                description:
                    $('#businessDescription').value.trim(),

                phone:
                    $('#businessPhone').value.trim(),

                email:
                    $('#businessEmail').value.trim(),

                location:
                    $('#businessLocation').value.trim(),

                categoryId:
                    Number(
                        $('#businessCategory').value
                    )
              })
            }
        );


        // Success
        setInlineMessage(
            'applyMessage',
            '',
            ''
        );

        toast(
            'Fagpersonprofil sendt til godkendelse.',
            'success'
        );


        // Reset safely
        form.reset();


        setTimeout(
            () => closeModal('applyModal'),
            900
        );

      } catch (error) {

        if (
            error.status === 401 ||
            error.status === 403
        ) {
          clearAuth();
        }

        setInlineMessage(
            'applyMessage',
            error.message,
            'error'
        );

      } finally {

        setBusy(
            submit,
            false,
            'Send ansøgning'
        );
      }
    });
  }

  function bindBrowse() {
    $('#professionalSearch')?.addEventListener('input', e => {
      state.search = e.target.value.trim().toLowerCase();
      renderProfessionals();
    });
    $('#clearFiltersButton')?.addEventListener('click', () => {
      state.activeCategoryId = '';
      state.search = '';
      if ($('#professionalSearch')) $('#professionalSearch').value = '';
      $$('.filter-chip').forEach(btn => btn.classList.toggle('active', btn.dataset.categoryId === ''));
      renderProfessionals();
    });
  }

  async function loadCategories() {
    try {
      const data = await api('/api/categories');
      state.categories = Array.isArray(data) ? data : [];
      renderCategories();
      $('#statCategories').textContent = state.categories.length || '—';
      if ($('#heroCategoryCount')) $('#heroCategoryCount').textContent = state.categories.length || '—';
    } catch (error) {
      console.warn('Categories could not be loaded:', error);
      renderCategoryFallback();
    }
  }

  function renderCategories() {
    const wrap = $('#categoryFilters');
    const select = $('#businessCategory');
    if (!wrap) return;
    wrap.innerHTML = '<button class="filter-chip active" data-category-id="" type="button">Alle fag</button>';
    if (select) select.innerHTML = '<option value="">Vælg kategori</option>';

    state.categories.forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip';
      button.dataset.categoryId = category.id;
      button.innerHTML = `<span>${escapeHtml(displayIcon(category))}</span><span>${escapeHtml(category.name)}</span>`;
      button.addEventListener('click', () => {
        state.activeCategoryId = String(category.id);
        $$('.filter-chip').forEach(btn => btn.classList.toggle('active', btn === button));
        renderProfessionals();
      });
      wrap.appendChild(button);

      if (select) {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${displayIcon(category)} ${category.name}`.trim();
        select.appendChild(option);
      }
    });

    wrap.querySelector('[data-category-id=""]')?.addEventListener('click', e => {
      state.activeCategoryId = '';
      $$('.filter-chip').forEach(btn => btn.classList.toggle('active', btn === e.currentTarget));
      renderProfessionals();
    });
  }

  function renderCategoryFallback() {
    state.categories = [
      ['Maler','🎨'],['Tømrer','🪚'],['Elektriker','⚡'],['VVS','🔧'],['Murer','🧱'],['Gartner','🌿'],['Rengøring','🧹'],['Gulvlægger','🪵']
    ].map((x,i) => ({ id:i+1, name:x[0], icon:x[1] }));
    renderCategories();
  }

  async function loadProfessionals() {
    try {
      const data = await api('/api/entrepreneurs');
      state.professionals = Array.isArray(data) ? data : [];
      $('#statProfessionals').innerHTML = `<span>${state.professionals.length}</span>`;
      renderProfessionals();
    } catch (error) {
      console.warn('Professionals could not be loaded:', error);
      const grid = $('#professionalsGrid');
      if (grid) grid.innerHTML = '<div class="empty-state">Fagpersoner kunne ikke hentes lige nu. Start backend og genindlæs siden.</div>';
    }
  }

  function renderProfessionals() {
    const grid = $('#professionalsGrid');
    if (!grid) return;
    let list = state.professionals;
    if (state.activeCategoryId) list = list.filter(p => String(p.categoryId) === state.activeCategoryId);
    if (state.search) {
      list = list.filter(p => [p.companyName,p.location,p.categoryName,p.description]
        .some(value => String(value || '').toLowerCase().includes(state.search)));
    }

    if (!list.length) {
      grid.innerHTML = '<div class="empty-state">Ingen profiler matcher dit filter endnu.</div>';
      return;
    }

    grid.innerHTML = list.map(p => {
      const rating = Number(p.rating || 0).toFixed(1);
      return `<article class="pro-card">
        <div class="pro-card-head">
          <div class="pro-avatar">${escapeHtml(displayIcon({name:p.categoryName, icon:p.categoryIcon}))}</div>
          <span class="availability ${p.availableForWork ? 'on' : ''}">${p.availableForWork ? 'LEDIG' : 'OPTAGET'}</span>
        </div>
        <h3>${escapeHtml(p.companyName || 'Fagperson')}</h3>
        <div class="category">${escapeHtml(p.categoryName || 'Kategori')}</div>
        <p>${escapeHtml(p.description || 'Ingen beskrivelse endnu.')}</p>
        <div class="pro-info">
          <span class="info-tag">⌖ ${escapeHtml(p.location || 'Område ikke angivet')}</span>
          <span class="info-tag"><span class="star">★</span> ${rating}</span>
        </div>
        <div class="pro-card-foot">
          <a class="contact-link" href="mailto:${encodeURIComponent(p.email || '')}">${escapeHtml(p.email || 'Kontakt')}</a>
          ${p.phone ? `<a class="contact-link" href="tel:${escapeHtml(p.phone)}">${escapeHtml(p.phone)}</a>` : ''}
        </div>
      </article>`;
    }).join('');
  }

  async function loadNews() {
    try {
      const data = await api('/api/news');
      state.news = Array.isArray(data) ? data : [];
      renderNews();
    } catch (error) {
      console.warn('News could not be loaded:', error);
      const grid = $('#newsGrid');
      if (grid) grid.innerHTML = '<div class="empty-state">Der er ingen nyheder at vise lige nu.</div>';
    }
  }

  function renderNews() {
    const grid = $('#newsGrid');
    if (!grid) return;
    const items = state.news.slice(0, 3);
    if (!items.length) {
      grid.innerHTML = '<div class="empty-state">Der er ingen publicerede nyheder endnu.</div>';
      return;
    }
    grid.innerHTML = items.map((news, index) => `<article class="news-card ${index === 0 || news.featured ? 'featured' : ''}">
      <div class="news-image">
        ${news.imageUrl ? `<img src="${escapeAttr(news.imageUrl)}" alt="">` : ''}
        <div class="news-geometry"></div>
      </div>
      <div class="news-body">
        <div class="news-meta">${news.featured ? 'FEATURED · ' : ''}WORKLY NEWS</div>
        <h3>${escapeHtml(news.title || 'Opdatering')}</h3>
        <p>${escapeHtml(news.summary || news.content || '')}</p>
        <div class="news-footer"><span>${escapeHtml(news.authorName || 'Workly')}</span><span>${formatDate(news.publishedAt || news.createdAt)}</span></div>
      </div>
    </article>`).join('');
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    if (busy) {
      button.dataset.label = button.textContent;
      button.disabled = true;
      button.textContent = label;
    } else {
      button.disabled = false;
      button.textContent = button.dataset.label || label;
    }
  }

  function setInlineMessage(id, message, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message || '';
    el.className = `inline-message${message ? ` show ${type || ''}` : ''}`;
  }

  function toast(message, type = '') {
    const stack = $('#toastStack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('da-DK', { day:'2-digit', month:'short', year:'numeric' }).format(date);
  }

  function displayIcon(category) {
    const raw = String(category?.icon || '').trim();
    if (raw && !/\.(png|jpe?g|svg|webp)$/i.test(raw)) return raw;
    const map = {
      'maler':'🎨','tømrer':'🪚','elektriker':'⚡','vvs':'🔧','murer':'🧱',
      'gartner':'🌿','rengøring':'🧹','gulvlægger':'🪵','handyman':'🛠️'
    };
    return map[String(category?.name || '').toLowerCase()] || '◆';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }
  function escapeAttr(value) { return escapeHtml(value); }

  function init3DScene() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.THREE) {
      window.addEventListener('load', () => window.THREE && startScene(), { once:true });
      return;
    }
    startScene();
  }

  function startScene() {
    const canvas = $('#scene-canvas');
    if (!canvas || !window.THREE) return;
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0e1013, 0.05);
    const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 100);
    camera.position.set(0, 0, 15.5);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    renderer.setSize(innerWidth, innerHeight);

    scene.add(new THREE.AmbientLight(0x24313a, .65));
    const key = new THREE.DirectionalLight(0xffffff, .8); key.position.set(5,6,7); scene.add(key);
    const rim = new THREE.DirectionalLight(0x6fe3c4, .8); rim.position.set(-6,-3,-2); scene.add(rim);

    const group = new THREE.Group();
    group.position.set(4.8, 0.3, -4);
    scene.add(group);

    const mint = new THREE.Color(0x6fe3c4);
    const coral = new THREE.Color(0xff6b4a);
    const dark = new THREE.Color(0x252a31);
    const blocks = [];

    for (let i = 0; i < 18; i++) {
      const size = .35 + Math.random() * .42;
      const geometry = new THREE.BoxGeometry(size, size, size);
      const baseColor = i % 8 === 2 ? mint : i % 11 === 6 ? coral : dark;
      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: .42,
        metalness: .16,
        emissive: baseColor.clone().multiplyScalar(i % 8 === 2 ? .07 : .025)
      });
      const cube = new THREE.Mesh(geometry, material);
      const angle = i * .85;
      const radius = 2.1 + (i % 4) * .52;
      cube.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.2) * 2.6, (Math.random() - .5) * 4);
      cube.rotation.set(Math.random()*2, Math.random()*2, Math.random()*2);
      cube.userData.speed = .07 + Math.random() * .12;
      cube.userData.seed = Math.random() * 10;
      group.add(cube);
      blocks.push(cube);
    }

    const ringGeo = new THREE.TorusGeometry(3.4, .015, 8, 90);
    const ringMat = new THREE.MeshBasicMaterial({ color:0x6fe3c4, transparent:true, opacity:.16 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = 1.1;
    group.add(ring);

    const clock = new THREE.Clock();
    let mx = 0, my = 0;
    window.addEventListener('pointermove', e => {
      mx = (e.clientX / innerWidth - .5) * .65;
      my = (e.clientY / innerHeight - .5) * .4;
    }, { passive:true });

    function resize() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      group.position.x = innerWidth < 980 ? 1.6 : 4.8;
    }
    addEventListener('resize', resize);
    resize();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const scroll = window.scrollY / Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      group.rotation.y += ((mx + scroll * .75) - group.rotation.y) * .015;
      group.rotation.x += ((my + .08 + scroll * .2) - group.rotation.x) * .015;
      group.position.y = .3 - scroll * 3.8;
      blocks.forEach((cube, i) => {
        cube.rotation.x += .0015 + cube.userData.speed * .002;
        cube.rotation.y += .002 + cube.userData.speed * .003;
        cube.position.y += Math.sin(t * .45 + cube.userData.seed + i) * .0007;
      });
      ring.rotation.z = t * .035;
      camera.position.x = Math.sin(t * .06) * .12;
      camera.lookAt(0,0,-2);
      renderer.render(scene, camera);
    }
    animate();
    requestAnimationFrame(() => canvas.classList.add('ready'));
  }
})();
