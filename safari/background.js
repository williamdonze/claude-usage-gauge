// background.js — Safari
// Persiste les données dans storage.local pour survivre aux kills du service worker

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "STORE_DATA") {
    return browser.storage.local.set({ usageData: msg.data }).then(() => ({ ok: true }));
  }
  if (msg.type === "GET_DATA") {
    return browser.storage.local.get("usageData").then((result) => ({ data: result.usageData || null }));
  }
});
