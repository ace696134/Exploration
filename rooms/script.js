/* Endless Requium - Room Handler
   Handles background, autoplay-safe audio, fade transitions,
   and mute state carried over from title screen.
*/

document.addEventListener("DOMContentLoaded", function () {

  const body = document.body;
  const audioName = body.dataset.audio;
  const bg = body.dataset.bg;

  /* ---------------- LOAD MUTE STATE ---------------- */
  const isMuted = localStorage.getItem("gameMuted") === "1";

  /* ---------------- BACKGROUND SET ---------------- */
  if (bg) {
    if (bg.startsWith("file:///")) {
      body.style.backgroundImage = `url("${bg}")`;
    } else {
      body.style.backgroundImage = `url("../images/${bg}")`;
    }
  }

  /* ---------------- FADE IN ---------------- */
  body.style.opacity = 0;
  requestAnimationFrame(() => {
    body.style.transition = "opacity 1s ease-out";
    body.style.opacity = 1;
  });

  /* ---------------- AUDIO ---------------- */
  let ambient = null;

  if (audioName) {
    const audioPath = audioName.startsWith("file:///")
      ? audioName
      : `../sounds/${audioName}`;

    ambient = new Audio(audioPath);
    ambient.loop = true;

    // Respect global mute state
    ambient.muted = isMuted;

    // Start volume silent for autoplay to work
    ambient.volume = 0;

    ambient.play().then(() => {
      if (!isMuted) fadeAudioIn();
    })
    .catch(() => {
      // Autoplay blocked → wait for gesture
      window.addEventListener("click", userGestureStart);
      window.addEventListener("keydown", userGestureStart);
    });
  }

  function userGestureStart() {
    if (ambient) {
      ambient.play();
      if (!isMuted) fadeAudioIn();
    }
    window.removeEventListener("click", userGestureStart);
    window.removeEventListener("keydown", userGestureStart);
  }

  /* ---------------- VOLUME FADE IN ---------------- */
  function fadeAudioIn() {
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      ambient.volume = v;
      if (v >= 0.6) clearInterval(fade);
    }, 50);
  }

  /* ---------------- VOLUME FADE OUT ---------------- */
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

  /* ---------------- ROOM NAVIGATION ---------------- */
  const buttons = document.querySelectorAll("[data-jump]");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.jump;

      // Start fade-out
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

/* ---------------- INVENTORY SYSTEM ---------------- */

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
  saveInventory(loadInventory().filter(i => i !== item));
  renderInventory();
}

function renderInventory() {
  const invContainer = document.querySelector("#inventory");
  if (!invContainer) return;

  const inv = loadInventory();
  invContainer.innerHTML = "";

  inv.forEach(item => {
    const slot = document.createElement("div");
    slot.className = "inv-item";
    slot.textContent = item;
    invContainer.appendChild(slot);
  });
}

document.addEventListener("DOMContentLoaded", function () {

  /* Auto render */
  renderInventory();

  /* Item pickups */
  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToInventory(btn.dataset.pickup);
      btn.remove();
    });
  });

  /* Item removes */
  document.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromInventory(btn.dataset.remove);
    });
  });

  /* --------- INVENTORY TOGGLE ----------- */
  const invBox = document.querySelector("#inventory");
  const toggleBtn = document.querySelector("#invToggle");

  if (toggleBtn && invBox) {
    toggleBtn.addEventListener("click", () => {
      const open = invBox.classList.contains("visible");

      if (open) {
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

});
