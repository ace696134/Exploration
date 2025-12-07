/* Endless Requium – Crafting System */

document.addEventListener("DOMContentLoaded", () => {

  const recipes = [
    {
      id: "torch",
      name: "Torch",
      needs: { Stick: 1, Coal: 1 },
      output: { Torch: 1 },
      img: "../images/torch.png",
      color: "#ff5500"
    },
    {
      id: "bandage",
      name: "Bandage",
      needs: { Cloth: 2 },
      output: { Bandage: 1 },
      img: "../images/bandage.png",
      color: "#fff"
    }
  ];

  const lastRoom = localStorage.getItem("lastRoom") || "index.html";

  const invBox = document.querySelector("#inventory");
  const container = document.getElementById("craftList");
  const backBtn = document.getElementById("backBtn");

  function loadInventory() {
    return JSON.parse(localStorage.getItem("inventory") || "[]");
  }

  function saveInventory(inv) {
    localStorage.setItem("inventory", JSON.stringify(inv));
  }

  function hasIngredients(recipe, inventory) {
    const invMap = {};
    inventory.forEach(item => {
      const n = item.name;
      if (!invMap[n]) invMap[n] = 0;
      invMap[n]++;
    });

    for (let key in recipe.needs) {
      if (!invMap[key] || invMap[key] < recipe.needs[key]) return false;
    }
    return true;
  }

  function craft(recipe) {
    let inventory = loadInventory();

    // Remove ingredients
    for (let key in recipe.needs) {
      for (let i = 0; i < recipe.needs[key]; i++) {
        const index = inventory.findIndex(x => x.name === key);
        if (index !== -1) inventory.splice(index, 1);
      }
    }

    // Add output
    for (let key in recipe.output) {
      for (let i = 0; i < recipe.output[key]; i++) {
        inventory.push({
          name: key,
          img: recipe.img || null,
          color: recipe.color || null
        });
      }
    }

    saveInventory(inventory);
    alert(`${recipe.name} crafted!`);
    location.reload();
  }

  // Render craftable recipes
  const inventory = loadInventory();
  recipes.forEach(recipe => {
    if (hasIngredients(recipe, inventory)) {
      const btn = document.createElement("button");
      btn.textContent = `Craft ${recipe.name}`;
      btn.className = "btn";
      btn.addEventListener("click", () => craft(recipe));
      container.appendChild(btn);
    }
  });

  // Back button
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = lastRoom;
    });
  }

});
