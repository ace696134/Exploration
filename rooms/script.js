/* Endless Requium - Room Handler
   Autoplay-safe audio, fade, background, navigation,
   AND carries over mute state from index.html.
*/

document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const audioName = body.dataset.audio;
  const bg = body.dataset.bg;

  /* ---------------- LOAD MUTE STATE ---------------- */
  const muteState = localStorage.getItem("gameMuted") === "1";

  /* ---------------- BACKGROUND ---------------- */
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

    // Respect mute setting
    ambient.muted = muteState;

    // Start silent to satisfy autoplay
    ambient.volume = 0;

    ambient.play().then(() => {
      if (!muteState) {
        setTimeout(() => fadeAudioIn(), 200);
      }
    }).catch(() => {
      // Autoplay blocked → fallback interaction
      window.addEventListener("click", startAudioFallback);
      window.addEventListener("keydown", startAudioFallback);
    });
  }

  function startAudioFallback() {
    ambient.play();
    if (!muteState) fadeAudioIn();
    window.removeEventListener("click", startAudioFallback);
    window.removeEventListener("keydown", startAudioFallback);
  }

  /* ---------------- FADE IN ---------------- */
  function fadeAudioIn() {
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      ambient.volume = v;
      if (v >= 0.6) clearInterval(fade);
    }, 50);
  }

  /* ---------------- FADE OUT ---------------- */
  function fadeAudioOut(callback) {
    if (!ambient) return callback();

    if (muteState) {
      ambient.pause();
      return callback();
    }

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
