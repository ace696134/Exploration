/* Endless Requium - Room Handler
   Handles: fade-in, fade-out, ambient audio, background images, navigation.
*/

document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const audioName = body.dataset.audio;
  const bg = body.dataset.bg;

  /* ---------------- BACKGROUND SET ---------------- */
  if (bg) {
    body.style.backgroundImage = `url('${bg}')`;
  }

  /* ---------------- FADE IN ---------------- */
  requestAnimationFrame(() => {
    body.style.opacity = 1;
  });

  /* ---------------- AUDIO FADE IN ---------------- */
  let ambient;
  if (audioName) {
    ambient = new Audio(`../sounds/${audioName}`);
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

  function fadeAudioIn() {
    let vol = 0;
    const interval = setInterval(() => {
      vol += 0.02;
      if (ambient) ambient.volume = vol;
      if (vol >= 0.5) clearInterval(interval);
    }, 50);
  }

  function fadeAudioOut(callback) {
    if (!ambient) return callback();

    let vol = ambient.volume;
    const interval = setInterval(() => {
      vol -= 0.03;
      ambient.volume = Math.max(vol, 0);
      if (vol <= 0) {
        clearInterval(interval);
        ambient.pause();
        callback();
      }
    }, 40);
  }

  /* ---------------- ROOM BUTTONS ---------------- */
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
