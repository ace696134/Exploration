/* Endless Requium - Room Handler
   Handles: fade-in, fade-out, ambient audio, background images, navigation.
*/

document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const audioName = body.dataset.audio;
  const bg = body.dataset.bg;

  /* ---------------- BACKGROUND SET ---------------- */
  if (bg) {
    // If absolute file URL, use directly
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

  /* ---------------- AUDIO SETUP ---------------- */
  let ambient;

  if (audioName) {
    // Support full file paths directly
    const audioPath = audioName.startsWith("file:///")
      ? audioName
      : `../sounds/${audioName}`;

    ambient = new Audio(audioPath);
    ambient.loop = true;
    ambient.volume = 0;

    function startAudio() {
      ambient.play().catch(() => {});
      fadeAudioIn();
      window.removeEventListener("click", startAudio);
      window.removeEventListener("keydown", startAudio);
    }

    window.addEventListener("click", startAudio);
    window.addEventListener("keydown", startAudio);
  }

  /* ---------------- AUDIO FADE IN ---------------- */
  function fadeAudioIn() {
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      if (ambient) ambient.volume = v;
      if (v >= 0.6) clearInterval(fade);
    }, 50);
  }

  /* ---------------- AUDIO FADE OUT ---------------- */
  function fadeAudioOut(callback) {
    if (!ambient) return callback();

    let v = ambient.volume;
    const fade = setInterval(() => {
      v -= 0.03;
      ambient.volume = Math.max(v, 0);
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

      // Fade-out effect
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
