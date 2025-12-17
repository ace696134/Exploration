/* rooms/inventory.js */

window.Inventory = {
  data: {},

  load() {
    this.data = JSON.parse(localStorage.getItem("inventory") || "{}");
  },

  save() {
    localStorage.setItem("inventory", JSON.stringify(this.data));
  },

  add(id, amount = 1) {
    if (!this.data[id]) this.data[id] = 0;
    this.data[id] += amount;
    this.save();
    refreshInventoryUI();
  },

  remove(id, amount = 1) {
    if (!this.data[id] || this.data[id] < amount) return false;
    this.data[id] -= amount;
    if (this.data[id] <= 0) delete this.data[id];
    this.save();
    refreshInventoryUI();
    return true;
  },

  has(id, amount = 1) {
    return (this.data[id] || 0) >= amount;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Inventory.load();
  refreshInventoryUI();
});

window.refreshInventoryUI = function () {
  const box = document.getElementById("inventory");
  if (!box) return;

  box.innerHTML = "";

  for (const id in Inventory.data) {
    const item = ITEMS[id];
    if (!item) continue;

    const row = document.createElement("div");
    row.className = "inv-item";
    row.style.borderColor = item.color;

    row.innerHTML = `
      <img class="inv-icon" src="${item.icon}">
      <span>${item.name}</span>
      <span>x${Inventory.data[id]}</span>
    `;

    box.appendChild(row);
  }
};
