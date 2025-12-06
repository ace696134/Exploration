/* Endless Requium - Room Handler
   Autoplay-safe audio + fade, background, navigation
*/

document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const audioName = body.dataset.audio;
  const bg = body.dataset.bg;

  /* ---------------- BACKGROUND SET ---------------- */
  if (bg) {
    if (bg.startsWith("file:///")) {
      body.style.backgroundImage = `url("${bg}")`;
    } else {
      body.style.backgroundImage = `url("../images/${bg}")`;
    }
  }

  /* ---------------- FADE IN ---------------- */
  requestAnimationFrame(() => {
    body.style.opacity = 1;
  });

  /* ---------------- AUDIO AUTOPLAY ---------------- */
  let ambient;

  if (audioName) {
    const audioPath = audioName.startsWith("file:///")
      ? audioName
      : `../sounds/${audioName}`;

    ambient = new Audio(audioPath);
    ambient.loop = true;

    // REQUIRED for autoplay to work
    ambient.muted = true;
    ambient.volume = 0;

    // Try to autoplay immediately
    ambient.play().then(() => {
      // Now fade in and unmute shortly after
      setTimeout(() => {
        ambient.muted = false;
        fadeAudioIn();
      }, 200);
    }).catch(err => {
      console.warn("Autoplay blocked, fallback:", err);
      // Fallback: enable playback on first click/keypress
      window.addEventListener("click", startAudioFallback);
      window.addEventListener("keydown", startAudioFallback);
    });
  }

  function startAudioFallback() {
    ambient.play();
    fadeAudioIn();
    window.removeEventListener("click", startAudioFallback);
    window.removeEventListener("keydown", startAudioFallback);
  }

  /* ---------------- AUDIO FADE IN ---------------- */
  function fadeAudioIn() {
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      ambient.volume = v;
      if (v >= 0.6) clearInterval(fade);
    }, 50);
  }

  /* ---------------- AUDIO FADE OUT ---------------- */
  function fadeAudioOut(callback) {
    if (!ambient) return callback();

    let v = ambient.volume;
    const fade = setInterval(() => {
      v -= 0.03;
      ambient.volume = Math.max(0, v);
      if (v <= 0) {
        clearInterval(fade);
        ambient.pause();
        callback();
      }
    }, 40);
  }

  /* ---------------- ROOM NAVIGATION ---------------- */
  const buttons = document.querySelectorAll("[data-jump]");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const nextRoom = btn.dataset.jump;

      body.style.transition = "opacity 0.8s ease-out";
      body.style.opacity = 0;

      fadeAudioOut(() => {
        setTimeout(() => {
          window.location.href = nextRoom;
        }, 800);
      });
    });
  });
});
