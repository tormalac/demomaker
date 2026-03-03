// --- DOM Elemek ---
const authBox = document.getElementById("authBox");
const addBtn = document.getElementById('addTrackBtn');
const picker = document.getElementById('trackPicker');
const list = document.getElementById('trackList');
const mixerTracks = document.getElementById('mixerTracks');
const ruler = document.getElementById('timelineRuler');
const rulerInner = document.getElementById('rulerInner');
const playhead = document.getElementById("playhead");
const gridBtn = document.querySelector('.grid-btn');
const gridDropdown = document.querySelector('.grid-dropdown');
const enableAudioBtn = document.getElementById('enableAudioBtn');

// ==========================================================
// --- AUDIO RENDSZER ---
// ==========================================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
const masterPanner = audioCtx.createStereoPanner();
const masterAnalyser = audioCtx.createAnalyser();
masterAnalyser.fftSize = 256;

masterGain.connect(masterPanner);
masterPanner.connect(masterAnalyser);
masterAnalyser.connect(audioCtx.destination);
masterGain.gain.value = 0.8; 

let trackCounter = 0;
let audioEnabled = false;
let availableInputs = [];
let availableOutputs = [];

async function enableAudio() {
  if (audioEnabled) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    availableInputs = devices.filter(d => d.kind === 'audioinput');
    availableOutputs = devices.filter(d => d.kind === 'audiooutput');
    audioEnabled = true;
    
    document.querySelectorAll('.track-container').forEach(track => {
      populateAudioSources(track);
      populateOutputDevices(track);
    });

    enableAudioBtn.textContent = 'Audio Ready';
    enableAudioBtn.disabled = true;
    enableAudioBtn.style.opacity = "0.5";
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    stream.getTracks().forEach(t => t.stop());
  } catch (err) {
    console.error("Audio Hiba:", err);
    alert('Audio hiba: ' + err.message);
  }
}
enableAudioBtn.onclick = enableAudio;

function populateAudioSources(track) {
  const inputPicker = track.querySelector('.audio-source-picker');
  if (!inputPicker) return;
  inputPicker.innerHTML = ''; 

  const virtualBtn = document.createElement('button');
  virtualBtn.textContent = 'Virtual';
  virtualBtn.dataset.deviceId = 'virtual';
  virtualBtn.onclick = () => selectSource(track, virtualBtn, inputPicker);
  inputPicker.appendChild(virtualBtn);

  if (!audioEnabled) return;

  availableInputs.forEach((input, index) => {
    const btn = document.createElement('button');
    btn.textContent = input.label ? input.label : `Input ${index + 1}`;
    btn.dataset.deviceId = input.deviceId;
    
    btn.onclick = (e) => {
        e.stopPropagation();
        selectSource(track, btn, inputPicker);
    };
    inputPicker.appendChild(btn);
  });
}

function selectSource(track, btn, picker) {
    const span = track.querySelector('.audio-source');
    span.innerHTML = `${btn.textContent}<div class="vu-meter-bg input-vu"></div>`;
    picker.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    picker.style.display = 'none';
    
    const monitorBtn = track.querySelector('.daw-btn.monitor');
    if(monitorBtn && monitorBtn.classList.contains('active')) {
        monitorBtn.click(); 
        setTimeout(() => monitorBtn.click(), 50);
    }
}

function populateOutputDevices(track) {
  const outputPicker = track.querySelector('.output-picker');
  if (!outputPicker) return;
  outputPicker.innerHTML = '';

  const virtualBtn = document.createElement('button');
  virtualBtn.textContent = 'Virtual';
  virtualBtn.dataset.deviceId = 'virtual';
  virtualBtn.onclick = () => selectOutput(track, virtualBtn, outputPicker);
  outputPicker.appendChild(virtualBtn);

  if (!audioEnabled) return;

  availableOutputs.forEach((device, index) => {
    const btn = document.createElement('button');
    btn.textContent = device.label ? device.label : `Output ${index + 1}`;
    btn.dataset.outputId = device.deviceId;
    
    btn.onclick = (e) => {
        e.stopPropagation();
        selectOutput(track, btn, outputPicker);
    };
    outputPicker.appendChild(btn);
  });
}

function selectOutput(track, btn, picker) {
    const span = track.querySelector('.output');
    span.innerHTML = `${btn.textContent}<div class="vu-meter-bg"></div>`;
    picker.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    picker.style.display = 'none';
    
    const audioEl = track.querySelector('audio');
    if (audioEl && typeof audioEl.setSinkId === 'function' && btn.dataset.outputId !== 'virtual') {
        audioEl.setSinkId(btn.dataset.outputId).catch(console.error);
    }
}

// --- WAVEFORM RAJZOLÓ ---
function drawWaveform(canvas, buffer, color = '#00ffd5') {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        if (max === -1 && min === 1) { max = 0.002; min = -0.002; }
        
        ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
}

// --- PATTERN VIZUÁLIS KIRAJZOLÁSA A SÁVON ---
function drawPattern(canvas, clip, color) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Vékony háttér-vonalak, hogy lássuk, ez egy rácsos pattern (4 dobhanghoz)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=1; i<4; i++) {
        ctx.moveTo(0, (height/4)*i);
        ctx.lineTo(width, (height/4)*i);
    }
    ctx.stroke();

    // Végigmegyünk a klip "kottáján", és kirajzoljuk a hangjegyeket
    if (clip.patternData && clip.patternData.notes) {
        clip.patternData.notes.forEach(noteEvent => {
            const x = noteEvent.start * PX_PER_SECOND;
            const w = Math.max(3, noteEvent.duration * PX_PER_SECOND); // Min 3px széles
            
            let y = 0;
            let h = height / 4;
            
            // "Mű" sávkiosztás a vizualizációhoz (0=OH, 1=CH, 2=SN, 3=BD)
            if (noteEvent.note === 46) y = 0; 
            else if (noteEvent.note === 42) y = height/4; 
            else if (noteEvent.note === 38) y = (height/4)*2; 
            else if (noteEvent.note === 36) y = (height/4)*3; 

            ctx.fillStyle = color;
            ctx.fillRect(x, y + 2, w, h - 4);
        });
    }
}

// --- KLIP ÁTMÉRETEZÉS (TRIMMING) LOGIKA ---
let isResizing = false;
let resizeTarget = null;
let resizeSide = null; // 'left' vagy 'right'
let resizeStartX = 0;
let resizeStartWidth = 0;
let resizeStartLeft = 0;
let resizeStartTrim = 0;

function initResize(e, handle, clip) {
    e.stopPropagation(); 
    if(e.cancelable) e.preventDefault(); 
    
    isResizing = true;
    resizeTarget = clip;
    resizeSide = handle.classList.contains('left') ? 'left' : 'right';
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    resizeStartX = clientX;
    
    resizeStartWidth = parseFloat(clip.style.width);
    resizeStartLeft = parseFloat(clip.style.left);
    resizeStartTrim = parseFloat(clip.dataset.trimOffset || 0);
    
    document.body.style.cursor = 'col-resize';
}

function handleResizeMove(clientX) {
    if (!isResizing || !resizeTarget) return;

    let deltaPx = clientX - resizeStartX;
    const snapPx = getSnapPx();

    if (resizeSide === 'right') {
        let newWidth = resizeStartWidth + deltaPx;
        
        if (snapPx > 0) {
            newWidth = Math.round(newWidth / snapPx) * snapPx;
        }

        if (newWidth < 10) newWidth = 10; 
        
        const maxDuration = resizeTarget.audioBuffer.duration - resizeStartTrim;
        if (newWidth / PX_PER_SECOND > maxDuration) {
            newWidth = maxDuration * PX_PER_SECOND;
        }

        resizeTarget.style.width = `${newWidth}px`;
        resizeTarget.dataset.duration = newWidth / PX_PER_SECOND;
    
    } else if (resizeSide === 'left') {
        let newLeft = resizeStartLeft + deltaPx;

        if (snapPx > 0) {
            newLeft = Math.round(newLeft / snapPx) * snapPx;
        }

        const appliedDeltaPx = newLeft - resizeStartLeft;
        let newWidth = resizeStartWidth - appliedDeltaPx;
        const appliedDeltaSec = appliedDeltaPx / PX_PER_SECOND;

        if (newWidth < 10) return;
        if (newLeft < 0) newLeft = 0;

        let newTrim = resizeStartTrim + appliedDeltaSec;
        if (newTrim < 0) {
            newTrim = 0;
            newLeft = resizeStartLeft - (resizeStartTrim * PX_PER_SECOND);
            newWidth = resizeStartWidth + (resizeStartTrim * PX_PER_SECOND);
        }

        resizeTarget.style.width = `${newWidth}px`;
        resizeTarget.style.left = `${newLeft}px`;
        resizeTarget.dataset.start = newLeft / PX_PER_SECOND;
        resizeTarget.dataset.trimOffset = newTrim;
        resizeTarget.dataset.duration = newWidth / PX_PER_SECOND;
        
        const canvas = resizeTarget.querySelector('canvas');
        if (canvas) {
            canvas.style.left = `-${newTrim * PX_PER_SECOND}px`;
        }
    }
}

// ==========================================================
// --- DAW LOGIKA & ESEMÉNYEK ---
// ==========================================================
let bpm = 120;
let timeSig = [4, 4];
let zoom = 1;
let PX_PER_SECOND = 100 * zoom;
let currentGrid = "1/8";

const GRID_MAP = {
  "1/2": 2, "1/4": 1, "1/4T": 1/3, "1/8": 0.5,
  "1/8T": 1/6, "1/16": 0.25, "1/16T": 1/12,
  "1/32": 0.125, "1/64": 0.0625 
};

// ==========================================================
// --- TICK ENGINE & ADATSTRUKTÚRA (CORE) ---
// ==========================================================
const PPQ = 960;

function ticksToSeconds(ticks, currentBpm = bpm) {
    return (ticks / PPQ) * (60 / currentBpm);
}

function secondsToTicks(seconds, currentBpm = bpm) {
    return Math.round((seconds / (60 / currentBpm)) * PPQ);
}

function ticksToPixels(ticks) {
    return ticksToSeconds(ticks) * PX_PER_SECOND;
}

function pixelsToTicks(pixels) {
    return secondsToTicks(pixels / PX_PER_SECOND);
}


// --- TRACK LÉTREHOZÁS ---
addBtn.addEventListener('click', () => picker.classList.toggle('show'));

