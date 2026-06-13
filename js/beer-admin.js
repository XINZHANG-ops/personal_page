/**
 * Beer Admin Mode — overlay script for pages/beer.html
 *
 * Activates only when URL contains ?admin (e.g. beer.html?admin).
 * Adds: login gate, top toolbar, edit/delete buttons on every card,
 * modal form for create/edit.
 *
 * Changes are queued locally (localStorage). One Sync click sends the
 * entire queue to the Cloudflare Worker, which commits all changes
 * (jsonl + every image) in a SINGLE git commit.
 */
(function () {
  'use strict';

  // === CONFIG ===
  const WORKER_URL = 'https://beer-upload.1528371521zx.workers.dev';
  const PW_KEY = 'beer_admin_pw';
  const PENDING_KEY = 'beer_admin_pending_v1';
  // ==============

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
    ensureBeers().then(() => {
      replayPendingToUI();
    }).catch(() => {});
    observeGrid();
    refreshToolbar();
  }

  // ---------- Pending queue (localStorage) ----------
  // Stored as an array of operations preserving insertion order:
  //   { action: 'create'|'update'|'delete', beer, imageDataUrl? }
  // We dedupe per-id so the queue stays minimal — see queueOp.
  function loadPending() {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function savePending(ops) {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(ops));
    } catch (e) {
      alert('LocalStorage is full — please Sync now or Discard. ' + (e.message || ''));
    }
  }
  function clearPending() { localStorage.removeItem(PENDING_KEY); }

  // Merge a new op into the queue, collapsing per-id so we never carry
  // redundant work. Rules:
  //   existing create + new update  -> create (with merged beer)
  //   existing create + new delete  -> remove from queue (cancels out)
  //   existing update + new update  -> update (last wins)
  //   existing update + new delete  -> delete
  //   no existing                   -> append
  function queueOp(op) {
    const ops = loadPending();
    const idx = ops.findIndex((o) => o.beer.id === op.beer.id);

    if (idx < 0) {
      ops.push(op);
    } else {
      const prev = ops[idx];
      if (prev.action === 'create' && op.action === 'delete') {
        // Cancel: never created on the server, just drop it
        ops.splice(idx, 1);
      } else if (prev.action === 'create') {
        // Stay as create, but update fields (and image if new one provided)
        ops[idx] = {
          action: 'create',
          beer: op.beer,
          imageDataUrl: op.imageDataUrl || prev.imageDataUrl,
        };
      } else if (op.action === 'delete') {
        ops[idx] = { action: 'delete', beer: { id: op.beer.id, name: op.beer.name } };
      } else {
        // update + update — last wins
        ops[idx] = {
          action: 'update',
          beer: op.beer,
          imageDataUrl: op.imageDataUrl || prev.imageDataUrl,
        };
      }
    }
    savePending(ops);
    return ops;
  }

  function pendingForId(id) {
    return loadPending().find((o) => o.beer.id === id) || null;
  }

  // Apply all pending ops to the in-memory beersCache + the live gallery.
  // Called once after page load so the user sees their unsaved changes.
  function replayPendingToUI() {
    const ops = loadPending();
    for (const op of ops) applyOpToUI(op);
    decorateAllPendingCards();
    refreshToolbar();
  }

  function applyOpToUI(op) {
    if (op.action === 'delete') {
      beersCache = beersCache.filter((b) => b.id !== op.beer.id);
      if (window.__beerAPI) window.__beerAPI.remove(op.beer.id);
      return;
    }
    // create or update
    const idx = beersCache.findIndex((b) => b.id === op.beer.id);
    if (idx >= 0) beersCache[idx] = op.beer; else beersCache.push(op.beer);
    if (window.__beerAPI) {
      const displayBeer = op.imageDataUrl
        ? Object.assign({}, op.beer, { imageUrl: op.imageDataUrl })
        : op.beer;
      window.__beerAPI.upsert(displayBeer);
    }
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
        --badm-warn: #e0a82e;
      }
      .badm-toolbar {
        position: fixed; top: 14px; right: 14px; z-index: 9999;
        background: rgba(26, 26, 26, 0.94);
        backdrop-filter: blur(8px);
        color: #fff; padding: 8px 10px 8px 14px;
        display: flex; gap: 8px; align-items: center;
        border-radius: 999px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25); font-size: 0.85rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        flex-wrap: wrap;
        max-width: calc(100vw - 28px);
      }
      body.badm-modal-open { overflow: hidden; }
      .badm-toolbar .badm-tag {
        background: var(--badm-accent); padding: 2px 9px; border-radius: 999px;
        font-weight: 700; letter-spacing: 0.06em; font-size: 0.72rem;
      }
      .badm-toolbar .badm-count {
        background: var(--badm-warn); color: #2a1f00;
        padding: 2px 9px; border-radius: 999px;
        font-weight: 700; font-size: 0.75rem;
        display: none;
      }
      .badm-toolbar.has-pending .badm-count { display: inline-block; }
      .badm-toolbar .badm-pill {
        background: transparent; border: 1px solid rgba(255,255,255,0.25);
        color: #fff; padding: 5px 12px; border-radius: 999px;
        font-size: 0.8rem; font-weight: 600; cursor: pointer;
        transition: background 0.15s, opacity 0.15s;
        font-family: inherit;
      }
      .badm-toolbar .badm-pill:hover:not(:disabled) { background: rgba(255,255,255,0.12); }
      .badm-toolbar .badm-pill:disabled { opacity: 0.4; cursor: not-allowed; }
      .badm-toolbar .badm-pill.primary {
        background: var(--badm-accent); border-color: var(--badm-accent);
      }
      .badm-toolbar .badm-pill.primary:hover:not(:disabled) { background: var(--badm-accent-dark); }
      .badm-toolbar .badm-pill.danger { color: #ffb3b3; border-color: rgba(255, 100, 100, 0.4); }
      .badm-toolbar .badm-pill.danger:hover:not(:disabled) { background: rgba(255, 80, 80, 0.15); }

      /* + Add beer card */
      .badm-add-card {
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        min-height: 220px;
        background: #fafaf6;
        border: 2px dashed #cfc6b4;
        border-radius: var(--border-radius, 12px);
        color: #8a7a55;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s, transform 0.05s;
        -webkit-tap-highlight-color: transparent;
      }
      .badm-add-card:hover {
        border-color: var(--badm-accent);
        background: #fff;
        color: var(--badm-accent-dark);
      }
      .badm-add-card:active { transform: scale(0.99); }
      .badm-add-card .plus { font-size: 3rem; line-height: 1; margin-bottom: 6px; }
      .badm-add-card .label { font-weight: 700; font-size: 1rem; letter-spacing: 0.02em; }
      .badm-add-card .sub { font-size: 0.8rem; color: #a89868; margin-top: 4px; }

      /* Password eye toggle */
      .badm-pw-wrap { position: relative; }
      .badm-pw-wrap input { padding-right: 42px !important; }
      .badm-pw-eye {
        position: absolute; top: 50%; right: 8px; transform: translateY(-50%);
        background: transparent; border: none; cursor: pointer;
        font-size: 18px; padding: 6px 8px; border-radius: 6px;
        color: var(--badm-muted); line-height: 1;
        -webkit-tap-highlight-color: transparent;
      }
      .badm-pw-eye:hover { background: rgba(0,0,0,0.05); color: var(--badm-text); }
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

      /* Pending change badge on a card */
      .beer-card.badm-pending::before {
        content: ''; position: absolute; top: 8px; left: 8px;
        width: 12px; height: 12px; border-radius: 50%;
        background: var(--badm-warn); z-index: 5;
        box-shadow: 0 0 0 3px rgba(255,255,255,0.85), 0 2px 6px rgba(0,0,0,0.25);
        animation: badm-pulse 1.8s ease-in-out infinite;
      }
      @keyframes badm-pulse {
        0%,100% { transform: scale(1); }
        50% { transform: scale(1.18); }
      }
      .beer-card.badm-pending.badm-pending-new::after {
        content: 'NEW'; position: absolute; top: 6px; left: 26px;
        background: #2f8a4a; color: #fff; padding: 1px 6px;
        font-size: 0.65rem; font-weight: 800; letter-spacing: 0.08em;
        border-radius: 999px; z-index: 5;
      }
      .beer-card.badm-pending.badm-pending-edit::after {
        content: 'EDITED'; position: absolute; top: 6px; left: 26px;
        background: var(--badm-warn); color: #2a1f00; padding: 1px 6px;
        font-size: 0.65rem; font-weight: 800; letter-spacing: 0.08em;
        border-radius: 999px; z-index: 5;
      }

      /* Modal */
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
      .badm-modal .badm-file {
        display: flex; align-items: center; justify-content: center;
        gap: 10px;
        margin: 0;
        padding: 14px 10px; border: 2px dashed var(--badm-border);
        border-radius: 10px; color: var(--badm-text); text-align: center;
        cursor: pointer; background: #faf7f2; font-size: 0.9rem;
        font-weight: 600;
        transition: border-color 0.15s, background 0.15s;
        -webkit-tap-highlight-color: transparent;
        min-height: 48px; box-sizing: border-box;
      }
      .badm-modal .badm-file:hover,
      .badm-modal .badm-file:active {
        border-color: var(--badm-accent); background: #fff;
      }
      .badm-modal .badm-file input { display: none; }
      .badm-modal .badm-file .icon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 22px; height: 22px; font-size: 18px; flex-shrink: 0;
      }
      .badm-modal .badm-file .text { white-space: nowrap; }
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

      /* Pending list inside Sync/Discard confirm modal */
      .badm-pending-list {
        list-style: none; padding: 0; margin: 6px 0 0;
        max-height: 240px; overflow-y: auto;
        border: 1px solid var(--badm-border); border-radius: 8px;
        background: #faf7f2;
      }
      .badm-pending-list li {
        padding: 8px 12px; border-bottom: 1px solid #ede7d8;
        font-size: 0.9rem; display: flex; gap: 8px; align-items: baseline;
      }
      .badm-pending-list li:last-child { border-bottom: none; }
      .badm-pending-list .tag {
        font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em;
        padding: 1px 7px; border-radius: 999px; flex-shrink: 0;
      }
      .badm-pending-list .tag.create { background: #d6f0df; color: #2f8a4a; }
      .badm-pending-list .tag.update { background: #fbecc4; color: #8a6500; }
      .badm-pending-list .tag.delete { background: #f9d6d6; color: var(--badm-danger); }

      @media (max-width: 600px) {
        .badm-toolbar { top: 10px; right: 10px; padding: 6px 8px 6px 12px; font-size: 0.8rem; gap: 6px; }
        .badm-toolbar .badm-pill { padding: 5px 10px; font-size: 0.78rem; }
        .badm-modal-overlay { padding: 0; align-items: stretch; }
        .badm-modal { max-height: 100vh; border-radius: 0; }
        .badm-add-card { min-height: 180px; }
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
        <div class="badm-pw-wrap">
          <input type="password" id="badm-pw" autocomplete="current-password">
          <button type="button" class="badm-pw-eye" id="badm-pw-eye"
                  aria-label="Show password" title="Show password">👁️</button>
        </div>
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
        history.replaceState(null, '', location.pathname + location.hash);
      },
    });
    const eye = document.getElementById('badm-pw-eye');
    const pwInput = document.getElementById('badm-pw');
    if (eye && pwInput) {
      eye.addEventListener('click', () => {
        const showing = pwInput.type === 'text';
        pwInput.type = showing ? 'password' : 'text';
        eye.textContent = showing ? '👁️' : '🙈';
        eye.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
        eye.setAttribute('title', showing ? 'Show password' : 'Hide password');
        pwInput.focus();
      });
      pwInput.focus();
    }
  }

  // ---------- Toolbar ----------
  function injectToolbar() {
    if (document.querySelector('.badm-toolbar')) return;
    const bar = document.createElement('div');
    bar.className = 'badm-toolbar';
    bar.id = 'badm-toolbar';
    bar.innerHTML = `
      <span class="badm-tag">ADMIN</span>
      <span class="badm-count" id="badm-pending-count">0</span>
      <button class="badm-pill primary" id="badm-sync" disabled
              title="Push every pending change to GitHub in a single commit">Sync</button>
      <button class="badm-pill danger" id="badm-discard" disabled
              title="Throw away every pending change">Discard</button>
      <button class="badm-pill" id="badm-logout"
              title="Leave admin mode (pending changes stay until next visit)">Exit</button>
    `;
    document.body.appendChild(bar);
    document.getElementById('badm-logout').addEventListener('click', () => {
      localStorage.removeItem(PW_KEY);
      password = '';
      location.search = '';
    });
    document.getElementById('badm-sync').addEventListener('click', confirmSync);
    document.getElementById('badm-discard').addEventListener('click', confirmDiscard);
  }

  function refreshToolbar() {
    const bar = document.getElementById('badm-toolbar');
    if (!bar) return;
    const ops = loadPending();
    const n = ops.length;
    bar.classList.toggle('has-pending', n > 0);
    const countEl = document.getElementById('badm-pending-count');
    if (countEl) countEl.textContent = `${n} pending`;
    const sync = document.getElementById('badm-sync');
    const discard = document.getElementById('badm-discard');
    if (sync) sync.disabled = n === 0;
    if (discard) discard.disabled = n === 0;
  }

  // ---------- "+ Add beer" card ----------
  function ensureAddCard() {
    const grid = document.getElementById('beer-grid');
    if (!grid) return;
    if (grid.querySelector('.badm-add-card')) {
      const card = grid.querySelector('.badm-add-card');
      if (grid.firstChild !== card) grid.insertBefore(card, grid.firstChild);
      return;
    }
    const card = document.createElement('div');
    card.className = 'badm-add-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <span class="plus">+</span>
      <span class="label">Add beer</span>
      <span class="sub">Queued locally — Sync to push</span>
    `;
    const open = () => openForm(null);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    grid.insertBefore(card, grid.firstChild);
  }

  // ---------- Card decoration ----------
  function observeGrid() {
    let lastCount = 0;
    const tryDecorate = () => {
      ensureAddCard();
      const cards = document.querySelectorAll('.beer-card');
      cards.forEach(decorateCard);
      decorateAllPendingCards();
      if (cards.length !== lastCount) {
        lastCount = cards.length;
        console.log(`[beer-admin] decorated ${cards.length} cards`);
      }
    };
    tryDecorate();
    const grid = document.getElementById('beer-grid');
    if (grid) {
      new MutationObserver(tryDecorate).observe(grid, { childList: true, subtree: true });
    }
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
      queueDelete(beer);
    });
    card.appendChild(actions);
  }

  function decorateAllPendingCards() {
    const ops = loadPending();
    const byId = new Map(ops.map((o) => [o.beer.id, o.action]));
    document.querySelectorAll('.beer-card').forEach((card) => {
      const id = card.getAttribute('data-beer-id');
      if (!id) return;
      card.classList.remove('badm-pending', 'badm-pending-new', 'badm-pending-edit');
      const action = byId.get(id);
      if (!action) return;
      card.classList.add('badm-pending');
      if (action === 'create') card.classList.add('badm-pending-new');
      else if (action === 'update') card.classList.add('badm-pending-edit');
    });
  }

  async function resolveBeer(id) {
    await ensureBeers();
    return beersCache.find((b) => b.id === id) || null;
  }

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

  // ---------- Form modal ----------
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
      sub: isEdit ? `id: ${beer.id} — queued locally until you Sync` : 'Queued locally — click Sync to push to GitHub',
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
        <label class="badm-file">
          <input type="file" id="badm-photo-gallery" accept="image/*">
          <span class="icon">🖼️</span><span class="text">Choose photo</span>
        </label>
        <div class="badm-file-status" id="badm-file-label">No photo selected</div>
        <img class="badm-preview" id="badm-preview" style="display:none">

        <h3>Scores (1-10)</h3>
        ${scoreSliders}
      `,
      primaryLabel: isEdit ? 'Save changes' : 'Add to queue',
      onPrimary: (close, btn) => submitForm(beer, close, btn),
      secondaryLabel: 'Cancel',
    });

    SCORE_FIELDS.forEach((s) => {
      const inp = document.getElementById(`badm-${s.id}`);
      const val = document.getElementById(`badm-${s.id}-val`);
      inp.addEventListener('input', () => { val.textContent = inp.value; });
    });

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
    document.getElementById('badm-photo-gallery').addEventListener('change', onPhotoChange);
    formContext = { beer, getImage: () => resizedDataUrl };
  }

  let formContext = null;

  function submitForm(existingBeer, close, btn) {
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
    // Block create for an id that already exists (either committed or pending)
    if (!isEdit) {
      if (beersCache.find((b) => b.id === id) || pendingForId(id)) {
        return setModalStatus(`A beer with id "${id}" already exists`, 'err');
      }
    }

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

    // Determine queue action — if this id was queued as 'create', stay 'create'.
    const existingPending = pendingForId(id);
    const queueAction = !isEdit
      ? 'create'
      : (existingPending?.action === 'create' ? 'create' : 'update');

    try {
      queueOp({
        action: queueAction,
        beer,
        imageDataUrl: newImage || null,
      });
    } catch (err) {
      return setModalStatus(`❌ Could not queue: ${err.message}`, 'err');
    }

    // Apply to UI immediately
    applyOpToUI({ action: queueAction, beer, imageDataUrl: newImage });
    decorateAllPendingCards();
    refreshToolbar();

    setModalStatus('✓ Queued. Click Sync in the toolbar when ready.', 'ok');
    setTimeout(close, 700);
  }

  function queueDelete(beer) {
    showModal({
      title: `Delete "${beer.name}"?`,
      sub: 'This queues the deletion. It will not be committed until you click Sync.',
      bodyHtml: '',
      primaryLabel: 'Queue delete',
      primaryClass: 'danger',
      onPrimary: (close) => {
        queueOp({ action: 'delete', beer: { id: beer.id, name: beer.name } });
        applyOpToUI({ action: 'delete', beer });
        decorateAllPendingCards();
        refreshToolbar();
        close();
      },
      secondaryLabel: 'Cancel',
    });
  }

  // ---------- Sync ----------
  function confirmSync() {
    const ops = loadPending();
    if (!ops.length) return;
    const list = ops.map((o) => `
      <li>
        <span class="tag ${o.action}">${o.action.toUpperCase()}</span>
        <span>${escapeHtml(o.beer.name || o.beer.id)}</span>
      </li>
    `).join('');

    showModal({
      title: `Sync ${ops.length} change${ops.length === 1 ? '' : 's'} to GitHub`,
      sub: 'Everything below will be committed in a single git commit.',
      bodyHtml: `<ul class="badm-pending-list">${list}</ul>`,
      primaryLabel: 'Sync now',
      onPrimary: async (close, btn) => {
        btn.disabled = true; btn.textContent = 'Syncing...';
        setModalStatus('Talking to GitHub...', 'info');
        try {
          const res = await callWorker({ action: 'batch', operations: ops });
          clearPending();
          refreshToolbar();
          decorateAllPendingCards();
          const s = res.summary || {};
          const summary = [
            s.created ? `${s.created} added` : null,
            s.updated ? `${s.updated} updated` : null,
            s.deleted ? `${s.deleted} deleted` : null,
          ].filter(Boolean).join(', ');
          setModalStatus(`✅ Committed ${res.commit?.slice(0, 7) || ''} — ${summary || 'no-op'}.\nSite redeploy in ~1-2 min.`, 'ok');
          setTimeout(close, 1600);
        } catch (err) {
          setModalStatus(`❌ ${err.message}`, 'err');
          btn.disabled = false; btn.textContent = 'Retry sync';
        }
      },
      secondaryLabel: 'Cancel',
    });
  }

  function confirmDiscard() {
    const ops = loadPending();
    if (!ops.length) return;
    showModal({
      title: `Discard ${ops.length} pending change${ops.length === 1 ? '' : 's'}?`,
      sub: 'Nothing on GitHub will change. Page will reload.',
      bodyHtml: '',
      primaryLabel: 'Discard',
      primaryClass: 'danger',
      onPrimary: (close) => {
        clearPending();
        close();
        location.reload();
      },
      secondaryLabel: 'Keep',
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
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.body.classList.add('badm-modal-open');
    document.body.appendChild(overlay);

    const primaryBtn = overlay.querySelector('[data-act="primary"]');
    primaryBtn.addEventListener('click', () => onPrimary?.(closeModal, primaryBtn));
    const secBtn = overlay.querySelector('[data-act="secondary"]');
    if (secBtn) secBtn.addEventListener('click', () => (onSecondary || (() => closeModal()))(closeModal));

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
    let bitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
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
    const cropSide = Math.min(srcW, srcH);
    const sx = Math.round((srcW - cropSide) / 2);
    const sy = Math.round((srcH - cropSide) / 2);
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, sx, sy, cropSide, cropSide, 0, 0, size, size);
    if (bitmap.close) bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
