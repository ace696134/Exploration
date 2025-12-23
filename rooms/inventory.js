/* =====================================================
   INVENTORY SYSTEM (ID-BASED, SAVE SAFE)
   ===================================================== */

window.Inventory = {
  data: {},

  // Load inventory from localStorage
  load() {
    const saved = localStorage.getItem("inventory");
    this.data = saved ? JSON.parse(saved) : {};
  },

  // Save inventory to localStorage
  save() {
    localStorage.setItem("inventory", JSON.stringify(this.data));
  },

  // Add items to inventory
  add(id, amount = 1) {
    if (!this.data[id]) this.data[id] = 0;
    this.data[id] += amount;
    this.save();
    window.refreshInventoryUI?.();
  },

  // Remove items from inventory
  remove(id, amount = 1) {
    if (!this.has(id, amount)) return false;
    this.data[id] -= amount;
    if (this.data[id] <= 0) delete this.data[id];
    this.save();
    window.refreshInventoryUI?.();
    return true;
  },

  // Check if inventory has item
  has(id, amount = 1) {
    return (this.data[id] || 0) >= amount;
  }
};

/* =====================================================
   INVENTORY UI HANDLER
   ===================================================== */

window.refreshInventoryUI = function () {
  const inv = document.getElementById("inventory");
  if (!inv) return;

  inv.innerHTML = ""; // clear current UI

  // Populate inventory items
  for (const id in Inventory.data) {
    const item = window.ITEMS_BY_ID?.[id];
    if (!item) continue;

    const row = document.createElement("div");
    row.className = "inv-item";
    row.style.borderColor = item.color || "red";

    row.innerHTML = `
      <img class="inv-icon" src="${item.icon}" alt="${item.name}">
      <span>${item.name}</span>
      <span class="count">x${Inventory.data[id]}</span>
    `;

    inv.appendChild(row);
  }
};

/* =====================================================
   INVENTORY TOGGLE BUTTON
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  Inventory.load();
  window.refreshInventoryUI?.();

  const toggle = document.getElementById("invToggle");
  const inv = document.getElementById("inventory");

  if (toggle && inv) {
    toggle.addEventListener("click", () => {
      inv.classList.toggle("visible");
    });
  }
});

/* =====================================================
   UTILITY FUNCTIONS FOR PICKUP / USE (OPTIONAL)
   ===================================================== */

window.pickupItem = function(id, amount = 1) {
  const item = window.ITEMS_BY_ID?.[id];
  if (!item) return;
  Inventory.add(id, amount);
  showMessage?.(`Picked up ${item.name}`);
};

window.useItem = function(id, callback) {
  if (!Inventory.has(id)) {
    showMessage?.("You don't have that item.");
    return;
  }
  Inventory.remove(id, 1);
  window.refreshInventoryUI?.();
  showMessage?.("Used item.");
  if (typeof callback === "function") callback();
};