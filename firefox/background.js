// background.js — Firefox MV2

const MAX_HISTORY = 24;

function badgeColor(pct) {
  if (pct < 50) return "#16a34a";
  if (pct < 75) return "#d97706";
  if (pct < 90) return "#ea580c";
  return "#dc2626";
}

let cachedIconBitmap = null;

async function getIconBitmap() {
  if (cachedIconBitmap) return cachedIconBitmap;
  try {
    const url = browser.runtime.getURL("icons/icon96.png");
    const res = await fetch(url);
    const blob = await res.blob();
    cachedIconBitmap = await createImageBitmap(blob);
  } catch(e) {}
  return cachedIconBitmap;
}

async function updateIcon(data) {
  const size = 96;
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const bitmap = await getIconBitmap();
  if (bitmap) ctx.drawImage(bitmap, 0, 0, size, size);

  if (data) {
    const pct = Math.round(data.five_hour?.utilization ?? 0);
    if (pct > 0) {
      const text = pct >= 100 ? "!!" : String(pct);
      const r = 22;
      const cx = size - r - 2, cy = size - r - 2;

      // colored circle badge
      ctx.fillStyle = badgeColor(pct);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // white border
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // percentage text
      const fontSize = text.length > 2 ? 17 : 20;
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, cx, cy + 1);
    }
  }

  const imageData = ctx.getImageData(0, 0, size, size);
  browser.browserAction.setIcon({ imageData: { 96: imageData } });
}

async function appendHistory(data) {
  const { usageHistory = [] } = await browser.storage.local.get("usageHistory");
  usageHistory.push({
    t: Date.now(),
    h5: Math.round(data.five_hour?.utilization ?? 0),
    d7: Math.round(data.seven_day?.utilization ?? 0),
  });
  if (usageHistory.length > MAX_HISTORY) usageHistory.splice(0, usageHistory.length - MAX_HISTORY);
  await browser.storage.local.set({ usageHistory });
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
    await browser.storage.local.set({ usageData: data });
    await updateIcon(data);
    await appendHistory(data);
    return data;
  } catch(e) { return null; }
}

browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "STORE_DATA") {
    browser.storage.local.set({ usageData: msg.data }, async () => {
      await updateIcon(msg.data);
      await appendHistory(msg.data);
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === "GET_DATA") {
    browser.storage.local.get(["usageData", "usageHistory"], (result) => {
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
browser.storage.local.get("usageData", ({ usageData }) => updateIcon(usageData || null));
