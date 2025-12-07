/* ---------------- CRAFTING RECIPES ---------------- */
// Format:
// "Result Item": { requires: { "Item A": qty, "Item B": qty }, icon: "path/to/icon.png", color: "#hex" }

const RECIPES = {
  "Locked Box": {
    requires: {
      "Metal Scrap": 2,
      "Screws": 4
    },
    icon: "../images/items/lockedbox.png",
    color: "#b4b4b4"
  },

  "Silver Key": {
    requires: {
      "Silver Scrap": 2,
      "Key Mold": 1
    },
    icon: "../images/items/silver_key.png",
    color: "#C0C0C0"
  },

  "Torch": {
    requires: {
      "Stick": 1,
      "Cloth": 1,
      "Oil": 1
    },
    icon: "../images/items/torch.png",
    color: "#ffcc66"
  }
};

  "Key Mold": {
    requires: {
      "Rubber": 1,
      "Lighter": 1,
      "Fake Key": 1
    },
    icon: "../images/items/key_mold.png",
    color: "#C0C0C0"
  }
};
