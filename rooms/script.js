/* Endless Requium - Room Handler
   Handles: sequential background fade, ambient audio, inventory toggle,
   pickups, and room navigation with fade transitions.
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
      img.style.opacity = 0;
      img.style.transition = "opacity 1.5s ease";
      img.style.position = "absolute";
      img.style.top = 0;
      img.style.left = 0;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
    });

    function showNextBg() {
      layers.forEach((img, i) => img.style.opacity = 0);
      layers[current].style.opacity = 1;
      current = (current + 1) % layers.length;
    }

    // Show first image immediately
    showNextBg();

    // Change background every 5 seconds
    setInterval(showNextBg, 5000);
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

  /* ---------------- INVENTORY ---------------- */
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

  function renderInventory() {
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

  /* ---------------- PICKUP ITEMS ---------------- */
  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToInventory(btn.dataset.pickup);
      btn.remove();
    });
  });

  /* ---------------- ROOM NAVIGATION ---------------- */
  const buttons = document.querySelectorAll("[data-jump]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.jump;
      body.style.transition = "opacity 0.8s ease-out";
      body.style.opacity = 0;
      fadeAudioOut(() => setTimeout(() => window.location.href = next, 750));
    });
  });
  /* ---------------- USE ITEM TO UNLOCK NEXT ROOM ---------------- */
  document.querySelectorAll("[data-use]").forEach(btn => {
    btn.addEventListener("click", () => {
      const needed = btn.dataset.use;
      const next = btn.dataset.jump;

      const inv = loadInventory();

      if (!inv.includes(needed)) {
        console.warn("Missing required item:", needed);
        return; // No item → block action
      }

      // Remove used item
      const updated = inv.filter(i => i !== needed);
      saveInventory(updated);
      renderInventory();

      // Fade → go to next room
      body.style.transition = "opacity 0.8s ease-out";
      body.style.opacity = 0;

      fadeAudioOut(() => {
        setTimeout(() => {
          window.location.href = next;
        }, 800);
      });
    });
  });

});


