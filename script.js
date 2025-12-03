/* script.js - optimized for performance, sounds in /sounds folder */

(function() {
  const stage = document.getElementById('stage');
  const titleEl = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');
  const enableBtn = document.getElementById('enableAudio');
  const muteBtn = document.getElementById('toggleMute');

  // Mirror text for glitch pseudo-elements
  titleEl.setAttribute('data-text', titleEl.textContent);

  // Audio setup
  let audioCtx = null;
  let humOsc = null;
  let humGain = null;
  let isMuted = false;

  function initAudio() {
    if (audioCtx) return;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Drone hum
      humOsc = audioCtx.createOscillator();
      humGain = audioCtx.createGain();

      humOsc.type = 'sine';
      humOsc.frequency.value = 42; // low horror drone

      // subtle LFO for pitch wobble
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 0.12; 
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 6;
      lfo.connect(lfoGain);
      lfoGain.connect(humOsc.frequency);

      humGain.gain.value = 0.02;
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
