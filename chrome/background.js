// background.js — Chrome MV3 (service worker)
// Persiste les données dans storage.local pour survivre aux kills du service worker

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "STORE_DATA") {
    chrome.storage.local.set({ usageData: msg.data }, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "GET_DATA") {
    chrome.storage.local.get("usageData", (result) => sendResponse({ data: result.usageData || null }));
    return true;
  }
});
