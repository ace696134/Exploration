/* rooms/rooms_system.js — integrate into rooms */
window.RoomsSystem = {
  onRoomLoad() {
    // small sanity drain each room visit
    SanitySystem.change(-1, "ambient");
    // small chance to spawn enemy
    if (Math.random() < 0.25) EnemySystem.spawnRandom();
    // random room events (flavor)
    if (Math.random() < 0.12) {
      if (window.showMessage) showMessage("You hear distant scraping...");
    }
  }
};
