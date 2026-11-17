// background.js — Chrome MV3

const MAX_HISTORY = 24;

function arcColor(pct) {
  if (pct < 50) return "#16a34a";
  if (pct < 75) return "#d97706";
  if (pct < 90) return "#ea580c";
  return "#dc2626";
}

async function updateIcon(data) {
  const size = 128;
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const pct = data ? Math.round(data.five_hour?.utilization ?? 0) : 0;
  const cx = size / 2, cy = size / 2;
  const r = 50, lw = 18;

  // Track ring (light gray)
  ctx.strokeStyle = "rgba(0,0,0,0.13)";
  ctx.lineWidth = lw;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Filled arc (clockwise from top)
  if (pct > 0) {
    const start = -Math.PI / 2;
    const end   = start + (Math.min(pct, 100) / 100) * Math.PI * 2;
    ctx.strokeStyle = arcColor(pct);
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.stroke();
  }

  // Percentage text in center
  const label = pct > 0 ? `${pct}%` : "";
  if (label) {
    const fontSize = label.length > 3 ? 26 : 30;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = arcColor(pct);
    ctx.fillText(label, cx, cy + 1);
  }

  const imageData = ctx.getImageData(0, 0, size, size);
  chrome.action.setIcon({ imageData: { 128: imageData } });
}

async function appendHistory(data) {
  const { usageHistory = [] } = await chrome.storage.local.get("usageHistory");
  usageHistory.push({
    t: Date.now(),
    h5: Math.round(data.five_hour?.utilization ?? 0),
    d7: Math.round(data.seven_day?.utilization ?? 0),
  });
  if (usageHistory.length > MAX_HISTORY) usageHistory.splice(0, usageHistory.length - MAX_HISTORY);
  await chrome.storage.local.set({ usageHistory });
}

async function fetchUsage() {
  try {
    const orgsRes = await fetch("https://claude.ai/api/organizations", { credentials: "include" });
    if (!orgsRes.ok) return null;
    const orgs = await orgsRes.json();
    const orgId = orgs?.[0]?.uuid || orgs?.[0]?.id;
    if (!orgId) return null;
    const res = await fetch(`https://claude.ai/api/organizations/${orgId}/usage`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    await chrome.storage.local.set({ usageData: data });
    await updateIcon(data);
    await appendHistory(data);
    return data;
  } catch(e) { return null; }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "STORE_DATA") {
    chrome.storage.local.set({ usageData: msg.data }, async () => {
      await updateIcon(msg.data);
      await appendHistory(msg.data);
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === "GET_DATA") {
    chrome.storage.local.get(["usageData", "usageHistory"], (result) => {
      sendResponse({ data: result.usageData || null, history: result.usageHistory || [] });
    });
    return true;
  }
  if (msg.type === "FETCH_NOW") {
    fetchUsage().then((data) => sendResponse({ data }));
    return true;
  }
});

// Restore icon on startup
chrome.storage.local.get("usageData", ({ usageData }) => updateIcon(usageData || null));
