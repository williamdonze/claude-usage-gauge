// content.js v11

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

  const TRANSLATIONS = {
    fr: { session: "5h", week: "7 jours", reset: "reset imminent",
          resetIn: (d,h,m) => d>0 ? (h>0?`${d}j ${h}h`:`${d}j`) : h>0 ? `${h}h${String(m).padStart(2,"0")}` : `${m}m` },
    en: { session: "5h", week: "7 days", reset: "resetting soon",
          resetIn: (d,h,m) => d>0 ? (h>0?`${d}d ${h}h`:`${d}d`) : h>0 ? `${h}h${String(m).padStart(2,"0")}` : `${m}m` },
    es: { session: "5h", week: "7 días", reset: "reinicio inminente",
          resetIn: (d,h,m) => d>0 ? (h>0?`${d}d ${h}h`:`${d}d`) : h>0 ? `${h}h${String(m).padStart(2,"0")}` : `${m}m` },
    de: { session: "5h", week: "7 Tage", reset: "Reset bald",
          resetIn: (d,h,m) => d>0 ? (h>0?`${d}T ${h}h`:`${d}T`) : h>0 ? `${h}h${String(m).padStart(2,"0")}` : `${m}m` },
    pt: { session: "5h", week: "7 dias", reset: "reset iminente",
          resetIn: (d,h,m) => d>0 ? (h>0?`${d}d ${h}h`:`${d}d`) : h>0 ? `${h}h${String(m).padStart(2,"0")}` : `${m}m` },
    ja: { session: "5時間", week: "7日間", reset: "まもなくリセット",
          resetIn: (d,h,m) => d>0 ? (h>0?`${d}日${h}時間`:`${d}日`) : h>0 ? `${h}時間${String(m).padStart(2,"0")}分` : `${m}分` },
    zh: { session: "5小时", week: "7天", reset: "即将重置",
          resetIn: (d,h,m) => d>0 ? (h>0?`${d}天${h}小时`:`${d}天`) : h>0 ? `${h}小时${String(m).padStart(2,"0")}分` : `${m}分` },
    ko: { session: "5시간", week: "7일", reset: "곧 초기화",
          resetIn: (d,h,m) => d>0 ? (h>0?`${d}일 ${h}시간`:`${d}일`) : h>0 ? `${h}시간${String(m).padStart(2,"0")}분` : `${m}분` },
  };
  const lang = (navigator.language || "en").toLowerCase().split("-")[0];
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;

  function formatReset(iso) {
    if (!iso) return "—";
    const diff = new Date(iso) - Date.now();
    if (diff <= 0) return T.reset;
    const totalMinutes = Math.floor(diff / 60000);
    const d = Math.floor(totalMinutes / 1440);
    const h = Math.floor((totalMinutes % 1440) / 60);
    const m = totalMinutes % 60;
    return "↻ " + T.resetIn(d, h, m);
  }

  function color(pct) {
    if (pct == null) return "#9ca3af";
    if (pct < 50) return "#16a34a";
    if (pct < 75) return "#d97706";
    if (pct < 90) return "#ea580c";
    return "#dc2626";
  }

  function mk(tag, id, cls) {
    const e = document.createElement(tag);
    if (id) e.id = id;
    if (cls) e.className = cls;
    return e;
  }
  function txt(tag, cls, text) { const e = mk(tag, null, cls); e.textContent = text; return e; }

  function buildGauge() {
    const el   = mk("div", "claude-usage-gauge");
    const cols = mk("div", null, "cug-cols");

    // Left: 5h with bar
    const left = mk("div", null, "cug-col");
    const ltop = mk("div", null, "cug-col-top");
    ltop.appendChild(txt("span", "cug-label", T.session));
    ltop.appendChild(mk("span", "cug-5h-pct", "cug-pct"));
    const track = mk("div", null, "cug-track");
    track.appendChild(mk("div", "cug-5h-fill", "cug-fill"));
    left.appendChild(ltop);
    left.appendChild(track);
    left.appendChild(mk("span", "cug-5h-rst", "cug-rst"));

    // Right: 7d text only (no bar)
    const right = mk("div", null, "cug-col cug-col--text");
    const rtop  = mk("div", null, "cug-col-top");
    rtop.appendChild(txt("span", "cug-label", T.week));
    rtop.appendChild(mk("span", "cug-7d-pct", "cug-pct"));
    right.appendChild(rtop);
    right.appendChild(mk("span", "cug-7d-rst", "cug-rst"));

    cols.appendChild(left);
    cols.appendChild(mk("div", null, "cug-sep"));
    cols.appendChild(right);
    el.appendChild(cols);
    return el;
  }

  let lastData = null;

  function applyData(d) {
    lastData = d;
    if (!gaugeEl) return;

    const h5pct = d.five_hour?.utilization ?? 0;
    const d7pct = d.seven_day?.utilization ?? 0;
    const c5 = color(h5pct), c7 = color(d7pct);

    const p5    = document.getElementById("cug-5h-pct");
    const fill  = document.getElementById("cug-5h-fill");
    const rst5  = document.getElementById("cug-5h-rst");
    const p7    = document.getElementById("cug-7d-pct");
    const rst7  = document.getElementById("cug-7d-rst");

    if (p5)   { p5.textContent = `${Math.round(h5pct)}%`; p5.style.color = c5; }
    if (fill) {
      fill.style.width = `${Math.min(100, h5pct)}%`;
      fill.style.background = c5;
      fill.classList.toggle("cug-fill--critical", h5pct >= 90);
    }
    if (rst5) rst5.textContent = formatReset(d.five_hour?.resets_at);
    if (p7)   { p7.textContent = `${Math.round(d7pct)}%`; p7.style.color = c7; }
    if (rst7) rst7.textContent = formatReset(d.seven_day?.resets_at);
  }

  async function loadAndRender() {
    if (!gaugeEl) return;
    const d = await fetchUsage();
    if (!d) return;
    applyData(d);
    try { chrome.runtime.sendMessage({ type: "STORE_DATA", data: d }); } catch(e) {}
  }

  function isExcludedPage() {
    const p = location.pathname;
    return p.startsWith("/settings") || p.startsWith("/login") || p.startsWith("/signup");
  }

  function isClaudeCode() {
    return location.pathname.startsWith("/code");
  }

  function findComposer() {
    // Claude Code: use specific testid, walk up to the surface card
    const ccInput = document.querySelector('[data-testid="code-prompt-input"]');
    if (ccInput) {
      let el = ccInput;
      for (let i = 0; i < 10; i++) {
        if (!el.parentElement) break;
        el = el.parentElement;
        const cls = typeof el.className === "string" ? el.className : "";
        if (cls.includes("bg-surface")) return el;
      }
    }

    // Normal Claude: walk up to fieldset or rounded-composer
    const input = document.querySelector('[contenteditable="true"]')
                || document.querySelector("textarea");
    if (!input) return null;

    let el = input;
    for (let i = 0; i < 12; i++) {
      if (!el.parentElement || el.parentElement.tagName === "BODY") break;
      el = el.parentElement;
      if (el.tagName === "FIELDSET") return el;
      if (typeof el.className === "string" && el.className.includes("rounded-composer")) return el;
    }

    // Fallback: first ancestor with send/model button
    el = input;
    for (let i = 0; i < 12; i++) {
      const p = el.parentElement;
      if (!p || p.tagName === "BODY") break;
      const hasSend  = p.querySelector('button[aria-label*="Send"], button[data-testid*="send"], button[type="submit"]');
      const hasModel = p.querySelector('[aria-label*="Sonnet"], [aria-label*="Opus"], [aria-label*="Haiku"]');
      if (hasSend || hasModel) return p;
      el = p;
    }
    return input.parentElement;
  }

  function inject() {
    if (document.getElementById("claude-usage-gauge")) return;
    const composer = findComposer();
    if (!composer) return;

    gaugeEl = buildGauge();
    composer.appendChild(gaugeEl);

    log("Injected ✓", isClaudeCode() ? "(Claude Code)" : "(Claude normal)");
    if (lastData) applyData(lastData);
    loadAndRender();
    setInterval(loadAndRender, 30000);
  }

  let observer = null;

  function watchAndInject() {
    if (isExcludedPage()) return;
    inject();
    observer = new MutationObserver(() => {
      if (isExcludedPage()) return;
      if (!document.getElementById("claude-usage-gauge")) inject();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    watchAndInject();
    let last = location.href;
    setInterval(() => {
      if (location.href !== last) {
        last = location.href;
        if (observer) { observer.disconnect(); observer = null; }
        const el = document.getElementById("claude-usage-gauge");
        if (el) el.remove();
        gaugeEl = null;
        if (!isExcludedPage()) setTimeout(watchAndInject, 1000);
      }
    }, 500);
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "RENDER_NOW" && msg.data) applyData(msg.data);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") loadAndRender();
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else setTimeout(init, 600);

})();
