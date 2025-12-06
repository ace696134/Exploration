/* Endless Requium - Room Handler
   Handles: stacked background fade-in, ambient audio, inventory toggle,
   pickups, and room navigation with fade transitions.
*/

document.addEventListener("DOMContentLoaded", function () {

  const body = document.body;
  const audioName = body.dataset.audio;
  const bgContainer = document.getElementById("bgContainer");
  const isMuted = localStorage.getItem("gameMuted") === "1";

  /* ---------------- BACKGROUND FADE-IN ---------------- */
  if (bgContainer) {
    const layers = Array.from(bgContainer.querySelectorAll("img"));
    layers.forEach((img, i) => {
      img.style.opacity = 0;
      img.style.transition = "opacity 1.2s ease";
      setTimeout(() => img.style.opacity = 1, i * 600); // stagger fade
    });
  }

  /* ---------------- BODY FADE-IN ---------------- */
  requestAnimationFrame(() => {
    body.style.opacity = 1;
  });

  /* ---------------- AMBIENT AUDIO ---------------- */
  let ambient = null;

  if (audioName) {
    ambient = new Audio(`../sounds/${audioName}`);
    ambient.loop = true;
    ambient.volume = 0;
    ambient.muted = isMuted;

    ambient.play().then(() => {
      if (!isMuted) fadeAudioIn();
    }).catch(() => {
      // Autoplay blocked → fallback to first gesture
      window.addEventListener("click", startAudioFallback);
      window.addEventListener("keydown", startAudioFallback);
    });
  }

  function startAudioFallback() {
    if (ambient) {
      ambient.play();
      if (!isMuted) fadeAudioIn();
    }
    window.removeEventListener("click", startAudioFallback);
    window.removeEventListener("keydown", startAudioFallback);
  }

  function fadeAudioIn() {
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      if (ambient) ambient.volume = v;
      if (v >= 0.6) clearInterval(fade);
    }, 50);
  }

  function fadeAudioOut(callback) {
    if (!ambient) return callback();
    if (isMuted) {
      ambient.pause();
      return callback();
    }
    let v = ambient.volume;
    const fade = setInterval(() => {
      v -= 0.03;
      ambient.volume = Math.max(0, v);
      if (v <= 0) {
        clearInterval(fade);
        ambient.pause();
        callback();
      }
    }, 40);
  }

  /* ---------------- INVENTORY SYSTEM ---------------- */
  const invBox = document.querySelector("#inventory");
  const toggleBtn = document.querySelector("#invToggle");

  function loadInventory() {
    const stored = localStorage.getItem("inventory");
    return stored ? JSON.parse(stored) : [];
  }

  function saveInventory(inv) {
    localStorage.setItem("inventory", JSON.stringify(inv));
  }

  function addToInventory(item) {
    const inv = loadInventory();
    if (!inv.includes(item)) inv.push(item);
    saveInventory(inv);
    renderInventory();
  }

  function removeFromInventory(item) {
    const inv = loadInventory().filter(i => i !== item);
    saveInventory(inv);
    renderInventory();
  }

  function renderInventory() {
    if (!invBox) return;
    invBox.innerHTML = "";
    loadInventory().forEach(item => {
      const slot = document.createElement("div");
      slot.className = "inv-item";
      slot.textContent = item;
      invBox.appendChild(slot);
    });
  }

  renderInventory();

  /* Toggle button for inventory */
  if (toggleBtn && invBox) {
    toggleBtn.addEventListener("click", () => {
      const open = invBox.classList.contains("visible");
      if (open) {
        invBox.classList.remove("visible");
        setTimeout(() => invBox.classList.add("hidden"), 300);
      } else {
        invBox.classList.remove("hidden");
        requestAnimationFrame(() => invBox.classList.add("visible"));
      }
    });
  }

  /* ---------------- PICKUP / REMOVE ITEMS ---------------- */
  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToInventory(btn.dataset.pickup);
      btn.remove(); // optional: remove from screen after pickup
    });
  });

  document.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromInventory(btn.dataset.remove);
    });
  });

  /* ---------------- ROOM NAVIGATION ---------------- */
  const buttons = document.querySelectorAll("[data-jump]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.jump;
      body.style.transition = "opacity 0.8s ease-out";
      body.style.opacity = 0;

      fadeAudioOut(() => {
        setTimeout(() => {
          window.location.href = next;
        }, 750);
      });
    });
  });
});
