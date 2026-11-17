// popup.js — Chrome MV3

const TRANSLATIONS = {
  fr: {
    subtitle:    "Données temps réel",
    loading:     "Chargement…",
    label5h:     "⏱ Session 5h",
    label7d:     "📅 7 jours",
    nodata:      "Ouvrez claude.ai pour charger les données",
    refresh:     "↻ Actualiser",
    reset:       "reset imminent",
    resetIn:     (d, h, m) => d > 0 ? (h > 0 ? `${d}j ${h}h` : `${d}j`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
    breakdown:   "Utilisation par produit",
    extraCred:   "Crédits supplémentaires",
  },
  en: {
    subtitle:    "Real-time data",
    loading:     "Loading…",
    label5h:     "⏱ 5h session",
    label7d:     "📅 7 days",
    nodata:      "Open claude.ai to load data",
    refresh:     "↻ Refresh",
    reset:       "resetting soon",
    resetIn:     (d, h, m) => d > 0 ? (h > 0 ? `${d}d ${h}h` : `${d}d`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
    breakdown:   "Usage by product",
    extraCred:   "Extra credits used",
  },
  es: {
    subtitle:    "Datos en tiempo real",
    loading:     "Cargando…",
    label5h:     "⏱ Sesión 5h",
    label7d:     "📅 7 días",
    nodata:      "Abre claude.ai para cargar los datos",
    refresh:     "↻ Actualizar",
    reset:       "reinicio inminente",
    resetIn:     (d, h, m) => d > 0 ? (h > 0 ? `${d}d ${h}h` : `${d}d`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
    breakdown:   "Uso por producto",
    extraCred:   "Créditos adicionales",
  },
  de: {
    subtitle:    "Echtzeit-Daten",
    loading:     "Laden…",
    label5h:     "⏱ 5h-Sitzung",
    label7d:     "📅 7 Tage",
    nodata:      "Öffne claude.ai um Daten zu laden",
    refresh:     "↻ Aktualisieren",
    reset:       "Reset bald",
    resetIn:     (d, h, m) => d > 0 ? (h > 0 ? `${d}T ${h}h` : `${d}T`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
    breakdown:   "Nutzung nach Produkt",
    extraCred:   "Zusätzliche Credits",
  },
  pt: {
    subtitle:    "Dados em tempo real",
    loading:     "Carregando…",
    label5h:     "⏱ Sessão 5h",
    label7d:     "📅 7 dias",
    nodata:      "Abra claude.ai para carregar os dados",
    refresh:     "↻ Atualizar",
    reset:       "reset iminente",
    resetIn:     (d, h, m) => d > 0 ? (h > 0 ? `${d}d ${h}h` : `${d}d`) : h > 0 ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m`,
    breakdown:   "Uso por produto",
    extraCred:   "Créditos extras",
  },
  ja: {
    subtitle:    "リアルタイムデータ",
    loading:     "読み込み中…",
    label5h:     "⏱ 5時間セッション",
    label7d:     "📅 7日間",
    nodata:      "claude.aiを開いてデータを読み込んでください",
    refresh:     "↻ 更新",
    reset:       "まもなくリセット",
    resetIn:     (d, h, m) => d > 0 ? (h > 0 ? `${d}日${h}時間` : `${d}日`) : h > 0 ? `${h}時間${String(m).padStart(2,"0")}分` : `${m}分`,
    breakdown:   "製品別使用量",
    extraCred:   "追加クレジット",
  },
  zh: {
    subtitle:    "实时数据",
    loading:     "加载中…",
    label5h:     "⏱ 5小时会话",
    label7d:     "📅 7天",
    nodata:      "请打开 claude.ai 以加载数据",
    refresh:     "↻ 刷新",
    reset:       "即将重置",
    resetIn:     (d, h, m) => d > 0 ? (h > 0 ? `${d}天${h}小时` : `${d}天`) : h > 0 ? `${h}小时${String(m).padStart(2,"0")}分` : `${m}分`,
    breakdown:   "按产品使用量",
    extraCred:   "额外积分",
  },
  ko: {
    subtitle:    "실시간 데이터",
    loading:     "로딩 중…",
    label5h:     "⏱ 5시간 세션",
    label7d:     "📅 7일",
    nodata:      "데이터를 불러오려면 claude.ai를 여세요",
    refresh:     "↻ 새로고침",
    reset:       "곧 초기화",
    resetIn:     (d, h, m) => d > 0 ? (h > 0 ? `${d}일 ${h}시간` : `${d}일`) : h > 0 ? `${h}시간 ${String(m).padStart(2,"0")}분` : `${m}분`,
    breakdown:   "제품별 사용량",
    extraCred:   "추가 크레딧",
  },
};

function getLang() {
  const code = (navigator.language || "en").toLowerCase().split("-")[0];
  return TRANSLATIONS[code] || TRANSLATIONS.en;
}

const T = getLang();

// Arc circumference for r=15
const ARC_CIRC = 2 * Math.PI * 15; // ≈ 94.25

function applyStaticText() {
  document.getElementById("p-subtitle").textContent  = T.subtitle;
  document.getElementById("loading").textContent      = T.loading;
  document.getElementById("p-5h-label").textContent   = T.label5h;
  document.getElementById("p-7d-label").textContent   = T.label7d;
  document.getElementById("p-nodata").textContent     = T.nodata;
  document.getElementById("btn-refresh").textContent  = T.refresh;
  document.getElementById("bd-title").textContent     = T.breakdown;
  document.getElementById("cred-label").textContent   = T.extraCred;
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

// Map product keys from API to display names
const PRODUCT_NAMES = {
  claude_ai:         "Claude.ai",
  claude_code:       "Claude Code",
  api:               "API",
  claude_api:        "API",
  anthropic_api:     "API",
  claude_ios:        "iOS",
  claude_android:    "Android",
  claude_desktop:    "Desktop",
};

function formatProductName(key) {
  return PRODUCT_NAMES[key] || key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatCurrency(val) {
  if (typeof val === "number") return `$${val.toFixed(2)}`;
  return String(val);
}

function renderBreakdown(data) {
  // Try common field names the API might use for product breakdown
  const breakdown =
    data.usage_breakdown ||
    data.product_breakdown ||
    data.products ||
    data.breakdown ||
    data.per_product ||
    null;

  const sec = document.getElementById("section-breakdown");
  const rowsEl = document.getElementById("bd-rows");

  if (!breakdown) {
    sec.style.display = "none";
    return;
  }

  const entries = Array.isArray(breakdown)
    ? breakdown
    : Object.entries(breakdown).map(([key, val]) => ({ key, ...val }));

  if (entries.length === 0) { sec.style.display = "none"; return; }

  rowsEl.innerHTML = "";
  for (const entry of entries) {
    const name = formatProductName(entry.key || entry.product || entry.name || "");
    const pct  = entry.utilization ?? entry.percentage ?? entry.pct ?? null;
    const val  = pct != null ? `${Math.round(pct)}%` : (entry.value ?? "");

    const row = document.createElement("div");
    row.className = "breakdown-row";
    row.innerHTML = `<span class="breakdown-name">${name}</span><span class="breakdown-val" style="color:${getColor(pct)}">${val}</span>`;
    rowsEl.appendChild(row);
  }
  sec.style.display = "block";
}

function renderCredits(data) {
  // Try common field names for extra credits cost
  const raw =
    data.extra_credits_cost ??
    data.extra_credits_used ??
    data.overage_cost ??
    data.overage_credits ??
    data.additional_credits_cost ??
    null;

  const sec = document.getElementById("section-credits");
  if (raw == null || raw === 0) { sec.style.display = "none"; return; }

  document.getElementById("cred-val").textContent = formatCurrency(raw);
  sec.style.display = "block";
}

function render(data) {
  document.getElementById("loading").style.display = "none";
  document.getElementById("main").style.display = "block";

  // Log full API payload to console so we can discover all available fields
  if (data) console.log("[ClaudeUsage] full API payload:", JSON.stringify(data, null, 2));

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

    // Live arc gauge in header — shows 5h session utilization
    const pct5h = data.five_hour?.utilization ?? 0;
    const arcFill = document.getElementById("hdr-arc-fill");
    if (arcFill) {
      arcFill.style.stroke = getColor(pct5h);
      arcFill.style.strokeDashoffset = ARC_CIRC * (1 - Math.min(100, pct5h) / 100);
    }

    renderBreakdown(data);
    renderCredits(data);
  } else {
    document.getElementById("p-nodata").style.display = "block";
    document.getElementById("section-breakdown").style.display = "none";
    document.getElementById("section-credits").style.display = "none";
  }
}

async function load() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("main").style.display = "none";

  // Try cached data first
  const cached = await new Promise((r) => chrome.runtime.sendMessage({ type: "GET_DATA" }, r));
  if (cached?.data) { render(cached.data); return; }

  // No cache: ask content script in open tab
  const tabs = await new Promise((r) => chrome.tabs.query({ url: "*://claude.ai/*" }, r));
  if (tabs.length > 0) {
    const data = await new Promise((r) =>
      chrome.tabs.sendMessage(tabs[0].id, { type: "FETCH_AND_REPLY" }, (d) => r(d || null))
    );
    if (data) { render(data); return; }
  }

  render(null);
}

async function refresh() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("main").style.display = "none";

  const tabs = await new Promise((r) => chrome.tabs.query({ url: "*://claude.ai/*" }, r));
  if (tabs.length > 0) {
    const data = await new Promise((r) =>
      chrome.tabs.sendMessage(tabs[0].id, { type: "FETCH_AND_REPLY" }, (d) => r(d || null))
    );
    if (data) { render(data); return; }
  }

  const cached = await new Promise((r) => chrome.runtime.sendMessage({ type: "GET_DATA" }, r));
  render(cached?.data || null);
}

applyStaticText();
document.getElementById("btn-refresh").addEventListener("click", refresh);
load();
