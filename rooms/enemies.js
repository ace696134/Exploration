/* rooms/enemies.js — enemy definitions and lightweight behaviors */

(function () {
  window.ENEMIES = {
    shadow: { id: "shadow", name: "Shadow", behavior: "standard" },
    mimic:  { id: "mimic",  name: "Mimic",  behavior: "jumpscare" },
    wraith: { id: "wraith", name: "Wraith", behavior: "sanityHunter" },
    stalker:{ id: "stalker",name: "Stalker",behavior: "behindPlayer" },
    hollow: { id: "hollow", name: "Hollow", behavior: "wandering" },
    lurker: { id: "lurker", name: "Lurker", behavior: "backgroundCreep" },
    echo:   { id: "echo",   name: "Echo",   behavior: "uiDistort" }
  };

  window.EnemySystem = {
    spawnRandom() {
      const base = ["shadow", "mimic"];
      const unlocked = (window.DeathUnlocks && DeathUnlocks.getUnlocked) ? DeathUnlocks.getUnlocked() : [];
      const pool = base.concat(unlocked);
      if (!pool.length) return null;
      const id = pool[Math.floor(Math.random() * pool.length)];
      const def = ENEMIES[id];
      if (def) this.runBehavior(def);
      return def;
    },

    runBehavior(def) {
      if (!def) return;
      switch (def.behavior) {
        case "standard":
          if (window.showMessage) showMessage(`${def.name} feels nearby.`);
          break;
        case "jumpscare":
          if (window.showMessage) showMessage(`${def.name} lunges from the dark!`);
          // you could call a jumpscare modal here
          break;
        case "sanityHunter":
          SanitySystem.change(-15, "enemy");
          if (window.showMessage) showMessage("A cold presence leeches your mind...");
          break;
        case "behindPlayer":
          if (window.showMessage) showMessage("You hear breathing close behind you...");
          break;
        case "wandering":
          if (window.showMessage) showMessage("A hollow figure drifts across the room...");
          break;
        case "backgroundCreep":
          document.body.classList.add("enemy-bg-flash");
          setTimeout(() => document.body.classList.remove("enemy-bg-flash"), 900);
          break;
        case "uiDistort":
          document.body.classList.add("ui-distort");
          setTimeout(() => document.body.classList.remove("ui-distort"), 1400);
          break;
        default:
          if (window.showMessage) showMessage(`${def.name} is here.`);
          break;
      }
    }
  };
})();
