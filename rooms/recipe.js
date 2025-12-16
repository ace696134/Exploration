/* ---------------- CRAFTING RECIPES ---------------- */
// Format:
// window.RECIPES = [
//   {
//     output: { id: "item_id", name: "Item Name", amount: 1 },
//     ingredients: [ { id: "ingredient_id", amount: 1 }, ... ]
//   }
// ];

window.RECIPES = [
  {
    output: { id: "locked_box", name: "Locked Box", amount: 1 },
    ingredients: [
      { id: "metal_scrap", amount: 2 },
      { id: "screws", amount: 4 }
    ],
    icon: "../images/items/lockedbox.png",
    color: "#b4b4b4"
  },
  {
    output: { id: "silver_key", name: "Silver Key", amount: 1 },
    ingredients: [
      { id: "metal_scrap", amount: 2 },
      { id: "key_mold", amount: 1 }
    ],
    icon: "../images/items/silver_key.png",
    color: "#C0C0C0"
  },
  {
    output: { id: "torch", name: "Torch", amount: 1 },
    ingredients: [
      { id: "stick", amount: 1 },
      { id: "cloth", amount: 1 },
      { id: "oil", amount: 1 }
    ],
    icon: "../images/items/torch.png",
    color: "#ffcc66"
  },
  {
    output: { id: "key_mold", name: "Key Mold", amount: 1 },
    ingredients: [
      { id: "rubber_ball", amount: 1 },
      { id: "lighter", amount: 1 },
      { id: "master_key", amount: 1 }
    ],
    icon: "../images/items/key_mold.png",
    color: "#C0C0C0"
  }
];
