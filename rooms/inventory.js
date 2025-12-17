/* =====================================================
   INVENTORY SYSTEM — Endless Requium
   ===================================================== */

window.Inventory = {
  data: {},

  /* ---------- LOAD / SAVE ---------- */
  load() {
    const saved = localStorage.getItem("inventory");
    this.data = saved ? JSON.parse(saved) : {};
  },

  save() {
    localStorage.setItem("inventory", JSON.stringify(this.data));
    refreshInventoryUI();
  },

  /* ---------- CORE OPERATIONS ---------- */
  add(itemId, amount = 1) {
    if (!this.data[itemId]) this.data[itemId] = 0;
    this.data[itemId] += amount;
    this.save();
  },

  remove(itemId, amount = 1) {
    if (!this.has(itemId, amount)) return false;
    this.data[itemId] -= amount;
    if (this.data[itemId] <= 0) delete this.data[itemId];
    this.save();
    return true;
  },

  has(itemId, amount = 1) {
    return (this.data[itemId] || 0) >= amount;
  },

  clearAll() {
    this.data = {};
    this.save();
  }
};

/* =====================================================
   INVENTORY UI INIT
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  Inventory.load();

  const invBtn   = document.getElementById("inventoryBtn");
  const invPanel = document.getElementById("inventoryPanel");

  if (!invBtn || !invPanel) {
    console.warn("[Inventory] Inventory UI elements missing.");
    return;
  }

  invBtn.addEventListener("click", () => {
    invPanel.classList.toggle("hidden");
    refreshInventoryUI();
  });

  refreshInventoryUI();
});

/* =====================================================
   INVENTORY UI RENDER
   ===================================================== */

window.refreshInventoryUI = function () {
  const list = document.getElementById("inventoryList");
  if (!list) return;

  list.innerHTML = "";

  const ids = Object.keys(Inventory.data);
  if (!ids.length) {
    list.innerHTML = `<p style="opacity:0.6">Inventory Empty</p>`;
    return;
  }

  ids.forEach(id => {
    const itemDef = window.ITEMS_BY_ID?.[id] || {
      name: id,
      icon: "",
      color: "#ff3333"
    };

    const row = document.createElement("div");
    row.className = "inv-item";
    row.style.borderColor = itemDef.color;

    row.innerHTML = `
      ${itemDef.icon ? `<img class="inv-icon" src="${itemDef.icon}">` : ""}
      <span class="inv-name">${itemDef.name}</span>
      <span class="inv-count">x${Inventory.data[id]}</span>
    `;

    list.appendChild(row);
  });
};

/* =====================================================
   GLOBAL POPUP MESSAGE (NO STACKING)
   ===================================================== */

window.showMessage = function (text, duration = 2000) {
  let popup = document.querySelector(".popup-message");

  if (!popup) {
    popup = document.createElement("div");
    popup.className = "popup-message";
    document.body.appendChild(popup);
  }

  popup.textContent = text;
  popup.style.opacity = "1";

  clearTimeout(popup._timeout);
  popup._timeout = setTimeout(() => {
    popup.style.opacity = "0";
  }, duration);
};

/* =====================================================
   DEV / DEBUG SHORTCUTS (REMOVE LATER)
   ===================================================== */

window.__give = (id, amt = 1) => Inventory.add(id, amt);
window.__clearInv = () => Inventory.clearAll();
