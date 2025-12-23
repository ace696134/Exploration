/* Endless Requium – Room Handler (FIXED) */

document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const bgContainer = document.getElementById("bgContainer");
  const audioName = body.dataset.audio;
  const isMuted = localStorage.getItem("gameMuted") === "1";

  /* ===============================
     BACKGROUND HANDLER (NO BLACK BOX)
  =============================== */
  if (bgContainer) {
    bgContainer.style.position = "fixed";
    bgContainer.style.top = "0";
    bgContainer.style.left = "0";
    bgContainer.style.width = "100vw";
    bgContainer.style.height = "100vh";
    bgContainer.style.zIndex = "0";
    bgContainer.style.overflow = "hidden";
    bgContainer.style.background = "transparent";

    const layers = [...bgContainer.querySelectorAll("img")];
    let current = 0;

    layers.forEach((img, i) => {
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      img.style.width = "100vw";
      img.style.height = "100vh";
      img.style.objectFit = "cover";
      img.style.opacity = i === 0 ? "1" : "0";
      img.style.transition = "opacity 1.5s ease-in-out";
      img.style.pointerEvents = "none";
      img.style.background = "transparent";
    });

    if (layers.length > 1) {
      setInterval(() => {
        layers[current].style.opacity = "0";
        current = (current + 1) % layers.length;
        layers[current].style.opacity = "1";
      }, 5000);
    }
  }

  /* Force content above background */
  document.querySelectorAll(".center-box, #inventory, #invToggle")
    .forEach(el => el.style.zIndex = "2");

  /* ===============================
     FADE IN
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

    ambient.play().then(fadeAudioIn).catch(() => {
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
     GLOBAL ROOM NAV FUNCTION (FIX)
  =============================== */
  window.goToRoom = function (room) {
    localStorage.setItem("lastRoom", location.href);
    body.style.opacity = "0";
    fadeAudioOut(() => {
      setTimeout(() => {
        location.href = room;
      }, 700);
    });
  };

  /* ===============================
     INVENTORY
  =============================== */
  if (window.Inventory) Inventory.load();

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
     PICKUP
  =============================== */
  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.pickup;
      const item = ITEMS_BY_ID[id];
      if (!item) return;

      Inventory.add(id, 1);
      showMessage(`Picked up ${item.name}`);
      refreshInventoryUI();
      btn.remove();
    });
  });

  /* ===============================
     USE ITEMS
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

      goToRoom(next);
    });
  });

});