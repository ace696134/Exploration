/* ===============================
   INVENTORY SYSTEM — ENDLESS REQUIUM
   =============================== */

/* ---------- CORE INVENTORY ---------- */
window.Inventory = {
  data: {},

  load() {
    try {
      const saved = localStorage.getItem("inventory");
      this.data = saved ? JSON.parse(saved) : {};
    } catch {
      this.data = {};
    }
  },

  save() {
    localStorage.setItem("inventory", JSON.stringify(this.data));
  },

  add(itemId, amount = 1) {
    if (!this.data[itemId]) this.data[itemId] = 0;
    this.data[itemId] += amount;
    this.save();
    refreshInventoryUI();
  },

  remove(itemId, amount = 1) {
    if (!this.data[itemId]) return false;

    this.data[itemId] -= amount;
    if (this.data[itemId] <= 0) delete this.data[itemId];

    this.save();
    refreshInventoryUI();
    return true;
  },

  has(itemId, amount = 1) {
    return (this.data[itemId] || 0) >= amount;
  },

  clear() {
    this.data = {};
    this.save();
    refreshInventoryUI();
  }
};

/* ---------- INIT ON PAGE LOAD ---------- */
document.addEventListener("DOMContentLoaded", () => {
  Inventory.load();

  const invBtn   = document.getElementById("inventoryBtn");
  const invPanel = document.getElementById("inventoryPanel");

  if (!invBtn || !invPanel) return;

  invBtn.addEventListener("click", () => {
    invPanel.classList.toggle("hidden");
    refreshInventoryUI();
  });
});

/* ---------- INVENTORY UI RENDER ---------- */
window.refreshInventoryUI = function () {
  const invList = document.getElementById("inventoryList");
  if (!invList) return;

  invList.innerHTML = "";

  const items = Inventory.data;
  const ids = Object.keys(items);

  if (ids.length === 0) {
    invList.innerHTML = `<div class="inv-empty">Inventory Empty</div>`;
    return;
  }

  ids.forEach(id => {
    const count = items[id];

    const item = window.ITEMS_BY_ID?.[id] || {
      name: id,
      icon: "",
      color: "#e33"
    };

    const row = document.createElement("div");
    row.className = "inv-item";
    row.style.borderColor = item.color;

    row.innerHTML = `
      ${item.icon ? `<img class="inv-icon" src="${item.icon}">` : ""}
      <span class="inv-name">${item.name}</span>
      <span class="inv-count">x${count}</span>
    `;

    invList.appendChild(row);
  });
};

/* ---------- HORROR UI EXTENSIONS ---------- */

/* Flicker inventory at low sanity */
window.applyInventorySanityEffect = function (level) {
  const panel = document.getElementById("inventoryPanel");
  if (!panel) return;

  panel.classList.remove("inv-mid", "inv-low", "inv-broken");

  if (level === "mid") panel.classList.add("inv-mid");
  if (level === "low") panel.classList.add("inv-low");
  if (level === "broken") panel.classList.add("inv-broken");
};

/* Corrupt inventory visuals (future use) */
window.corruptInventoryUI = function () {
  const panel = document.getElementById("inventoryPanel");
  if (!panel) return;

  panel.classList.add("inventory-corrupt");
  setTimeout(() => panel.classList.remove("inventory-corrupt"), 800);
};

/* ---------- DEV SAFETY ---------- */
window.debugInventory = function () {
  console.table(Inventory.data);
};