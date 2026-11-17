// background.js — Chrome MV3

const MAX_HISTORY = 24;

function badgeColor(pct) {
  if (pct < 50) return "#16a34a";
  if (pct < 75) return "#d97706";
  if (pct < 90) return "#ea580c";
  return "#dc2626";
}

async function updateBadge(data) {
  if (!data) { chrome.action.setBadgeText({ text: "" }); return; }
  const pct = Math.round(data.five_hour?.utilization ?? 0);
  const text = pct > 0 ? String(pct) : "";
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color: badgeColor(pct) });
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
    await updateBadge(data);
    await appendHistory(data);
    return data;
  } catch(e) { return null; }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "STORE_DATA") {
    chrome.storage.local.set({ usageData: msg.data }, async () => {
      await updateBadge(msg.data);
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

// Restore badge on startup
chrome.storage.local.get("usageData", ({ usageData }) => updateBadge(usageData || null));