function createTrack(type) {
    trackCounter++;
    const trackId = 'trk-' + trackCounter;

    // 1. FELSŐ Track HTML létrehozása
    const track = document.createElement('div');
    track.className = `track-container ${type}`;
    track.dataset.trackId = trackId;

    track.innerHTML = `
      <div class="track-inspector">
        <span class="track-type">${type}</span>
        <span class="track-name" contenteditable="true">Track ${trackCounter}</span>
        <button class="delete-track">×</button>
        <div class="track-controls">
          <button class="daw-btn mute" title="Mute">M</button>
          <button class="daw-btn solo" title="Solo">S</button>
          <button class="daw-btn record" title="Record Enabled">●</button>
          <button class="daw-btn monitor" title="Direct Monitor"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path class="wave" fill="none" stroke-width="2" stroke="currentColor" d="M16 8c1.5 1.5 1.5 6 0 7.5"/></svg></button>
          <button class="daw-btn edit" title="Edit Enabled">e</button>
        </div>
        <div class="track-sliders">
          <label>Vol
           <input type="range" min="0" max="100" value="80" class="trk-vol-slider horizontal-fader"><span class="slider-value">80%</span>
          </label>
          <label>Pan
           <input type="range" min="-50" max="50" value="0" class="trk-pan-slider horizontal-fader"><span class="slider-value">0</span>
          </label>
        </div>
        <div class="track-meta">
          <span class="audio-source">No Input<div class="vu-meter-bg input-vu"></div></span>
          <div class="audio-source-picker"></div>
          <span class="output">No Output<div class="vu-meter-bg"></div></span>
          <div class="output-picker"></div>
        </div>
        <div class="track-inserts">Audio Inserts</div>
      </div>
      <div class="track-area">
        <div class="timeline">
         <div class="timeline-grid"></div>
         <div class="clips"></div>
        </div>
      </div>
    `;

    // --- AUDIO GRAPH BEKÖTÉSE A PANORÁMÁVAL ---
    const trackGain = audioCtx.createGain();
    const trackPanner = audioCtx.createStereoPanner();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    
    // Jelút: Panner -> Gain -> Analyser -> Master Gain
    trackPanner.connect(trackGain);
    trackGain.connect(analyser);
    analyser.connect(masterGain);
    
    track.trackGainNode = trackGain;
    track.trackPannerNode = trackPanner;
    track.analyserNode = analyser;
    trackGain.gain.value = 0.8;

    addTrackDragEvents(track);
    list.appendChild(track);

    // 2. ALSÓ Mixer Csatorna HTML létrehozása
    const mixChan = document.createElement('div');
    mixChan.className = `mixer-channel ${type}`;
    mixChan.dataset.trackId = trackId;
    mixChan.innerHTML = `
        <div class="mix-header">Track ${trackCounter}</div>
        <div class="mix-type">${type}</div>
        <div class="mix-controls">
            <button class="daw-btn mute mix-mute">M</button>
            <button class="daw-btn solo mix-solo">S</button>
        </div>
        <div class="mix-pan-wrap">
            <input type="range" min="-50" max="50" value="0" class="mix-pan-slider mini-pan-fader">
        </div>
        <div class="fader-wrapper">
            <input type="range" min="0" max="100" value="80" class="mix-vol-slider vertical-fader">
        </div>
        <div class="mix-val">80%</div>
    `;
    mixerTracks.appendChild(mixChan);

    // Track Kijelölés logika
    const inspector = track.querySelector('.track-inspector');
    inspector.addEventListener('click', (ev) => {
        if(ev.target.tagName === 'BUTTON' || ev.target.tagName === 'INPUT') return;
        document.querySelectorAll('.track-container').forEach(t => t.classList.remove('selected'));
        track.classList.add('selected');
    });

    updateZoomVisibility();
    document.querySelectorAll('.track-container').forEach(t => t.classList.remove('selected'));
    track.classList.add('selected');

    const rulerEl = document.getElementById('timelineRuler');
    if (rulerEl.style.display !== 'flex') rulerEl.style.display = 'flex';
    
    populateAudioSources(track);
    populateOutputDevices(track);
    drawAllGrids();
    drawRuler();
}

picker.addEventListener('click', (e) => {
    if (!e.target.dataset.type) return;
    createTrack(e.target.dataset.type);
    picker.classList.remove('show');
});

// --- SÁV ÉS MIXER SZINKRONIZÁCIÓ (INPUT ESEMÉNYEK) ---
document.addEventListener('input', e => {
    // 1. MASTER Vol & Pan vezérlés
    if (e.target.classList.contains('master-vol-slider')) {
        const val = e.target.value;
        document.querySelector('.master-vol-val').textContent = val + '%';
        masterGain.gain.value = val / 100;
    }
    else if (e.target.classList.contains('master-pan-slider')) {
        masterPanner.pan.value = e.target.value / 50;
    }
    
    // 2. FELSŐ Track Slider húzása -> ALSÓ Mixer frissítése
    else if (e.target.matches('.track-sliders input[type="range"]')) {
        const isVol = e.target.parentElement.textContent.includes('Vol');
        const val = e.target.value;
        const trackContainer = e.target.closest('.track-container');
        const trackId = trackContainer ? trackContainer.dataset.trackId : null;
        
        if (isVol) {
            e.target.nextElementSibling.textContent = val + '%';
            if (trackId) {
                const mixChan = document.querySelector(`.mixer-channel[data-track-id="${trackId}"]`);
                if (mixChan) {
                    mixChan.querySelector('.mix-vol-slider').value = val;
                    mixChan.querySelector('.mix-val').textContent = val + '%';
                }
            }
            updateSoloStates();
        } else {
            // Felső Pan húzása
            e.target.nextElementSibling.textContent = val;
            if (trackId) {
                const mixChan = document.querySelector(`.mixer-channel[data-track-id="${trackId}"]`);
                if (mixChan) mixChan.querySelector('.mix-pan-slider').value = val;
                if (trackContainer.trackPannerNode) trackContainer.trackPannerNode.pan.value = val / 50;
            }
        }
    }
    
    // 3. ALSÓ Mixer Slider húzása -> FELSŐ Track frissítése
    else if (e.target.classList.contains('mix-vol-slider') || e.target.classList.contains('mix-pan-slider')) {
        const isVol = e.target.classList.contains('mix-vol-slider');
        const val = e.target.value;
        const trackId = e.target.closest('.mixer-channel').dataset.trackId;
        const track = document.querySelector(`.track-container[data-track-id="${trackId}"]`);
        
        if (isVol) {
            e.target.parentElement.nextElementSibling.textContent = val + '%'; // A .mix-val a fader wrapper mellett van
            if (track) {
                const volInputs = track.querySelectorAll('.track-sliders input[type="range"]');
                if(volInputs[0]) {
                    volInputs[0].value = val;
                    volInputs[0].nextElementSibling.textContent = val + '%';
                    updateSoloStates();
                }
            }
        } else {
            // Alsó Pan húzása
            if (track) {
                const panInputs = track.querySelectorAll('.track-sliders input[type="range"]');
                if(panInputs[1]) {
                    panInputs[1].value = val;
                    panInputs[1].nextElementSibling.textContent = val;
                    if (track.trackPannerNode) track.trackPannerNode.pan.value = val / 50;
                }
            }
        }
    }
    // 4. Track Név -> Mixer
    else if (e.target.classList.contains('track-name')) {
        const trackId = e.target.closest('.track-container').dataset.trackId;
        const mixChan = document.querySelector(`.mixer-channel[data-track-id="${trackId}"]`);
        if (mixChan) mixChan.querySelector('.mix-header').textContent = e.target.textContent;
    }
});

// --- ENTER TILTÁSA A SÁV NEVÉNEK ÁTÍRÁSAKOR ---
document.addEventListener('keydown', (e) => {
    // Csak akkor avatkozunk be, ha épp egy track nevét szerkesztik
    if (e.target.classList.contains('track-name')) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Megakadályozza az új sort
            e.target.blur();    // Leveszi a kurzort, mintha kész lennél
        }
    }
});

// --- STEP SEQUENCER LOGIKA ÉS UI ÉPÍTÉS ---
const seqOverlay = document.getElementById('seq-modal-overlay');
const seqGrid = document.getElementById('seq-grid');
const instruments = [
    { id: 'oh', name: 'Open Hat', note: 46 },
    { id: 'ch', name: 'Hi-Hat', note: 42 },
    { id: 'sn', name: 'Snare', note: 38 },
    { id: 'bd', name: 'Kick', note: 36 }
];

// --- DRUM EDITOR (PATTERN KLIP SZERKESZTŐ) ---
function openDrumEditor(clip) {
    const seqOverlay = document.getElementById('seq-modal-overlay');
    const seqGrid = document.getElementById('seq-grid');
    const title = document.getElementById('seq-title');
    
    title.textContent = clip.querySelector('.clip-name').textContent + ' - EDITOR';
    
    const instruments = [
        { id: 'oh', name: 'Open Hat', note: 46 },
        { id: 'ch', name: 'Hi-Hat', note: 42 },
        { id: 'sn', name: 'Snare', note: 38 },
        { id: 'bd', name: 'Kick', note: 36 }
    ];

    // 16 tizenhatod (1 ütem). Később a klip hosszához igazítjuk.
    const stepsPerBar = 16; 
    const totalSteps = clip.patternData.lengthInBars * stepsPerBar;
    const secPerBeat = 60 / bpm;
    const secPerStep = secPerBeat / 4; // 1 tizenhatod hossza mp-ben (4/4 esetén)

    seqGrid.innerHTML = '';

    instruments.forEach(inst => {
        const row = document.createElement('div');
        row.className = 'seq-row';
        
        const label = document.createElement('div');
        label.className = 'seq-inst-name';
        label.textContent = inst.name;
        row.appendChild(label);
        
        const stepsContainer = document.createElement('div');
        stepsContainer.className = 'seq-steps';
        
        for(let i = 0; i < totalSteps; i++) {
            const btn = document.createElement('button');
            btn.className = 'seq-step-btn';
            
            // Megnézzük, van-e hangjegy a klipben ezen az időponton
            const noteTime = i * secPerStep;
            const existingNoteIndex = clip.patternData.notes.findIndex(n => n.note === inst.note && Math.abs(n.start - noteTime) < 0.01);
            
            if (existingNoteIndex !== -1) {
                btn.classList.add('active');
            }
            
            // Szerkesztés (Kattintás) logikája
            btn.addEventListener('click', () => {
                const isActive = btn.classList.contains('active');
                if (isActive) {
                    // Törlés a memóriából
                    btn.classList.remove('active');
                    const idx = clip.patternData.notes.findIndex(n => n.note === inst.note && Math.abs(n.start - noteTime) < 0.01);
                    if (idx !== -1) clip.patternData.notes.splice(idx, 1);
                } else {
                    // Hozzáadás a memóriához
                    btn.classList.add('active');
                    clip.patternData.notes.push({note: inst.note, start: noteTime, duration: 0.1, velocity: 100});
                    
                    // Hang lejátszása kattintáskor (Visszajelzés)
                    if (!window.analogDrums) window.analogDrums = new AnalogDrumMachine(audioCtx);
                    // A sáv bemenetére küldjük (így ha van rajta FX, azon is átmegy)
                    const trackOutput = clip.closest('.track-container').trackPannerNode || masterGain;
                    window.analogDrums.playNote(inst.note, audioCtx.currentTime, 100, trackOutput);
                }
                
                // AZONNAL FRISSÍTJÜK A CANVAS-T A SÁVON!
                const color = clip.closest('.track-container').classList.contains('drum') ? '#3fa9f5' : '#b084f7';
                const canvas = clip.querySelector('canvas');
                // Segédvonalak újrarajzolása
                drawPattern(canvas, clip, color);
            });
            stepsContainer.appendChild(btn);
        }
        row.appendChild(stepsContainer);
        seqGrid.appendChild(row);
    });

    seqOverlay.style.display = 'flex';
}

// Bezárás gomb
document.getElementById('close-seq-btn').addEventListener('click', () => {
    seqOverlay.style.display = 'none';
});

