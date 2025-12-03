/* script.js - audio + glitch triggers for title/subtitle/stage */

/* Immediately-invoked to avoid globals */
(function () {
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');
  const stage = document.getElementById('stage');
  const enableBtn = document.getElementById('enableAudio');
  const muteBtn = document.getElementById('toggleMute');

  // Mirror text into data-text so CSS pseudo-elements display same content
  titleEl.setAttribute('data-text', titleEl.textContent);

  // ---- WebAudio hum (user gesture required) ----
  let audioCtx = null, humOsc = null, humGain = null, isMuted = false;

  function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      humOsc = audioCtx.createOscillator();
      humGain = audioCtx.createGain();

      // base drone
      humOsc.type = 'sine';
      humOsc.frequency.value = 42; // dark low tone

      // subtle LFO to modulate pitch
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 0.12; // very slow wobble
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 6;
      lfo.connect(lfoGain);
      lfoGain.connect(humOsc.frequency);

      humGain.gain.value = 0.02; // quiet by default
      humOsc.connect(humGain);
      humGain.connect(audioCtx.destination);
      lfo.start();
      humOsc.start();

      enableBtn.classList.add('hidden');
      muteBtn.classList.remove('hidden');
      muteBtn.textContent = 'Mute';
    } catch (e) {
      console.warn('Audio init error:', e);
    }
  }

  function toggleMute() {
    if (!audioCtx) return;
    isMuted = !isMuted;
    humGain.gain.setValueAtTime(isMuted ? 0 : 0.02, audioCtx.currentTime);
    muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
  }

  enableBtn.addEventListener('click', () => {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  });
  muteBtn.addEventListener('click', toggleMute);

  // also allow first keypress or click anywhere to start audio
  function firstGesture() {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    window.removeEventListener('keydown', firstGesture);
    window.removeEventListener('click', firstGesture);
  }
  window.addEventListener('keydown', firstGesture);
  window.addEventListener('click', firstGesture);

  // ---- Glitch behaviour: random spikes, flickers, stage shakes ----
  function rand(min,max) { return Math.floor(Math.random()*(max-min+1))+min; }

  function doGlitchSpike() {
    titleEl.classList.add('glitch-spike');
    subtitleEl.classList.add('flicker');
    // subtle additional chroma-jump by changing CSS var for pseudo transform
    titleEl.style.setProperty('--tx', `${rand(-12,12)}px`);
    setTimeout(() => {
      titleEl.classList.remove('glitch-spike');
      subtitleEl.classList.remove('flicker');
      titleEl.style.removeProperty('--tx');
    }, 600);
  }

  function doFullFlicker(doShake=false) {
    stage.classList.add('flicker');
    if (doShake) stage.classList.add('shake');
    setTimeout(() => {
      stage.classList.remove('flicker');
      stage.classList.remove('shake');
    }, 520);
  }

  // schedule random events
  function scheduleChaos() {
    setInterval(() => {
      if (Math.random() < 0.58) doGlitchSpike();
    }, rand(2200,4300));

    setInterval(() => {
      if (Math.random() < 0.20) doFullFlicker(Math.random() < 0.6);
    }, rand(7000,19000));

    setInterval(() => {
      if (Math.random() < 0.14) {
        doGlitchSpike();
        setTimeout(doGlitchSpike, 120);
        setTimeout(() => doFullFlicker(true), 340);
      }
    }, rand(12000,28000));
  }

  setTimeout(scheduleChaos, 700);

  // Small sway animation (camera float)
  (function sway(){
    let t=0;
    function frame(){
      t += 0.0045;
      const rx = Math.sin(t*0.9)*0.10;
      const ty = Math.sin(t*0.7)*0.8;
      stage.style.transform = `rotate(${rx}deg) translateY(${ty}px)`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

})();
