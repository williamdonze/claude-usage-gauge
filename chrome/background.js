// background.js — Chrome MV3 (service worker)
// Persiste les données dans storage.local pour survivre aux kills du service worker

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
    return data;
  } catch(e) { return null; }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "STORE_DATA") {
    chrome.storage.local.set({ usageData: msg.data }, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "GET_DATA") {
    chrome.storage.local.get("usageData", (result) => sendResponse({ data: result.usageData || null }));
    return true;
  }
  if (msg.type === "FETCH_NOW") {
    fetchUsage().then((data) => sendResponse({ data }));
    return true;
  }
});
