// background.js — Chrome MV3 (service worker)
let cachedData = null;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "STORE_DATA") {
    cachedData = msg.data;
    sendResponse({ ok: true });
  }
  if (msg.type === "GET_DATA") {
    sendResponse({ data: cachedData });
  }
  return true;
});
