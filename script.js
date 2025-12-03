/* script.js - Title screen hum only + glitch/flicker */

(function() {
  const stage = document.getElementById('stage');
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');
  const enableBtn = document.getElementById('enableAudio');
  const muteBtn = document.getElementById('toggleMute');
  const playBtn = document.getElementById('playButton');

  // Mirror text for CSS pseudo-elements (glitch)
  titleEl.setAttribute('data-text', titleEl.textContent);

  // Title screen audio
  let titleAudio = new Audio('sounds/hum.mp3');
  titleAudio.loop = true;
  titleAudio.volume = 0.8;
  let isMuted = false;
  
  function showPlayButton() {
    playBtn.classList.remove('hidden');
  }

   function showPlayButton() {
     document.body.classlist.add('fade-out');
     const door = new Audio('sounds/creaky_door.mp3');
     door.volume = 1;
     door.play();
     setTimeout(() => {
       window.location.href = "rooms/lore.html"; 
     }, 2000)
   }
  
  function initAudio() {
    titleAudio.play().catch(e => console.warn('Audio blocked:', e));
    enableBtn.classList.add('hidden');
    muteBtn.classList.remove('hidden');
    muteBtn.textContent = 'Mute';
  }

  function toggleMute() {
    isMuted = !isMuted;
    titleAudio.muted = isMuted;
    muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
  }

  enableBtn.addEventListener('click', initAudio);
  muteBtn.addEventListener('click', toggleMute);

  // Allow first click or keypress to start audio (browser autoplay policy)
  function firstGesture() {
    initAudio();
    window.removeEventListener('keydown', firstGesture);
    window.removeEventListener('click', firstGesture);
  }
  window.addEventListener('keydown', firstGesture);
  window.addEventListener('click', firstGesture);

  // -------------------
  // Glitch + flicker logic
  // -------------------
  function rand(min,max) { return Math.random()*(max-min)+min; }

  function glitchSpike() {
    titleEl.classList.add('glitch-spike');
    subtitleEl.classList.add('flash');
    titleEl.style.setProperty('--tx', `${rand(-12,12)}px`);
    setTimeout(() => {
      titleEl.classList.remove('glitch-spike');
      subtitleEl.classList.remove('flash');
      titleEl.style.removeProperty('--tx');
    }, 600);
  }

  function flickerStage(shake=false) {
    stage.classList.add('flicker');
    if(shake) stage.classList.add('shake');
    setTimeout(() => {
      stage.classList.remove('flicker');
      stage.classList.remove('shake');
    }, 520);
  }

  function scheduleChaos() {
    setInterval(() => { if(Math.random()<0.55) glitchSpike(); }, rand(2500,4000));
    setInterval(() => { if(Math.random()<0.18) flickerStage(Math.random()<0.5); }, rand(8000,16000));
    setInterval(() => {
      if(Math.random()<0.12){
        glitchSpike();
        setTimeout(glitchSpike, 120);
        setTimeout(()=>flickerStage(true), 340);
      }
    }, rand(15000,25000));
  }

  setTimeout(scheduleChaos, 800);

})();
