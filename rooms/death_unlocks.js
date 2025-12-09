/* rooms/death_unlocks.js */
window.DeathUnlocks = (function () {
  const KEY = "deathUnlocks_v1";
  function load() { return JSON.parse(localStorage.getItem(KEY) || '{"unlocked":[], "deaths":0}'); }
  function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  const mapping = {
    sanity: "wraith",
    bleedout: "stalker",
    starvation: "hollow",
    ambush: "lurker",
    unknown: "echo"
  };

  return {
    addDeath(cause = "unknown") {
      const d = load();
      d.deaths = (d.deaths || 0) + 1;
      const enemy = mapping[cause] || mapping.unknown;
      if (!d.unlocked.includes(enemy)) d.unlocked.push(enemy);
      save(d);
      return enemy;
    },
    getUnlocked() { return load().unlocked || []; },
    getAll() { return load(); },
    reset() { localStorage.removeItem(KEY); }
  };
})();
