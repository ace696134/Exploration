/* Endless Requium - Room Handler
   Fully robust version:
   - Sequential background fade
   - Ambient audio with fade in/out
   - Inventory with images + colors
   - Popup messages
   - Room navigation
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

  /* ---------------- BODY FADE-IN ---------------- */
  requestAnimationFrame(() => body.classList.add("fade-in"));

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
      ambient.volume = v;
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

  /* ---------------- INVENTORY ---------------- */

  // New format: [{name:"Silver Key", img:"...", color:"#fff"}]
  function loadInventory() {
    return JSON.parse(localStorage.getItem("inventory") || "[]");
  }

  function saveInventory(inv) {
    localStorage.setItem("inventory", JSON.stringify(inv));
  }

  function addItem(itemObj) {
    const inv = loadInventory();
    if (!inv.some(i => i.name.toLowerCase() === itemObj.name.toLowerCase())) {
      inv.push(itemObj);
      saveInventory(inv);
    }
  }

  function removeItem(name) {
    saveInventory(
      loadInventory().filter(i => i.name.toLowerCase() !== name.toLowerCase())
    );
  }

  function renderInventory() {
    const invBox = document.querySelector("#inventory");
    if (!invBox) return;

    invBox.innerHTML = "";

    loadInventory().forEach(item => {
      const div = document.createElement("div");
      div.className = "inv-item";

      if (item.color) {
        div.style.backgroundColor = item.color;
      }

      div.innerHTML = `
        <img src="${item.img}" class="inv-icon">
        <span>${item.name}</span>
      `;

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

  /* ---------------- PICKUP ITEMS (JSON inside attribute) ---------------- */
  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {

      const itemObj = JSON.parse(btn.dataset.pickup);

      addItem(itemObj);
      renderInventory();
      showMessage(`Picked up: ${itemObj.name}`);

      btn.remove();
    });
  });

  /* ---------------- USE ITEM TO UNLOCK ---------------- */
  document.querySelectorAll("[data-use]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const neededName = btn.dataset.use.trim(); // string
      const next = btn.dataset.jump;

      const inv = loadInventory().map(i => i.name.toLowerCase());

      if (!inv.includes(neededName.toLowerCase())) {
        showMessage(`You don't have "${neededName}".`);
        return;
      }

      removeItem(neededName);
      renderInventory();
      showMessage(`Used: ${neededName}`);

      body.style.transition = "opacity 0.8s ease-out";
      body.style.opacity = 0;

      fadeAudioOut(() => {
        setTimeout(() => window.location.href = next, 750);
      });
    });
  });

  /* ---------------- ROOM NAVIGATION ---------------- */
  document.querySelectorAll("[data-jump]").forEach(btn => {
    btn.addEventListener("click", () => {

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
