/* Endless Requium – Room Handler
   Inventory now supports:
   - item name
   - item image
   - custom color
   - crafting table button integration
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

    if (layers.length > 1) {
      setInterval(() => {
        const prev = current;
        current = (current + 1) % layers.length;
        layers[prev].style.opacity = 0;
        layers[current].style.opacity = 1;
      }, 5000);
    }
  }

  /* ---------------- BODY FADE-IN ---------------- */
  requestAnimationFrame(() => body.classList.add("fade-in"));

  /* ---------------- AUDIO ---------------- */
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

  /* ---------------- INVENTORY HELPERS ---------------- */
  const loadInventory = () => JSON.parse(localStorage.getItem("inventory") || "[]");
  const saveInventory = (inv) => localStorage.setItem("inventory", JSON.stringify(inv));

  const removeItem = (name) => {
    const inv = loadInventory();
    const filtered = inv.filter(i => i.name.toLowerCase() !== name.toLowerCase());
    saveInventory(filtered);
  };

  /* ---------------- INVENTORY RENDER ---------------- */
  function renderInventory() {
    const box = document.querySelector("#inventory");
    if (!box) return;

    box.innerHTML = "";

    loadInventory().forEach(item => {
      const row = document.createElement("div");
      row.className = "inv-item";

      if (item.color) row.style.borderColor = item.color;

      if (item.icon) {
        const img = document.createElement("img");
        img.src = item.icon;
        img.className = "inv-icon";
        row.appendChild(img);
      }

      const text = document.createElement("span");
      text.textContent = item.name;
      row.appendChild(text);

      box.appendChild(row);
    });

    // Crafting button
    if (!box.querySelector("#craftingBtn")) {
      const craftBtn = document.createElement("button");
      craftBtn.id = "craftingBtn";
      craftBtn.textContent = "🛠️ Crafting Table";
      craftBtn.className = "btn";
      craftBtn.style.marginTop = "10px";

      craftBtn.addEventListener("click", () => {
        localStorage.setItem("lastRoom", window.location.href);
        window.location.href = "crafting.html";
      });

      box.appendChild(craftBtn);
    }
  }

  renderInventory();

  /* ---------------- INVENTORY TOGGLE ---------------- */
  const invBox = document.querySelector("#inventory");
  const toggleBtn = document.querySelector("#invToggle");

  if (toggleBtn && invBox) {
    toggleBtn.addEventListener("click", () => {
      invBox.classList.toggle("visible");
      renderInventory();
    });
  }

  /* ---------------- POPUP MESSAGE ---------------- */
  function showMessage(text, duration = 2000) {
    const msg = document.createElement("div");
    msg.className = "popup-message";
    msg.textContent = text;
    document.body.append(msg);

    requestAnimationFrame(() => {
      msg.style.transition = "opacity 0.3s ease-out";
      msg.style.opacity = "1";
    });

    setTimeout(() => {
      msg.style.opacity = "0";
      msg.addEventListener("transitionend", () => msg.remove());
    }, duration);
  }

/* ---------------- PICKUP ITEMS (stacking) ---------------- */
document.querySelectorAll("[data-pickup]").forEach(btn => {
  btn.addEventListener("click", () => {
    const itemName = btn.dataset.pickup;
    const itemData = ITEMS[itemName];

    if (!itemData) {
      console.error("Item not found in ITEMS:", itemName);
      return;
    }

    // Load existing inventory
    let inv = loadInventory();

    // Check if item already exists in inventory
    const existing = inv.find(i => i.id === itemData.id);
    if (existing) {
      // If stack limit exists, respect it
      if (itemData.stack && existing.quantity + 1 > itemData.stack) {
        showMessage(`Cannot carry more than ${itemData.stack} ${itemName}!`);
        return;
      }
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      // Add new item
      inv.push({
        id: itemData.id,
        name: itemData.name,
        icon: itemData.icon,
        color: itemData.color,
        description: itemData.description,
        quantity: 1,
        stack: itemData.stack || 1
      });
    }

    saveInventory(inv);
    showMessage(`Picked up ${itemName}!`);
    renderInventory();
    btn.remove(); // Remove pickup button from room
  });
});


  /* ---------------- USE ITEMS ---------------- */
  document.querySelectorAll("[data-use]").forEach(btn => {
    btn.addEventListener("click", e => {

      e.stopPropagation();

      const neededRaw = btn.dataset.use;
      const needed = neededRaw.trim().toLowerCase();

      const inv = loadInventory();
      const match = inv.find(i => i.name.toLowerCase() === needed);

      if (!match) {
        showMessage(`You don't have "${neededRaw}".`);
        return;
      }

      removeItem(neededRaw);
      renderInventory();
      showMessage(`Used: ${neededRaw}`);

      const next = btn.dataset.jump;
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

      localStorage.setItem("lastRoom", window.location.href);

      const next = btn.dataset.jump;
      body.style.opacity = 0;

      fadeAudioOut(() =>
        setTimeout(() => window.location.href = next, 750)
      );
    });
  });

   /* ---------------- DEBUG / CONSOLE CHEATS ---------------- */
