/* Room Audio + Fade-in (automatic from body data-audio) */

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const audioFile = body.dataset.audio; // reads data-audio attribute
    if (!audioFile) return; // do nothing if not set

    // --- FADE-IN ---
    body.style.opacity = 0;
    body.style.transition = 'opacity 1.2s ease-in-out';
    requestAnimationFrame(() => {
      body.style.opacity = 1;
    });

    // --- AMBIENT AUDIO ---
    const ambient = new Audio(`../sounds/${audioFile}`);
    ambient.loop = true;
    ambient.volume = 0; // start silent for fade-in

    // smoothly fade-in the audio
    const fadeDuration = 1500; // ms
    let startTime = null;

    function fadeAudio(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / fadeDuration, 1);
      ambient.volume = 0.5 * progress; // target volume 0.5
      if (progress < 1) {
        requestAnimationFrame(fadeAudio);
      }
    }

    function startAmbient() {
      ambient.play().catch(e => console.warn('Ambient blocked:', e));
      requestAnimationFrame(fadeAudio);
      window.removeEventListener('click', startAmbient);
      window.removeEventListener('keydown', startAmbient);
    }

    // autoplay workaround: first click or keypress
    window.addEventListener('click', startAmbient);
    window.addEventListener('keydown', startAmbient);
  });
})();
