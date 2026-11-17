// popup.js — Chrome MV3

const TRANSLATIONS = {
  fr: {
    subtitle:   "Données temps réel",
    loading:    "Chargement…",
    label5h:    "⏱ Session 5h",
    label7d:    "📅 7 jours",
    nodata:     "Ouvrez claude.ai pour charger les données",
    refresh:    "↻ Actualiser",
    reset:      "reset imminent",
    resetIn:    (d, h, m) => d > 0 ? (h > 0 ? `${d}j ${h}h` : `${d}j`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
  },
  en: {
    subtitle:   "Real-time data",
    loading:    "Loading…",
    label5h:    "⏱ 5h session",
    label7d:    "📅 7 days",
    nodata:     "Open claude.ai to load data",
    refresh:    "↻ Refresh",
    reset:      "resetting soon",
    resetIn:    (d, h, m) => d > 0 ? (h > 0 ? `${d}d ${h}h` : `${d}d`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
  },
  es: {
    subtitle:   "Datos en tiempo real",
    loading:    "Cargando…",
    label5h:    "⏱ Sesión 5h",
    label7d:    "📅 7 días",
    nodata:     "Abre claude.ai para cargar los datos",
    refresh:    "↻ Actualizar",
    reset:      "reinicio inminente",
    resetIn:    (d, h, m) => d > 0 ? (h > 0 ? `${d}d ${h}h` : `${d}d`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
  },
  de: {
    subtitle:   "Echtzeit-Daten",
    loading:    "Laden…",
    label5h:    "⏱ 5h-Sitzung",
    label7d:    "📅 7 Tage",
    nodata:     "Öffne claude.ai um Daten zu laden",
    refresh:    "↻ Aktualisieren",
    reset:      "Reset bald",
    resetIn:    (d, h, m) => d > 0 ? (h > 0 ? `${d}T ${h}h` : `${d}T`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
  },
  pt: {
    subtitle:   "Dados em tempo real",
    loading:    "Carregando…",
    label5h:    "⏱ Sessão 5h",
    label7d:    "📅 7 dias",
    nodata:     "Abra claude.ai para carregar os dados",
    refresh:    "↻ Atualizar",
    reset:      "reset iminente",
    resetIn:    (d, h, m) => d > 0 ? (h > 0 ? `${d}d ${h}h` : `${d}d`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
  },
  ja: {
    subtitle:   "リアルタイムデータ",
    loading:    "読み込み中…",
    label5h:    "⏱ 5時間セッション",
    label7d:    "📅 7日間",
    nodata:     "claude.aiを開いてデータを読み込んでください",
    refresh:    "↻ 更新",
    reset:      "まもなくリセット",
    resetIn:    (d, h, m) => d > 0 ? (h > 0 ? `${d}日${h}時間` : `${d}日`) : h > 0 ? `${h}時間${String(m).padStart(2,"0")}分` : `${m}分`,
  },
  zh: {
    subtitle:   "实时数据",
    loading:    "加载中…",
    label5h:    "⏱ 5小时会话",
    label7d:    "📅 7天",
    nodata:     "请打开 claude.ai 以加载数据",
    refresh:    "↻ 刷新",
    reset:      "即将重置",
    resetIn:    (d, h, m) => d > 0 ? (h > 0 ? `${d}天${h}小时` : `${d}天`) : h > 0 ? `${h}小时${String(m).padStart(2,"0")}分` : `${m}分`,
  },
  ko: {
    subtitle:   "실시간 데이터",
    loading:    "로딩 중…",
    label5h:    "⏱ 5시간 세션",
    label7d:    "📅 7일",
    nodata:     "데이터를 불러오려면 claude.ai를 여세요",
    refresh:    "↻ 새로고침",
    reset:      "곧 초기화",
    resetIn:    (d, h, m) => d > 0 ? (h > 0 ? `${d}일 ${h}시간` : `${d}일`) : h > 0 ? `${h}시간 ${String(m).padStart(2,"0")}분` : `${m}분`,
  },
};

function getLang() {
  const code = (navigator.language || "en").toLowerCase().split("-")[0];
  return TRANSLATIONS[code] || TRANSLATIONS.en;
}

const T = getLang();

function applyStaticText() {
  document.getElementById("p-subtitle").textContent  = T.subtitle;
  document.getElementById("loading").textContent      = T.loading;
  document.getElementById("p-5h-label").textContent   = T.label5h;
  document.getElementById("p-7d-label").textContent   = T.label7d;
  document.getElementById("p-nodata").textContent     = T.nodata;
  document.getElementById("btn-refresh").textContent  = T.refresh;
}

function formatResetIn(isoDate) {
  if (!isoDate) return "—";
  const diff = new Date(isoDate) - Date.now();
  if (diff <= 0) return T.reset;
  const totalMinutes = Math.floor(diff / 60000);
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  return T.resetIn(d, h, m);
}

function getColor(pct) {
  if (pct == null) return "#6b7280";
  if (pct < 50)  return "#16a34a";
  if (pct < 75)  return "#d97706";
  if (pct < 90)  return "#ea580c";
  return "#dc2626";
}

function render(data) {
  document.getElementById("loading").style.display = "none";
  document.getElementById("main").style.display = "block";

  function fillRow(prefix, utilization, resetsAt) {
    const pct = utilization ?? 0;
    const color = getColor(pct);
    document.getElementById(`p-${prefix}-val`).textContent = `${Math.round(pct)}%`;
    document.getElementById(`p-${prefix}-val`).style.color = color;
    document.getElementById(`p-${prefix}-reset`).textContent = formatResetIn(resetsAt);
    const fill = document.getElementById(`p-${prefix}-fill`);
    fill.style.width = `${Math.min(100, pct)}%`;
    fill.style.background = color;
  }

  if (data) {
    fillRow("5h", data.five_hour?.utilization, data.five_hour?.resets_at);
    fillRow("7d", data.seven_day?.utilization, data.seven_day?.resets_at);
    document.getElementById("p-nodata").style.display = "none";
  } else {
    document.getElementById("p-nodata").style.display = "block";
  }
}

function fetchViaTab(tabId) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        try {
          const orgsRes = await fetch("/api/organizations", { credentials: "include" });
          const orgs = await orgsRes.json();
          const id = orgs?.[0]?.uuid || orgs?.[0]?.id;
          if (!id) return null;
          const res = await fetch(`/api/organizations/${id}/usage`, { credentials: "include" });
          return res.ok ? await res.json() : null;
        } catch(e) { return null; }
      }
    }, (results) => resolve(results?.[0]?.result || null));
  });
}

