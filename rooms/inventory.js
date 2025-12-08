/* -------- SIMPLE INVENTORY SYSTEM -------- */

window.Inventory = {
  data: {},

  load() {
    const saved = localStorage.getItem("inventory");
    this.data = saved ? JSON.parse(saved) : {};
  },

  save() {
    localStorage.setItem("inventory", JSON.stringify(this.data));
  },

  add(itemId, amount = 1) {
    if (!this.data[itemId]) this.data[itemId] = 0;
    this.data[itemId] += amount;
    this.save();
  },

  remove(itemId, amount = 1) {
    if (!this.data[itemId]) return false;
    this.data[itemId] -= amount;
    if (this.data[itemId] <= 0) delete this.data[itemId];
    this.save();
    return true;
  },

  has(itemId, amount = 1) {
    return this.data[itemId] >= amount;
  }
};

/* -------- INVENTORY UI -------- */

document.addEventListener("DOMContentLoaded", () => {
  Inventory.load();

  const invBtn = document.getElementById("inventoryBtn");
  const invPanel = document.getElementById("inventoryPanel");
  const invList = document.getElementById("inventoryList");

  if (!invBtn) return;

  invBtn.addEventListener("click", () => {
    invPanel.classList.toggle("hidden");
    renderInventory();
  });

  function renderInventory() {
    invList.innerHTML = "";

    for (const id in Inventory.data) {
      const item = ITEMS_BY_ID[id];
      const count = Inventory.data[id];

      const row = document.createElement("div");
      row.className = "inv-item";
      row.style.borderColor = item.color;

      row.innerHTML = `
        <img src="${item.icon}">
        <span>${item.name}</span>
        <span class="inv-count">x${count}</span>
      `;

      invList.appendChild(row);
    }
  }
});
