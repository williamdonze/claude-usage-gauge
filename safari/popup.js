// popup.js — Safari

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
  if (pct < 50)  return "#22c55e";
  if (pct < 75)  return "#f59e0b";
  if (pct < 90)  return "#f97316";
  return "#ef4444";
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
    fill.style.background = `linear-gradient(90deg, ${color}99, ${color})`;
  }

  if (data) {
    fillRow("5h", data.five_hour?.utilization, data.five_hour?.resets_at);
    fillRow("7d", data.seven_day?.utilization, data.seven_day?.resets_at);
    document.getElementById("p-nodata").style.display = "none";
  } else {
    document.getElementById("p-nodata").style.display = "block";
  }
}

async function fetchDirect() {
  try {
    const orgsRes = await fetch("https://claude.ai/api/organizations", { credentials: "include" });
    if (!orgsRes.ok) return null;
    const orgs = await orgsRes.json();
    const orgId = orgs?.[0]?.uuid || orgs?.[0]?.id;
    if (!orgId) return null;
    const res = await fetch(`https://claude.ai/api/organizations/${orgId}/usage`, { credentials: "include" });
    return res.ok ? await res.json() : null;
  } catch(e) { return null; }
}

async function load() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("main").style.display = "none";

  // 1. Essaie le cache du background
  const cached = await browser.runtime.sendMessage({ type: "GET_DATA" });
  if (cached?.data) { render(cached.data); return; }

  // 2. Fetch direct depuis le popup (fonctionne sans onglet claude.ai ouvert)
  const data = await fetchDirect();
  if (data) {
    browser.runtime.sendMessage({ type: "STORE_DATA", data });
    render(data);
    return;
  }

  render(null);
}

applyStaticText();
document.getElementById("btn-refresh").addEventListener("click", load);
load();
