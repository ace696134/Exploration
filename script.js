/* script.js - robust title screen: hum only, glitches, play transition */

(function () {
  // Wait for DOM to be ready
  window.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('stage');
    const titleEl = document.getElementById('title');
    const subtitleEl = document.getElementById('subtitle');
    const enableBtn = document.getElementById('enableAudio');
    const muteBtn = document.getElementById('toggleMute');
    const playBtn = document.getElementById('playButton');
    playBtn.classList.remove('hidden');
    
    // Safety: abort if required elements are missing
    if (!titleEl || !subtitleEl || !enableBtn || !playBtn) {
      console.error('Missing UI elements. Check index.html IDs (title, subtitle, enableAudio, playButton).');
      return;
    }

    // Make sure data-text is set for pseudo elements
    if (!titleEl.getAttribute('data-text')) {
      titleEl.setAttribute('data-text', titleEl.textContent.trim());
    }

    // Audio setup (relative path, works with file:// if folder structure is correct)
    const titleAudio = new Audio('sounds/hum.mp3');
    titleAudio.loop = true;
    titleAudio.volume = 0.45;
    let isMuted = false;

    function initAudio() {
      // Play and ignore possible promise rejection (blocked until gesture)
      titleAudio.play().catch(err => {
        console.warn('Audio play was blocked or failed:', err);
      });

      enableBtn.classList.add('hidden');
      muteBtn.classList.remove('hidden');
    }

    function toggleMute() {
      isMuted = !isMuted;
      titleAudio.muted = isMuted;
      muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    }

    function startGame() {
      // fade out and play creaky door, then navigate to lore
      document.body.classList.add('fade-out');

      const door = new Audio('sounds/creaky_door.mp3');
      door.volume = 1;
      door.play().catch(e => console.warn('Door sound blocked', e));

      setTimeout(() => {
        // ensure folder "rooms/lore.html" exists - adjust path if yours differs
        window.location.href = 'rooms/lore.html';
      }, 2000);
    }

    // Attach listeners
    enableBtn.addEventListener('click', initAudio);
    muteBtn.addEventListener('click', toggleMute);
    playBtn.addEventListener('click', startGame);

    // Autoplay workaround: also respond to first click/keypress
    function firstGestureHandler() {
      initAudio();
      window.removeEventListener('click', firstGestureHandler);
      window.removeEventListener('keydown', firstGestureHandler);
    }
    window.addEventListener('click', firstGestureHandler);
    window.addEventListener('keydown', firstGestureHandler);

    // Lightweight glitch/flicker scheduling
    function rand(min, max) { return Math.random() * (max - min) + min; }

    function glitchSpike() {
      titleEl.classList.add('glitch-spike');
      subtitleEl.classList.add('flicker');
      setTimeout(() => {
        titleEl.classList.remove('glitch-spike');
        subtitleEl.classList.remove('flicker');
      }, 600);
    }

    function flickerStage(shake = false) {
      if (!stage) return;
      stage.classList.add('flicker');
      setTimeout(() => stage.classList.remove('flicker'), 520);
    }

    // schedule (light weight)
    setTimeout(() => {
      setInterval(() => { if (Math.random() < 0.55) glitchSpike(); }, rand(2500, 4000));
      setInterval(() => { if (Math.random() < 0.18) flickerStage(); }, rand(8000, 16000));
    }, 800);
  });
})();
