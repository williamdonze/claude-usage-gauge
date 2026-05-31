// popup.js — Chrome MV3

function formatResetIn(isoDate) {
  if (!isoDate) return "—";
  const diff = new Date(isoDate) - Date.now();
  if (diff <= 0) return "reset imminent";
  const totalMinutes = Math.floor(diff / 60000);
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  if (d > 0) return h > 0 ? `${d}j ${h}h` : `${d}j`;
  if (h > 0) return `${h}h ${m.toString().padStart(2,"0")}m`;
  return `${m}m`;
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

  // 1. Cache du background
  const cached = await new Promise((r) => chrome.runtime.sendMessage({ type: "GET_DATA" }, r));
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

document.getElementById("btn-refresh").addEventListener("click", load);
load();
