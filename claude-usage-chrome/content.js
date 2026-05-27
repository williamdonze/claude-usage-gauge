// content.js v9

(function () {
  "use strict";

  const BASE = "https://claude.ai";
  let gaugeEl = null;
  let orgId = null;

  function log(...args) { console.log("[ClaudeUsage]", ...args); }

  async function getOrgId() {
    if (orgId) return orgId;
    try {
      const m = document.cookie.match(/lastActiveOrg=([a-f0-9-]{36})/i);
      if (m) { orgId = m[1]; return orgId; }
    } catch(e) {}
    try {
      const res = await fetch(`${BASE}/api/organizations`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const id = data?.[0]?.uuid || data?.[0]?.id;
        if (id) { orgId = id; return id; }
      }
    } catch(e) {}
    return null;
  }

  async function fetchUsage() {
    const id = await getOrgId();
    if (!id) return null;
    try {
      const res = await fetch(`${BASE}/api/organizations/${id}/usage`, { credentials: "include" });
      if (!res.ok) return null;
      return await res.json();
    } catch(e) { return null; }
  }

  function formatReset(iso) {
    if (!iso) return "";
    const diff = new Date(iso) - Date.now();
    if (diff <= 0) return "reset imminent";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `↺ ${h}h${m.toString().padStart(2,"0")}` : `↺ ${m}m`;
  }

  function color(pct) {
    if (pct == null) return "#9ca3af";
    if (pct < 50) return "#16a34a";
    if (pct < 75) return "#d97706";
    if (pct < 90) return "#ea580c";
    return "#dc2626";
  }

  function buildGauge() {
    const el = document.createElement("div");
    el.id = "claude-usage-gauge";
    el.innerHTML = `
      <div class="cug-bar-wrap">
        <div class="cug-bar-track">
          <div class="cug-bar-fill" id="cug-fill"></div>
        </div>
        <div class="cug-bar-labels">
          <span class="cug-label-left">
            <span class="cug-dot" id="cug-dot"></span>
            <span class="cug-session-label">Session 5h</span>
            <span class="cug-pct-val" id="cug-5h-pct"></span>
            <span class="cug-reset-val" id="cug-5h-rst"></span>
          </span>
          <span class="cug-label-right">
            <span class="cug-week-label">7 jours :</span>
            <span class="cug-week-pct" id="cug-7d-pct"></span>
          </span>
        </div>
      </div>
    `;
    return el;
  }

  async function loadAndRender() {
    if (!gaugeEl) return;
    const d = await fetchUsage();
    if (!d) return;

    const p5 = d.five_hour?.utilization ?? 0;
    const p7 = d.seven_day?.utilization ?? 0;
    const c5 = color(p5);

    const fill = document.getElementById("cug-fill");
    const dot  = document.getElementById("cug-dot");
    const pct5 = document.getElementById("cug-5h-pct");
    const rst5 = document.getElementById("cug-5h-rst");
    const pct7 = document.getElementById("cug-7d-pct");

    if (fill)  { fill.style.width = `${Math.min(100, p5)}%`; fill.style.background = c5; }
    if (dot)   { dot.style.color = c5; dot.style.background = c5; }
    if (pct5)  { pct5.textContent = `${Math.round(p5)}%`; pct5.style.color = c5; }
    if (rst5)  { rst5.textContent = formatReset(d.five_hour?.resets_at); }
    if (pct7)  { pct7.textContent = `${Math.round(p7)}%`; pct7.style.color = color(p7); }

    try { chrome.runtime.sendMessage({ type: "STORE_DATA", data: d }); } catch(e) {}
  }

  // ── Trouve le composer et injecte à l'intérieur ─────────────────────────

  function findComposer() {
    const ta = document.querySelector("textarea")
             || document.querySelector('[contenteditable="true"]');
    if (!ta) return null;

    let el = ta;
    for (let i = 0; i < 12; i++) {
      const p = el.parentElement;
      if (!p || p.tagName === "BODY") break;
      // Cherche le conteneur qui a les boutons de contrôle (Sonnet, send, mic)
      const hasSend  = p.querySelector('button[aria-label*="Send"], button[data-testid*="send"], button[type="submit"]');
      const hasModel = p.querySelector('[aria-label*="Sonnet"], [aria-label*="Opus"], [aria-label*="Haiku"]');
      if (hasSend || hasModel) return p;
      el = p;
    }
    return ta.parentElement;
  }

  function inject() {
    if (document.getElementById("claude-usage-gauge")) return;
    const composer = findComposer();
    if (!composer) return;

    gaugeEl = buildGauge();
    composer.appendChild(gaugeEl);
    log("Injected ✓");
    loadAndRender();
    setInterval(loadAndRender, 60000);
  }

  function watchAndInject() {
    inject();
    const obs = new MutationObserver(() => {
      if (!document.getElementById("claude-usage-gauge")) inject();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    watchAndInject();
    let last = location.href;
    setInterval(() => {
      if (location.href !== last) {
        last = location.href;
        gaugeEl = null;
        setTimeout(watchAndInject, 1000);
      }
    }, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else setTimeout(init, 600);

})();
