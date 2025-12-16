const container = document.getElementById("recipesContainer");

if (!container) {
  console.error("recipesContainer not found");
}

/* ---------- CHECK IF CRAFTABLE ---------- */
function canCraft(recipe) {
  return recipe.ingredients.every(i =>
    Inventory.has(i.id, i.amount)
  );
}

/* ---------- RENDER ---------- */
function renderRecipes() {
  container.innerHTML = "";

  RECIPES.forEach(recipe => {
    const craftable = canCraft(recipe);

    const card = document.createElement("div");
    card.style.border = `2px solid ${recipe.color || "red"}`;
    card.style.padding = "12px";
    card.style.opacity = craftable ? "1" : "0.35";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.gap = "12px";

    /* ICON */
    if (recipe.icon) {
      const img = document.createElement("img");
      img.src = recipe.icon;
      img.style.width = "48px";
      img.style.height = "48px";
      img.style.objectFit = "contain";
      card.appendChild(img);
    }

    /* INFO */
    const info = document.createElement("div");
    info.style.flex = "1";

    info.innerHTML = `
      <strong>${recipe.output.name}</strong><br>
      <span style="font-size:14px;">
        ${recipe.ingredients.map(i => `${i.amount}x ${i.id}`).join("<br>")}
      </span>
    `;

    card.appendChild(info);

    /* BUTTON */
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = craftable ? "Craft" : "Missing Items";
    btn.disabled = !craftable;

    btn.onclick = () => {
      recipe.ingredients.forEach(i => {
        Inventory.remove(i.id, i.amount);
      });
      Inventory.add(recipe.output.id, recipe.output.amount);
      renderRecipes();
    };

    card.appendChild(btn);
    container.appendChild(card);
  });
}

renderRecipes();