/* ---------------- SANITY SYSTEM ---------------- */

window.Sanity = {
  value: parseInt(localStorage.getItem("sanity")) || 100,
  max: 100,

  save() {
    localStorage.setItem("sanity", String(this.value));
  },

  set(v) {
    this.value = Math.max(0, Math.min(this.max, v));
    this.save();
    this.applyVisualEffects();
    if (this.value <= 0) {
      // death from sanity
      if (window.playerDied) playerDied("sanity");
    }
    if (window.updateSanityUI) window.updateSanityUI();
  },

  change(amount) {
    this.set(this.value + amount);
  },

  applyVisualEffects() {
    // Put a data-state on body for CSS to handle filters/animations
    const body = document.body;
    if (!body) return;

    if (this.value >= 70) body.dataset.sanity = "high";
    else if (this.value >= 30) body.dataset.sanity = "mid";
    else if (this.value > 0) body.dataset.sanity = "low";
    else body.dataset.sanity = "broken";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // ensure effects applied on page load
  Sanity.applyVisualEffects();
});
