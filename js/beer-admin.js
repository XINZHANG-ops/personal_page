/**
 * Beer Admin Mode — overlay script for pages/beer.html
 *
 * Activates only when URL contains ?admin (e.g. beer.html?admin).
 * Adds: login gate, top toolbar with "Add beer" button, edit/delete buttons
 * on every card, modal form for create/edit.
 *
 * Talks to a Cloudflare Worker that writes to GitHub. Set WORKER_URL below.
 */
(function () {
  'use strict';

  // === CONFIG ===
  const WORKER_URL = 'https://beer-upload.1528371521zx.workers.dev';
  const PW_KEY = 'beer_admin_pw';
  // ==============

  // Activate only when ?admin (or #admin) is present
  const isAdmin = /[?&]admin\b/.test(location.search) || location.hash === '#admin';
  if (!isAdmin) return;

  const STYLES = [
    'IPA (India Pale Ale)', 'Imperial Stout', 'Stout', 'Lager', 'Pilsner',
    'Wheat Beer', 'Porter', 'Lagered Ale', 'Sour Ale', 'Amber Ale',
    'Pale Ale', 'Belgian', 'Brown Ale', 'Barleywine', 'Saison', 'Other',
  ];
  const SCORE_FIELDS = [
    { id: 'maltiness',   label: '麦芽香 Maltiness' },
    { id: 'colorDepth',  label: '颜色深浅 Color Depth' },
    { id: 'clarity',     label: '清澈度 Clarity' },
    { id: 'bitterness',  label: '苦度 Bitterness' },
    { id: 'otherAromas', label: '其他香味 Other Aromas' },
    { id: 'overall',     label: '综合 Overall' },
  ];

  let password = localStorage.getItem(PW_KEY) || '';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    injectStyles();
    if (!password) {
      promptLogin();
    } else {
      enterAdmin();
    }
  }

  function enterAdmin() {
    injectToolbar();
    // Preload jsonl so card buttons have data ready
    ensureBeers().catch(() => {});
    // beer.js renders cards async on DOMContentLoaded; observe the grid
    observeGrid();
  }

  // ---------- Styles ----------
  function injectStyles() {
    const css = `
      :root {
        --badm-bg: #1a1a1a;
        --badm-accent: #c87f2c;
        --badm-accent-dark: #a86919;
        --badm-danger: #b53e3e;
        --badm-text: #2a2a2a;
        --badm-muted: #7a7a7a;
        --badm-border: #e3ddd2;
      }
      .badm-toolbar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
        background: linear-gradient(180deg, #1a1a1a 0%, #242220 100%);
        color: #fff; padding: 10px 18px;
        display: flex; gap: 10px; align-items: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25); font-size: 0.9rem;
        flex-wrap: wrap;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      }
      body.badm-active { padding-top: 56px; }
      body.badm-modal-open { overflow: hidden; }
      .badm-toolbar .badm-tag {
        background: var(--badm-accent); padding: 3px 10px; border-radius: 4px;
        font-weight: 700; letter-spacing: 0.04em; font-size: 0.8rem;
      }
      .badm-toolbar .badm-tagline { color: #cfcfcf; font-size: 0.85rem; }
      .badm-toolbar .badm-spacer { flex: 1; }
      .badm-btn {
        background: var(--badm-accent); color: #fff; border: none;
        padding: 8px 16px; border-radius: 8px; cursor: pointer;
        font-size: 0.9rem; font-weight: 600;
        transition: background 0.15s, transform 0.05s;
        font-family: inherit;
      }
      .badm-btn:hover { background: var(--badm-accent-dark); }
      .badm-btn:active { transform: translateY(1px); }
      .badm-btn.secondary { background: transparent; border: 1px solid #555; color: #ddd; }
      .badm-btn.secondary:hover { background: rgba(255,255,255,0.08); }
      .badm-btn.danger { background: var(--badm-danger); }
      .badm-btn.danger:hover { background: #962f2f; }
      .badm-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

      .beer-card { position: relative; }
      .badm-card-actions {
        position: absolute; top: 10px; right: 10px; z-index: 5;
        display: flex; gap: 6px;
        opacity: 1;
      }
      /* On desktop with hover capability, fade in on hover for cleaner look */
      @media (hover: hover) and (pointer: fine) {
        .badm-card-actions { opacity: 0; transition: opacity 0.15s; }
        .beer-card:hover .badm-card-actions,
        .beer-card:focus-within .badm-card-actions { opacity: 1; }
      }
      .badm-icon-btn {
        background: rgba(0,0,0,0.82); color: #fff; border: none;
        width: 40px; height: 40px; border-radius: 50%;
        font-size: 17px; cursor: pointer; padding: 0;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        -webkit-tap-highlight-color: transparent;
      }
      .badm-icon-btn:hover { background: rgba(0,0,0,0.9); transform: scale(1.05); }
      .badm-icon-btn.delete:hover { background: var(--badm-danger); }

      /* Modal — overlay + scroll lock */
      .badm-modal-overlay {
        position: fixed; inset: 0; background: rgba(20, 18, 14, 0.55);
        backdrop-filter: blur(3px);
        z-index: 10000; display: flex; align-items: center; justify-content: center;
        padding: 16px;
        animation: badm-fade 0.15s ease-out;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      }
      @keyframes badm-fade { from { opacity: 0; } to { opacity: 1; } }
      .badm-modal {
        background: #fff; border-radius: 16px;
        max-width: 540px; width: 100%; max-height: 92vh;
        display: flex; flex-direction: column;
        box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        overflow: hidden;
        animation: badm-pop 0.18s ease-out;
      }
      @keyframes badm-pop {
        from { opacity: 0; transform: scale(0.96) translateY(8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .badm-modal-header {
        padding: 18px 22px 14px;
        border-bottom: 1px solid var(--badm-border);
        background: #faf7f2;
      }
      .badm-modal-header h2 {
        margin: 0; font-size: 1.2rem; color: var(--badm-text); font-weight: 700;
      }
      .badm-modal-header .badm-sub {
        color: var(--badm-muted); font-size: 0.85rem; margin-top: 4px;
      }
      .badm-modal-body {
        padding: 18px 22px; overflow-y: auto; flex: 1;
        -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
        color: var(--badm-text);
      }
      .badm-modal-footer {
        padding: 14px 22px; border-top: 1px solid var(--badm-border);
        background: #fafafa;
      }
      .badm-modal label {
        display: block; font-weight: 600; margin: 14px 0 6px;
        font-size: 0.88rem; color: var(--badm-text);
      }
      .badm-modal label:first-child { margin-top: 0; }
      .badm-modal input[type=text], .badm-modal input[type=number],
      .badm-modal input[type=password], .badm-modal select, .badm-modal textarea {
        width: 100%; padding: 11px 12px; font-size: 16px;
        border: 1px solid var(--badm-border); border-radius: 8px;
        font-family: inherit; box-sizing: border-box;
        background: #fff; color: var(--badm-text);
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .badm-modal input:focus, .badm-modal select:focus, .badm-modal textarea:focus {
        outline: none; border-color: var(--badm-accent);
        box-shadow: 0 0 0 3px rgba(200, 127, 44, 0.12);
      }
      .badm-modal input[readonly] { background: #f5f2ec; color: #6a6a6a; }
      .badm-modal textarea { min-height: 88px; resize: vertical; line-height: 1.5; }
      .badm-modal .badm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .badm-modal h3 {
        margin: 22px 0 6px; font-size: 0.95rem;
        color: var(--badm-muted); text-transform: uppercase;
        letter-spacing: 0.08em; font-weight: 700;
        border-top: 1px solid var(--badm-border); padding-top: 16px;
      }
      .badm-slider { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
      .badm-slider input[type=range] {
        flex: 1; accent-color: var(--badm-accent);
        height: 4px;
      }
      .badm-slider .val {
        min-width: 40px; text-align: right; font-weight: 700;
        color: var(--badm-accent-dark); font-variant-numeric: tabular-nums;
        font-size: 0.95rem;
      }
      .badm-preview {
        max-width: 180px; aspect-ratio: 1/1; object-fit: cover;
        border-radius: 10px; display: block; margin: 10px 0 4px;
        background: #f0ece5; border: 1px solid var(--badm-border);
      }
      .badm-file-group { display: flex; gap: 8px; margin-top: 4px; }
      .badm-file {
        flex: 1; display: flex; align-items: center; justify-content: center;
        padding: 14px 10px; border: 2px dashed var(--badm-border);
        border-radius: 10px; text-align: center; color: var(--badm-text);
        cursor: pointer; background: #faf7f2; font-size: 0.9rem;
        font-weight: 600;
        transition: border-color 0.15s, background 0.15s;
        -webkit-tap-highlight-color: transparent;
      }
      .badm-file:hover, .badm-file:active {
        border-color: var(--badm-accent); background: #fff;
      }
      .badm-file input { display: none; }
      .badm-file-status {
        margin-top: 8px; padding: 8px 12px; font-size: 0.85rem;
        color: var(--badm-muted); text-align: center;
      }
      .badm-actions { display: flex; gap: 10px; }
      .badm-actions button { flex: 1; padding: 12px; font-size: 0.95rem; }
      .badm-status {
        padding: 10px 12px; border-radius: 8px; margin-top: 14px;
        font-size: 0.88rem; white-space: pre-wrap; line-height: 1.45;
      }
      .badm-status.err { background: #fdeaea; color: var(--badm-danger); border: 1px solid #f3c9c9; }
      .badm-status.info { background: #eef2f7; color: #345; border: 1px solid #d6dde6; }
      .badm-status.ok { background: #e7f5ec; color: #2f8a4a; border: 1px solid #c5e6cf; }

      @media (max-width: 600px) {
        .badm-toolbar { padding: 8px 12px; font-size: 0.85rem; }
        .badm-toolbar .badm-tagline { display: none; }
        .badm-modal-overlay { padding: 0; align-items: stretch; }
        .badm-modal { max-height: 100vh; border-radius: 0; }
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---------- Login ----------
  function promptLogin() {
    showModal({
      title: 'Admin login',
      sub: 'Enter the admin password set in the Worker.',
      bodyHtml: `
        <label for="badm-pw">Password</label>
        <input type="password" id="badm-pw" autocomplete="current-password">
      `,
      primaryLabel: 'Unlock',
      onPrimary: (close) => {
        const pw = document.getElementById('badm-pw').value.trim();
        if (!pw) return;
        password = pw;
        localStorage.setItem(PW_KEY, pw);
        close();
        enterAdmin();
      },
      secondaryLabel: 'Cancel',
      onSecondary: (close) => {
        close();
        // Strip ?admin from URL
        history.replaceState(null, '', location.pathname + location.hash);
      },
    });
  }

  // ---------- Toolbar ----------
  function injectToolbar() {
    if (document.querySelector('.badm-toolbar')) return;
    const bar = document.createElement('div');
    bar.className = 'badm-toolbar';
    bar.innerHTML = `
      <span class="badm-tag">ADMIN</span>
      <span class="badm-tagline">Live edits commit to GitHub</span>
      <span class="badm-spacer"></span>
      <button class="badm-btn" id="badm-add">+ Add beer</button>
      <button class="badm-btn secondary" id="badm-logout">Lock</button>
    `;
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.classList.add('badm-active');
    document.getElementById('badm-add').addEventListener('click', () => openForm(null));
    document.getElementById('badm-logout').addEventListener('click', () => {
      localStorage.removeItem(PW_KEY);
      password = '';
      location.search = ''; // reload without ?admin
    });
  }

  // ---------- Inject card actions ----------
  function observeGrid() {
    let lastCount = 0;
    const tryDecorate = () => {
      const cards = document.querySelectorAll('.beer-card');
      cards.forEach(decorateCard);
      if (cards.length !== lastCount) {
        lastCount = cards.length;
        console.log(`[beer-admin] decorated ${cards.length} cards`);
      }
    };
    tryDecorate();
    // Re-decorate when the gallery re-renders (sort/filter)
    const grid = document.getElementById('beer-grid');
    if (grid) {
      new MutationObserver(tryDecorate).observe(grid, { childList: true, subtree: true });
    }
    // Safety net: re-run a few times in case cards render after our observer attaches
    let retries = 0;
    const poll = setInterval(() => {
      tryDecorate();
      if (++retries >= 10) clearInterval(poll);
    }, 500);
  }

  function decorateCard(card) {
    if (card.querySelector('.badm-card-actions')) return;
    const id = card.getAttribute('data-beer-id');
    if (!id) return;

    // Force position:relative inline as a safety net so absolute children anchor here
    if (getComputedStyle(card).position === 'static') {
      card.style.position = 'relative';
    }

    const actions = document.createElement('div');
    actions.className = 'badm-card-actions';
    actions.innerHTML = `
      <button class="badm-icon-btn edit" title="Edit" aria-label="Edit beer">✏️</button>
      <button class="badm-icon-btn delete" title="Delete" aria-label="Delete beer">🗑️</button>
    `;
    actions.querySelector('.edit').addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const beer = await resolveBeer(id);
      if (!beer) return alert('Could not load beer data for ' + id);
      openForm(beer);
    });
    actions.querySelector('.delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const beer = await resolveBeer(id);
      if (!beer) return alert('Could not load beer data for ' + id);
      confirmDelete(beer);
    });
    card.appendChild(actions);
  }

  async function resolveBeer(id) {
    await ensureBeers();
    return beersCache.find((b) => b.id === id) || null;
  }

  // Cache populated by fetchJsonl()
  let beersCache = [];
  let jsonlLoading = null;
  function ensureBeers() {
    if (beersCache.length) return Promise.resolve(beersCache);
    if (jsonlLoading) return jsonlLoading;
    jsonlLoading = fetch('../data/beer.jsonl', { cache: 'no-store' })
      .then((r) => r.text())
      .then((text) => {
        beersCache = text.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
        return beersCache;
      })
      .finally(() => { jsonlLoading = null; });
    return jsonlLoading;
  }

  // ---------- Form modal (create / edit) ----------
  function openForm(beer) {
    renderForm(beer);
  }

  function renderForm(beer) {
    const isEdit = !!beer;
    const scoreSliders = SCORE_FIELDS.map((s) => `
      <label for="badm-${s.id}">${s.label}</label>
      <div class="badm-slider">
        <input type="range" id="badm-${s.id}" min="1" max="10" step="0.5"
               value="${beer?.scores?.[s.id] ?? 7.5}">
        <span class="val" id="badm-${s.id}-val">${beer?.scores?.[s.id] ?? 7.5}</span>
      </div>
    `).join('');

    const styleOptions = STYLES.map((s) =>
      `<option ${beer?.style === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    showModal({
      title: isEdit ? `Edit: ${beer.name}` : 'Add new beer',
      sub: isEdit ? `id: ${beer.id}` : 'Will commit to data/beer.jsonl',
      width: 'wide',
      bodyHtml: `
        <label for="badm-name">Name *</label>
        <input type="text" id="badm-name" value="${escapeAttr(beer?.name ?? '')}" ${isEdit ? 'readonly' : ''} required>
        ${isEdit ? '<div class="badm-sub" style="margin-top:4px">Name is the unique id — to rename, delete and re-add.</div>' : ''}

        <label for="badm-style">Style</label>
        <select id="badm-style">${styleOptions}</select>

        <div class="badm-row">
          <div>
            <label for="badm-abv">ABV (%)</label>
            <input type="number" id="badm-abv" step="0.1" min="0" max="20" value="${beer?.abv ?? 5}">
          </div>
          <div>
            <label for="badm-price">Price ($)</label>
            <input type="number" id="badm-price" step="0.01" min="0" value="${beer?.price ?? 0}">
          </div>
        </div>

        <label for="badm-notes">Notes *</label>
        <textarea id="badm-notes" required>${escapeHtml(beer?.notes ?? '')}</textarea>

        <label>Photo ${isEdit ? '(leave empty to keep existing)' : '*'}</label>
        <div class="badm-file-group">
          <label class="badm-file">
            <input type="file" id="badm-photo-camera" accept="image/*" capture="environment">
            📷 Take photo
          </label>
          <label class="badm-file">
            <input type="file" id="badm-photo-gallery" accept="image/*">
            🖼️ From library
          </label>
        </div>
        <div class="badm-file-status" id="badm-file-label">No photo selected</div>
        <img class="badm-preview" id="badm-preview" style="display:none">

        <h3>Scores (1-10)</h3>
        ${scoreSliders}
      `,
      primaryLabel: isEdit ? 'Save changes' : 'Create beer',
      onPrimary: (close, btn) => submitForm(beer, close, btn),
      secondaryLabel: 'Cancel',
    });

    // Wire sliders
    SCORE_FIELDS.forEach((s) => {
      const inp = document.getElementById(`badm-${s.id}`);
      const val = document.getElementById(`badm-${s.id}-val`);
      inp.addEventListener('input', () => { val.textContent = inp.value; });
    });

    // Photo preview + resize (two inputs: camera + gallery)
    let resizedDataUrl = null;
    const preview = document.getElementById('badm-preview');
    const fileLabel = document.getElementById('badm-file-label');
    const onPhotoChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      fileLabel.textContent = `Processing ${file.name}...`;
      try {
        resizedDataUrl = await resizeImage(file, 1200);
        preview.src = resizedDataUrl;
        preview.style.display = 'block';
        fileLabel.textContent = `✓ ${file.name}`;
      } catch (err) {
        fileLabel.textContent = `❌ Failed to load image: ${err.message || 'unknown error'}`;
      }
    };
    document.getElementById('badm-photo-camera').addEventListener('change', onPhotoChange);
    document.getElementById('badm-photo-gallery').addEventListener('change', onPhotoChange);
    // Expose to submit
    formContext = { beer, getImage: () => resizedDataUrl };
  }

  let formContext = null;

  async function submitForm(existingBeer, close, btn) {
    const isEdit = !!existingBeer;
    const name = document.getElementById('badm-name').value.trim();
    const notes = document.getElementById('badm-notes').value.trim();
    if (!name || !notes) return setModalStatus('Name and notes are required', 'err');

    const scores = {};
    SCORE_FIELDS.forEach((s) => {
      scores[s.id] = parseFloat(document.getElementById(`badm-${s.id}`).value);
    });

    const newImage = formContext?.getImage();
    if (!isEdit && !newImage) return setModalStatus('Please upload a photo', 'err');

    const id = isEdit ? existingBeer.id : sanitize(name);
    const beer = {
      id,
      name,
      style: document.getElementById('badm-style').value,
      abv: parseFloat(document.getElementById('badm-abv').value),
      date: isEdit ? existingBeer.date : new Date().toISOString().slice(0, 10),
      price: parseFloat(document.getElementById('badm-price').value),
      imageUrl: `assets/images/beers/${id}.jpg`,
      notes,
      scores,
    };

    btn.disabled = true; btn.textContent = isEdit ? 'Saving...' : 'Creating...';
    setModalStatus('Talking to GitHub...', 'info');

    try {
      const res = await callWorker({
        action: isEdit ? 'update' : 'create',
        beer,
        imageDataUrl: newImage || null,
      });
      setModalStatus(`✅ Saved! Page rebuilds in ~1-2 min.\nCommit: ${res.commit?.slice(0, 7) || 'ok'}`, 'ok');
      // Refresh local cache
      if (isEdit) {
        const idx = beersCache.findIndex((b) => b.id === id);
        if (idx >= 0) beersCache[idx] = beer;
      } else {
        beersCache.push(beer);
      }
      setTimeout(close, 1500);
    } catch (err) {
      setModalStatus(`❌ ${err.message}`, 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = isEdit ? 'Save changes' : 'Create beer';
    }
  }

  function confirmDelete(beer) {
    showModal({
      title: `Delete "${beer.name}"?`,
      sub: 'Removes the line from data/beer.jsonl. Image file is kept.',
      bodyHtml: '',
      primaryLabel: 'Delete',
      primaryClass: 'danger',
      onPrimary: async (close, btn) => {
        btn.disabled = true; btn.textContent = 'Deleting...';
        setModalStatus('Talking to GitHub...', 'info');
        try {
          const res = await callWorker({ action: 'delete', beer: { id: beer.id } });
          setModalStatus(`✅ Deleted. Commit: ${res.commit?.slice(0, 7) || 'ok'}`, 'ok');
          beersCache = beersCache.filter((b) => b.id !== beer.id);
          removeCardFromDom(beer.id);
          setTimeout(close, 800);
        } catch (err) {
          setModalStatus(`❌ ${err.message}`, 'err');
        } finally {
          btn.disabled = false; btn.textContent = 'Delete';
        }
      },
      secondaryLabel: 'Cancel',
    });
  }

  function removeCardFromDom(id) {
    const card = document.querySelector(`.beer-card[data-beer-id="${cssEscape(id)}"]`);
    if (!card) return;
    card.style.transition = 'opacity 0.25s, transform 0.25s';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.92)';
    setTimeout(() => card.remove(), 260);
  }

  // Safe selector escape (id may contain hyphens but to be safe)
  function cssEscape(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/["\\]/g, '\\$&');
  }

  // ---------- Worker call ----------
  async function callWorker(payload) {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem(PW_KEY); password = '';
      }
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  }

  // ---------- Modal infra ----------
  let modalEscHandler = null;

  function showModal({ title, sub, bodyHtml, primaryLabel, onPrimary,
                       secondaryLabel, onSecondary, primaryClass = '' }) {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'badm-modal-overlay';
    overlay.innerHTML = `
      <div class="badm-modal" role="dialog" aria-modal="true">
        <div class="badm-modal-header">
          <h2>${escapeHtml(title)}</h2>
          ${sub ? `<div class="badm-sub">${escapeHtml(sub)}</div>` : ''}
        </div>
        <div class="badm-modal-body">
          ${bodyHtml}
          <div class="badm-status" style="display:none" id="badm-status"></div>
        </div>
        <div class="badm-modal-footer">
          <div class="badm-actions">
            ${secondaryLabel ? `<button class="badm-btn secondary" data-act="secondary">${escapeHtml(secondaryLabel)}</button>` : ''}
            <button class="badm-btn ${primaryClass}" data-act="primary">${escapeHtml(primaryLabel)}</button>
          </div>
        </div>
      </div>
    `;
    // Only close on overlay-background click (not on modal content)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    // Prevent body scroll while modal is open
    document.body.classList.add('badm-modal-open');
    document.body.appendChild(overlay);

    const primaryBtn = overlay.querySelector('[data-act="primary"]');
    primaryBtn.addEventListener('click', () => onPrimary?.(closeModal, primaryBtn));
    const secBtn = overlay.querySelector('[data-act="secondary"]');
    if (secBtn) secBtn.addEventListener('click', () => (onSecondary || (() => closeModal()))(closeModal));

    // ESC to close
    modalEscHandler = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', modalEscHandler);
  }

  function closeModal() {
    document.querySelectorAll('.badm-modal-overlay').forEach((el) => el.remove());
    document.body.classList.remove('badm-modal-open');
    if (modalEscHandler) {
      document.removeEventListener('keydown', modalEscHandler);
      modalEscHandler = null;
    }
  }

  function setModalStatus(msg, type) {
    const el = document.getElementById('badm-status');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = msg;
    el.className = 'badm-status ' + type;
  }

  // ---------- Utils ----------
  function sanitize(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function resizeImage(file, size) {
    // Honor EXIF orientation (iPhone/Android portrait photos store raw pixels
    // sideways + a rotate flag; canvas ignores the flag without this option).
    let bitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Fallback for very old browsers — at least let <img> handle EXIF on load
      bitmap = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    const srcW = bitmap.width;
    const srcH = bitmap.height;
    const ratio = Math.min(size / srcW, size / srcH, 1);
    const w = Math.round(srcW * ratio);
    const h = Math.round(srcH * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
    if (bitmap.close) bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
