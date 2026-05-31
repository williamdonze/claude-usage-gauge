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

  const TRANSLATIONS = {
    fr: { session: "Session 5h", week: "7 jours :", reset: "reset imminent",
          resetIn: (d,h,m) => d>0 ? (h>0?`↺ ${d}j ${h}h`:`↺ ${d}j`) : h>0 ? `↺ ${h}h${String(m).padStart(2,"0")}` : `↺ ${m}m` },
    en: { session: "5h session", week: "7 days:", reset: "resetting soon",
          resetIn: (d,h,m) => d>0 ? (h>0?`↺ ${d}d ${h}h`:`↺ ${d}d`) : h>0 ? `↺ ${h}h${String(m).padStart(2,"0")}` : `↺ ${m}m` },
    es: { session: "Sesión 5h", week: "7 días:", reset: "reinicio inminente",
          resetIn: (d,h,m) => d>0 ? (h>0?`↺ ${d}d ${h}h`:`↺ ${d}d`) : h>0 ? `↺ ${h}h${String(m).padStart(2,"0")}` : `↺ ${m}m` },
    de: { session: "5h-Sitzung", week: "7 Tage:", reset: "Reset bald",
          resetIn: (d,h,m) => d>0 ? (h>0?`↺ ${d}T ${h}h`:`↺ ${d}T`) : h>0 ? `↺ ${h}h${String(m).padStart(2,"0")}` : `↺ ${m}m` },
    pt: { session: "Sessão 5h", week: "7 dias:", reset: "reset iminente",
          resetIn: (d,h,m) => d>0 ? (h>0?`↺ ${d}d ${h}h`:`↺ ${d}d`) : h>0 ? `↺ ${h}h${String(m).padStart(2,"0")}` : `↺ ${m}m` },
    ja: { session: "5時間セッション", week: "7日間:", reset: "まもなくリセット",
          resetIn: (d,h,m) => d>0 ? (h>0?`↺ ${d}日${h}時間`:`↺ ${d}日`) : h>0 ? `↺ ${h}時間${String(m).padStart(2,"0")}分` : `↺ ${m}分` },
    zh: { session: "5小时会话", week: "7天:", reset: "即将重置",
          resetIn: (d,h,m) => d>0 ? (h>0?`↺ ${d}天${h}小时`:`↺ ${d}天`) : h>0 ? `↺ ${h}小时${String(m).padStart(2,"0")}分` : `↺ ${m}分` },
    ko: { session: "5시간 세션", week: "7일:", reset: "곧 초기화",
          resetIn: (d,h,m) => d>0 ? (h>0?`↺ ${d}일 ${h}시간`:`↺ ${d}일`) : h>0 ? `↺ ${h}시간${String(m).padStart(2,"0")}분` : `↺ ${m}분` },
  };
  const lang = (navigator.language || "en").toLowerCase().split("-")[0];
  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;

  function formatReset(iso) {
    if (!iso) return "";
    const diff = new Date(iso) - Date.now();
    if (diff <= 0) return T.reset;
    const totalMinutes = Math.floor(diff / 60000);
    const d = Math.floor(totalMinutes / 1440);
    const h = Math.floor((totalMinutes % 1440) / 60);
    const m = totalMinutes % 60;
    return T.resetIn(d, h, m);
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
            <span class="cug-session-label">${T.session}</span>
            <span class="cug-pct-val" id="cug-5h-pct"></span>
            <span class="cug-reset-val" id="cug-5h-rst"></span>
          </span>
          <span class="cug-label-right">
            <span class="cug-week-label">${T.week}</span>
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

    if (Math.round(p5) === 67) showPet();
    else hidePet();
  }

  // ── Animation 67% ──────────────────────────────────────────────────────

  const PET_FRAMES = [
    `<svg shape-rendering="crispEdges" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 912 608"><rect fill="#d97757" x="151.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="532.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="532.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="532.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="152.3" width="76" height="76"/><rect fill="#c0694e" x="759.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="835.7" y="228.3" width="76" height="76"/><rect fill="#c0694e" x="759.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="835.7" y="152.3" width="76" height="76"/><rect fill="#c0694e" x="75.7" y="152.3" width="76" height="76"/><rect fill="#c0694e" x="75.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="-.3" y="152.3" width="76" height="76"/><rect fill="#d97757" x="-.3" y="228.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="76.3" width="76" height="76"/><rect x="227.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="76.3" width="76" height="76"/><rect x="607.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="227.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="303.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="379.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="455.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="607.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="531.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="683.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="532.3" width="76" height="76"/></svg>`,
    `<svg shape-rendering="crispEdges" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 912 608"><rect fill="#d97757" x="151.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="532.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="532.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="532.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="152.3" width="76" height="76"/><rect fill="#c0694e" x="759.7" y="278.3" width="76" height="76"/><rect fill="#d97757" x="835.7" y="278.3" width="76" height="76"/><rect fill="#c0694e" x="759.7" y="202.3" width="76" height="76"/><rect fill="#d97757" x="835.7" y="202.3" width="76" height="76"/><rect fill="#c0694e" x="75.7" y="102.3" width="76" height="76"/><rect fill="#c0694e" x="75.7" y="178.3" width="76" height="76"/><rect fill="#d97757" x="-.3" y="102.3" width="76" height="76"/><rect fill="#d97757" x="-.3" y="178.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="76.3" width="76" height="76"/><rect x="227.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="76.3" width="76" height="76"/><rect x="607.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="227.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="303.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="379.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="455.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="607.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="531.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="683.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="532.3" width="76" height="76"/></svg>`,
    `<svg shape-rendering="crispEdges" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 912 608"><rect fill="#d97757" x="151.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="532.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="532.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="532.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="456.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="380.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="304.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="228.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="227.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="607.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="152.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="152.3" width="76" height="76"/><rect fill="#c0694e" x="759.7" y="178.3" width="76" height="76"/><rect fill="#d97757" x="835.7" y="178.3" width="76" height="76"/><rect fill="#c0694e" x="759.7" y="102.3" width="76" height="76"/><rect fill="#d97757" x="835.7" y="102.3" width="76" height="76"/><rect fill="#c0694e" x="75.7" y="202.3" width="76" height="76"/><rect fill="#c0694e" x="75.7" y="278.3" width="76" height="76"/><rect fill="#d97757" x="-.3" y="202.3" width="76" height="76"/><rect fill="#d97757" x="-.3" y="278.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y="76.3" width="76" height="76"/><rect x="227.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="303.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="379.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="455.7" y="76.3" width="76" height="76"/><rect x="607.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="531.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="76.3" width="76" height="76"/><rect fill="#d97757" x="151.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="227.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="303.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="379.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="455.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="607.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="531.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="683.7" y=".3" width="76" height="76"/><rect fill="#d97757" x="683.7" y="532.3" width="76" height="76"/></svg>`,
  ];

  let petEl = null;
  let petTimer = null;
  let petFrame = 0;
  let petLooping = false;

  function buildPet() {
    const el = document.createElement("div");
    el.id = "cug-pet";
    el.innerHTML = PET_FRAMES[0];
    return el;
  }

  function positionPet() {
    if (!petEl || !gaugeEl) return;
    const container = gaugeEl.parentElement || gaugeEl;
    const rect = container.getBoundingClientRect();
    const petW = petEl.offsetWidth || 96;
    petEl.style.bottom = `${window.innerHeight - rect.top}px`;
    petEl.style.left   = `${rect.right - petW}px`;
    petEl.style.right  = "auto";
  }

  function stepPet() {
    if (!petEl) return;
    if (!petLooping) {
      petEl.innerHTML = PET_FRAMES[1];
      petFrame = 1;
      petLooping = true;
      petTimer = setInterval(() => {
        petFrame = petFrame === 1 ? 2 : 1;
        if (petEl) petEl.innerHTML = PET_FRAMES[petFrame];
      }, 200);
    }
  }

  function showPet() {
    if (document.getElementById("cug-pet")) return;
    petEl = buildPet();
    document.body.appendChild(petEl);
    requestAnimationFrame(positionPet);
    window.addEventListener("resize", positionPet);
    petLooping = false;
    petFrame = 0;
    setTimeout(stepPet, 600);
  }

  function hidePet() {
    window.removeEventListener("resize", positionPet);
    if (petTimer) { clearInterval(petTimer); petTimer = null; }
    if (petEl) { petEl.remove(); petEl = null; }
    petLooping = false;
    petFrame = 0;
  }



  function isExcludedPage() {
    const p = location.pathname;
    return p.startsWith("/settings") || p.startsWith("/login") || p.startsWith("/signup");
  }

  // ── Détecte si on est sur Claude Code (/code) ──────────────────────────

  function isClaudeCode() {
    return location.pathname.startsWith("/code");
  }

  // ── Trouve le composer ──────────────────────────────────────────────────

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

    if (isClaudeCode()) {
      // Sur Claude Code, injecte après le composer pour ne pas bloquer l'input
      composer.parentElement.insertBefore(gaugeEl, composer.nextSibling);
    } else {
      // Sur Claude normal, injecte à l'intérieur du composer (sous l'input)
      composer.appendChild(gaugeEl);
    }

    log("Injected ✓", isClaudeCode() ? "(Claude Code)" : "(Claude normal)");
    loadAndRender();
    setInterval(loadAndRender, 60000);
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
        if (isExcludedPage()) {
          if (observer) { observer.disconnect(); observer = null; }
          const el = document.getElementById("claude-usage-gauge");
          if (el) el.remove();
          gaugeEl = null;
        } else {
          if (observer) { observer.disconnect(); observer = null; }
          gaugeEl = null;
          setTimeout(watchAndInject, 1000);
        }
      }
    }, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else setTimeout(init, 600);

})();
