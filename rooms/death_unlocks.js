/* ---------------- DEATH-BASED ENEMY UNLOCKS ---------------- */

window.DeathUnlocks = {
  data: JSON.parse(localStorage.getItem("deathUnlocks") || "{}"),
  init() {
    if (!this.data.unlocked) this.data = { unlocked: [], totalDeaths: 0 };
  },
  save() { localStorage.setItem("deathUnlocks", JSON.stringify(this.data)); },

  unlock(enemyId) {
    if (!this.data.unlocked.includes(enemyId)) {
      this.data.unlocked.push(enemyId);
      this.save();
      if (window.showMessage) showMessage(`New enemy unlocked: ${enemyId}`);
      else console.log("Unlocked enemy:", enemyId);
    }
  },

  addDeath(cause) {
    this.data.totalDeaths = (this.data.totalDeaths || 0) + 1;

    const unlockMap = {
      sanity: "wraith",
      bleedout: "stalker",
      starvation: "hollow",
      ambush: "lurker",
      unknown: "echo"
    };

    const newEnemy = unlockMap[cause] || unlockMap["unknown"];
    this.unlock(newEnemy);
    this.save();
  },

  getUnlockedEnemies() {
    return this.data.unlocked || [];
  }
};

DeathUnlocks.init();