// --- GOMBOK ÉS KATTINTÁSOK KEZELÉSE (Sávok és Keverő is) ---
document.addEventListener('click', e => {
    
    // 1. TÖRLÉS GOMB (Sáv és Keverő törlése)
    if (e.target.classList.contains('delete-track')) {
        if (confirm('Törlöd ezt a sávot?')) {
            const track = e.target.closest('.track-container');
            const trackId = track.dataset.trackId;
            track.remove();
            
            const mixChan = document.querySelector(`.mixer-channel[data-track-id="${trackId}"]`);
            if (mixChan) mixChan.remove();
            
            const remainingTracks = document.querySelectorAll('.track-container').length;
            if (remainingTracks === 0) document.getElementById('timelineRuler').style.display = 'none';
            
            updateSoloStates();
            updateZoomVisibility();
        }
        return;
    }

    // 2. MUTE GOMB
    const muteBtn = e.target.closest('.daw-btn.mute');
    if (muteBtn) {
        const trackId = muteBtn.closest('[data-track-id]').dataset.trackId;
        const track = document.querySelector(`.track-container[data-track-id="${trackId}"]`);
        if(!track) return;
        
        const trkMute = track.querySelector('.daw-btn.mute');
        trkMute.classList.toggle('active');
        
        if (trkMute.classList.contains('active')) {
            track.querySelector('.daw-btn.solo').classList.remove('active');
        }
        syncMixerButtons(trackId);
        updateSoloStates();
        return;
    }

    // 3. SOLO GOMB
    const soloBtn = e.target.closest('.daw-btn.solo');
    if (soloBtn) {
        const trackId = soloBtn.closest('[data-track-id]').dataset.trackId;
        const track = document.querySelector(`.track-container[data-track-id="${trackId}"]`);
        if(!track) return;
        
        const trkSolo = track.querySelector('.daw-btn.solo');
        trkSolo.classList.toggle('active');
        
        if (trkSolo.classList.contains('active')) {
            track.querySelector('.daw-btn.mute').classList.remove('active');
        }
        syncMixerButtons(trackId);
        updateSoloStates();
        return;
    }

    // 4. MONITOR & EGYÉB (Csak a felső sávon)
    const monitorBtn = e.target.closest('.daw-btn.monitor');
    if (monitorBtn) { handleMonitorClick(monitorBtn); return; }

    // Clip LED törlése kattintásra
    if (e.target.classList.contains('clip-led')) {
        e.target.classList.remove('clipping');
        return;
    }

    // 5. EDIT GOMB (Pattern klip létrehozása és Editor megnyitása)
    const editBtn = e.target.closest('.daw-btn.edit');
    if (editBtn) {
        const trackContainer = editBtn.closest('.track-container');
        
        if (trackContainer.classList.contains('drum') || trackContainer.classList.contains('synth')) {
            // Megnézzük, van-e már kijelölt klip ezen a sávon
            const selectedClip = trackContainer.querySelector('.audio-clip.selected-clip');
            
            if (selectedClip) {
                if (selectedClip.dataset.type === 'pattern') {
                    openDrumEditor(selectedClip);
                } else {
                    alert("Ez egy Audio Klip! A MIDI Editor csak Pattern klipekhez használható.");
                }
            } else {
                // NINCS KIJELÖLVE SEMMI: Hozunk létre egy új, 1 ütemes Pattern Klipet a Piros Vonalnál!
                let startTime = currentPlayTime;
                
                // Rácshoz (Grid) illesztjük a kezdést, hogy pontosan ütemre kerüljön
                const snapPx = getSnapPx();
                if (snapPx > 0) {
                    startTime = (Math.round((startTime * PX_PER_SECOND) / snapPx) * snapPx) / PX_PER_SECOND;
                }

                const clipsContainer = trackContainer.querySelector('.clips');
                const newClip = addPatternClipToTrack(clipsContainer, "Pattern " + Math.floor(Math.random()*100), startTime, 1);
                
                // --- TEST ADATOK: Tegyünk bele egy Alap Dob Groove-ot, hogy lássuk a grafikát! ---
                const secPerBeat = 60 / bpm; // Egy negyed hossza másodpercben
                newClip.patternData.notes.push({note: 36, start: 0, duration: 0.1, velocity: 100}); // Kick (1. ütés)
                newClip.patternData.notes.push({note: 38, start: secPerBeat, duration: 0.1, velocity: 100}); // Snare (2. ütés)
                newClip.patternData.notes.push({note: 36, start: secPerBeat*2, duration: 0.1, velocity: 100}); // Kick (3. ütés)
                newClip.patternData.notes.push({note: 38, start: secPerBeat*3, duration: 0.1, velocity: 100}); // Snare (4. ütés)

                // Kirajzoljuk a Canvas-ra
                const color = trackContainer.classList.contains('drum') ? '#3fa9f5' : '#b084f7';
                drawPattern(newClip.querySelector('canvas'), newClip, color);

                const selectBtn = document.querySelector('.select-btn');
                if (selectBtn && selectBtn.classList.contains('active')) {
                    document.querySelectorAll('.audio-clip').forEach(c => c.classList.remove('selected-clip'));
                    newClip.classList.add('selected-clip');
                }
            }
        } else {
            alert("A Pattern Editor egyelőre csak a DRUM és SYNTH sávokon működik!");
        }
        return;
    }
    
    const otherBtn = e.target.closest('.daw-btn');
    if (otherBtn && !otherBtn.classList.contains('mix-mute') && !otherBtn.classList.contains('mix-solo')) {
        otherBtn.classList.toggle('active');
        return;
    }
});

// Pickerek bezárása kattintásra
document.addEventListener('click', (e) => {
    if(!e.target.closest('.audio-source') && !e.target.closest('.output')){
        closeAllPickers();
    }
});


// --- MONITORING LOGIKA ---
async function handleMonitorClick(btn) {
    btn.classList.toggle('active');
    const track = btn.closest('.track-container');
    
    // Melyik bemenet van kiválasztva? Ha semmi, legyen az alapértelmezett ('default')
    const inputPicker = track.querySelector('.audio-source-picker');
    const selectedInputBtn = inputPicker.querySelector('button.selected');
    const inputId = selectedInputBtn ? selectedInputBtn.dataset.deviceId : 'default';
    
    const outputPicker = track.querySelector('.output-picker');
    const selectedOutputBtn = outputPicker.querySelector('button.selected');
    const outputId = selectedOutputBtn ? selectedOutputBtn.dataset.outputId : 'default';

    let audioEl = track.querySelector('audio');
    if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.style.display = 'none';
        track.appendChild(audioEl);
    }

    if (btn.classList.contains('active')) {
        try {
            // Ha 'virtual', akkor nem kérünk hangot. Ha 'default', megkérjük a böngésző alap mic-jét!
            if (inputId === 'virtual') return;

            const audioConstraints = (inputId !== 'default') 
                ? { deviceId: { exact: inputId } } 
                : true;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
            audioEl.srcObject = stream;
            audioEl.play();

            if (outputId !== 'virtual' && outputId !== 'default' && typeof audioEl.setSinkId === 'function') {
                audioEl.setSinkId(outputId).catch(console.warn);
            }

            // VU méter bekötése
            const sourceNode = audioCtx.createMediaStreamSource(stream);
            const inputAnalyser = audioCtx.createAnalyser();
            inputAnalyser.fftSize = 256;
            sourceNode.connect(inputAnalyser); 
            
            track.inputAnalyserNode = inputAnalyser;

        } catch(err) {
            console.error("Monitor hiba:", err);
            alert("Kérlek engedélyezd a mikrofont a böngészőben! (" + err.message + ")");
            btn.classList.remove('active');
        }
    } else {
        if (audioEl.srcObject) {
            audioEl.srcObject.getTracks().forEach(t => t.stop());
            audioEl.srcObject = null;
        }
        track.inputAnalyserNode = null;
    }
}


// Bemenet/Kimenet megnyitása
list.addEventListener('click', e => {
    const sourceSpan = e.target.closest('.audio-source');
    if (sourceSpan) {
        const p = sourceSpan.nextElementSibling;
        closeAllPickers();
        p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
        e.stopPropagation();
    }
    const outSpan = e.target.closest('.output');
    if (outSpan) {
        const p = outSpan.nextElementSibling;
        closeAllPickers();
        p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
        e.stopPropagation();
    }
});

function syncMixerButtons(trackId) {
    const track = document.querySelector(`.track-container[data-track-id="${trackId}"]`);
    const mixChan = document.querySelector(`.mixer-channel[data-track-id="${trackId}"]`);
    if(!track || !mixChan) return;

    const isMuted = track.querySelector('.daw-btn.mute').classList.contains('active');
    const isSolo = track.querySelector('.daw-btn.solo').classList.contains('active');
    
    mixChan.querySelector('.mix-mute').classList.toggle('active', isMuted);
    mixChan.querySelector('.mix-solo').classList.toggle('active', isSolo);
}

function updateSoloStates() {
    const allTracks = document.querySelectorAll('.track-container');
    const activeSolos = document.querySelectorAll('.track-container .daw-btn.solo.active');
    const isAnySolo = activeSolos.length > 0;

    allTracks.forEach(track => {
        if (!track.trackGainNode) return;
        const isMuted = track.querySelector('.daw-btn.mute').classList.contains('active');
        const isSolo = track.querySelector('.daw-btn.solo').classList.contains('active');
        
        // Hangerő kiolvasása a felső csúszkából
        const volInput = track.querySelector('.trk-vol-slider');
        const sliderVolume = (volInput ? parseInt(volInput.value) : 80) / 100;

        if (isAnySolo) {
            track.trackGainNode.gain.value = isSolo ? sliderVolume : 0;
        } else {
            track.trackGainNode.gain.value = isMuted ? 0 : sliderVolume;
        }
    });
}

function closeAllPickers() {
    document.querySelectorAll('.audio-source-picker, .output-picker').forEach(p => {
        p.style.display = 'none';
    });
}

const zoomContainer = document.getElementById('zoomContainer');
function updateZoomVisibility() {
    const trackCount = document.querySelectorAll('.track-container').length;
    if (trackCount > 0) {
        zoomContainer.style.display = 'block';
    } else {
        zoomContainer.style.display = 'none';
    }
}

// --- TRACK (SÁV) DRAG & DROP LOGIKA ---
let draggedTrack = null;
function addTrackDragEvents(trackContainer) {
    // 1. Az egész inspector helyett csak a típus nevet (pl. "guitar") fogjuk meg
    const dragHandle = trackContainer.querySelector('.track-type');
    const inspector = trackContainer.querySelector('.track-inspector');

    // 2. Csak a "fogantyú" legyen húzható
    dragHandle.setAttribute('draggable', 'true');
    dragHandle.style.cursor = 'grab'; // Vizuális visszajelzés a felhasználónak

    dragHandle.addEventListener('dragstart', (e) => {
        draggedTrack = trackContainer;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'track-move');
        
        // PRO TIPP: Bár csak a kis szöveget fogtuk meg, beállíthatjuk, 
        // hogy húzás közben az egész inspector látszódjon "szellemként"!
        e.dataTransfer.setDragImage(inspector, 10, 10);
        
        setTimeout(() => { trackContainer.classList.add('dragging'); }, 0);
    });

    dragHandle.addEventListener('dragend', () => {
        trackContainer.classList.remove('dragging');
        trackContainer.style.display = 'flex';
        draggedTrack = null;

        // Keverőpult csatornáinak átrendezése (ez marad az eredeti)
        const mixerContainer = document.getElementById('mixerTracks');
        const currentTracks = document.querySelectorAll('.track-container');
        
        currentTracks.forEach(track => {
            const trackId = track.dataset.trackId;
            const mixChan = document.querySelector(`.mixer-channel[data-track-id="${trackId}"]`);
            if (mixChan) {
                mixerContainer.appendChild(mixChan);
            }
        });
    });

    // Kurzorkép cseréje, amíg nyomva tartod az egeret
    dragHandle.addEventListener('mousedown', () => dragHandle.style.cursor = 'grabbing');
    dragHandle.addEventListener('mouseup', () => dragHandle.style.cursor = 'grab');
}

