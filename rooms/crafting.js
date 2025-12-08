/* -------- Crafting System for Endless Requium -------- */

document.addEventListener("DOMContentLoaded", () => {

  const recipesContainer = document.getElementById("recipesContainer");
  const invBox = document.querySelector("#inventory");
  const toggleBtn = document.querySelector("#invToggle");

  if (!recipesContainer) return;

  /* ---------------- INVENTORY TOGGLE ---------------- */
  if (toggleBtn && invBox) {
    toggleBtn.addEventListener("click", () => {
      invBox.classList.toggle("visible");
      if (window.refreshInventoryUI) window.refreshInventoryUI();
      renderRecipes(); // update recipe buttons whenever inventory panel toggled
    });
  }

  /* ---------------- RENDER RECIPES ---------------- */
  function renderRecipes() {
    recipesContainer.innerHTML = "";

    RECIPES.forEach(recipe => {
      const canCraft = recipe.ingredients.every(ing => Inventory.has(ing.id, ing.amount));

      const recipeBtn = document.createElement("button");
      recipeBtn.className = "btn";
      recipeBtn.style.display = "flex";
      recipeBtn.style.justifyContent = "space-between";
      recipeBtn.style.alignItems = "center";
      recipeBtn.style.padding = "8px";
      recipeBtn.disabled = !canCraft;

      const nameSpan = document.createElement("span");
      nameSpan.textContent = recipe.output.name;

      const detailSpan = document.createElement("span");
      detailSpan.style.fontSize = "0.9em";
      detailSpan.style.color = "#aaa";
      detailSpan.textContent = recipe.ingredients
        .map(i => `${i.amount}x ${ITEMS[i.id].name}`)
        .join(", ");

      recipeBtn.appendChild(nameSpan);
      recipeBtn.appendChild(detailSpan);

      recipeBtn.addEventListener("click", () => {
        craftRecipe(recipe);
      });

      recipesContainer.appendChild(recipeBtn);
    });
  }

  /* ---------------- CRAFTING LOGIC ---------------- */
  function craftRecipe(recipe) {
    const canCraft = recipe.ingredients.every(ing => Inventory.has(ing.id, ing.amount));
    if (!canCraft) {
      if (window.showMessage) showMessage("You do not have the required items.");
      return;
    }

    // Remove ingredients
    recipe.ingredients.forEach(ing => {
      Inventory.remove(ing.id, ing.amount);
    });

    // Add crafted item
    Inventory.add(recipe.output.id, recipe.output.amount || 1);

    // Update inventory UI
    if (window.refreshInventoryUI) window.refreshInventoryUI();

    // Show popup message
    if (window.showMessage) showMessage(`Crafted: ${recipe.output.name}!`);

    // Refresh recipe buttons
    renderRecipes();
  }

  renderRecipes();

  // Optional: refresh recipes whenever inventory changes externally
  window.refreshCraftingUI = renderRecipes;

});
