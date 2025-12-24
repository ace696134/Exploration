window.Inventory = {
  data: {},

  load() {
    const saved = localStorage.getItem("inventory");
    this.data = saved ? JSON.parse(saved) : {};
    console.log("Inventory loaded", this.data);
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

document.addEventListener("DOMContentLoaded", () => {
  console.log("Inventory DOMContentLoaded");
  Inventory.load();

  const toggle = document.getElementById("invToggle");
  const inv = document.getElementById("inventory");

  if (!toggle) console.warn("Inventory toggle not found!");
  if (!inv) console.warn("Inventory panel not found!");

  if (toggle && inv) {
    toggle.addEventListener("click", () => {
      console.log("Inventory toggle clicked");
      window.refreshInventoryUI?.();
      inv.classList.toggle("visible");
    });
  }
});

window.refreshInventoryUI = function () {
  const inv = document.getElementById("inventory");
  if (!inv) return;

  inv.innerHTML = "";

  const ids = Object.keys(Inventory.data);

  if (ids.length === 0) {
    inv.innerHTML = `<div style="opacity:0.6">(empty)</div>`;
    return;
  }

  ids.forEach(id => {
    const item = window.ITEMS_BY_ID?.[id];
    if (!item) return;

    const row = document.createElement("div");
    row.className = "inv-item";

    row.innerHTML = `
      <img class="inv-icon" src="${item.icon}">
      <span>${item.name}</span>
      <span>x${Inventory.data[id]}</span>
    `;

    inv.appendChild(row);
  });
};