list.addEventListener('dragover', (e) => {
    e.preventDefault(); 
    if (!draggedTrack) return;
    const afterElement = getDragAfterElement(list, e.clientY);
    if (afterElement == null) {
        list.appendChild(draggedTrack);
    } else {
        list.insertBefore(draggedTrack, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.track-container:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// --- UI GOMBOK (BPM, Grid) ---
document.querySelectorAll('.loop-btn, .play-btn, .rec-btn, .click-btn, .snap-btn, .select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('button').classList.toggle('active');
    });
});

const bpmInput = document.querySelector('.bpm-input');
bpmInput.addEventListener('input', () => {
    bpmInput.value = bpmInput.value.replace(/\D/g, '');
});
bpmInput.addEventListener('change', () => {
    let val = parseInt(bpmInput.value);
    if (isNaN(val) || val < 20) val = 20;
    if (val > 999) val = 999;
    bpmInput.value = val;
    
    const oldBpm = bpm; 
    bpm = val;          
    
    // Kiszámoljuk az arányt (pl. ha 120-ról 60-ra megyünk, minden kétszer olyan hosszú lesz)
    const ratio = oldBpm / bpm;
    
    document.querySelectorAll('.audio-clip').forEach(clip => {
        const startSec = parseFloat(clip.dataset.start);
        const beatPosition = startSec / (60 / oldBpm);
        const newStartSec = beatPosition * (60 / bpm);

        clip.dataset.start = newStartSec;
        clip.style.left = `${newStartSec * PX_PER_SECOND}px`;

        // --- ÚJ: MIDI/Pattern klip időzítésének átskálázása! ---
        if (clip.dataset.type === 'pattern') {
            // Hosszúság átméretezése (sec -> sec)
            const oldDuration = parseFloat(clip.dataset.duration);
            const newDuration = oldDuration * ratio;
            clip.dataset.duration = newDuration;
            clip.style.width = `${newDuration * PX_PER_SECOND}px`;

            // Canvas (grafika) átméretezése
            const canvas = clip.querySelector('canvas');
            if (canvas) {
                canvas.width = Math.min(newDuration * PX_PER_SECOND, 16384);
                canvas.style.width = `${newDuration * PX_PER_SECOND}px`;
            }

            // Belső hangjegyek időkódjainak (sec) skálázása
            if (clip.patternData && clip.patternData.notes) {
                clip.patternData.notes.forEach(note => {
                    note.start = note.start * ratio;
                });
            }

            // Vonalak újrarajzolása az új pozíciókra
            const color = clip.closest('.track-container').classList.contains('drum') ? '#3fa9f5' : '#b084f7';
            drawPattern(canvas, clip, color);
        }
    });

    const playheadBeat = currentPlayTime / (60 / oldBpm);
    currentPlayTime = playheadBeat * (60 / bpm);
    startOffset = currentPlayTime; 

    drawRuler();
    drawAllGrids();
    updatePlayheadVisuals();
});

gridBtn.addEventListener('click', e => {
  e.stopPropagation();
  gridDropdown.classList.toggle('open');
});
gridDropdown.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    currentGrid = btn.dataset.grid;
    gridBtn.textContent = currentGrid;
    gridDropdown.classList.remove('open');
    gridDropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    drawAllGrids();
  });
});

// --- SELECT GOMB EXTRA FUNKCIÓ: Kijelölések törlése kattintáskor ---
const selectToolBtn = document.querySelector('.select-btn');
if (selectToolBtn) {
    selectToolBtn.addEventListener('click', () => {
        // 1. Levesszük a fehér keretet az összes kijelölt klipről
        document.querySelectorAll('.audio-clip.selected-clip').forEach(clip => {
            clip.classList.remove('selected-clip');
        });
        
        // 2. Biztonsági nullázás a memóriában
        isDraggingClip = false;
        draggedClip = null;
        selectedClip = null;
    });
}

const cutBtn = document.querySelector('.cut-btn');
function performCut(e) {
    if (e.cancelable) e.preventDefault(); 
    e.stopPropagation();
    
    // Lekérjük az ÖSSZES kijelölt klipet (hiszen most már több is lehet!)
    const selectedClips = document.querySelectorAll('.audio-clip.selected-clip');
    
    if (selectedClips.length === 0) {
        alert("Nincs kijelölve klip a vágáshoz!");
        cutBtn.classList.remove('active');
        return;
    }

    let cutCount = 0;

    selectedClips.forEach(selected => {
        const clipStart = parseFloat(selected.dataset.start);
        const clipDur = parseFloat(selected.dataset.duration);
        const clipEnd = clipStart + clipDur;
        
        // Csak azt a klipet vágjuk el, amit épp metsz a Playhead (piros vonal)
        if (currentPlayTime > clipStart && currentPlayTime < clipEnd) {
            const buffer = selected.audioBuffer;
            const parent = selected.parentElement; // Ez a .clips div
            const name = selected.querySelector('.clip-name').textContent;
            const originalTrim = parseFloat(selected.dataset.trimOffset || 0);
            
            // Kiszámoljuk, hol vágunk a klipen belül (másodpercben)
            const cutPointRelative = currentPlayTime - clipStart;
            
            // 1. Eredeti klip eltüntetése
            selected.remove(); 
            
            // 2. BAL OLDALI DARAB létrehozása (a vágópontig)
            addClipToTrack(parent, buffer, name, clipStart, originalTrim, cutPointRelative);
            
            // 3. JOBB OLDALI DARAB létrehozása (a vágóponttól a végéig)
            const remainingDuration = clipDur - cutPointRelative;
            const newTrimOffset = originalTrim + cutPointRelative;
            addClipToTrack(parent, buffer, name, currentPlayTime, newTrimOffset, remainingDuration);
            
            cutCount++;
        }
    });

    if (cutCount === 0) {
        alert("A Playhead (piros vonal) nem érinti a kijelölt klipet(eket)!");
    } else {
        // Haptikus visszajelzés mobilon
        if (navigator.vibrate) navigator.vibrate(50);
    }
    
    // Gomb vizuális kikapcsolása kattintás után
    setTimeout(() => cutBtn.classList.remove('active'), 150);
}
cutBtn.addEventListener('touchstart', performCut, {passive: false});
cutBtn.addEventListener('click', performCut);

const duplicateBtn = document.querySelector('.duplicate-btn');
function performDuplicate(e) {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    
    const selectedClips = document.querySelectorAll('.audio-clip.selected-clip');
    
    if (selectedClips.length === 0) {
        alert("Nincs kijelölve klip a duplikáláshoz!");
        if (duplicateBtn) duplicateBtn.classList.remove('active');
        return;
    }

    // Ide gyűjtjük az újonnan létrehozott másolatokat
    const newlyCreatedClips = [];

    selectedClips.forEach(selected => {
        const parent = selected.parentElement; 
        const name = selected.querySelector('.clip-name').textContent; 
        
        const currentStart = parseFloat(selected.dataset.start);
        const currentDuration = parseFloat(selected.dataset.duration);
        const currentTrim = parseFloat(selected.dataset.trimOffset || 0);
        
        const newStart = currentStart + currentDuration;
        
        let newClip;

        // --- ÚJ LOGIKA: Megnézzük, milyen típusú a klip ---
        if (selected.dataset.type === 'pattern') {
            
            // 1. Létrehozzuk az új üres Pattern klipet a timeline-on
            newClip = addPatternClipToTrack(parent, name, newStart, selected.patternData.lengthInBars);
            
            // 2. DEEP COPY: Teljesen független másolatot készítünk a "kottáról" (JSON trükk)
            newClip.patternData.notes = JSON.parse(JSON.stringify(selected.patternData.notes));
            
            // 3. Kirajzoljuk rá a másolt kis bogyókat
            const trackContainer = parent.closest('.track-container');
            const color = (trackContainer && trackContainer.classList.contains('synth')) ? '#b084f7' : '#3fa9f5';
            drawPattern(newClip.querySelector('canvas'), newClip, color);

        } else {
            // RÉGI LOGIKA: Ha ez egy Audio Klip, másoljuk az audioBuffer-t
            const buffer = selected.audioBuffer;
            newClip = addClipToTrack(parent, buffer, name, newStart, currentTrim, currentDuration);
        }

        if (newClip) newlyCreatedClips.push(newClip);
    });

    // 1. Töröljük a kijelölést az EREDETI klipekről
    selectedClips.forEach(c => c.classList.remove('selected-clip'));

    // 2. Rátesszük a kijelölést az ÚJ klipekre
    newlyCreatedClips.forEach(c => c.classList.add('selected-clip'));

    // Vizuális és haptikus visszajelzés
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => {
        if (duplicateBtn) duplicateBtn.classList.remove('active');
    }, 150);
}

if (duplicateBtn) {
    duplicateBtn.addEventListener('touchstart', performDuplicate, {passive: false});
    duplicateBtn.addEventListener('click', performDuplicate);
}

const deleteBtn = document.querySelector('.delete-btn');

function performDelete(e) {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    
    // 1. Megkeressük az ÖSSZES kijelölt klipet
    const selectedClips = document.querySelectorAll('.audio-clip.selected-clip');
    
    if (selectedClips.length === 0) {
        if (deleteBtn) deleteBtn.classList.remove('active');
        return; // Ha nincs mit törölni, kilépünk
    }

    // 2. Végigmegyünk a listán, és mindet eltüntetjük a DOM-ból
    selectedClips.forEach(clip => {
        clip.remove();
    });

    // 3. Haptikus visszajelzés (rezgés) mobilon
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]); 
    
    // Gomb vizuális kikapcsolása egy kis késleltetéssel
    setTimeout(() => {
        if (deleteBtn) deleteBtn.classList.remove('active');
    }, 150);
}

if (deleteBtn) {
    deleteBtn.addEventListener('touchstart', performDelete, {passive: false});
    deleteBtn.addEventListener('click', performDelete);
}

// ==========================================================
// --- GÖRGETÉS ÉS PLAYHEAD (SZINKRONIZÁLT) ---
// ==========================================================
let globalScrollX = 0;
let currentPlayTime = 0; 
const playTimeDisplay = document.querySelector('.play-time-btn');

function secondsPerBar() { return (60 / bpm) * timeSig[0]; }

function drawRuler(totalBars = 200) {

    const loopEl = document.getElementById('loopRegion');
    
    rulerInner.innerHTML = '';
    
    if (loopEl) rulerInner.appendChild(loopEl);
    
    const barSeconds = secondsPerBar();
    const barPx = barSeconds * PX_PER_SECOND;
    
    for (let i = 0; i < totalBars; i++) {
        const bar = document.createElement('div');
        bar.className = 'ruler-bar';
        bar.style.width = barPx + 'px';
        const label = document.createElement('span');
        label.textContent = i + 1; 
        bar.appendChild(label);
        rulerInner.appendChild(bar);
    }
    const totalWidthPx = totalBars * barPx;
    rulerInner.style.width = totalWidthPx + 'px';
    document.querySelectorAll('.timeline').forEach(tl => {
        tl.style.width = totalWidthPx + 'px';
    });
    
    // Frissítjük a vizuális pozícióját is (pl. zoomolás után)
    if (typeof updateLoopVisuals === 'function') updateLoopVisuals();
}

