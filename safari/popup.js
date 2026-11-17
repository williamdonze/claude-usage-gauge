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
    breakdown:   "Répartition 7 jours",
    extraCred:   "Crédits extra actifs",
    creditsUsed: "Crédits utilisés",
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
    breakdown:   "7-day breakdown",
    extraCred:   "Extra credits active",
    creditsUsed: "Credits used",
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
    breakdown:   "Desglose 7 días",
    extraCred:   "Créditos extra activos",
    creditsUsed: "Créditos usados",
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
    breakdown:   "7-Tage-Aufschlüsselung",
    extraCred:   "Extra-Credits aktiv",
    creditsUsed: "Verbrauchte Credits",
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
    breakdown:   "Divisão 7 dias",
    extraCred:   "Créditos extras ativos",
    creditsUsed: "Créditos usados",
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
    breakdown:   "7日間の内訳",
    extraCred:   "追加クレジット有効",
    creditsUsed: "使用済みクレジット",
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
    breakdown:   "7天细分",
    extraCred:   "额外积分激活",
    creditsUsed: "已用积分",
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
    breakdown:   "7일 세부 분석",
    extraCred:   "추가 크레딧 활성",
    creditsUsed: "사용된 크레딧",
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

function formatAmountMinor(amount_minor, exponent, currency) {
  if (amount_minor == null) return null;
  const amount = amount_minor / Math.pow(10, exponent ?? 2);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", minimumFractionDigits: 2 }).format(amount);
  } catch(e) { return `$${amount.toFixed(2)}`; }
}

function renderBreakdown(data) {
  const sec = document.getElementById("section-breakdown");
  const rowsEl = document.getElementById("bd-rows");

  // seven_day_breakdown.rows: [{key, display_name, percent}]
  const bd = data.seven_day_breakdown;
  if (!bd?.rows?.length) { sec.style.display = "none"; return; }

  // Show rows with percent > 0, sorted descending
  const rows = bd.rows.filter(r => r.percent > 0).sort((a, b) => b.percent - a.percent);
  if (!rows.length) { sec.style.display = "none"; return; }

  // Use a neutral accent color (not capacity-based) for the mini bars
  const barColor = getColor(data.seven_day?.utilization);

  rowsEl.innerHTML = "";
  for (const row of rows) {
    const div = document.createElement("div");
    div.className = "breakdown-row";
    div.innerHTML =
      `<div class="bd-row-top">` +
        `<span class="breakdown-name">${row.display_name}</span>` +
        `<span class="breakdown-val" style="color:${barColor}">${row.percent}%</span>` +
      `</div>` +
      `<div class="bd-mini-track">` +
        `<div class="bd-mini-fill" style="width:${row.percent}%;background:${barColor}"></div>` +
      `</div>`;
    rowsEl.appendChild(div);
  }
  sec.style.display = "block";
}

function renderCredits(data) {
  const sec = document.getElementById("section-credits");

  // spend.used: {amount_minor, currency, exponent}
  const spend = data.spend;
  const eu    = data.extra_usage;

  const usedMinor = spend?.used?.amount_minor ?? eu?.used_credits ?? null;
  if (!usedMinor) { sec.style.display = "none"; return; }

  const exponent = spend?.used?.exponent ?? eu?.decimal_places ?? 2;
  const currency = spend?.used?.currency ?? eu?.currency ?? "USD";
  const formatted = formatAmountMinor(usedMinor, exponent, currency);
  if (!formatted) { sec.style.display = "none"; return; }

  const isEnabled = spend?.enabled ?? eu?.is_enabled ?? false;
  document.getElementById("cred-label").textContent = isEnabled ? T.extraCred : T.creditsUsed;
  document.getElementById("cred-val").textContent = formatted;
  document.getElementById("cred-val").style.color = isEnabled ? "#dc2626" : "var(--muted)";
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
  const cached = await new Promise((r) => browser.runtime.sendMessage({ type: "GET_DATA" }, r));
  if (cached?.data) { render(cached.data); return; }

  // No cache: ask content script in open tab
  const tabs = await new Promise((r) => browser.tabs.query({ url: "*://claude.ai/*" }, r));
  if (tabs.length > 0) {
    const data = await new Promise((r) =>
      browser.tabs.sendMessage(tabs[0].id, { type: "FETCH_AND_REPLY" }, (d) => r(d || null))
    );
    if (data) { render(data); return; }
  }

  render(null);
}

async function refresh() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("main").style.display = "none";

  const tabs = await new Promise((r) => browser.tabs.query({ url: "*://claude.ai/*" }, r));
  if (tabs.length > 0) {
    const data = await new Promise((r) =>
      browser.tabs.sendMessage(tabs[0].id, { type: "FETCH_AND_REPLY" }, (d) => r(d || null))
    );
    if (data) { render(data); return; }
  }

  const cached = await new Promise((r) => browser.runtime.sendMessage({ type: "GET_DATA" }, r));
  render(cached?.data || null);
}

applyStaticText();
document.getElementById("btn-refresh").addEventListener("click", refresh);
load();
