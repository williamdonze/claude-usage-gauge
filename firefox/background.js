// background.js — Firefox

const MAX_HISTORY = 24;

function badgeColor(pct) {
  if (pct < 50) return "#16a34a";
  if (pct < 75) return "#d97706";
  if (pct < 90) return "#ea580c";
  return "#dc2626";
}

async function updateBadge(data) {
  if (!data) { browser.browserAction.setBadgeText({ text: "" }); return; }
  const pct = Math.round(data.five_hour?.utilization ?? 0);
  const text = pct > 0 ? String(pct) : "";
  await browser.browserAction.setBadgeText({ text });
  await browser.browserAction.setBadgeBackgroundColor({ color: badgeColor(pct) });
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

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "STORE_DATA") {
    return browser.storage.local.set({ usageData: msg.data }).then(async () => {
      await updateBadge(msg.data);
      await appendHistory(msg.data);
      return { ok: true };
    });
  }
  if (msg.type === "GET_DATA") {
    return browser.storage.local.get(["usageData", "usageHistory"]).then((result) => ({
      data: result.usageData || null,
      history: result.usageHistory || [],
    }));
  }
});

// Restore badge on startup
browser.storage.local.get("usageData").then(({ usageData }) => updateBadge(usageData || null));
