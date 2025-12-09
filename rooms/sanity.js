/* rooms/sanity.js — Sanity engine + UI bar */
window.SanitySystem = (function () {
  const KEY = "sanity";
  const MAX = 100;

  function load() {
    const v = parseInt(localStorage.getItem(KEY));
    return Number.isInteger(v) ? v : MAX;
  }
  function save(v) { localStorage.setItem(KEY, String(v)); }

  function clamp(v) { return Math.max(0, Math.min(MAX, Math.round(v))); }

  function applyVisuals(v) {
    document.body.dataset.sanity = v >= 70 ? "high"
      : v >= 30 ? "mid" : v > 0 ? "low" : "broken";
    // update bar
    const bar = document.getElementById("sanityBarFill");
    if (bar) bar.style.width = `${(v / MAX) * 100}%`;
  }

  function set(v, reason) {
    const nv = clamp(v);
    save(nv);
    applyVisuals(nv);
    if (window.updateSanityUI) window.updateSanityUI(nv);
    if (nv <= 0) {
      // death
      if (window.playerDied) playerDied(reason || "sanity");
    }
    return nv;
  }

  function change(delta, reason) {
    return set(load() + delta, reason);
  }

  // Public API
  return {
    init() {
      const v = load();
      applyVisuals(v);
      ensureBar();
    },
    get: load,
    set,
    change
  };

  function ensureBar() {
    if (document.getElementById("sanityBar")) return;
    const div = document.createElement("div");
    div.id = "sanityBar";
    div.innerHTML = `
      <div id="sanityBarLabel">Sanity</div>
      <div id="sanityBarTrack"><div id="sanityBarFill"></div></div>
    `;
    div.style.position = "fixed";
    div.style.left = "20px";
    div.style.bottom = "20px";
    div.style.zIndex = 2000;
    div.style.width = "220px";
    div.style.fontFamily = "Underdog, sans-serif";
    document.body.appendChild(div);
    // minimal styles (can be overridden in CSS)
    const css = document.createElement("style");
    css.textContent = `
      #sanityBar { color: #ffd9d6; font-size: 12px; }
      #sanityBarLabel { margin-bottom:6px; }
      #sanityBarTrack { background: rgba(255,255,255,0.06); border:2px solid #e33; height:12px; border-radius:8px; overflow:hidden; }
      #sanityBarFill { height:100%; width:100%; background: linear-gradient(90deg,#8af,#6bf); transition: width .35s ease; }
    `;
    document.head.appendChild(css);
  }

})();
document.addEventListener("DOMContentLoaded", () => window.SanitySystem.init());
