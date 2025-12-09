/* rooms/trophies.js */
window.Trophies = {
  KEY: "trophies_v1",
  add(id, name) {
    const cur = JSON.parse(localStorage.getItem(this.KEY) || "[]");
    if (!cur.find(t=>t.id===id)) {
      cur.push({id,name,date:Date.now()});
      localStorage.setItem(this.KEY, JSON.stringify(cur));
      if (window.showMessage) showMessage(`Trophy: ${name}`);
    }
  },
  list() { return JSON.parse(localStorage.getItem(this.KEY) || "[]"); }
};
