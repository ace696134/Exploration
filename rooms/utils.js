/* ---------------- GLOBAL UTILS (death handler) ---------------- */

/* utils.js — global helpers */
function playerDied(reason = "unknown") {
  // record death and unlock
  const unlocked = DeathUnlocks.addDeath(reason);
  if (window.showMessage) showMessage(`You died by ${reason}. ${unlocked} unlocked for next runs.`);
  // clear run-only storage
  localStorage.removeItem("inventory");
  localStorage.removeItem("sanity");
  localStorage.removeItem("currentRoom");
  // small delay to allow toast
  setTimeout(()=> window.location.href = "index.html", 600);
}
