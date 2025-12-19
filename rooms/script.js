/* Endless Requium – Room Handler (FIXED & CONSOLIDATED) */

document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const bgContainer = document.getElementById("bgContainer");
  const audioName = body.dataset.audio;
  const isMuted = localStorage.getItem("gameMuted") === "1";

  /* ===============================
     BACKGROUND HANDLER (FIXED)
  =============================== */
  if (bgContainer) {
    bgContainer.style.position = "fixed";
    bgContainer.style.inset = "0";
    bgContainer.style.zIndex = "-1";
    bgContainer.style.overflow = "hidden";

    const layers = Array.from(bgContainer.querySelectorAll("img"));
    let current = 0;

    layers.forEach((img, i) => {
      img.style.position = "absolute";
      img.style.inset = "0";
      img.style.width = "100vw";
      img.style.height = "100vh";
      img.style.objectFit = "cover";
      img.style.opacity = i === 0 ? "1" : "0";
      img.style.transition = "opacity 1.5s ease-in-out";
      img.style.pointerEvents = "none";
    });

    if (layers.length > 1) {
      setInterval(() => {
        layers[current].style.opacity = "0";
        current = (current + 1) % layers.length;
        layers[current].style.opacity = "1";
      }, 5000);
    }
  }

  /* ===============================
     BODY FADE
  =============================== */
  requestAnimationFrame(() => body.classList.add("fade-in"));

  /* ===============================
     AUDIO
  =============================== */
  let ambient = null;

  if (audioName) {
    ambient = new Audio(`../sounds/${audioName}`);
    ambient.loop = true;
    ambient.volume = 0;
    ambient.muted = isMuted;

    ambient.play().then(() => fadeAudioIn()).catch(() => {
      window.addEventListener("click", startAudio);
      window.addEventListener("keydown", startAudio);
    });
  }

  function startAudio() {
    ambient.play();
    fadeAudioIn();
    window.removeEventListener("click", startAudio);
    window.removeEventListener("keydown", startAudio);
  }

  function fadeAudioIn() {
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      ambient.volume = Math.min(0.6, v);
      if (v >= 0.6) clearInterval(fade);
    }, 50);
  }

  function fadeAudioOut(cb) {
    if (!ambient) return cb();
    let v = ambient.volume;
    const fade = setInterval(() => {
      v -= 0.03;
      ambient.volume = Math.max(0, v);
      if (v <= 0) {
        clearInterval(fade);
        ambient.pause();
        cb();
      }
    }, 40);
  }

  /* ===============================
     INVENTORY (SINGLE SOURCE)
  =============================== */
  Inventory.load();

  function showMessage(text, duration = 2000) {
    if (document.querySelector(".popup-message")) return;

    const msg = document.createElement("div");
    msg.className = "popup-message";
    msg.textContent = text;
    document.body.appendChild(msg);

    requestAnimationFrame(() => msg.style.opacity = "1");

    setTimeout(() => {
      msg.style.opacity = "0";
      msg.addEventListener("transitionend", () => msg.remove());
    }, duration);
  }

  /* ===============================
     PICKUP SYSTEM (FIXED)
     data-pickup="silver_key"
  =============================== */
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
      refreshInventoryUI();
      btn.remove();
    });
  });

  /* ===============================
     USE ITEMS
     data-use="silver_key"
  =============================== */
  document.querySelectorAll("[data-use]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.use;
      const next = btn.dataset.jump;

      if (!Inventory.has(id)) {
        showMessage("You don't have that.");
        return;
      }

      Inventory.remove(id, 1);
      refreshInventoryUI();
      showMessage("Used item.");

      body.style.opacity = 0;
      fadeAudioOut(() => {
        setTimeout(() => location.href = next, 700);
      });
    });
  });

  /* ===============================
     ROOM NAVIGATION
  =============================== */
  document.querySelectorAll("[data-jump]").forEach(btn => {
    if (btn.hasAttribute("data-use")) return;

    btn.addEventListener("click", () => {
      localStorage.setItem("lastRoom", location.href);
      body.style.opacity = 0;
      fadeAudioOut(() =>
        setTimeout(() => location.href = btn.dataset.jump, 700)
      );
    });
  });

  /* ===============================
     DODGE SYSTEM (UNCHANGED)
  =============================== */
  let dodgeWindow = false;
  let dodgeTimeout = null;

  window.startDodgeWindow = function (time = 800) {
    dodgeWindow = true;
    dodgeTimeout = setTimeout(() => {
      dodgeWindow = false;
      changeSanity(-15, "hit");
    }, time);
  };

  document.addEventListener("keydown", e => {
    if (dodgeWindow && e.key.toLowerCase() === "d") {
      dodgeWindow = false;
      clearTimeout(dodgeTimeout);
      console.log("Dodged");
    }
  });

});
