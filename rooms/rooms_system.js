/* ---------------- ROOM / ENEMY SPAWNING HELPERS ---------------- */

function getEnemyPoolForRoom() {
  const base = ["shadow", "mimic"];
  const unlocked = (DeathUnlocks && DeathUnlocks.getUnlockedEnemies) ? DeathUnlocks.getUnlockedEnemies() : [];
  return [...base, ...unlocked];
}

function spawnEnemyForRoom() {
  const pool = getEnemyPoolForRoom();
  if (!pool.length) return null;
  const id = pool[Math.floor(Math.random() * pool.length)];
  const enemyDef = ENEMIES[id];
  if (!enemyDef) return null;
  // Run a lightweight behavior
  runEnemyBehavior(enemyDef);
  return enemyDef;
}

function runEnemyBehavior(enemy) {
  // Keep effects small — use showMessage or visual changes
  switch ((enemy && enemy.behavior) || "") {
    case "standard":
      if (window.showMessage) showMessage(`${enemy.name} senses you.`);
      break;
    case "jumpscare":
      if (window.showMessage) showMessage(`${enemy.name} lunges from the dark!`);
      // You can call a more elaborate jumpscare here
      break;
    case "sanityHunter":
      Sanity.change(-15);
      if (window.showMessage) showMessage("Something leeches your sanity...");
      break;
    case "behindPlayer":
      if (window.showMessage) showMessage("Breathing — close behind you...");
      break;
    case "wandering":
      if (window.showMessage) showMessage("A hollow figure drifts past...");
      break;
    case "backgroundCreep":
      // quick visual flash: add class, remove shortly after
      document.body.classList.add("enemy-bg-flash");
      setTimeout(() => document.body.classList.remove("enemy-bg-flash"), 900);
      break;
    case "uiDistort":
      // small UI distortion flicker
      document.body.classList.add("ui-distort");
      setTimeout(() => document.body.classList.remove("ui-distort"), 1500);
      break;
    default:
      if (window.showMessage) showMessage(`${enemy.name} is nearby.`);
      break;
  }
}
