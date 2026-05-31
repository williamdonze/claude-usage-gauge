// background.js — stocke les dernières données d'usage pour le popup

let cachedData = null;

browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "STORE_DATA") {
    cachedData = msg.data;
    sendResponse({ ok: true });
  }
  if (msg.type === "GET_DATA") {
    sendResponse({ data: cachedData });
  }
});
