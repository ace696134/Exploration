/* ---------------- CRAFTING SYSTEM ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("recipesContainer");
  const backBtn = document.getElementById("backBtn");

  if (!container) return;

  // Load inventory
  let inventory = JSON.parse(localStorage.getItem("inventory") || "[]");

  // Helper: check if required items are in inventory
  function hasItems(required) {
    return required.every(req => inventory.some(i => i.name.toLowerCase() === req.toLowerCase()));
  }

  // Render recipes
  function renderRecipes() {
    container.innerHTML = "";

    recipes.forEach(recipe => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = recipe.name;

      if (!hasItems(recipe.requires)) {
        btn.disabled = true;
        btn.style.opacity = 0.5;
      }

      btn.addEventListener("click", () => {
        // Remove required items from inventory
        recipe.requires.forEach(itemName => {
          const index = inventory.findIndex(i => i.name.toLowerCase() === itemName.toLowerCase());
          if (index !== -1) inventory.splice(index, 1);
        });

        // Add crafted item
        inventory.push(recipe.result);
        localStorage.setItem("inventory", JSON.stringify(inventory));

        // Feedback
        alert(`Crafted: ${recipe.result.name}`);

        // Re-render recipes to update buttons
        renderRecipes();
      });

      container.appendChild(btn);
    });
  }

  renderRecipes();

  // ---------------- BACK BUTTON ----------------
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const lastRoom = localStorage.getItem("lastRoom") || "index.html";
      window.location.href = lastRoom;
    });
  }
});
