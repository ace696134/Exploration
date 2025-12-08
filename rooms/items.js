/* -------- GLOBAL ITEM DEFINITIONS -------- */
/* These are NOT what the player owns — these are just the item *templates*. */
/*
Common: #A3A3A3
Uncommon: #35D413
Rare: #13469C
Mythical: #C713D4
Legendary: #FDFF30
*/

window.ITEMS = {
  "Silver Key": {
    id: "silver_key",
    name: "Silver Key",
    icon: "../images/items/silver_key.png",
    color: "#13469C",
    description: "A small metallic key. It looks old.",
    stack: 16
  },

  "Key Mold": {
    id: "key_mold",
    name: "Key Mold",
    icon: "../images/items/key_mold.png",
    color: "#13469C",
    description: "A small mold.. You could probably make a key with this.",
    stack: 1
  },

  "Lighter": {
    id: "lighter",
    name: "Lighter",
    icon: "../images/items/lighter.png",
    color: "#35D413",
    description: "A standard lighter with a print of fire under blue skies.",
    stack: 1
  },
  
  "Music Box": {
    id: "music_box",
    name: "Music Box",
    icon: "../images/items/music_box.png",
    color: "#13469C",
    description: "A small music box playing a tune. You feel like something is attached to it..",
    stack: 1
  },

  "Metal Scrap": {
    id: "metal_scrap",
    name: "Metal Scrap",
    icon: "../images/items/metal_scrap.png",
    color: "#A3A3A3",
    description: "A small piece of metal scrap.. Could probably be melted and put into a mold if you had 5.",
    stack: 128
  },
  
  "Melted Metal Scrap": {
    id: "melted_metal_scrap",
    name: "Melted Metal Scrap",
    icon: "../images/items/melted_metal_scrap.png",
    color: "#A3A3A3",
    description: "A small piece of metal scrap you melted.. Could probably be put into a mold if you had 5.",
    stack: 5
  }
};

/* -------- ITEMS LOOKUP BY ID -------- */
window.ITEMS_BY_ID = {};
for (const key in ITEMS) {
  if (ITEMS.hasOwnProperty(key)) {
    const item = ITEMS[key];
    ITEMS_BY_ID[item.id] = item;
  }
}