window.giveItem = function(itemName, amount = 1) {
  const itemData = ITEMS[itemName];
  if (!itemData) {
    console.error(`Item "${itemName}" does not exist in ITEMS.`);
    return;
  }

  let inv = JSON.parse(localStorage.getItem("inventory") || "[]");

  // Check for stacking
  const existing = inv.find(i => i.id === itemData.id);
  if (existing) {
    if (itemData.stack && existing.quantity + amount > itemData.stack) {
      console.warn(`Cannot exceed stack of ${itemData.stack}. Giving max possible.`);
      existing.quantity = itemData.stack;
    } else {
      existing.quantity = (existing.quantity || 1) + amount;
    }
  } else {
    inv.push({
      id: itemData.id,
      name: itemData.name,
      icon: itemData.icon,
      color: itemData.color,
      description: itemData.description,
      quantity: amount,
      stack: itemData.stack || 1
    });
  }

  localStorage.setItem("inventory", JSON.stringify(inv));
  if (window.refreshInventoryUI) window.refreshInventoryUI(); // update UI if available
  console.log(`Gave ${amount}x ${itemName} to yourself.`);
};
/* ---------------- SANITY SYSTEM ---------------- */

function loadSanity() {
  let s = Number(localStorage.getItem("sanity"));
  if (isNaN(s)) s = 100; 
  localStorage.setItem("sanity", s);
  return s;
}

function saveSanity(v) {
  localStorage.setItem("sanity", v);
}

function loadUnlockedEnemies() {
  return JSON.parse(localStorage.getItem("unlockedEnemies") || "[]");
}

function saveUnlockedEnemies(list) {
  localStorage.setItem("unlockedEnemies", JSON.stringify(list));
}

window.getSanity = loadSanity;

window.changeSanity = function(amount, reason = "unknown") {
  let sanity = loadSanity();
  sanity = Math.max(0, Math.min(100, sanity + amount));
  saveSanity(sanity);
  applySanityEffects(sanity);

  // death
  if (sanity <= 0) {
    handleDeath(reason);
  }
};

function handleDeath(reason) {
  console.warn("Player died due to:", reason);

  // save “cause of death”
  localStorage.setItem("lastDeathCause", reason);

  // unlock enemy based on cause
  const unlocked = loadUnlockedEnemies();
  if (!unlocked.includes(reason)) {
    unlocked.push(reason);
    saveUnlockedEnemies(unlocked);
  }

  // send them to death screen (you can change this page)
  window.location.href = "../rooms/death.html";
}

/* ------------ SANITY VISUAL EFFECTS ---------------- */

function applySanityEffects(sanity) {
  const s = document.body.style;

  // clear first
  s.filter = "";
  document.body.classList.remove("low-sanity-1","low-sanity-2","low-sanity-3");

  if (sanity <= 60 && sanity > 35) {
    document.body.classList.add("low-sanity-1"); // blur-only
  }
  if (sanity <= 35 && sanity > 15) {
    document.body.classList.add("low-sanity-2"); // blur + vignette
  }
  if (sanity <= 15) {
    document.body.classList.add("low-sanity-3"); // distortion
  }
}

/* Run sanity effects on room load */
applySanityEffects(loadSanity());

});
