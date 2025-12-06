/* Endless Requium - Room Handler
   Handles: sequential background fade, ambient audio, inventory toggle,
   pickups, item-use unlocking, and room navigation with fade transitions.
*/

document.addEventListener("DOMContentLoaded", function () {

  const body = document.body;
  const audioName = body.dataset.audio;
  const bgContainer = document.getElementById("bgContainer");
  const isMuted = localStorage.getItem("gameMuted") === "1";

  /* ---------------- BACKGROUND SEQUENTIAL FADE ---------------- */
  if (bgContainer) {
    const layers = Array.from(bgContainer.querySelectorAll("img"));
    let current = 0;

    layers.forEach(img => {
      img.style.opacity = 0;
      img.style.transition = "opacity 1.5s ease";
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.pointerEvents = "none";   // prevents clicking blocking buttons
    });

    function showNextBg() {
      layers.forEach(img => img.style.opacity = 0);
      layers[current].style.opacity = 1;
      current = (current + 1) % layers.length;
    }

    showNextBg();
    setInterval(showNextBg, 5000);
  }

  /* ---------------- BODY FADE-IN ---------------- */
  requestAnimationFrame(() => {
    body.style.opacity = 0;
  });

  /* ---------------- AMBIENT AUDIO ---------------- */
  let ambient = null;
  if (audioName) {
    ambient = new Audio(`../sounds/${audioName}`);
    ambient.loop = true;
    ambient.volume = 0;
    ambient.muted = isMuted;

    ambient.play()
      .then(() => {
        if (!isMuted) fadeAudioIn();
      })
      .catch(() => {
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

  /* ---------------- INVENTORY FUNCTIONS ---------------- */
  function loadInventory() {
    return JSON.parse(localStorage.getItem("inventory") || "[]");
  }
  function saveInventory(inv) {
    localStorage.setItem("inventory", JSON.stringify(inv));
  }
  function removeItem(name) {
    saveInventory(loadInventory().filter(i => i !== name));
  }
  function renderInventory() {
    const invBox = document.querySelector("#inventory");
    if (!invBox) return;
    invBox.innerHTML = "";
    loadInventory().forEach(item => {
      const div = document.createElement("div");
      div.className = "inv-item";
      div.textContent = item;
      invBox.appendChild(div);
    });
  }
  renderInventory();

  /* ---------------- INVENTORY TOGGLE ---------------- */
  const invBox = document.querySelector("#inventory");
  const toggleBtn = document.querySelector("#invToggle");

  if (toggleBtn && invBox) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = invBox.classList.contains("visible");
      if (isOpen) {
        invBox.classList.remove("visible");
        setTimeout(() => invBox.classList.add("hidden"), 300);
      } else {
        invBox.classList.remove("hidden");
        requestAnimationFrame(() => {
          invBox.classList.add("visible");
        });
      }
    });
  }

  /* ---------------- POPUP MESSAGE ---------------- */
  function showMessage(text, duration = 2000) {
    let msg = document.createElement("div");
    msg.className = "popup-message";
    msg.textContent = text;
    document.body.append(msg);

    msg.style.opacity = 0;
    requestAnimationFrame(() => {
      msg.style.transition = "opacity 0.3s ease-out";
      msg.style.opacity = 1;
    });

    setTimeout(() => {
      msg.style.opacity = 0;
      msg.addEventListener("transitionend", () => msg.remove());
    }, duration);
  }

  /* ---------------- PICKUP ITEMS ---------------- */
  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.dataset.pickup;
      const inv = loadInventory();
      if (!inv.includes(item)) {
        inv.push(item);
        saveInventory(inv);
        renderInventory();
        showMessage(`Picked up: ${item}`);
      }
      btn.remove();
    });
  });

  /* ---------------- ROOM NAVIGATION ---------------- */
  document.querySelectorAll("[data-jump]").forEach(btn => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.jump;
      body.style.transition = "opacity 0.8s ease-out";
      body.style.opacity = 0;

      fadeAudioOut(() => {
        setTimeout(() => window.location.href = next, 750);
      });
    });
  });

  /* ---------------- USE ITEM TO UNLOCK ---------------- */
  document.querySelectorAll("[data-use]").forEach(btn => {
    btn.addEventListener("click", () => {
      const needed = btn.dataset.use;
      const next = btn.dataset.jump;

      const inv = loadInventory();
      if (!inv.includes(needed)) {
        showMessage(`You don’t have “${needed}”.`);
        return;
      }

      removeItem(needed);
      renderInventory();
      showMessage(`Used: ${needed}`);

      body.style.transition = "opacity 0.8s ease-out";
      body.style.opacity = 0;

      fadeAudioOut(() => {
        setTimeout(() => window.location.href = next, 750);
      });
    });
  });

});
