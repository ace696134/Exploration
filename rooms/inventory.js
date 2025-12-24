/* ============================
   INVENTORY SYSTEM
============================ */

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

/* ============================
   INVENTORY UI
============================ */

document.addEventListener("DOMContentLoaded", () => {
  Inventory.load();

  const toggleBtn = document.getElementById("invToggle");
  const invPanel = document.getElementById("inventory");

  if (!toggleBtn || !invPanel) return;

  // Toggle inventory visibility
  toggleBtn.addEventListener("click", (e) => {
    invPanel.classList.toggle("visible");
    refreshInventoryUI();
    e.stopPropagation();
  });

  // Close if clicking outside
  document.addEventListener("mousedown", (e) => {
    if (invPanel.classList.contains("visible") &&
        !e.target.closest("#inventory") &&
        !e.target.closest("#invToggle")) {
      invPanel.classList.remove("visible");
    }
  });

  // Initial render
  refreshInventoryUI();
});

/* ============================
   REFRESH INVENTORY UI
============================ */

window.refreshInventoryUI = function () {
  const invPanel = document.getElementById("inventory");
  if (!invPanel) return;

  invPanel.innerHTML = "";

  const ids = Object.keys(Inventory.data);
  if (ids.length === 0) {
    invPanel.innerHTML = `<div style="opacity:0.6">(empty)</div>`;
    return;
  }

  ids.forEach(id => {
    const item = window.ITEMS_BY_ID?.[id];
    if (!item) return;

    const row = document.createElement("div");
    row.className = "inv-item";
    if (item.color) row.style.borderColor = item.color;

    row.innerHTML = `
      <img class="inv-icon" src="${item.icon}">
      <span>${item.name}</span>
      <span class="inv-count">x${Inventory.data[id]}</span>
    `;

    invPanel.appendChild(row);
  });

  // Optional: Crafting button
  if (!invPanel.querySelector("#craftingBtn")) {
    const craftBtn = document.createElement("button");
    craftBtn.id = "craftingBtn";
    craftBtn.textContent = "🛠️ Crafting Table";
    craftBtn.className = "btn";
    craftBtn.style.marginTop = "10px";

    craftBtn.addEventListener("click", () => {
      localStorage.setItem("lastRoom", window.location.href);
      window.location.href = "crafting.html";
    });

    invPanel.appendChild(craftBtn);
  }
};
