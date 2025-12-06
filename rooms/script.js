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

    layers.forEach((img, i) => {
      img.style.opacity = i === 0 ? 1 : 0;
      img.style.transition = "opacity 1.5s ease";
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.pointerEvents = "none";   // prevent clicking blocking buttons
    });

    function showNextBg() {
      const prev = current;
      current = (current + 1) % layers.length;
      layers[prev].style.opacity = 0;
      layers[current].style.opacity = 1;
    }

    setInterval(showNextBg, 5000);
  }

  /* ---------------- BODY FADE-IN ---------------- */
  requestAnimationFrame(() => {
    body.classList.add("fade-in");
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
    return JSON.parse(localStorage.getItem("inventory") || "[]").map(i => i.trim());
  }

  function saveInventory(inv) {
    localStorage.setItem("inventory", JSON.stringify(inv));
  }

  function removeItem(name) {
    const updatedInv = loadInventory().filter(i => i.toLowerCase() !== name.trim().toLowerCase());
    saveInventory(updatedInv);
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
      invBox.classList.toggle("visible");
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
      msg.addEventListener("transitionend", function handler() {
        msg.remove();
        msg.removeEventListener("transitionend", handler);
      });
    }, duration);
  }

  /* ---------------- PICKUP ITEMS ---------------- */
  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.dataset.pickup.trim();
      const inv = loadInventory().map(i => i.trim());
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
      const neededRaw = btn.dataset.use;
      const needed = neededRaw.trim().toLowerCase();
      const next = btn.dataset.jump;

      const inv = loadInventory().map(i => i.trim().toLowerCase());

      if (!inv.includes(needed)) {
        showMessage(`You don’t have “${neededRaw}”.`);
        return;
      }

      removeItem(neededRaw);
      renderInventory();
      showMessage(`Used: ${neededRaw}`);

      body.style.transition = "opacity 0.8s ease-out";
      body.style.opacity = 0;

      fadeAudioOut(() => {
        setTimeout(() => window.location.href = next, 750);
      });
    });
  });

});
