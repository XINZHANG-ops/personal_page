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
    // beer.js renders cards async on DOMContentLoaded; observe the grid
    observeGrid();
  }

  // ---------- Styles ----------
  function injectStyles() {
    const css = `
      .badm-toolbar {
        position: sticky; top: 0; z-index: 50;
        background: #1a1a1a; color: #fff;
        padding: 10px 16px; display: flex; gap: 8px; align-items: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 0.9rem;
      }
      .badm-toolbar .badm-tag { background: #c87f2c; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
      .badm-toolbar .badm-spacer { flex: 1; }
      .badm-btn {
        background: #c87f2c; color: #fff; border: none;
        padding: 8px 14px; border-radius: 6px; cursor: pointer;
        font-size: 0.9rem; font-weight: 600;
      }
      .badm-btn.secondary { background: transparent; border: 1px solid #555; color: #ddd; }
      .badm-btn.danger { background: #b53e3e; }
      .badm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .beer-card { position: relative; }
      .badm-card-actions {
        position: absolute; top: 8px; right: 8px; z-index: 5;
        display: flex; gap: 4px;
      }
      .badm-icon-btn {
        background: rgba(0,0,0,0.7); color: #fff; border: none;
        width: 32px; height: 32px; border-radius: 50%;
        font-size: 14px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }
      .badm-icon-btn:hover { background: rgba(0,0,0,0.9); }
      .badm-icon-btn.delete:hover { background: #b53e3e; }

      .badm-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.6);
        z-index: 1000; display: flex; align-items: flex-start; justify-content: center;
        padding: 20px; overflow-y: auto;
      }
      .badm-modal {
        background: #fff; border-radius: 12px; max-width: 560px; width: 100%;
        padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      }
      .badm-modal h2 { margin: 0 0 4px; font-size: 1.25rem; }
      .badm-modal .badm-sub { color: #777; font-size: 0.85rem; margin-bottom: 16px; }
      .badm-modal label { display: block; font-weight: 600; margin: 12px 0 6px; font-size: 0.9rem; }
      .badm-modal input[type=text], .badm-modal input[type=number],
      .badm-modal input[type=password], .badm-modal select, .badm-modal textarea {
        width: 100%; padding: 10px; font-size: 16px;
        border: 1px solid #ddd; border-radius: 6px; font-family: inherit;
        box-sizing: border-box;
      }
      .badm-modal textarea { min-height: 80px; resize: vertical; }
      .badm-modal .badm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .badm-slider { display: flex; align-items: center; gap: 10px; }
      .badm-slider input[type=range] { flex: 1; }
      .badm-slider .val { min-width: 36px; text-align: right; font-weight: 600; color: #a86919; }
      .badm-preview {
        max-width: 200px; aspect-ratio: 1/1; object-fit: cover;
        border-radius: 6px; display: block; margin: 8px 0; background: #f0ece5;
      }
      .badm-actions { display: flex; gap: 8px; margin-top: 20px; }
      .badm-actions button { flex: 1; padding: 12px; font-size: 1rem; }
      .badm-status { padding: 10px; border-radius: 6px; margin-top: 12px; font-size: 0.9rem; white-space: pre-wrap; }
      .badm-status.err { background: #fdeaea; color: #b53e3e; }
      .badm-status.info { background: #eef2f7; color: #345; }
      .badm-status.ok { background: #e7f5ec; color: #2f8a4a; }
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
      <span>Editing live data — changes commit to GitHub</span>
      <span class="badm-spacer"></span>
      <button class="badm-btn" id="badm-add">+ Add beer</button>
      <button class="badm-btn secondary" id="badm-logout">Lock</button>
    `;
    document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById('badm-add').addEventListener('click', () => openForm(null));
    document.getElementById('badm-logout').addEventListener('click', () => {
      localStorage.removeItem(PW_KEY);
      password = '';
      location.search = ''; // reload without ?admin
    });
  }

  // ---------- Inject card actions ----------
  function observeGrid() {
    const tryDecorate = () => {
      const cards = document.querySelectorAll('.beer-card');
      cards.forEach(decorateCard);
    };
    tryDecorate();
    // Re-decorate when the gallery re-renders (sort/filter)
    const grid = document.getElementById('beer-grid');
    if (grid) {
      new MutationObserver(tryDecorate).observe(grid, { childList: true });
    }
  }

  function decorateCard(card) {
    if (card.querySelector('.badm-card-actions')) return;
    const id = card.getAttribute('data-beer-id');
    const beer = findBeer(id);
    if (!beer) return;

    const actions = document.createElement('div');
    actions.className = 'badm-card-actions';
    actions.innerHTML = `
      <button class="badm-icon-btn edit" title="Edit">✏️</button>
      <button class="badm-icon-btn delete" title="Delete">🗑️</button>
    `;
    actions.querySelector('.edit').addEventListener('click', (e) => {
      e.stopPropagation();
      openForm(beer);
    });
    actions.querySelector('.delete').addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDelete(beer);
    });
    card.appendChild(actions);
  }

  function findBeer(id) {
    // beer.js exposes the data through internal scope; we can't access it directly.
    // Read the rendered card to reconstruct a minimal beer object for editing seeding.
    // For full fidelity we hit the Worker to fetch beer.jsonl. Use a small cache.
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
    ensureBeers().then(() => {
      // Re-find if we just loaded
      if (beer) beer = beersCache.find((b) => b.id === beer.id) || beer;
      renderForm(beer);
    });
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

        <label for="badm-photo">Photo ${isEdit ? '(leave empty to keep existing)' : '*'}</label>
        <input type="file" id="badm-photo" accept="image/*" capture="environment">
        <img class="badm-preview" id="badm-preview" style="display:none">

        <h3 style="margin-top:16px">Scores (1-10)</h3>
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

    // Photo preview + resize
    let resizedDataUrl = null;
    const photoInput = document.getElementById('badm-photo');
    const preview = document.getElementById('badm-preview');
    photoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) { resizedDataUrl = null; preview.style.display = 'none'; return; }
      resizedDataUrl = await resizeImage(file, 1200);
      preview.src = resizedDataUrl;
      preview.style.display = 'block';
    });
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
          setTimeout(close, 1200);
        } catch (err) {
          setModalStatus(`❌ ${err.message}`, 'err');
        } finally {
          btn.disabled = false; btn.textContent = 'Delete';
        }
      },
      secondaryLabel: 'Cancel',
    });
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
  function showModal({ title, sub, bodyHtml, primaryLabel, onPrimary,
                       secondaryLabel, onSecondary, primaryClass = '' }) {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'badm-modal-overlay';
    overlay.innerHTML = `
      <div class="badm-modal" role="dialog" aria-modal="true">
        <h2>${escapeHtml(title)}</h2>
        ${sub ? `<div class="badm-sub">${escapeHtml(sub)}</div>` : ''}
        <div class="badm-body">${bodyHtml}</div>
        <div class="badm-status" style="display:none" id="badm-status"></div>
        <div class="badm-actions">
          ${secondaryLabel ? `<button class="badm-btn secondary" data-act="secondary">${escapeHtml(secondaryLabel)}</button>` : ''}
          <button class="badm-btn ${primaryClass}" data-act="primary">${escapeHtml(primaryLabel)}</button>
        </div>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);

    const primaryBtn = overlay.querySelector('[data-act="primary"]');
    primaryBtn.addEventListener('click', () => onPrimary?.(closeModal, primaryBtn));
    const secBtn = overlay.querySelector('[data-act="secondary"]');
    if (secBtn) secBtn.addEventListener('click', () => (onSecondary || (() => {}))(closeModal));
  }

  function closeModal() {
    document.querySelectorAll('.badm-modal-overlay').forEach((el) => el.remove());
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

  function resizeImage(file, size) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const ratio = Math.min(size / img.width, size / img.height, 1);
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