function drawAllGrids() {
    const secondsPerBeat = 60 / bpm;
    const barPx = (secondsPerBeat * timeSig[0]) * PX_PER_SECOND; 
    const gridMultiplier = GRID_MAP[currentGrid] || 0.5;
    const gridPx = (secondsPerBeat * gridMultiplier) * PX_PER_SECOND;

    document.querySelectorAll('.timeline-grid').forEach(el => {
        el.style.backgroundImage = `
            linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
        `;
        el.style.backgroundSize = `${barPx}px 100%, ${gridPx}px 100%`;
    });
}

const zoomSlider = document.getElementById('zoomSlider');
zoomSlider.addEventListener('input', (e) => {
    zoom = parseFloat(e.target.value);
    document.getElementById('zoomValueDisplay').textContent = zoom.toFixed(1) + 'x';
    PX_PER_SECOND = 100 * zoom; 

    drawRuler();
    drawAllGrids();

    document.querySelectorAll('.audio-clip').forEach(clip => {
        const start = parseFloat(clip.dataset.start);
        const duration = parseFloat(clip.dataset.duration);
        const trimOffset = parseFloat(clip.dataset.trimOffset || 0);

        clip.style.left = `${start * PX_PER_SECOND}px`;
        clip.style.width = `${duration * PX_PER_SECOND}px`;

        const canvas = clip.querySelector('canvas');
        if (canvas && clip.audioBuffer) {
            const fullWidth = clip.audioBuffer.duration * PX_PER_SECOND;
            canvas.style.width = `${fullWidth}px`;
            canvas.style.left = `-${trimOffset * PX_PER_SECOND}px`;
        }
    });
    updatePlayheadVisuals();
});

zoomSlider.addEventListener('change', (e) => {
    document.querySelectorAll('.audio-clip').forEach(clip => {
        const canvas = clip.querySelector('canvas');
        if (canvas && clip.audioBuffer) {
            const fullWidth = clip.audioBuffer.duration * PX_PER_SECOND;
            canvas.width = Math.min(Math.max(1, fullWidth), 16384); 
            
            // --- INNENTŐL JÖN AZ ÚJ SZÍNEZŐ LOGIKA ---
            let waveColor = '#00ffd5'; // Alap zöld
            const parentTrack = clip.closest('.track-container');
            
            if (parentTrack) {
                if (parentTrack.classList.contains('drum')) waveColor = '#3fa9f5';
                else if (parentTrack.classList.contains('bass')) waveColor = '#ffd93d';
                else if (parentTrack.classList.contains('synth')) waveColor = '#b084f7';
                else if (parentTrack.classList.contains('vocal')) waveColor = '#ff7ac8';
                else if (parentTrack.classList.contains('sample')) waveColor = '#ff8c00';
            }

            // Most már átadjuk a helyes színt az újrarajzolásnál is!
            drawWaveform(canvas, clip.audioBuffer, waveColor); 
        }
    });
});

function setScroll(x) {
    if (x < 0) x = 0;
    const timelineEl = document.querySelector('.timeline');
    let maxScroll = 10000;
    if (timelineEl && rulerInner.parentElement) {
        maxScroll = timelineEl.clientWidth - rulerInner.parentElement.clientWidth + 100;
    }
    if (x > maxScroll) x = maxScroll;
    globalScrollX = x;

    if(rulerInner.parentElement) {
        rulerInner.parentElement.scrollLeft = globalScrollX;
    }
    document.querySelectorAll('.track-area').forEach(area => {
        area.scrollLeft = globalScrollX;
    });
    updatePlayheadVisuals();
}

function updatePlayheadVisuals() {
    const leftPx = 164 + (currentPlayTime * PX_PER_SECOND) - globalScrollX;
    playhead.style.left = `${leftPx}px`;

    if (leftPx < 164) {
        playhead.style.opacity = '0'; 
    } else {
        playhead.style.opacity = '1';
    }

    const mins = Math.floor(currentPlayTime / 60).toString().padStart(2, '0');
    const secs = Math.floor(currentPlayTime % 60).toString().padStart(2, '0');
    const ms = Math.floor((currentPlayTime % 1) * 1000).toString().padStart(3, '0');
    playTimeDisplay.textContent = `${mins}:${secs}.${ms}`;
}

ruler.addEventListener('pointerdown', (e) => {
    const rect = rulerInner.getBoundingClientRect();
    let x = e.clientX - rect.left; 
    if (x < 0) x = 0;
    
    const snapPx = getSnapPx();
    if (snapPx > 0) {
        x = Math.round(x / snapPx) * snapPx;
    }

    currentPlayTime = x / PX_PER_SECOND;
    startOffset = currentPlayTime; 
    updatePlayheadVisuals();
    
    ruler.setPointerCapture(e.pointerId);
    ruler.onpointermove = (ev) => {
        let mx = ev.clientX - rect.left;
        if (mx < 0) mx = 0;
        if (snapPx > 0) {
            mx = Math.round(mx / snapPx) * snapPx;
        }
        currentPlayTime = mx / PX_PER_SECOND;
        startOffset = currentPlayTime;
        updatePlayheadVisuals();
    };
    ruler.onpointerup = () => {
        ruler.onpointermove = null;
        ruler.onpointerup = null;
    };
});

// ==========================================================
// --- LOOP LOKÁTOR (CUBASE STÍLUS) ---
// ==========================================================
let loopStartSec = 0;
let loopEndSec = 4; // Alapból 4 másodpercnyi (vagy ütemnyi) loop
const loopRegion = document.getElementById('loopRegion');
const loopBtn = document.querySelector('.loop-btn');

let isDraggingLocator = false;
let locatorSide = null;

// Gombnyomásra megjelenik/eltűnik
loopBtn.addEventListener('click', () => {
    const isActive = loopBtn.classList.contains('active');
    loopRegion.style.display = isActive ? 'block' : 'none';
    if (isActive) updateLoopVisuals();
});

function updateLoopVisuals() {
    const leftPx = loopStartSec * PX_PER_SECOND;
    const widthPx = (loopEndSec - loopStartSec) * PX_PER_SECOND;
    loopRegion.style.left = `${leftPx}px`;
    loopRegion.style.width = `${Math.max(10, widthPx)}px`; // Minimum 10px széles
}

// Csatlakoztatjuk a lokátor füleket a mozgatáshoz
document.querySelectorAll('.loop-handle').forEach(handle => {
    const initLocatorDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDraggingLocator = true;
        locatorSide = handle.dataset.side;
        document.body.style.cursor = 'ew-resize';
    };
    handle.addEventListener('mousedown', initLocatorDrag);
    handle.addEventListener('touchstart', initLocatorDrag, {passive: false});
});

// Ez a függvény számolja ki az új helyet húzás közben
function handleLocatorMove(clientX) {
    if (!isDraggingLocator) return;
    
    const rect = rulerInner.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;

    // Rácshoz (gridhez) igazodás a lokátoroknál is!
    const snapPx = getSnapPx();
    if (snapPx > 0) {
        x = Math.round(x / snapPx) * snapPx;
    }

    const sec = x / PX_PER_SECOND;

    if (locatorSide === 'left') {
        if (sec < loopEndSec - 0.1) loopStartSec = sec; // Ne lehessen a jobb oldali alá tolni
    } else {
        if (sec > loopStartSec + 0.1) loopEndSec = sec; // Ne lehessen a bal oldali alá tolni
    }
    updateLoopVisuals();
}

// ==========================================================
// --- KLIP KIJELÖLÉS, GÖRGETÉS ÉS MOZGATÁS ---
// ==========================================================
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartScroll = 0;
let isPanDirectionLocked = false;
let panDirection = null;

let isDraggingClip = false;
let draggedClip = null;
let clipStartLeft = 0;
let clipMouseStartX = 0;
let selectedClip = null;
let targetTrackForClip = null;
let hasDraggedClip = false;

// --- 1. KLIP KIJELÖLÉSE ÉS DRAG INDÍTÁSA ---
function handleClipInteraction(clientX, target, e) {
    if (target.closest('.control-panel') || target.closest('.track-actions') || target.closest('.timeline-ruler') || target.tagName === 'BUTTON' || target.closest('button')) {
        return false;
    }

    const selectBtn = document.querySelector('.select-btn');
    const isSelectMode = selectBtn && selectBtn.classList.contains('active');
    const clip = target.closest('.audio-clip');

    // Ha az üres sávra kattintunk
    if (!clip) {
        document.querySelectorAll('.audio-clip').forEach(c => c.classList.remove('selected-clip'));
        return false;
    }

    // HA NINCS BEKAPCSOLVA A SELECT ESZKÖZ, NE LEHESSEN KIJELÖLNI SEMMIT!
    if (!isSelectMode) return false;

    const wasSelected = clip.classList.contains('selected-clip');

    // Ha még nem volt kijelölve, azonnal rátesszük, hogy lehessen húzni a többivel együtt
    if (!wasSelected) {
        clip.classList.add('selected-clip');
        clip.dataset.justSelected = 'true'; // Megjegyezzük, hogy most kapta meg
    } else {
        clip.dataset.justSelected = 'false'; // Már ki volt jelölve
    }

    // Felkészülünk a húzásra
    isDraggingClip = true;
    draggedClip = clip;
    clipMouseStartX = clientX;
    hasDraggedClip = false; // Még nem mozdítottuk el az egeret/ujjat!

    // Elmentjük minden kijelölt klip kiinduló pozícióját
    document.querySelectorAll('.selected-clip').forEach(c => {
        c.dataset.startLeft = parseFloat(c.style.left) || 0;
    });

    return true;
}

function getSnapPx() {
    const snapBtn = document.querySelector('.snap-btn');
    if (!snapBtn || !snapBtn.classList.contains('active')) return 0;
    const secondsPerBeat = 60 / bpm;
    const gridMultiplier = GRID_MAP[currentGrid] || 0.5;
    const gridSeconds = secondsPerBeat * gridMultiplier;
    return gridSeconds * PX_PER_SECOND;
}

// --- 2. KLIPEK MOZGATÁSA ÉS CÉL-SÁV KIEMELÉSE ---
function handleClipDragMove(clientX, clientY) {
    if (!isDraggingClip || !draggedClip) return;
    
    const walk = clientX - clipMouseStartX;
    
    // Ha legalább 2 pixelt elmozdítottuk az egeret, az már húzás (nem sima kattintás)
    if (Math.abs(walk) > 2) {
        hasDraggedClip = true;
    }

    // MINDEN kijelölt klipet mozgatunk
    document.querySelectorAll('.selected-clip').forEach(clip => {
        let newLeft = parseFloat(clip.dataset.startLeft) + walk;
        if (newLeft < 0) newLeft = 0;

        const snapPx = getSnapPx();
        if (snapPx > 0) {
            newLeft = Math.round(newLeft / snapPx) * snapPx;
        }

        clip.style.left = newLeft + 'px';
        clip.dataset.start = newLeft / PX_PER_SECOND; 
    });

    if (clientY === undefined) return;
    const originalPointerEvents = draggedClip.style.pointerEvents;
    draggedClip.style.pointerEvents = 'none';
    const elemBelow = document.elementFromPoint(clientX, clientY);
    draggedClip.style.pointerEvents = originalPointerEvents;

    document.querySelectorAll('.track-container').forEach(t => t.classList.remove('drag-over-target'));
    targetTrackForClip = null;

    if (elemBelow) {
        const hoverTrack = elemBelow.closest('.track-container');
        const currentTrack = draggedClip.closest('.track-container');

        if (hoverTrack && hoverTrack !== currentTrack) {
            targetTrackForClip = hoverTrack;
            hoverTrack.classList.add('drag-over-target');
        }
    }
}

