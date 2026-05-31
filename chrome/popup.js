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

async function load() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("main").style.display = "none";

  // Essaie le cache du background
  chrome.runtime.sendMessage({ type: "GET_DATA" }, (cached) => {
    if (cached?.data) { render(cached.data); return; }

    // Injecte dans l'onglet claude.ai actif
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.url?.includes("claude.ai")) { render(null); return; }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          try {
            const m = document.cookie.match(/lastActiveOrg=([a-f0-9-]{36})/i);
            const orgId = m?.[1];
            if (!orgId) return null;
            const res = await fetch(`https://claude.ai/api/organizations/${orgId}/usage`, { credentials: "include" });
            return res.ok ? await res.json() : null;
          } catch(e) { return null; }
        }
      }, (results) => {
        render(results?.[0]?.result || null);
      });
    });
  });
}

document.getElementById("btn-refresh").addEventListener("click", load);
load();
