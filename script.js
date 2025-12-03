/* script.js - drives random glitch spikes, flickers, screen shake and audio hum */

(function () {
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  const stage = document.getElementById('stage');
  const enableBtn = document.getElementById('enableAudio');
  const muteBtn = document.getElementById('toggleMute');

  // Keep the data-text attr for pseudo-elements
  title.setAttribute('data-text', title.textContent);

  // ------ AUDIO: low faint hum using WebAudio API ------
  let audioCtx = null;
  let humOsc = null;
  let humGain = null;
  let isMuted = false;

  function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      humOsc = audioCtx.createOscillator();
      humGain = audioCtx.createGain();

      // low drone
      humOsc.type = 'sine';
      humOsc.frequency.value = 45; // low base
      // add subtle modulation
      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.15; // very slow wobble
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 6; // mod range in Hz
      lfo.connect(lfoGain);
      lfoGain.connect(humOsc.frequency);

      // gentle volume
      humGain.gain.value = 0.025;

      humOsc.connect(humGain);
      humGain.connect(audioCtx.destination);

      lfo.start();
      humOsc.start();

      enableBtn.classList.add('hidden');
      muteBtn.classList.remove('hidden');
    } catch (e) {
      console.warn('Audio init failed', e);
    }
  }

  function toggleMute() {
    if (!audioCtx) return;
    isMuted = !isMuted;
    humGain.gain.setValueAtTime(isMuted ? 0 : 0.025, audioCtx.currentTime);
    muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
  }

  enableBtn.addEventListener('click', () => {
    initAudio();
    // resume audio if suspended (required by some browsers)
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  });

  muteBtn.addEventListener('click', toggleMute);

  // ------ RANDOM GLITCHS & FLICKERS ------
  // Random interval helper
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // trigger a quick glitch spike on the title
  function doGlitchSpike() {
    title.classList.add('glitch-spike');
    // quick subtitle micro shuffle
    subtitle.classList.add('flicker');
    setTimeout(() => {
      title.classList.remove('glitch-spike');
      subtitle.classList.remove('flicker');
    }, 600);
  }

  // trigger a full-screen flicker & optional shake
  function doFullFlicker(doShake = false) {
    stage.classList.add('flicker');
    if (doShake) stage.classList.add('shake');
    setTimeout(() => {
      stage.classList.remove('flicker');
      stage.classList.remove('shake');
    }, 500);
  }

  // schedule random effects at varying intervals
  function scheduleChaos() {
    // small glitches fairly often
    setInterval(() => {
      if (Math.random() < 0.55) doGlitchSpike();
    }, rand(2400, 4200));

    // rare full flickers/shakes
    setInterval(() => {
      if (Math.random() < 0.22) doFullFlicker(Math.random() < 0.6);
    }, rand(7000, 22000));

    // occasional rapid stutter (clustered)
    setInterval(() => {
      if (Math.random() < 0.15) {
        doGlitchSpike();
        setTimeout(doGlitchSpike, 120);
        setTimeout(() => doFullFlicker(true), 320);
      }
    }, rand(12000, 30000));
  }

  // subtle continuous sway for unease
  (function sway() {
    let t = 0;
    function frame() {
      t += 0.004;
      // tiny rotate + translate to simulate camera float
      const rx = Math.sin(t * 0.9) * 0.12;
      const ty = Math.sin(t * 0.7) * 0.9;
      stage.style.transform = `rotate(${rx}deg) translateY(${ty}px)`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  // Start the random schedule after a small delay
  setTimeout(scheduleChaos, 600);

  // Accessibility: allow enabling audio with any keypress as well
  window.addEventListener('keydown', function onFirstKey(e) {
    if (!audioCtx) {
      // only start on non-modifier keys
      if (e.key && e.key.length === 1) {
        initAudio();
      }
    }
    // remove after first
    window.removeEventListener('keydown', onFirstKey);
  });

  // Provide click anywhere to enable audio too (first gesture)
  window.addEventListener('click', function onFirstClick() {
    initAudio();
    window.removeEventListener('click', onFirstClick);
  });
})();
