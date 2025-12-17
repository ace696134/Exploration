/* rooms/crafting.js */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("recipesContainer");
  if (!container) return;

  container.innerHTML = "";

  RECIPES.forEach(recipe => {
    const canCraft = recipe.ingredients.every(i =>
      Inventory.has(i.id, i.amount)
    );

    if (!canCraft) return;

    const item = ITEMS[recipe.output.id];
    if (!item) return;

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = `Craft ${item.name}`;
    btn.style.borderColor = item.color;

    btn.addEventListener("click", () => {
      recipe.ingredients.forEach(i =>
        Inventory.remove(i.id, i.amount)
      );

      Inventory.add(recipe.output.id, recipe.output.amount || 1);
      btn.remove();
    });

    container.appendChild(btn);
  });
});
