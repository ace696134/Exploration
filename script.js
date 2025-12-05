/* script.js - Title screen hum + glitch + play transition */

(function() {
  const stage = document.getElementById('stage');
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');
  const enableBtn = document.getElementById('enableAudio');
  const muteBtn = document.getElementById('toggleMute');
  const playBtn = document.getElementById('playButton');

  // Glitch reflection
  titleEl.setAttribute('data-text', titleEl.textContent);

  // Title hum
  let titleAudio = new Audio('sounds/hum.mp3');
  titleAudio.loop = true;
  titleAudio.volume = 0.8;
  let isMuted = false;

  // Start the game → fade out + door sound
  function startGame() {
    document.body.classList.add('fade-out');

    const door = new Audio('sounds/creaky_door.mp3');
    door.volume = 1;
    door.play();

    setTimeout(() => {
      window.location.href = "rooms/lore.html";
    }, 2000); // 2 seconds
  }

  // Enable audio
  function initAudio() {
    titleAudio.play().catch(() => console.warn("Audio blocked"));

    enableBtn.classList.add('hidden');

    muteBtn.classList.remove('hidden');
    muteBtn.textContent = 'Mute';

    // NOW show play button
    playBtn.classList.remove('hidden');
  }

  function toggleMute() {
    isMuted = !isMuted;
    titleAudio.muted = isMuted;
    muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
  }

  enableBtn.addEventListener('click', initAudio);
  muteBtn.addEventListener('click', toggleMute);
  playBtn.addEventListener('click', startGame);

  // Autoplay workaround
  function firstGesture() {
    initAudio();
    window.removeEventListener('keydown', firstGesture);
    window.removeEventListener('click', firstGesture);
  }
  window.addEventListener('keydown', firstGesture);
  window.addEventListener('click', firstGesture);

  // ———— GLITCH / FLICKER ————

  function rand(min,max) { return Math.random()*(max-min)+min; }

  function glitchSpike() {
    titleEl.classList.add('glitch-spike');
    subtitleEl.classList.add('flash');
    setTimeout(() => {
      titleEl.classList.remove('glitch-spike');
      subtitleEl.classList.remove('flash');
    }, 600);
  }

  function flickerStage(shake=false) {
    stage.classList.add('flicker');
    setTimeout(() => {
      stage.classList.remove('flicker');
    }, 520);
  }

  function scheduleChaos() {
    setInterval(() => { if(Math.random()<0.55) glitchSpike(); }, rand(2500,4000));
    setInterval(() => { if(Math.random()<0.18) flickerStage(); }, rand(8000,16000));
  }

  setTimeout(scheduleChaos, 800);
})();
