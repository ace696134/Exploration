/* Endless Requium – Unified Room Script */

document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const audioName = body.dataset.audio;
  const bgContainer = document.getElementById("bgContainer");
  const isMuted = localStorage.getItem("gameMuted") === "1";

  /* =====================================================
     BACKGROUND FADE
     ===================================================== */
  if (bgContainer) {
    const layers = [...bgContainer.querySelectorAll("img")];
    let current = 0;

    layers.forEach((img, i) => {
      img.style.opacity = i === 0 ? 1 : 0;
      img.style.position = "absolute";
      img.style.inset = "0";
      img.style.transition = "opacity 1.5s ease";
      img.style.objectFit = "cover";
      img.style.pointerEvents = "none";
    });

    if (layers.length > 1) {
      setInterval(() => {
        const prev = current;
        current = (current + 1) % layers.length;
        layers[prev].style.opacity = 0;
        layers[current].style.opacity = 1;
      }, 5000);
    }
  }

  /* =====================================================
     BODY FADE
     ===================================================== */
  requestAnimationFrame(() => body.classList.add("fade-in"));

  /* =====================================================
     AUDIO
     ===================================================== */
  let ambient = null;

  if (audioName) {
    ambient = new Audio(`../sounds/${audioName}`);
    ambient.loop = true;
    ambient.volume = 0;
    ambient.muted = isMuted;

    ambient.play().then(() => {
      if (!isMuted) fadeAudioIn();
    }).catch(() => {
      window.addEventListener("click", unlockAudio, { once: true });
      window.addEventListener("keydown", unlockAudio, { once: true });
    });
  }

  function unlockAudio() {
    if (!ambient) return;
    ambient.play();
    if (!isMuted) fadeAudioIn();
  }

  function fadeAudioIn() {
    let v = 0;
    const i = setInterval(() => {
      v += 0.02;
      ambient.volume = Math.min(0.6, v);
      if (v >= 0.6) clearInterval(i);
    }, 40);
  }

  function fadeAudioOut(cb) {
    if (!ambient) return cb();
    let v = ambient.volume;
    const i = setInterval(() => {
      v -= 0.03;
      ambient.volume = Math.max(0, v);
      if (v <= 0) {
        clearInterval(i);
        ambient.pause();
        cb();
      }
    }, 40);
  }

  /* =====================================================
     POPUP MESSAGE (FIXED — NO STACKING)
     ===================================================== */
  let activePopup = null;

  window.showMessage = function (text, duration = 2000) {
    if (activePopup) activePopup.remove();

    const msg = document.createElement("div");
    msg.className = "popup-message";
    msg.textContent = text;
    document.body.appendChild(msg);
    activePopup = msg;

    requestAnimationFrame(() => msg.style.opacity = "1");

    setTimeout(() => {
      msg.style.opacity = "0";
      msg.addEventListener("transitionend", () => {
        if (msg === activePopup) activePopup = null;
        msg.remove();
      });
    }, duration);
  };

  /* =====================================================
     INVENTORY TOGGLE
     ===================================================== */
  const invToggle = document.getElementById("invToggle");
  const invBox = document.getElementById("inventory");

  if (invToggle && invBox) {
    invToggle.addEventListener("click", () => {
      invBox.classList.toggle("visible");
      if (window.refreshInventoryUI) refreshInventoryUI();
    });
  }

  /* =====================================================
     PICKUP SYSTEM (ID-BASED, STACKING SAFE)
     ===================================================== */
  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.pickup;
      const item = ITEMS_BY_ID[id];

      if (!item) {
        console.error("Unknown item:", id);
        return;
      }

      Inventory.add(id, 1);
      showMessage(`Picked up ${item.name}`);
      if (window.refreshInventoryUI) refreshInventoryUI();
      btn.remove();
    });
  });

  /* =====================================================
     USE ITEMS
     ===================================================== */
  document.querySelectorAll("[data-use]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();

      const id = btn.dataset.use;
      const item = ITEMS_BY_ID[id];

      if (!item || !Inventory.has(id, 1)) {
        showMessage(`You don't have ${item?.name || id}`);
        return;
      }

      Inventory.remove(id, 1);
      showMessage(`Used ${item.name}`);
      if (window.refreshInventoryUI) refreshInventoryUI();

      const next = btn.dataset.jump;
      if (next) {
        localStorage.setItem("lastRoom", location.href);
        body.classList.add("fade-out");
        fadeAudioOut(() => setTimeout(() => location.href = next, 600));
      }
    });
  });

  /* =====================================================
     ROOM NAVIGATION
     ===================================================== */
  document.querySelectorAll("[data-jump]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.use) return;

      localStorage.setItem("lastRoom", location.href);
      body.classList.add("fade-out");
      fadeAudioOut(() => setTimeout(() => location.href = btn.dataset.jump, 600));
    });
  });

  /* =====================================================
     SANITY SYSTEM (HOOKS YOUR CSS)
     ===================================================== */
  function loadSanity() {
    let s = Number(localStorage.getItem("sanity"));
    if (isNaN(s)) s = 100;
    localStorage.setItem("sanity", s);
    return s;
  }

  function saveSanity(v) {
    localStorage.setItem("sanity", v);
  }

  window.changeSanity = function (amount) {
    let s = loadSanity();
    s = Math.max(0, Math.min(100, s + amount));
    saveSanity(s);
    applySanityEffects(s);
    if (s <= 0) location.href = "../rooms/death.html";
  };

  function applySanityEffects(s) {
    body.dataset.sanity =
      s > 60 ? "high" :
      s > 35 ? "mid" :
      s > 15 ? "low" : "broken";
  }

  applySanityEffects(loadSanity());

  /* =====================================================
     DODGE SYSTEM (FIXED)
     ===================================================== */
  let dodgeActive = false;
  let dodgeTimer = null;

  window.startDodgeWindow = function (ms = 800) {
    dodgeActive = true;
    clearTimeout(dodgeTimer);
    dodgeTimer = setTimeout(() => {
      dodgeActive = false;
      changeSanity(-15);
    }, ms);
  };

  document.addEventListener("keydown", e => {
    if (dodgeActive && e.key.toLowerCase() === "d") {
      dodgeActive = false;
      clearTimeout(dodgeTimer);
      const flash = document.getElementById("dodgeFlash");
      if (flash) {
        flash.classList.add("active");
        setTimeout(() => flash.classList.remove("active"), 150);
      }
      showMessage("Dodged!");
    }
  });

});