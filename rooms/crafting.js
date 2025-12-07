document.addEventListener("DOMContentLoaded", () => {

  /* Load inventory */
  function loadInventory() {
    return JSON.parse(localStorage.getItem("inventory") || "[]");
  }

  function saveInventory(inv) {
    localStorage.setItem("inventory", JSON.stringify(inv));
  }

  /* Recipes */
  const recipes = [
    {
      result: "Clockwork Key",
      color: "#ffcc00",
      img: "../images/items/clockkey.png",
      ingredients: ["Silver Key", "Rusted Gear"]
    },
    {
      result: "Torch",
      color: "#ffa500",
      img: "../images/items/torch.png",
      ingredients: ["Stick", "Cloth"]
    }
  ];

  const container = document.getElementById("crafting-container");
  const inv = loadInventory().map(i => i.trim());
  
  /* Render recipes */
  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const hasAll = recipe.ingredients.every(i =>
      inv.map(x => x.toLowerCase()).includes(i.toLowerCase())
    );

    card.innerHTML = `
      <h2>${recipe.result}</h2>
      <img src="${recipe.img}" class="recipe-img">
      <p>Needs: ${recipe.ingredients.join(", ")}</p>
      <button class="btn craft-btn" ${hasAll ? "" : "disabled"}>
        Craft
      </button>
    `;

    container.appendChild(card);

    const btn = card.querySelector(".craft-btn");
    if (!hasAll) return;

    btn.addEventListener("click", () => {
      let newInv = loadInventory();

      // Remove ingredients
      recipe.ingredients.forEach(i => {
        const index = newInv.findIndex(x => x.toLowerCase() === i.toLowerCase());
        if (index !== -1) newInv.splice(index, 1);
      });

      // Add crafted item
      newInv.push(recipe.result);

      saveInventory(newInv);

      alert(`Crafted ${recipe.result}!`);

      window.location.reload();
    });
  });

  /* BACK BUTTON */
  const backBtn = document.getElementById("backBtn");
  const previousRoom = localStorage.getItem("lastRoom") || "index.html";

  backBtn.addEventListener("click", () => {
    window.location.href = previousRoom;
  });

});