// --- 4. A KLIP ELENGEDÉSE (DROP) ---
function handleClipDragEnd() {
    if (!isDraggingClip || !draggedClip) return;

    // Ha volt cél-sáv, az ÖSSZES kijelölt klipet átdobjuk oda
    if (targetTrackForClip) {
        const newClipsContainer = targetTrackForClip.querySelector('.clips');
        if (newClipsContainer) {
            document.querySelectorAll('.selected-clip').forEach(clip => {
                newClipsContainer.appendChild(clip);
                updateClipColor(clip, targetTrackForClip); 
            });
        }
    }
    
    // Töröljük a sáv vizuális kiemelését
    document.querySelectorAll('.track-container').forEach(t => t.classList.remove('drag-over-target'));

    // --- A JAVÍTOTT TOGGLE LOGIKA ---
    // Ha NEM mozdítottuk el az egeret (tehát csak egy sima kattintás volt)
    // ÉS már előtte is ki volt jelölve, akkor most VESSZÜK LE a kijelölést!
    if (!hasDraggedClip && draggedClip.dataset.justSelected === 'false') {
        draggedClip.classList.remove('selected-clip');
    }

    // Takarítás
    isDraggingClip = false;
    draggedClip = null;
    targetTrackForClip = null;
}

// --- 3. KLIP ÁTSZÍNEZÉSE ---
function updateClipColor(clip, track) {
    let waveColor = '#00ffd5'; 
    if (track.classList.contains('drum')) waveColor = '#3fa9f5';
    else if (track.classList.contains('bass')) waveColor = '#ffd93d';
    else if (track.classList.contains('synth')) waveColor = '#b084f7';
    else if (track.classList.contains('vocal')) waveColor = '#ff7ac8';
    else if (track.classList.contains('sample')) waveColor = '#ff8c00';

    const canvas = clip.querySelector('canvas');
    if (canvas && clip.audioBuffer) {
        drawWaveform(canvas, clip.audioBuffer, waveColor);
    }
}

// --- 5. BERAGADÁS ELLENI VÉDELEM (RESET) ---
function resetAllInteractions() {
    isResizing = false;
    resizeTarget = null;
    
    // Klip dobásának befejezése, ha épp fogtuk
    if (isDraggingClip) handleClipDragEnd();
    
    isPanning = false;
    isPanDirectionLocked = false;
    panDirection = null;

    if (isDraggingLocator) {
        isDraggingLocator = false;
        locatorSide = null;
    }

    document.body.style.cursor = '';
}

// --- 6. PC (EGÉR) ESEMÉNYEK ---
document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.track-inspector') || isResizing) return;

    if (handleClipInteraction(e.clientX, e.target, e)) return;

    const selectBtn = document.querySelector('.select-btn');
    const isSelectMode = selectBtn && selectBtn.classList.contains('active');
    const clickedClip = e.target.closest('.audio-clip');
    
    if (clickedClip && !e.target.classList.contains('resize-handle')) {
        if (isSelectMode) {
            e.preventDefault(); 
            document.querySelectorAll('.audio-clip').forEach(c => c.classList.remove('selected-clip'));
            clickedClip.classList.add('selected-clip');
            
            isDraggingClip = true;
            draggedClip = clickedClip;
            selectedClip = clickedClip; 
            clipMouseStartX = e.clientX;
            clipStartLeft = parseFloat(clickedClip.style.left) || 0;
            return; 
        } 
    }

    if (e.target.closest('.track-area') || e.target.closest('.timeline-ruler')) {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        isPanning = true;
        panStartX = e.clientX;
        panStartScroll = globalScrollX;
        document.body.style.cursor = 'grabbing';
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingLocator) { e.preventDefault(); handleLocatorMove(e.touches ? e.touches[0].clientX : e.clientX); return; }
    if (isResizing) { handleResizeMove(e.clientX); return; }
    // ITT VAN A JAVÍTÁS: Átadjuk mindkét koordinátát!
    if (isDraggingClip) { e.preventDefault(); handleClipDragMove(e.clientX, e.clientY); return; }
    if (isPanning) { e.preventDefault(); const walk = panStartX - e.clientX; setScroll(panStartScroll + walk); }
});

document.addEventListener('mouseup', resetAllInteractions);

// --- 7. MOBIL (ÉRINTÉS) ESEMÉNYEK ---
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return; 
    if (handleClipInteraction(e.touches[0].clientX, e.target, e)) return;

    if (e.target.closest('.track-area') || e.target.closest('.timeline-ruler')) {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        isPanning = true;
        panStartX = e.touches[0].clientX;
        panStartY = e.touches[0].clientY; 
        panStartScroll = globalScrollX;
        isPanDirectionLocked = false;
        panDirection = null;
    }
}, {passive: false});

document.addEventListener('touchmove', (e) => {
    if (isDraggingLocator) { e.preventDefault(); handleLocatorMove(e.touches ? e.touches[0].clientX : e.clientX); return; }
    if (isResizing) { e.preventDefault(); handleResizeMove(e.touches[0].clientX); return; }
    // ITT IS JAVÍTVA: Mindkét koordinátát átadjuk!
    if (isDraggingClip) { e.preventDefault(); handleClipDragMove(e.touches[0].clientX, e.touches[0].clientY); return; }
    
    if (isPanning) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = Math.abs(currentX - panStartX);
        const diffY = Math.abs(currentY - panStartY);

        if (!isPanDirectionLocked && (diffX > 5 || diffY > 5)) {
            isPanDirectionLocked = true;
            panDirection = diffX > diffY ? 'horizontal' : 'vertical';
        }

        if (isPanDirectionLocked) {
            if (panDirection === 'horizontal') {
                e.preventDefault(); 
                const walk = panStartX - currentX; 
                setScroll(panStartScroll + walk);
            } else {
                isPanning = false; 
            }
        }
    }
}, {passive: false});

document.addEventListener('touchend', resetAllInteractions);
document.addEventListener('touchcancel', resetAllInteractions);

document.addEventListener('wheel', (e) => {
    if (e.target.closest('.track-area') || e.target.closest('.timeline-ruler')) {
        if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
            e.preventDefault();
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            setScroll(globalScrollX + delta);
        }
    }
}, {passive: false});


// ==========================================================
// --- LEJÁTSZÁS, REC ÉS EXPORT ---
// ==========================================================
let isPlaying = false;
let startPlayTime = 0;     
let startOffset = 0;        
let animationFrameId;       
let audioSources = [];      
let activeRecorders = []; 

const importBtn = document.querySelector('.project-btn:nth-child(6)'); 
const fileInput = document.getElementById('audioImportInput');
const playBtn = document.querySelector('.play-btn');

importBtn.onclick = () => {
    if (document.querySelectorAll('.track-container').length === 0) {
        alert("Előbb hozz létre egy Track-et!");
        return;
    }
    const selectedTrack = document.querySelector('.track-container.selected');
    if (!selectedTrack) {
        alert("Kérlek, jelölj ki egy sávot először! (Kattints a bal oldali paneljére)");
        return;
    }
    fileInput.click();
};

fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importBtn.textContent = "Loading...";
    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        importBtn.textContent = "Import";

        const targetTrack = document.querySelector('.track-container.selected');
        if (!targetTrack) return; 
        const clipsContainer = targetTrack.querySelector('.clips');
        
        addClipToTrack(clipsContainer, audioBuffer, file.name, currentPlayTime);
    } catch (err) {
        console.error(err);
        alert("Hiba a fájl betöltésekor: " + err.message);
        importBtn.textContent = "Import";
    }
    fileInput.value = '';
};

// ==========================================================
// --- EXPORT (REAL-TIME LOSSLESS WAV BOUNCE) ---
// ==========================================================
const exportBtn = Array.from(document.querySelectorAll('.project-btn')).find(b => b.textContent === 'Export');

if (exportBtn) {
    let isExporting = false;
    let leftChannel = [];
    let rightChannel = [];
    let recordingLength = 0;
    
    // Létrehozunk egy ScriptProcessor-t a nyers PCM adatok rögzítésére
    const bufferSize = 4096;
    const recorderNode = audioCtx.createScriptProcessor(bufferSize, 2, 2);
    
    recorderNode.onaudioprocess = (e) => {
        if (!isExporting) return;
        // Klónozzuk a puffereket, különben a memóriában felülíródnak
        leftChannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        rightChannel.push(new Float32Array(e.inputBuffer.getChannelData(1)));
        recordingLength += bufferSize;
    };

    // Bekötjük a Master csatorna végére, és tovább a hangszórókra (ez kell a működéséhez)
    masterAnalyser.connect(recorderNode);
    recorderNode.connect(audioCtx.destination);

    exportBtn.addEventListener('click', () => {
        if (isPlaying) {
            alert("Kérlek, állítsd le a lejátszást az exportálás előtt!");
            return;
        }

        const loopBtn = document.querySelector('.loop-btn');
        const isLooping = loopBtn && loopBtn.classList.contains('active');

        let exportStartSec = 0;
        let exportEndSec = 0;

        if (isLooping) {
            exportStartSec = loopStartSec;
            exportEndSec = loopEndSec;
            loopBtn.classList.remove('active'); 
        } else {
            let maxTimeSec = 0;
            document.querySelectorAll('.audio-clip').forEach(clip => {
                const end = parseFloat(clip.dataset.start) + parseFloat(clip.dataset.duration);
                if (end > maxTimeSec) maxTimeSec = end;
            });

            if (maxTimeSec === 0) {
                alert("Nincs mit exportálni! (Üres a projekt)");
                return;
            }
            exportEndSec = maxTimeSec + 2; 
        }

        const exportDuration = exportEndSec - exportStartSec;

        // Reseteljük a memóriát az új felvételhez
        leftChannel = [];
        rightChannel = [];
        recordingLength = 0;

        // UI frissítése
        exportBtn.textContent = 'Bouncing...';
        exportBtn.style.color = '#00ffd5'; 
        exportBtn.style.pointerEvents = 'none';

        currentPlayTime = exportStartSec;
        startOffset = exportStartSec;
        updatePlayheadVisuals(); 

        // INDÍTÁS
        isExporting = true;
        const playBtn = document.querySelector('.play-btn');
        if (!isPlaying) playBtn.click();

        // LEÁLLÍTÁS pontosan az idő leteltekor
        setTimeout(() => {
            if (isPlaying) playBtn.click(); 
            isExporting = false;
            
            exportBtn.textContent = 'Saving WAV...';
            exportBtn.style.color = '#ffd93d'; // Sárga szín, amíg kódol

            // Kódolás megkezdése (kis késleltetéssel, hogy a UI frissülhessen)
            setTimeout(() => {
                const wavBlob = exportToWav(leftChannel, rightChannel, recordingLength, audioCtx.sampleRate);
                const url = URL.createObjectURL(wavBlob);
                
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = isLooping ? 'demoMaker_Loop.wav' : 'demoMaker_Track.wav';
                document.body.appendChild(a);
                a.click();
                
                URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // UI visszaállítása
                exportBtn.textContent = 'Export';
                exportBtn.style.color = '';
                exportBtn.style.pointerEvents = 'auto';
                if (isLooping) loopBtn.classList.add('active');
            }, 100);

        }, exportDuration * 1000);
    });
}