async function load() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("main").style.display = "none";

  // 1. Cache du background (inclut l'historique)
  const cached = await new Promise((r) => chrome.runtime.sendMessage({ type: "GET_DATA" }, r));
  if (cached?.history?.length) renderSparkline(cached.history);
  if (cached?.data) { render(cached.data); return; }

  // 2. N'importe quel onglet claude.ai ouvert
  const tabs = await new Promise((r) => chrome.tabs.query({ url: "*://claude.ai/*" }, r));
  if (tabs.length > 0) {
    const data = await fetchViaTab(tabs[0].id);
    if (data) {
      chrome.runtime.sendMessage({ type: "STORE_DATA", data });
      render(data);
      return;
    }
  }

  // 3. Fetch depuis le background (pas besoin d'onglet)
  const result = await new Promise((r) => chrome.runtime.sendMessage({ type: "FETCH_NOW" }, r));
  render(result?.data || null);
}

async function refresh() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("main").style.display = "none";

  // Fetch frais, skip cache
  let data = null;
  const tabs = await new Promise((r) => chrome.tabs.query({ url: "*://claude.ai/*" }, r));
  if (tabs.length > 0) data = await fetchViaTab(tabs[0].id);
  if (!data) {
    const result = await new Promise((r) => chrome.runtime.sendMessage({ type: "FETCH_NOW" }, r));
    data = result?.data || null;
  }
  if (data) {
    chrome.runtime.sendMessage({ type: "STORE_DATA", data });
    // Notifie tous les onglets claude.ai de re-rendre
    chrome.tabs.query({ url: "*://claude.ai/*" }, (tabs) => {
      tabs.forEach((t) => chrome.tabs.sendMessage(t.id, { type: "RENDER_NOW", data }).catch(() => {}));
    });
  }
  render(data);
}

function renderSparkline(history) {
  if (!history || history.length < 2) return;
  const wrap = document.getElementById("sparkline-wrap");
  const svg  = document.getElementById("sparkline-svg");
  if (!wrap || !svg) return;
  wrap.style.display = "block";

  const W = 272, H = 44, pad = 2;
  const n = history.length;

  function points(key, color) {
    const pts = history.map((p, i) => {
      const x = pad + (i / (n - 1)) * (W - pad * 2);
      const y = H - pad - (p[key] / 100) * (H - pad * 2);
      return `${x},${y}`;
    }).join(" ");
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    poly.setAttribute("points", pts);
    poly.setAttribute("fill", "none");
    poly.setAttribute("stroke", color);
    poly.setAttribute("stroke-width", "1.5");
    poly.setAttribute("stroke-linejoin", "round");
    poly.setAttribute("stroke-linecap", "round");
    svg.appendChild(poly);

    // last point dot
    const last = history[n - 1];
    const lx = W - pad;
    const ly = H - pad - (last[key] / 100) * (H - pad * 2);
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", lx);
    dot.setAttribute("cy", ly);
    dot.setAttribute("r", "2.5");
    dot.setAttribute("fill", color);
    svg.appendChild(dot);
  }

  svg.replaceChildren();
  points("h5", "#d97706");
  points("d7", "#6366f1");
}

applyStaticText();
document.getElementById("btn-refresh").addEventListener("click", refresh);
load();
