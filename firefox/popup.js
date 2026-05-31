// popup.js v3

function formatResetIn(isoDate) {
  if (!isoDate) return "—";
  const diff = new Date(isoDate) - Date.now();
  if (diff <= 0) return "reset imminent";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m.toString().padStart(2,"0")}m`;
  return `${m}m`;
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

async function load() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("main").style.display = "none";

  // Essaie d'abord les données en cache
  const cached = await browser.runtime.sendMessage({ type: "GET_DATA" });
  if (cached?.data) { render(cached.data); return; }

  // Sinon demande à l'onglet actif de charger
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (tab?.url?.includes("claude.ai")) {
    // Injecte un script pour récupérer les données fraîches
    browser.tabs.executeScript(tab.id, {
      code: `
        (async () => {
          try {
            const orgRes = await fetch('/api/organizations', { credentials: 'include' });
            const orgs = await orgRes.json();
            const id = orgs?.[0]?.uuid || orgs?.[0]?.id;
            if (!id) return null;
            const res = await fetch('/api/organizations/' + id + '/usage', { credentials: 'include' });
            return await res.json();
          } catch(e) { return null; }
        })()
      `,
      matchAboutBlank: false
    }).then(results => {
      render(results?.[0] || null);
    }).catch(() => render(null));
  } else {
    render(null);
  }
}

document.getElementById("btn-refresh").addEventListener("click", load);
load();