// --- SAJÁT VESZTESÉGMENTES WAV KÓDOLÓ ---
function exportToWav(left, right, len, sampleRate) {
    const numChannels = 2;
    const bitDepth = 16;
    const result = new Float32Array(len * numChannels);
    
    // Csatornák összefűzése (Bal-Jobb-Bal-Jobb)
    let offset = 0;
    for (let i = 0; i < left.length; i++) {
        const l = left[i];
        const r = right[i];
        for (let j = 0; j < l.length; j++) {
            result[offset++] = l[j];
            result[offset++] = r[j];
        }
    }

    const byteRate = sampleRate * numChannels * (bitDepth / 8);
    const blockAlign = numChannels * (bitDepth / 8);
    const dataSize = result.length * (bitDepth / 8);
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    function writeString(v, off, str) {
        for (let i = 0; i < str.length; i++) v.setUint8(off + i, str.charCodeAt(i));
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // 1 = PCM kódolás
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Szöveges (Float32) adatok 16-bites formátumba konvertálása
    let dataOffset = 44;
    for (let i = 0; i < result.length; i++) {
        let sample = Math.max(-1, Math.min(1, result[i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(dataOffset, sample, true);
        dataOffset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
}

function addClipToTrack(container, buffer, name, startTime = null, trimOffset = 0, duration = null) {
    const clip = document.createElement('div');
    clip.className = 'audio-clip';
    
    // Megkeressük a sávot, amibe épp tesszük a klipet
    const parentTrack = container.closest('.track-container');
    let waveColor = '#00ffd5'; // Alapértelmezett (Guitar/Default)

    if (parentTrack) {
        if (parentTrack.classList.contains('drum')) waveColor = '#3fa9f5';
        else if (parentTrack.classList.contains('bass')) waveColor = '#ffd93d';
        else if (parentTrack.classList.contains('synth')) waveColor = '#b084f7';
        else if (parentTrack.classList.contains('vocal')) waveColor = '#ff7ac8';
        else if (parentTrack.classList.contains('sample')) waveColor = '#ff8c00';
    }

    // Ha nincs megadva start, akkor a playhead; ha van, akkor az (pl. cut esetén)
    const startPos = startTime !== null ? startTime : currentPlayTime;
    const clipDuration = duration !== null ? duration : buffer.duration;
    const width = clipDuration * PX_PER_SECOND;
    
    clip.style.width = `${width}px`;
    clip.style.left = `${startPos * PX_PER_SECOND}px`;
    
    // Adatok tárolása
    clip.dataset.start = startPos;         // Mikor kezdődik a timeline-on
    clip.dataset.trimOffset = trimOffset;  // Mennyit vágtunk le az elejéből
    clip.dataset.duration = clipDuration;  // Milyen hosszú a klip
    clip.audioBuffer = buffer;             // Maga az audio adat
    
    // 1. Név címke
    const label = document.createElement('div');
    label.className = 'clip-name';
    label.textContent = name;
    clip.appendChild(label);

    // 2. Waveform Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'clip-waveform';
    
    // A canvas szélessége mindig a TELJES eredeti fájl hossza
    const fullWidth = buffer.duration * PX_PER_SECOND;
    
    canvas.width = Math.min(fullWidth, 16384);       
    canvas.style.width = `${fullWidth}px`; 
    canvas.style.left = `-${trimOffset * PX_PER_SECOND}px`;
    
    clip.appendChild(canvas);
    
    // Kirajzoljuk a teljes buffert
    setTimeout(() => drawWaveform(canvas, buffer, waveColor), 0);

    // 3. Resize fülek (Trimeléshez)
    const leftHandle = document.createElement('div');
    leftHandle.className = 'resize-handle left';
    leftHandle.onmousedown = (e) => initResize(e, leftHandle, clip);
    leftHandle.ontouchstart = (e) => initResize(e, leftHandle, clip);
    
    const rightHandle = document.createElement('div');
    rightHandle.className = 'resize-handle right';
    rightHandle.onmousedown = (e) => initResize(e, rightHandle, clip);
    rightHandle.ontouchstart = (e) => initResize(e, rightHandle, clip);
    
    clip.appendChild(leftHandle);
    clip.appendChild(rightHandle);

    container.appendChild(clip);

    return clip;
}

function addPatternClipToTrack(container, name, startTime, lengthInBars = 1) {
    const clip = document.createElement('div');
    clip.className = 'audio-clip pattern-clip'; 

    const parentTrack = container.closest('.track-container');
    let clipColor = '#3fa9f5'; // Alapértelmezett (Drum Kék)
    if (parentTrack && parentTrack.classList.contains('synth')) clipColor = '#b084f7';

    // Kiszámoljuk, milyen hosszú a klip pixelben (ütemek alapján)
    const secondsPerBeat = 60 / bpm;
    const duration = lengthInBars * timeSig[0] * secondsPerBeat;
    const width = duration * PX_PER_SECOND;

    clip.style.width = `${width}px`;
    clip.style.left = `${startTime * PX_PER_SECOND}px`;
    
    // Adatok tárolása (Ez az "AGYA" a klipnek)
    clip.dataset.type = 'pattern';         // JELZÜK A RENDSZERNEK, HOGY EZ NEM AUDIÓ!
    clip.dataset.start = startTime;        
    clip.dataset.duration = duration;  
    clip.dataset.trimOffset = 0;           
    
    // Itt tároljuk a kottát (Note adatok)! Később az Editor ide fog írni.
    clip.patternData = {
        lengthInBars: lengthInBars,
        notes: [] 
    };

    // 1. Név címke
    const label = document.createElement('div');
    label.className = 'clip-name';
    label.textContent = name;
    clip.appendChild(label);

    // 2. Waveform Canvas (Rajzvászon)
    const canvas = document.createElement('canvas');
    canvas.className = 'clip-waveform';
    canvas.width = Math.min(width, 16384);       
    canvas.style.width = `${width}px`; 
    clip.appendChild(canvas);

    // 3. Resize fülek (Később hasznos lesz a loopoláshoz)
    const leftHandle = document.createElement('div');
    leftHandle.className = 'resize-handle left';
    leftHandle.onmousedown = (e) => initResize(e, leftHandle, clip);
    
    const rightHandle = document.createElement('div');
    rightHandle.className = 'resize-handle right';
    rightHandle.onmousedown = (e) => initResize(e, rightHandle, clip);
    
    clip.appendChild(leftHandle);
    clip.appendChild(rightHandle);

    container.appendChild(clip);

    return clip;
}

async function startRecording(startTimeOffset) {
    activeRecorders = [];
    const allTracks = document.querySelectorAll('.track-container');
    const armedTracks = Array.from(allTracks).filter(track => {
        const recBtn = track.querySelector('.daw-btn.record');
        return recBtn && recBtn.classList.contains('active');
    });

    if (armedTracks.length === 0) return;

    for (let track of armedTracks) {
        const selectedInputBtn = track.querySelector('.audio-source-picker button.selected');
        const inputId = selectedInputBtn ? selectedInputBtn.dataset.deviceId : 'default';

        // Ha Virtual sáv (pl. MIDI lesz később), arra nem veszünk fel audio-t
        if (inputId === 'virtual') continue; 

        try {
            const audioConstraints = (inputId !== 'default') 
                ? { deviceId: { exact: inputId } } 
                : true;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
            const mediaRecorder = new MediaRecorder(stream);
            let audioChunks = [];

            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                try {
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType }); 
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                    const clipsContainer = track.querySelector('.clips');
                    const clipName = "Rec_" + Math.floor(Math.random() * 1000);
                    addClipToTrack(clipsContainer, audioBuffer, clipName, startTimeOffset);
                } catch(decodeErr) {
                    console.error("Hiba az audio feldolgozásakor:", decodeErr);
                } finally {
                    stream.getTracks().forEach(t => t.stop());
                }
            };

            mediaRecorder.start();
            activeRecorders.push(mediaRecorder);

        } catch (err) {
            track.querySelector('.daw-btn.record').classList.remove('active');
        }
    }
}

function stopRecording() {
    activeRecorders.forEach(recorder => {
        if (recorder.state === 'recording') recorder.stop();
    });
    activeRecorders = [];
}

// --- UGRÁS A KEZDETRE / LOOP ELEJÉRE (RETURN TO ZERO) ---
const rewindBtn = document.querySelector('.rewind-btn');

rewindBtn.addEventListener('click', () => {
    // 1. Eldöntjük, hova ugrunk (ha megy a loop, akkor annak az elejére, amúgy 0-ra)
    const loopBtn = document.querySelector('.loop-btn');
    const isLooping = loopBtn && loopBtn.classList.contains('active');
    const targetTime = isLooping ? loopStartSec : 0;

    // 2. Beállítjuk a belső órákat
    currentPlayTime = targetTime;
    startOffset = targetTime;

    // 3. Ha épp fut a lejátszás, zökkenőmentesen újraindítjuk onnan
    if (isPlaying) {
        // Megállítjuk a már ütemezett, jövőbeli hangokat
        audioSources.forEach(src => { try { src.stop(); } catch(e) {} });
        audioSources = [];
        clearTimeout(timerID);

        // Frissítjük a Web Audio referenciaszintjét
        startPlayTime = audioCtx.currentTime;

        // Metronóm újraütemezése
        const secondsPerBeat = 60.0 / bpm;
        const beatsPassed = Math.round((startOffset / secondsPerBeat) * 10000) / 10000;
        const nextBeatIndex = Math.ceil(beatsPassed);
        currentQuarterNote = nextBeatIndex % timeSig[0];
        const nextBeatDelay = (nextBeatIndex - beatsPassed) * secondsPerBeat;
        nextNoteTime = audioCtx.currentTime + nextBeatDelay;
        scheduler();

        // Klipek hangjának újraindítása az új pozícióból
        scheduleClips(startOffset);
    }

    // 4. A nézetet (scrollt) is odahúzzuk, hogy lássuk a piros vonalat
    // Pici (50px) ráhagyást adunk, hogy ne pont a bal szélre tapadjon, kivéve ha 0-n van
    let scrollTarget = (targetTime * PX_PER_SECOND) - 50;
    setScroll(Math.max(0, scrollTarget));
    
    // Grafika frissítése
    updatePlayheadVisuals();
    
    // Gomb vizuális felvillanása
    rewindBtn.classList.add('active');
    setTimeout(() => rewindBtn.classList.remove('active'), 150);
});

const ICON_PLAY = `<svg width="16" height="16" viewBox="0 0 16 16"><polygon points="3,2 13,8 3,14" fill="currentColor"/></svg>`;
const ICON_PAUSE = `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="4" height="12" fill="currentColor"/><rect x="9" y="2" width="4" height="12" fill="currentColor"/></svg>`;

playBtn.onclick = (e) => {
    playBtn.classList.toggle('active');
    if (isPlaying) {
        stopPlayback();
        playBtn.innerHTML = ICON_PLAY;
    } else {
        startPlayback();
        playBtn.innerHTML = ICON_PAUSE;
    }
};

let lookahead = 25.0; 
let scheduleAheadTime = 0.1; 
let nextNoteTime = 0.0; 
let currentQuarterNote = 0; 
let timerID; 

function playClickSound(time, beatNumber) {
    const clickBtn = document.querySelector('.click-btn');
    if (!clickBtn || !clickBtn.classList.contains('active')) return; 

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(masterGain); 

    if (beatNumber === 0) {
        osc.frequency.value = 1000;
    } else {
        osc.frequency.value = 800;
    }

    const startTime = Math.max(time, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(1, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    osc.start(startTime);
    osc.stop(startTime + 0.05);

    const timeUntilClick = (startTime - audioCtx.currentTime) * 1000;
    if (beatNumber === 0) {
        setTimeout(() => {
            clickBtn.classList.add('pulse-beat'); 
            setTimeout(() => clickBtn.classList.remove('pulse-beat'), 100);
        }, Math.max(0, timeUntilClick));
    }
}

function nextNote() {
    const secondsPerBeat = 60.0 / bpm;
    nextNoteTime += secondsPerBeat;
    currentQuarterNote++;
    if (currentQuarterNote === timeSig[0]) currentQuarterNote = 0;
}

function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        playClickSound(nextNoteTime, currentQuarterNote);
        nextNoteTime += 60.0 / bpm; 
        currentQuarterNote++; 
        if (currentQuarterNote === timeSig[0]) currentQuarterNote = 0;
    }
    timerID = setTimeout(scheduler, lookahead);
}

// Ezt a függvényt mostantól többször is meg tudjuk hívni (induláskor és loopoláskor is)
function scheduleClips(offsetTime) {
    const allClips = document.querySelectorAll('.audio-clip');
    
    allClips.forEach(clipDiv => {
        const clipStartTimeline = parseFloat(clipDiv.dataset.start); 
        const clipDuration = parseFloat(clipDiv.dataset.duration);
        const trimOffset = parseFloat(clipDiv.dataset.trimOffset || 0); 
        const clipEndTimeline = clipStartTimeline + clipDuration;

        if (offsetTime < clipEndTimeline) {
            const parentTrack = clipDiv.closest('.track-container');
            // Célkimenet: A sáv pannerje, vagy a Master
            const trackOutput = (parentTrack && parentTrack.trackPannerNode) ? parentTrack.trackPannerNode : masterGain;

            // --- 1. AUDIO KLIP LEJÁTSZÁSA ---
            if (clipDiv.dataset.type !== 'pattern') {
                const buffer = clipDiv.audioBuffer;
                if (!buffer) return;
                
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(trackOutput);
                
                let whenToStart = 0; 
                let offsetInFile = 0; 

                if (offsetTime > clipStartTimeline) {
                    whenToStart = 0; 
                    offsetInFile = (offsetTime - clipStartTimeline) + trimOffset;
                } else {
                    whenToStart = clipStartTimeline - offsetTime;
                    offsetInFile = trimOffset;
                }

                let playDuration = clipDuration;
                if (offsetTime > clipStartTimeline) {
                    playDuration = clipEndTimeline - offsetTime;
                }

                source.start(audioCtx.currentTime + whenToStart, offsetInFile, playDuration);
                audioSources.push(source);
            } 
            // --- 2. PATTERN (MIDI) KLIP LEJÁTSZÁSA ---
            else {
                if (!window.analogDrums) window.analogDrums = new AnalogDrumMachine(audioCtx);

                if (clipDiv.patternData && clipDiv.patternData.notes) {
                    clipDiv.patternData.notes.forEach(note => {
                        const noteAbsoluteTime = clipStartTimeline + note.start - trimOffset;
                        
                        if (noteAbsoluteTime >= offsetTime && noteAbsoluteTime < clipEndTimeline) {
                            const whenToStart = noteAbsoluteTime - offsetTime;
                            
                            // Itt adjuk át a 'trackOutput'-ot paraméterként! 
                            // Ez a sáv Panner-e, amiből továbbmegy az FX-be, Mute/Solo-ba és Gain-be.
                            window.analogDrums.playNote(note.note, audioCtx.currentTime + whenToStart, note.velocity, trackOutput);
                        }
                    });
                }
            }
        }
    });
}

function startPlayback() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    isPlaying = true;
    startPlayTime = audioCtx.currentTime;
    startOffset = currentPlayTime; 

    const secondsPerBeat = 60.0 / bpm;
    const beatsPassed = Math.round((startOffset / secondsPerBeat) * 10000) / 10000;
    const nextBeatIndex = Math.ceil(beatsPassed);
    currentQuarterNote = nextBeatIndex % timeSig[0];
    const nextBeatDelay = (nextBeatIndex - beatsPassed) * secondsPerBeat;
    nextNoteTime = audioCtx.currentTime + nextBeatDelay;
    
    scheduler();

    const globalRecActive = document.querySelector('.control-panel .rec-btn').classList.contains('active');
    if (globalRecActive) {
        startRecording(startOffset); 
    }

    // Hangok ürítése és az ÚJ függvényünk meghívása!
    audioSources = []; 
    scheduleClips(startOffset);

    requestAnimationFrame(updatePlayheadAnim);
}

function stopPlayback() {
    isPlaying = false;
    audioSources.forEach(src => {
        try { src.stop(); } catch(e) {}
    });
    audioSources = [];
    cancelAnimationFrame(animationFrameId);
    playBtn.classList.remove('active');
    playBtn.innerHTML = ICON_PLAY;

    stopRecording(); 
    const recBtn = document.querySelector('.control-panel .rec-btn');
    if (recBtn) recBtn.classList.remove('active');

    clearTimeout(timerID); 
}

function updatePlayheadAnim() {
    if (!isPlaying) return;
    const elapsed = audioCtx.currentTime - startPlayTime;
    currentPlayTime = startOffset + elapsed;

    // --- LOOP LOGIKA ITT ---
    const loopBtn = document.querySelector('.loop-btn');
    if (loopBtn && loopBtn.classList.contains('active') && currentPlayTime >= loopEndSec) {
        
        // 1. Megállítjuk a már ütemezett, túlnyúló hangokat
        audioSources.forEach(src => { try { src.stop(); } catch(e) {} });
        audioSources = [];
        clearTimeout(timerID); // Metronóm (click) leállítása egy pillanatra

        // 2. Visszaugrunk a Loop elejére
        currentPlayTime = loopStartSec;
        startOffset = loopStartSec;
        startPlayTime = audioCtx.currentTime; // Az "új" 0. másodperc most van!

        // 3. Metronóm újraütemezése
        const secondsPerBeat = 60.0 / bpm;
        const beatsPassed = Math.round((startOffset / secondsPerBeat) * 10000) / 10000;
        const nextBeatIndex = Math.ceil(beatsPassed);
        currentQuarterNote = nextBeatIndex % timeSig[0];
        const nextBeatDelay = (nextBeatIndex - beatsPassed) * secondsPerBeat;
        nextNoteTime = audioCtx.currentTime + nextBeatDelay;
        scheduler();

        // 4. Klipek újraindítása az új pozícióból!
        scheduleClips(startOffset);
    }
    // --- LOOP LOGIKA VÉGE ---

    const screenX = 164 + (currentPlayTime * PX_PER_SECOND) - globalScrollX;
    const containerWidth = window.innerWidth;
    if (screenX > containerWidth * 0.9) {
        setScroll(globalScrollX + 5); 
    }
    updatePlayheadVisuals();
    animationFrameId = requestAnimationFrame(updatePlayheadAnim);
}

// --- VU METER ANIMÁCIÓS LOOP ---
function updateMeters() {
    const tracks = document.querySelectorAll('.track-container');
    
    tracks.forEach(track => {
        // OUTPUT METER
        if (track.analyserNode) {
           const analyser = track.analyserNode;
           const bufferLength = analyser.frequencyBinCount;
           const dataArray = new Uint8Array(bufferLength);
           analyser.getByteTimeDomainData(dataArray);

           let max = 0;
           for (let i = 0; i < bufferLength; i++) {
               const value = dataArray[i]; 
               const volume = Math.abs(value - 128); 
               if (volume > max) max = volume;
           }

           let percentage = (max / 128) * 100 * 1.2; 
           if (percentage > 100) percentage = 100;

           const meterBg = track.querySelector('.output .vu-meter-bg');
           if (meterBg) {
               const insetAmount = 100 - percentage;
               meterBg.style.clipPath = `inset(0 ${insetAmount}% 0 0)`;
               meterBg.style.webkitClipPath = `inset(0 ${insetAmount}% 0 0)`;
           }
         }
         
         // INPUT METER
         const inMeterBg = track.querySelector('.audio-source .vu-meter-bg');
         if (track.inputAnalyserNode && inMeterBg) {
            const inAnalyser = track.inputAnalyserNode;
            const inBufferLength = inAnalyser.frequencyBinCount;
            const inDataArray = new Uint8Array(inBufferLength);
            inAnalyser.getByteTimeDomainData(inDataArray);

            let inMax = 0;
            for (let i = 0; i < inBufferLength; i++) {
                const vol = Math.abs(inDataArray[i] - 128); 
                if (vol > inMax) inMax = vol;
            }

            let inPercentage = (inMax / 128) * 100 * 1.5; 
            if (inPercentage > 100) inPercentage = 100;

            const inInsetAmount = 100 - inPercentage;
            inMeterBg.style.clipPath = `inset(0 ${inInsetAmount}% 0 0)`;
            inMeterBg.style.webkitClipPath = `inset(0 ${inInsetAmount}% 0 0)`;
         } else if (inMeterBg) {
            inMeterBg.style.clipPath = `inset(0 100% 0 0)`;
            inMeterBg.style.webkitClipPath = `inset(0 100% 0 0)`;
         }
    });
    // --- ÚJ: MASTER METER LOGIKA ---
    const masterBufferLength = masterAnalyser.frequencyBinCount;
    const masterData = new Uint8Array(masterBufferLength);
    masterAnalyser.getByteTimeDomainData(masterData);

    let masterMax = 0;
    for (let i = 0; i < masterBufferLength; i++) {
        const vol = Math.abs(masterData[i] - 128); 
        if (vol > masterMax) masterMax = vol;
    }

    let masterPercent = (masterMax / 128) * 100 * 1.2; 
    
    // Clipping ellenőrzés (ha túllépi a 100%-ot)
    const clipLed = document.querySelector('.clip-led');
    if (masterPercent > 99) {
        masterPercent = 100;
        if (clipLed) clipLed.classList.add('clipping'); // Bekapcsol a piros LED
    }

    const masterMeterBg = document.querySelector('.master-vu');
    if (masterMeterBg) {
        const insetAmount = 100 - masterPercent;
        masterMeterBg.style.clipPath = `inset(0 ${insetAmount}% 0 0)`;
        masterMeterBg.style.webkitClipPath = `inset(0 ${insetAmount}% 0 0)`;
    }

    requestAnimationFrame(updateMeters);
}

// Alapállapot beállítása az induláskor
createTrack('guitar');
updateMeters();
