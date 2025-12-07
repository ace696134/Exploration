/* Endless Requium – Room Handler
   Inventory now supports:
   - item name
   - item image
   - custom color
*/

document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const audioName = body.dataset.audio;
  const bgContainer = document.getElementById("bgContainer");
  const isMuted = localStorage.getItem("gameMuted") === "1";

  /* ---------------- BACKGROUND FADE ---------------- */
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
      img.style.pointerEvents = "none";
    });

    setInterval(() => {
      const prev = current;
      current = (current + 1) % layers.length;
      layers[prev].style.opacity = 0;
      layers[current].style.opacity = 1;
    }, 5000);
  }

  requestAnimationFrame(() => body.classList.add("fade-in"));

  /* ---------------- AUDIO ---------------- */
  let ambient = null;
  if (audioName) {
    ambient = new Audio(`../sounds/${audioName}`);
    ambient.loop = true;
    ambient.volume = 0;
    ambient.muted = isMuted;

    ambient.play()
      .then(() => { if (!isMuted) fadeAudioIn(); })
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
    if (isMuted) { ambient.pause(); return callback(); }
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

  function loadInventory() {
    return JSON.parse(localStorage.getItem("inventory") || "[]");
  }

  function saveInventory(inv) {
    localStorage.setItem("inventory", JSON.stringify(inv));
  }

  function removeItem(name) {
    const inv = loadInventory();
    const lower = name.trim().toLowerCase();
    const filtered = inv.filter(i => i.name.toLowerCase() !== lower);
    saveInventory(filtered);
  }

  function renderInventory() {
    const box = document.querySelector("#inventory");
    if (!box) return;

    box.innerHTML = "";

    loadInventory().forEach(item => {
      const row = document.createElement("div");
      row.className = "inv-item";

      if (item.color) row.style.borderColor = item.color;

      if (item.img) {
        const img = document.createElement("img");
        img.src = item.img;
        img.className = "inv-icon";
        row.appendChild(img);
      }

      const text = document.createElement("span");
      text.textContent = item.name;
      row.appendChild(text);

      box.appendChild(row);
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
    const msg = document.createElement("div");
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
      const name = btn.dataset.pickup.trim();
      const img = btn.dataset.img || null;
      const color = btn.dataset.color || null;

      const inv = loadInventory();
      const exists = inv.some(i => i.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        inv.push({ name, img, color });
        saveInventory(inv);
        renderInventory();
        showMessage(`Picked up: ${name}`);
      }
      btn.remove();
    });
  });

  /* ---------------- USE ITEMS ---------------- */
  document.querySelectorAll("[data-use]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const neededRaw = btn.dataset.use;
      const needed = neededRaw.trim().toLowerCase();
      const next = btn.dataset.jump;

      const inv = loadInventory();
      const match = inv.find(i => i.name.toLowerCase() === needed);

      if (!match) {
        showMessage(`You don't have "${neededRaw}".`);
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

  /* ---------------- ROOM NAVIGATION ---------------- */
  document.querySelectorAll("[data-jump]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      if (btn.hasAttribute("data-use")) return;

      const next = btn.dataset.jump;

      body.style.transition = "opacity 0.8s ease-out";
      body.style.opacity = 0;

      fadeAudioOut(() => {
        setTimeout(() => window.location.href = next, 750);
      });
    });
  });

});
