/* ---------------- GLOBAL UTILS (death handler) ---------------- */

function playerDied(reason = "unknown") {
  // Record the death cause and unlock enemy
  if (window.DeathUnlocks && DeathUnlocks.addDeath) DeathUnlocks.addDeath(reason);

  // Reset run-only data
  localStorage.removeItem("inventory");
  localStorage.removeItem("sanity");
  localStorage.removeItem("currentRoom");

  // Optional: keep trophies and deathUnlocks persistent

  // Redirect to main menu
  // Provide a tiny delay so unlock toast can show
  setTimeout(() => {
    window.location.href = "index.html";
  }, 350);
}
