/* =====================================================
   INVENTORY SYSTEM (ID-BASED, SAVE SAFE)
   ===================================================== */

window.Inventory = {
  data: {},

  load() {
    const saved = localStorage.getItem("inventory");
    this.data = saved ? JSON.parse(saved) : {};
    // refresh UI after loading
    window.refreshInventoryUI?.();
  },

  save() {
    localStorage.setItem("inventory", JSON.stringify(this.data));
  },

  add(id, amount = 1) {
    if (!this.data[id]) this.data[id] = 0;
    this.data[id] += amount;
    this.save();
    window.refreshInventoryUI?.();
  },

  remove(id, amount = 1) {
    if (!this.has(id, amount)) return false;
    this.data[id] -= amount;
    if (this.data[id] <= 0) delete this.data[id];
    this.save();
    window.refreshInventoryUI?.();
    return true;
  },

  has(id, amount = 1) {
    return (this.data[id] || 0) >= amount;
  }
};

/* =====================================================
   INVENTORY UI
   ===================================================== */

window.refreshInventoryUI = function () {
  const inv = document.getElementById("inventory");
  if (!inv) return;

  inv.innerHTML = "";

  for (const id in Inventory.data) {
    const item = ITEMS_BY_ID[id];
    if (!item) continue;

    const row = document.createElement("div");
    row.className = "inv-item";
    row.style.borderColor = item.color;

    row.innerHTML = `
      <img src="${item.icon}" class="inv-icon">
      <span>${item.name}</span>
      <span class="count">x${Inventory.data[id]}</span>
    `;

    inv.appendChild(row);
  }
};

/* ============================
   DOM READY
============================ */

document.addEventListener("DOMContentLoaded", () => {
  // Load inventory **after refreshInventoryUI exists**
  Inventory.load();

  // ===== INVENTORY TOGGLE BUTTON =====
  const toggle = document.getElementById("invToggle");
  const inv = document.getElementById("inventory");
  if (toggle && inv) {
    toggle.addEventListener("click", () => {
      inv.classList.toggle("visible");
    });
  }
});