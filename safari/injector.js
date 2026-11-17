// injector.js — runs in page main world via web_accessible_resources
// Patches window.fetch to detect SSE stream end and notify content script
(function(){
  const _fetch = window.fetch;
  window.fetch = async function(...args){
    const url = (typeof args[0]==="string" ? args[0] : (args[0]?.url||""));
    const isStream = /\/append_message|\/completion|\/retry_completion/.test(url);
    const res = await _fetch.apply(this, args);
    if (isStream && res.body) {
      const [b1, b2] = res.body.tee();
      (async()=>{
        const reader = b2.getReader();
        try { while(!(await reader.read()).done){} } catch(e){}
        window.dispatchEvent(new CustomEvent("cug-stream-done"));
      })();
      return new Response(b1, {status:res.status, statusText:res.statusText, headers:res.headers});
    }
    return res;
  };
})();
