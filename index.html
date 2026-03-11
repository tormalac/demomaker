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

// --- UNIVERZÁLIS SÁV-SZÍN LEKÉRDEZŐ ---
function getTrackColor(trackContainer) {
    if (!trackContainer) return '#00ffd5'; 
    if (trackContainer.classList.contains('drum')) return '#3fa9f5';   // Kék
    if (trackContainer.classList.contains('bass')) return '#ffd93d';   // Sárga
    if (trackContainer.classList.contains('synth')) return '#b084f7';  // Lila
    if (trackContainer.classList.contains('guitar')) return '#00ffd5'; // Türkiz
    if (trackContainer.classList.contains('vocal')) return '#ff7ac8';  // Rózsaszín
    if (trackContainer.classList.contains('sample')) return '#ff8c00'; // Narancs
    return '#00ffd5';
}

// ==========================================================
// --- AUDIO RENDSZER ---
// ==========================================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
const masterPanner = audioCtx.createStereoPanner();
const masterAnalyser = audioCtx.createAnalyser();
masterAnalyser.fftSize = 256;

window.audioPool = {};

masterGain.connect(masterPanner);
masterPanner.connect(masterAnalyser);
masterAnalyser.connect(audioCtx.destination);
masterGain.gain.value = 0.8; 

let trackCounter = 0;
let audioEnabled = false;
let availableInputs = [];
let availableOutputs = [];

// ==========================================================
// --- GLOBAL SIDECHAIN ENGINE (LA-2A STYLE) ---
// ==========================================================
const sidechainBus = audioCtx.createGain();
const scAnalyzer = audioCtx.createScriptProcessor(1024, 1, 1);
const scDummy = audioCtx.createGain();
scDummy.gain.value = 0; // Egy néma kimenet, hogy a processor fusson, de ne duplázza a dobot

sidechainBus.connect(scAnalyzer);
scAnalyzer.connect(scDummy);
scDummy.connect(audioCtx.destination);

let scCurrentEnv = 0;
// LA-2A optikai viselkedés: 10ms gyors bekapás, 150ms zenei visszaállás
const scAttack = Math.exp(-1 / (audioCtx.sampleRate * 0.010)); 
const scRelease = Math.exp(-1 / (audioCtx.sampleRate * 0.150)); 

scAnalyzer.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    
    let maxEnvInThisBuffer = 0;

    // --- JAVÍTÁS: MINTÁNKÉNTI (PER-SAMPLE) BURKOLÓGÖRBE ---
    // Így már garantáltan nem maradunk le a lábdob milliszekundumos csattanásáról!
    for (let i = 0; i < input.length; i++) {
        const absVal = Math.abs(input[i]);
        
        if (absVal > scCurrentEnv) {
            scCurrentEnv = scAttack * scCurrentEnv + (1 - scAttack) * absVal;
        } else {
            scCurrentEnv = scRelease * scCurrentEnv + (1 - scRelease) * absVal;
        }
        
        // Eltároljuk a legnagyobb értéket ebből a 23ms-os ablakból
        if (scCurrentEnv > maxEnvInThisBuffer) {
            maxEnvInThisBuffer = scCurrentEnv;
        }
    }

    // Digitális zajzár a "szellem" kompresszió ellen
    if (scCurrentEnv < 0.001) {
        scCurrentEnv = 0;
        maxEnvInThisBuffer = 0;
    }

    // Sávok kompresszálása dobon kívül
    document.querySelectorAll('.track-container:not(.drum)').forEach(track => {
        if (track.scGainNode) {
            const scInput = track.querySelector('.trk-sc-slider');
            const amount = scInput ? parseInt(scInput.value) / 100 : 0;
            
            // Ha fel van húzva a slider, és jön egy dobütés
            if (amount > 0 && maxEnvInThisBuffer > 0) {
                
                // Mivel most már pontos a matematika, a maxEnv könnyen felugrik 0.8 - 1.0 köré.
                // Egy 2.0-ás szorzó bőven elég, hogy a padlóig vágja a szintit.
                let reduction = maxEnvInThisBuffer * 2.0 * amount; 
                if (reduction > 0.95) reduction = 0.95; // Max 95%-os némítás
                
                const targetGain = 1.0 - reduction;
                
                // Gyorsabb reagálási időre (0.005) állítjuk a kompresszort
                track.scGainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.005);
            } else {
                // Azonnal engedje fel a szintit, ha vége a dobnak
                track.scGainNode.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.01);
            }
        }
    });
};

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

    // ÚJ LOGIKA: CSAK a dob sáv kapja a 9 soros nézetet, 
    // minden más sáv a zenei (Piano Roll) nézetet kapja!
    const isDrum = clip.closest('.track-container').classList.contains('drum');

    if (!isDrum) {
        // --- PIANO ROLL RAJZOLÁS DINAMIKUS HATÁROKKAL ---
        const trackContainer = clip.closest('.track-container');
        const isBass = trackContainer.classList.contains('bass');
        const isSynth = trackContainer.classList.contains('synth');

        let minNote = 36; // C2 (Alap min)
        let maxNote = 71; // B4 (Alap max)

        if (isBass) {
            minNote = 24; // C1
            maxNote = 59; // B3
        } else if (isSynth) {
            minNote = 36; // C2
            maxNote = 83; // B5
        }

        const numNotes = maxNote - minNote + 1; 
        const rowHeight = height / numNotes;

        if (clip.patternData && clip.patternData.notes) {
            clip.patternData.notes.forEach(noteEvent => {
                const x = noteEvent.start * PX_PER_SECOND;
                const w = Math.max(3, noteEvent.duration * PX_PER_SECOND); 
                
                // Csak akkor rajzoljuk ki a kottára, ha beleesik a látható tartományba
                if (noteEvent.note >= minNote && noteEvent.note <= maxNote) {
                    const row = maxNote - noteEvent.note; 
                    const y = row * rowHeight;
                    
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y + 1, w - 1, rowHeight - 2);
                }
            });
        }
    } else {
        // --- DOBGÉP RAJZOLÁS (Eredeti 9 soros nézet) ---
        const numInst = 9;
        const rowHeight = height / numInst;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=1; i<numInst; i++) {
            ctx.moveTo(0, rowHeight * i);
            ctx.lineTo(width, rowHeight * i);
        }
        ctx.stroke();

        const noteRowMap = { 49:0, 51:1, 48:2, 45:3, 41:4, 46:5, 42:6, 38:7, 36:8 };

        if (clip.patternData && clip.patternData.notes) {
            clip.patternData.notes.forEach(noteEvent => {
                const x = noteEvent.start * PX_PER_SECOND;
                const w = Math.max(3, noteEvent.duration * PX_PER_SECOND); 
                
                const row = noteRowMap[noteEvent.note] !== undefined ? noteRowMap[noteEvent.note] : 8;
                const y = row * rowHeight;
                
                ctx.fillStyle = color;
                ctx.fillRect(x, y + 1, w, rowHeight - 2);
            });
        }
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
        
        // ÚJ: Ha Pattern klip, szabadon nyújtható
        if (resizeTarget.dataset.type === 'pattern') {
            resizeTarget.style.width = `${newWidth}px`;
            resizeTarget.dataset.duration = newWidth / PX_PER_SECOND;
            
            const canvas = resizeTarget.querySelector('canvas');
            if (canvas) {
                // 1. Frissítjük a valós pixel felbontást, hogy ne "gumiként" nyúljon
                canvas.width = Math.min(newWidth, 16384);
                canvas.style.width = `${newWidth}px`;
                
                // 2. Azonnal újrarajzoljuk a kottát a helyes (fix) pozíciókra!
                const trackContainer = resizeTarget.closest('.track-container');
                const waveColor = getTrackColor(trackContainer);
                drawPattern(canvas, resizeTarget, waveColor);
            }
        } else {
            // Hangfájl esetén nem húzható túl a saját hosszán
            const maxDuration = resizeTarget.audioBuffer.duration - resizeStartTrim;
            if (newWidth / PX_PER_SECOND > maxDuration) {
                newWidth = maxDuration * PX_PER_SECOND;
            }
            resizeTarget.style.width = `${newWidth}px`;
            resizeTarget.dataset.duration = newWidth / PX_PER_SECOND;
        }
    
    } else if (resizeSide === 'left') {
        // Bal oldal: Itt minden marad a régiben (ez csak Audio klipnél hívódik meg)
        let newLeft = resizeStartLeft + deltaPx;
        if (snapPx > 0) newLeft = Math.round(newLeft / snapPx) * snapPx;

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
        if (canvas) canvas.style.left = `-${newTrim * PX_PER_SECOND}px`;
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
  "1/4": 1, "1/4T": 1/3, "1/8": 0.5,
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
        <div style="display: flex; align-items: center; gap: 8px;">
            <span class="track-type">${type}</span>
            ${type !== 'drum' ? `<button class="daw-btn sidechain-btn pump-btn" title="Sidechain Pump">PUMP</button>` : ''}
        </div>
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

        ${type !== 'drum' ? `
        <div class="sidechain-popup">
            <div class="sc-header">Sidechain</div>
            <div style="font-size: 8px; color: #888; text-align: center; margin-bottom: 6px; line-height: 1.2; font-family: var(--font-mono); letter-spacing: 0.5px;">
                DRUM-DRIVEN<br>AUDIO DUCKING
            </div>
            <label>Amount
                <input type="range" min="0" max="100" value="0" class="trk-sc-slider horizontal-fader">
                <span class="slider-value" style="color: #00ffd5; text-align: right; display: block; margin-top: 4px;">0%</span>
            </label>
        </div>
        ` : ''}
      </div>
      <div class="track-area">
        <div class="timeline">
         <div class="timeline-grid"></div>
         <div class="clips"></div>
        </div>
      </div>
    `;

    // --- AUDIO GRAPH BEKÖTÉSE ---
    const trackGain = audioCtx.createGain();
    const trackPanner = audioCtx.createStereoPanner();
    const scGain = audioCtx.createGain(); // ÚJ: Sidechain "VCA" Node
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    
    // Jelút: Panner -> Gain -> SC Gain -> Analyser -> Master Gain
    trackPanner.connect(trackGain);
    trackGain.connect(scGain);
    scGain.connect(analyser);
    analyser.connect(masterGain);
    
    track.trackGainNode = trackGain;
    track.trackPannerNode = trackPanner;
    track.scGainNode = scGain; // Eltároljuk, a ScriptProcessor ezt fogja ráncigálni
    track.analyserNode = analyser;
    trackGain.gain.value = 0.8;

    // --- ÚJ: DOB SÁV BEKÖTÉSE A SIDECHAIN BUS-BA ---
    if (type === 'drum') {
        // A dob sávot beleküldjük a láthatatlan Sidechain Analyzerbe is!
        trackGain.connect(sidechainBus);
    }

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
    
    // 2. FELSŐ Track Slider ÉS Sidechain Slider húzása
    else if (e.target.matches('.track-sliders input[type="range"]') || e.target.classList.contains('trk-sc-slider')) {
        const isVol = e.target.classList.contains('trk-vol-slider');
        const isSc = e.target.classList.contains('trk-sc-slider');
        const val = e.target.value;
        const trackContainer = e.target.closest('.track-container');
        const trackId = trackContainer ? trackContainer.dataset.trackId : null;
        
        if (isSc) {
            // Frissíti a Sidechain popupban a számot!
            e.target.nextElementSibling.textContent = val + '%';
            
            // --- ÚJ: PUMP GOMB VILÁGÍTÁSÁNAK KAPCSOLÁSA ---
            const pumpBtn = trackContainer.querySelector('.pump-btn');
            if (pumpBtn) {
                if (val > 0) {
                    pumpBtn.classList.add('engaged'); // Kigyullad a gomb
                } else {
                    pumpBtn.classList.remove('engaged'); // Elalszik a gomb
                }
            }
        }
        else if (isVol) {
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
    const seqModal = document.getElementById('seq-modal');
    const seqGrid = document.getElementById('seq-grid');
    const title = document.getElementById('seq-title');
    
    // Kék szín a dobgépnek
    seqModal.style.borderColor = '#3fa9f5';
    title.style.color = '#3fa9f5';
    title.textContent = clip.querySelector('.clip-name').textContent + ' - EDITOR';

    // --- ÚJ: DOB PRESET VÁLASZTÓ ---
    const trackContainer = clip.closest('.track-container');
    const presetSelector = document.getElementById('preset-selector');
    presetSelector.style.display = 'block';
    presetSelector.innerHTML = `
        <option value="TR-808 (Deep)">TR-808 (Deep)</option>
        <option value="TR-909 (Punchy)">TR-909 (Punchy)</option>
        <option value="Synthwave">Retro Synthwave</option>
    `;
    // Betöltjük a mentett hangot, vagy adunk egy alapértelmezettet
    presetSelector.value = trackContainer.dataset.preset || 'TR-808 (Deep)';
    presetSelector.onchange = (e) => { 
        trackContainer.dataset.preset = e.target.value; 
    };
    
    const instruments = [
        { id: 'cr', name: 'Crash', note: 49 },
        { id: 'rd', name: 'Ride', note: 51 },
        { id: 'ht', name: 'Hi Tom', note: 48 },
        { id: 'mt', name: 'Mid Tom', note: 45 },
        { id: 'lt', name: 'Low Tom', note: 41 },
        { id: 'oh', name: 'Open Hat', note: 46 },
        { id: 'ch', name: 'Hi-Hat', note: 42 },
        { id: 'sn', name: 'Snare', note: 38 },
        { id: 'bd', name: 'Kick', note: 36 }
    ];

    // --- ÚJ, DINAMIKUS RÁCS KISZÁMÍTÁSA ---
    // Hány 16-od hang fér el egy ütemben az aktuális ütemmutató szerint?
    const stepsPerBar = timeSig[0] * (16 / timeSig[1]); 
    const totalSteps = clip.patternData.lengthInBars * stepsPerBar;
    
    // Egy 16-od hang abszolút hossza másodpercben (ez mindig fix a BPM-hez képest)
    const secPerStep = (60 / bpm) / 4;


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
        
        // --- DINAMIKUS DOB RÁCS CIKLUS ---
        const stepsPerBeat = 16 / timeSig[1]; // Kiszámolja, hány lépés egy ütés (pl. /4 esetén 4, /8 esetén 2)

        for(let i = 0; i < totalSteps; i++) {
            const btn = document.createElement('button');
            btn.className = 'seq-step-btn';
            
            // Dinamikus CSS osztályok ráosztása a Time Sig alapján!
            if (i % stepsPerBeat === 0) btn.classList.add('beat-start');
            if (Math.floor(i / stepsPerBeat) % 2 === 0) btn.classList.add('beat-even');
            else btn.classList.add('beat-odd');
            
            // Megnézzük, van-e hangjegy a klipben ezen az időponton
            const noteTime = i * secPerStep;
            const existingNoteIndex = clip.patternData.notes.findIndex(n => n.note === inst.note && Math.abs(n.start - noteTime) < 0.01);
            
            if (existingNoteIndex !== -1) btn.classList.add('active');
            
            // Szerkesztés (Kattintás) logikája
            btn.addEventListener('click', () => {
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    const idx = clip.patternData.notes.findIndex(n => n.note === inst.note && Math.abs(n.start - noteTime) < 0.01);
                    if (idx !== -1) clip.patternData.notes.splice(idx, 1);
                } else {
                    btn.classList.add('active');
                    clip.patternData.notes.push({note: inst.note, start: noteTime, duration: 0.1, velocity: 100});
                    
                    if (!window.analogDrums) window.analogDrums = new AnalogDrumMachine(audioCtx);
                    const trackOutput = clip.closest('.track-container').trackPannerNode || masterGain;
                    window.analogDrums.playNote(inst.note, audioCtx.currentTime, 100, trackOutput, trackContainer.dataset.preset);
                }
                
                const color = clip.closest('.track-container').classList.contains('drum') ? '#3fa9f5' : '#b084f7';
                drawPattern(clip.querySelector('canvas'), clip, color);
            });
            stepsContainer.appendChild(btn);
        }
        row.appendChild(stepsContainer);
        seqGrid.appendChild(row);
    });

    seqOverlay.style.display = 'flex';
}

// --- PIANO ROLL EDITOR (CUBASE / FL STUDIO STYLE) ---
function openPianoRoll(clip) {
    const seqOverlay = document.getElementById('seq-modal-overlay');
    const seqModal = document.getElementById('seq-modal'); 
    const seqGrid = document.getElementById('seq-grid');
    const title = document.getElementById('seq-title');
    
    // 1. Szín lekérdezése az okos függvényünkkel
    const trackContainer = clip.closest('.track-container');
    let trackColor = getTrackColor(trackContainer); 

    // 2. Ablak és bogyók színezése
    seqModal.style.borderColor = trackColor;
    title.style.color = trackColor;
    title.textContent = clip.querySelector('.clip-name').textContent + ' - PIANO ROLL';
    seqGrid.style.setProperty('--piano-roll-note-color', trackColor);

    // 3. Preset Selector
    const presetSelector = document.getElementById('preset-selector');
    presetSelector.style.display = 'block';
    presetSelector.innerHTML = `
        <option value="Classic Saw">Classic Saw</option>
        <option value="Deep Bass">Deep Bass</option>
        <option value="8-Bit Square">8-Bit Square</option>
    `;
    presetSelector.value = trackContainer.dataset.preset || 'Classic Saw';
    if (!trackContainer.dataset.preset) trackContainer.dataset.preset = presetSelector.value;
    presetSelector.onchange = (e) => { trackContainer.dataset.preset = e.target.value; };
    
    const isBass = trackContainer.classList.contains('bass');
    const isSynth = trackContainer.classList.contains('synth');

    let startOct = 4;
    let endOct = 2; // Alapból 3 oktáv
    
    if (isBass) {
        startOct = 3;
        endOct = 1; // Basszus: mélyebb tartomány (3, 2, 1)
    } else if (isSynth) {
        startOct = 5;
        endOct = 2; // Synth: szélesebb, 4 oktáv (5, 4, 3, 2)
    }

    const notes = [];
    const noteNames = ['B','A#','A','G#','G','F#','F','E','D#','D','C#','C'];
    const isBlack = [false, true, false, true, false, true, false, false, true, false, true, false];
    
    for(let oct = startOct; oct >= endOct; oct--) {
        for(let i = 0; i < 12; i++) {
            notes.push({
                name: noteNames[i] + oct,
                note: (oct + 1) * 12 + (11 - i), 
                type: isBlack[i] ? 'black' : 'white'
            });
        }
    }

    const stepsPerBar = timeSig[0] * (16 / timeSig[1]); 
    const totalSteps = clip.patternData.lengthInBars * stepsPerBar;
    const secPerStep = (60 / bpm) / 4; 

    seqGrid.style.gap = '0';
    seqGrid.style.padding = '0';
    seqGrid.innerHTML = '';

    let isDrawingPR = false;
    let currentPRNote = null;
    
    document.addEventListener('mouseup', () => { isDrawingPR = false; currentPRNote = null; });
    document.addEventListener('touchend', () => { isDrawingPR = false; currentPRNote = null; });

    const stepsPerBeat = 16 / timeSig[1]; 

    notes.forEach(key => {
        const row = document.createElement('div');
        row.className = 'pr-row';
        if (key.type === 'black') row.classList.add('black-row'); 
        
        const keyLabel = document.createElement('div');
        keyLabel.className = `pr-key ${key.type}`;
        keyLabel.textContent = key.name;
        row.appendChild(keyLabel);
        
        const stepsContainer = document.createElement('div');
        stepsContainer.className = 'pr-grid';
        
        for(let i = 0; i < totalSteps; i++) {
            const cell = document.createElement('div');
            cell.className = 'pr-cell';
            
            cell.dataset.time = i * secPerStep;
            cell.dataset.note = key.note;
            
            if (i % stepsPerBeat === 0) cell.classList.add('beat-start');
            if (Math.floor(i / stepsPerBeat) % 2 === 0) cell.classList.add('beat-even');
            else cell.classList.add('beat-odd');
            
            const noteTime = i * secPerStep;
            
            const isActive = clip.patternData.notes.some(n => n.note === key.note && noteTime >= n.start - 0.001 && noteTime < n.start + n.duration - 0.001);
            const isStart = clip.patternData.notes.some(n => n.note === key.note && Math.abs(noteTime - n.start) < 0.001);

            if (isActive) cell.classList.add('active');
            if (isStart) cell.classList.add('note-start');
            
            const startDraw = (e) => {
                if (e.cancelable) e.preventDefault(); 
                isDrawingPR = true;
                
                if (cell.classList.contains('active')) {
                    const idx = clip.patternData.notes.findIndex(n => n.note === key.note && noteTime >= n.start - 0.001 && noteTime < n.start + n.duration - 0.001);
                    if (idx !== -1) clip.patternData.notes.splice(idx, 1);
                    
                    Array.from(stepsContainer.children).forEach((c, idx) => {
                        const t = idx * secPerStep;
                        const active = clip.patternData.notes.some(n => n.note === key.note && t >= n.start - 0.001 && t < n.start + n.duration - 0.001);
                        const start = clip.patternData.notes.some(n => n.note === key.note && Math.abs(t - n.start) < 0.001);
                        
                        if (!active) c.classList.remove('active', 'note-start'); 
                        else {
                            if (start) c.classList.add('note-start');
                            else c.classList.remove('note-start');
                        }
                    });
                } else {
                    currentPRNote = {note: key.note, start: noteTime, duration: secPerStep, velocity: 100};
                    clip.patternData.notes.push(currentPRNote);
                    cell.classList.add('active', 'note-start'); 
                    
                    if (!window.analogSynth) window.analogSynth = new AnalogSynth(audioCtx);
                    const trackOutput = clip.closest('.track-container').trackPannerNode || masterGain;
                    window.analogSynth.playNote(key.note, audioCtx.currentTime, 0.2, 100, trackOutput, trackContainer.dataset.preset);
                }
                drawPattern(clip.querySelector('canvas'), clip, trackColor); // Itt adja át a színt!
            };

            cell.addEventListener('mousedown', startDraw);
            cell.addEventListener('touchstart', startDraw, {passive: false});

            cell.addEventListener('mouseenter', () => {
                if (isDrawingPR && currentPRNote && noteTime > currentPRNote.start) {
                    currentPRNote.duration = (noteTime - currentPRNote.start) + secPerStep;
                    cell.classList.add('active');
                    drawPattern(clip.querySelector('canvas'), clip, trackColor);
                }
            });
            
            cell.addEventListener('touchmove', (e) => {
                if (!isDrawingPR || !currentPRNote) return;
                if (e.cancelable) e.preventDefault(); 
                
                const touch = e.touches[0];
                const targetCell = document.elementFromPoint(touch.clientX, touch.clientY);
                
                if (targetCell && targetCell.classList.contains('pr-cell')) {
                    const cellTime = parseFloat(targetCell.dataset.time);
                    const cellNote = parseInt(targetCell.dataset.note);
                    
                    if (cellNote === currentPRNote.note && cellTime > currentPRNote.start) {
                        currentPRNote.duration = (cellTime - currentPRNote.start) + secPerStep;
                        targetCell.classList.add('active');
                        drawPattern(clip.querySelector('canvas'), clip, trackColor);
                    }
                }
            }, {passive: false});
            
            stepsContainer.appendChild(cell);
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

            // Leválasztjuk a sáv csomópontjait a Masterről, mielőtt töröljük
            if (track.trackGainNode) track.trackGainNode.disconnect();
            if (track.trackPannerNode) track.trackPannerNode.disconnect();
            if (track.analyserNode) track.analyserNode.disconnect();
            if (track.fxOutputNode) track.fxOutputNode.disconnect();

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

    // 5. EDIT GOMB (Editor megnyitása BÁRMELYIK sávon)
    const editBtn = e.target.closest('.daw-btn.edit');
    if (editBtn) {
        const trackContainer = editBtn.closest('.track-container');
        const isDrum = trackContainer.classList.contains('drum');
        let selectedClip = trackContainer.querySelector('.audio-clip.selected-clip');
        
        // --- ÚJ OKOS LOGIKA ---
        // Ha nincs explicit kijelölve klip, CSAK azt nézzük meg, mi van a piros lejátszófej (Playhead) alatt:
        if (!selectedClip) {
            const allClips = Array.from(trackContainer.querySelectorAll('.audio-clip'));
            selectedClip = allClips.find(c => {
                const start = parseFloat(c.dataset.start);
                const end = start + parseFloat(c.dataset.duration);
                return currentPlayTime >= start && currentPlayTime <= end; 
            });
            
            // Ha sikeresen kitaláltuk, vizuálisan is kijelöljük neki
            if (selectedClip) {
                document.querySelectorAll('.audio-clip').forEach(c => c.classList.remove('selected-clip'));
                selectedClip.classList.add('selected-clip');
            }
        }
        // --- ÚJ LOGIKA VÉGE ---

        if (selectedClip) {
            if (selectedClip.dataset.type === 'pattern') {
                if (isDrum) openDrumEditor(selectedClip); 
                else openPianoRoll(selectedClip);         
            }
        } else {
            // NINCS KIJELÖLVE SEMMI ÉS A PLAYHEAD ALATT SINCS KLIP: Hozunk létre egy új Pattern Klipet!
            let startTime = currentPlayTime;
            const snapPx = getSnapPx();
            if (snapPx > 0) {
                startTime = (Math.round((startTime * PX_PER_SECOND) / snapPx) * snapPx) / PX_PER_SECOND;
            }

            const clipsContainer = trackContainer.querySelector('.clips');
            const newClip = addPatternClipToTrack(clipsContainer, "Pattern " + Math.floor(Math.random()*100), startTime, 1);
            
            if (isDrum) {
               const secPerBeat = 60 / bpm; 
               newClip.patternData.notes.push({note: 36, start: 0, duration: 0.1, velocity: 100}); 
               newClip.patternData.notes.push({note: 38, start: secPerBeat, duration: 0.1, velocity: 100}); 
               newClip.patternData.notes.push({note: 36, start: secPerBeat*2, duration: 0.1, velocity: 100}); 
               newClip.patternData.notes.push({note: 38, start: secPerBeat*3, duration: 0.1, velocity: 100}); 
            }

            // Színezés okosan
            const waveColor = getTrackColor(trackContainer);
            drawPattern(newClip.querySelector('canvas'), newClip, waveColor);

            const selectBtn = document.querySelector('.select-btn');
            if (selectBtn && selectBtn.classList.contains('active')) {
                document.querySelectorAll('.audio-clip').forEach(c => c.classList.remove('selected-clip'));
                newClip.classList.add('selected-clip');
            }
            
            // Extra UX: Az újonnan létrehozott klipet is egyből nyissuk meg!
            if (isDrum) openDrumEditor(newClip); 
            else openPianoRoll(newClip);
        }
        return;
    }

    // SIDECHAIN GOMB
    const scBtn = e.target.closest('.daw-btn.sidechain-btn');
    if (scBtn) {
        const track = scBtn.closest('.track-container');
        const popup = track.querySelector('.sidechain-popup');
        
        // Zárjuk be az összes többi nyitott SC ablakot, hogy ne legyen káosz
        document.querySelectorAll('.sidechain-popup').forEach(p => { 
            if (p !== popup) p.style.display = 'none'; 
        });
        document.querySelectorAll('.daw-btn.sidechain-btn').forEach(b => {
            if (b !== scBtn) b.classList.remove('active');
        });

        // Váltogatjuk a megnyitást (Toggle)
        const isClosed = popup.style.display === 'none' || popup.style.display === '';
        popup.style.display = isClosed ? 'flex' : 'none';
        scBtn.classList.toggle('active', isClosed);
        
        e.stopPropagation();
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

// Pickerek és Sidechain ablakok bezárása kattintásra (üres területen)
document.addEventListener('click', (e) => {
    if(!e.target.closest('.audio-source') && !e.target.closest('.output') && !e.target.closest('.sidechain-popup') && !e.target.closest('.sidechain-btn')){
        closeAllPickers();
        document.querySelectorAll('.sidechain-popup').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.daw-btn.sidechain-btn').forEach(b => b.classList.remove('active'));
    }
});

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
            const color = getTrackColor(clip.closest('.track-container'));
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

// --- ÜTEMMUTATÓ (TIME SIGNATURE) BEÁLLÍTÁSA ---
const tsInput = document.querySelector('.time-signature-input');
tsInput.addEventListener('change', (e) => {
    // Szétszedjük a beírt értéket (pl. "3/4" -> 3 és 4)
    const parts = e.target.value.split('/');
    if (parts.length === 2) {
        const num = parseInt(parts[0]);
        const den = parseInt(parts[1]);
        
        // Biztonsági ellenőrzés (csak érvényes zenei értékeket fogadunk el)
        if (num > 0 && num <= 32 && [2, 4, 8, 16].includes(den)) {
            timeSig = [num, den];
            
            // Újrarajzoljuk a hátteret és a vonalzót
            drawRuler();
            drawAllGrids();
            return;
        }
    }
    // Ha hülyeséget írt be, visszaírjuk az eredetit
    e.target.value = `${timeSig[0]}/${timeSig[1]}`;
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
            //addClipToTrack(parent, buffer, name, clipStart, originalTrim, cutPointRelative);
            const assetId = selected.dataset.assetId;
            addClipToTrack(parent, buffer, name, clipStart, originalTrim, cutPointRelative, assetId);
            
            // 3. JOBB OLDALI DARAB létrehozása (a vágóponttól a végéig)
            const remainingDuration = clipDur - cutPointRelative;
            const newTrimOffset = originalTrim + cutPointRelative;
            //addClipToTrack(parent, buffer, name, currentPlayTime, newTrimOffset, remainingDuration);
            addClipToTrack(parent, buffer, name, currentPlayTime, newTrimOffset, remainingDuration, assetId);
            
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
            
            // 3. Kirajzoljuk rá a másolt kis bogyókat a HELYES sávszínnel
            const trackContainer = parent.closest('.track-container');
            const color = getTrackColor(trackContainer);
            drawPattern(newClip.querySelector('canvas'), newClip, color);

        } else {
            // RÉGI LOGIKA: Ha ez egy Audio Klip, másoljuk az audioBuffer-t
            const buffer = selected.audioBuffer;
            const assetId = selected.dataset.assetId;
            newClip = addClipToTrack(parent, buffer, name, newStart, currentTrim, currentDuration, assetId);        
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

function secondsPerBar() { 
    const secondsPerBeat = 60 / bpm;
    return timeSig[0] * secondsPerBeat * (4 / timeSig[1]); 
}

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
    const barPx = secondsPerBar() * PX_PER_SECOND; 
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

// 1. Amikor folyamatosan HÚZOD a csúszkát (Klipek szélességének dinamikus nyújtása)
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
        if (canvas) {
            // HA AUDIO KLIP
            if (clip.audioBuffer) {
                const fullWidth = clip.audioBuffer.duration * PX_PER_SECOND;
                canvas.style.width = `${fullWidth}px`;
                canvas.style.left = `-${trimOffset * PX_PER_SECOND}px`;
            } 
            // HA PATTERN KLIP
            else if (clip.dataset.type === 'pattern') {
                canvas.style.width = `${duration * PX_PER_SECOND}px`;
            }
        }
    });
    updatePlayheadVisuals();
});

// 2. Amikor ELENGEDED a csúszkát (Újrarajzoljuk a belső grafikát a tökéletes élességért)
zoomSlider.addEventListener('change', (e) => {
    document.querySelectorAll('.audio-clip').forEach(clip => {
        const canvas = clip.querySelector('canvas');
        if (!canvas) return;

        // Szín megállapítása
        let waveColor = '#00ffd5'; // Alap zöld
        const parentTrack = clip.closest('.track-container');
        
        if (parentTrack) {
            if (parentTrack.classList.contains('drum')) waveColor = '#3fa9f5';
            else if (parentTrack.classList.contains('bass')) waveColor = '#ffd93d';
            else if (parentTrack.classList.contains('synth')) waveColor = '#b084f7';
            else if (parentTrack.classList.contains('vocal')) waveColor = '#ff7ac8';
            else if (parentTrack.classList.contains('sample')) waveColor = '#ff8c00';
        }

        // --- ÚJ: PATTERN (MIDI) GRAFIKA ÚJRARAJZOLÁSA ---
        if (clip.dataset.type === 'pattern') {
            const duration = parseFloat(clip.dataset.duration);
            const newWidth = duration * PX_PER_SECOND;
            canvas.width = Math.min(Math.max(1, newWidth), 16384); 
            drawPattern(canvas, clip, waveColor);
        } 
        // --- RÉGI: AUDIO WAVEFORM ÚJRARAJZOLÁSA ---
        else if (clip.audioBuffer) {
            const fullWidth = clip.audioBuffer.duration * PX_PER_SECOND;
            canvas.width = Math.min(Math.max(1, fullWidth), 16384); 
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
let hasMovedDuringPan = false;
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
    // 1. Lekérjük az új sáv színét az okos függvényünkkel
    const waveColor = getTrackColor(track); 

    const canvas = clip.querySelector('canvas');
    if (!canvas) return;

    // 2. Megnézzük, milyen típusú a klip, és annak megfelelően rajzoljuk újra!
    if (clip.dataset.type === 'pattern') {
        // HA KOTTA (MIDI) KLIP
        drawPattern(canvas, clip, waveColor);
    } else if (clip.audioBuffer) {
        // HA AUDIO (WAV/MP3/REC) KLIP
        drawWaveform(canvas, clip.audioBuffer, waveColor);
    }
}

// --- 5. BERAGADÁS ELLENI VÉDELEM (RESET) ---
function resetAllInteractions() {
    if (isPanning && !hasMovedDuringPan) {
        document.querySelectorAll('.audio-clip').forEach(c => c.classList.remove('selected-clip'));
    }

    isResizing = false;
    resizeTarget = null;

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
        hasMovedDuringPan = false;
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
    if (isPanning) { 
        e.preventDefault(); 
        const walk = panStartX - e.clientX; 
        if (Math.abs(walk) > 3) hasMovedDuringPan = true; // <-- HA MOZOG 3 PIXELT, JELZÜNK
        setScroll(panStartScroll + walk); 
    }
});

document.addEventListener('mouseup', resetAllInteractions);

// --- 7. MOBIL (ÉRINTÉS) ESEMÉNYEK ---
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return; 
    if (handleClipInteraction(e.touches[0].clientX, e.target, e)) return;

    if (e.target.closest('.track-area') || e.target.closest('.timeline-ruler')) {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        isPanning = true;
        hasMovedDuringPan = false;
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
            hasMovedDuringPan = true;
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

function addClipToTrack(container, buffer, name, startTime = null, trimOffset = 0, duration = null, assetId = null) {
    const clip = document.createElement('div');
    clip.className = 'audio-clip';
    
    // --- AUDIO POOL LOGIKA ---
    // Ha nem kapott assetId-t (tehát ez egy teljesen új felvétel vagy import), adunk neki egyet!
    if (!assetId) {
        assetId = 'asset_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        window.audioPool[assetId] = buffer;
    }
    
    // Elmentjük az id-t a klipbe, hogy a vágásnál és mentésnél tudjuk, melyik fájlra hivatkozik
    clip.dataset.assetId = assetId;         
    clip.audioBuffer = buffer;             
    
    // Szín megállapítása
    const parentTrack = container.closest('.track-container');
    let waveColor = '#00ffd5'; 

    if (parentTrack) {
        if (parentTrack.classList.contains('drum')) waveColor = '#3fa9f5';
        else if (parentTrack.classList.contains('bass')) waveColor = '#ffd93d';
        else if (parentTrack.classList.contains('synth')) waveColor = '#b084f7';
        else if (parentTrack.classList.contains('vocal')) waveColor = '#ff7ac8';
        else if (parentTrack.classList.contains('sample')) waveColor = '#ff8c00';
    }

    const startPos = startTime !== null ? startTime : currentPlayTime;
    const clipDuration = duration !== null ? duration : buffer.duration;
    const width = clipDuration * PX_PER_SECOND;
    
    clip.style.width = `${width}px`;
    clip.style.left = `${startPos * PX_PER_SECOND}px`;
    
    clip.dataset.start = startPos;         
    clip.dataset.trimOffset = trimOffset;  
    clip.dataset.duration = clipDuration;  
    
    const label = document.createElement('div');
    label.className = 'clip-name';
    label.textContent = name;
    clip.appendChild(label);

    const canvas = document.createElement('canvas');
    canvas.className = 'clip-waveform';
    const fullWidth = buffer.duration * PX_PER_SECOND;
    
    canvas.width = Math.min(fullWidth, 16384);       
    canvas.style.width = `${fullWidth}px`; 
    canvas.style.left = `-${trimOffset * PX_PER_SECOND}px`;
    clip.appendChild(canvas);
    
    setTimeout(() => drawWaveform(canvas, buffer, waveColor), 0);

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
    const duration = lengthInBars * secondsPerBar();
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
    //const leftHandle = document.createElement('div');
    //leftHandle.className = 'resize-handle left';
    //leftHandle.onmousedown = (e) => initResize(e, leftHandle, clip);
    
    // 3. Resize fül (Csak a jobb oldali, hogy lehessen szélesíteni tempóváltáskor)
    const rightHandle = document.createElement('div');
    rightHandle.className = 'resize-handle right';
    rightHandle.onmousedown = (e) => initResize(e, rightHandle, clip);
    rightHandle.ontouchstart = (e) => initResize(e, rightHandle, clip);
    
    //clip.appendChild(leftHandle);
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

        // Ha Virtual sáv (pl. MIDI), arra nem veszünk fel mikrofonos audio-t
        if (inputId === 'virtual') continue; 

        try {
            // --- 1. PRO AUDIO BEÁLLÍTÁSOK (Zajszűrés és Auto-Gain KIKAPCSOLÁSA) ---
            const audioConstraints = {
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false
            };

            if (inputId !== 'default') {
                audioConstraints.deviceId = { exact: inputId };
            }

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
                    
                    // --- 2. LATENCY (KÉSLELTETÉS) KOMPENZÁCIÓ ---
                    // Böngészős rögzítésnél (ASIO nélkül) átlagosan 100-150ms a hardveres csúszás.
                    let latencySec = 0.120; // 120 milliszekundum (0.12 mp) kompenzáció
                    
                    // Biztonsági ellenőrzés (ha nagyon rövid lenne a felvétel)
                    if (audioBuffer.duration <= latencySec) {
                        latencySec = 0; 
                    }
                    
                    const adjustedDuration = audioBuffer.duration - latencySec;

                    addClipToTrack(
                        clipsContainer, 
                        audioBuffer, 
                        clipName, 
                        startTimeOffset, 
                        latencySec,        // A trimOffset megkapja a latency értéket
                        adjustedDuration
                    );
                    
                } catch(decodeErr) {
                    console.error("Hiba az audio feldolgozásakor:", decodeErr);
                } finally {
                    stream.getTracks().forEach(t => t.stop());
                }
            };

            mediaRecorder.start();
            activeRecorders.push(mediaRecorder);

        } catch (err) {
            console.error("Felvételi hiba:", err);
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
        const secondsPerClick = (60.0 / bpm) * (4 / timeSig[1]);
        const beatsPassed = Math.round((startOffset / secondsPerClick) * 10000) / 10000;
        const nextBeatIndex = Math.ceil(beatsPassed);
        currentQuarterNote = nextBeatIndex % timeSig[0];
        const nextBeatDelay = (nextBeatIndex - beatsPassed) * secondsPerClick;
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
        const secondsPerClick = (60.0 / bpm) * (4 / timeSig[1]);
        nextNoteTime += secondsPerClick; 
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
                if (clipDiv.patternData && clipDiv.patternData.notes) {
                    // Lekérjük a sávhoz mentett presetet!
                    const savedPreset = parentTrack.dataset.preset || null;

                    clipDiv.patternData.notes.forEach(note => {
                        const noteAbsoluteTime = clipStartTimeline + note.start - trimOffset;
                        
                        if (noteAbsoluteTime >= offsetTime && noteAbsoluteTime < clipEndTimeline) {
                            const whenToStart = noteAbsoluteTime - offsetTime;
                            
                            // HA A SÁV NEM DOB, AKKOR MINDENKÉPPEN A SZINTIT HASZNÁLJA
                            if (!parentTrack.classList.contains('drum')) {
                                // SZINTETIZÁTOR LEJÁTSZÁSA
                                if (!window.analogSynth) window.analogSynth = new AnalogSynth(audioCtx);
                                
                                const nodes = window.analogSynth.playNote(note.note, audioCtx.currentTime + whenToStart, note.duration || 0.25, note.velocity, trackOutput, savedPreset);
                                
                                if (nodes) audioSources.push(...nodes);
                                
                            } else {
                                // DOBGÉP LEJÁTSZÁSA
                                if (!window.analogDrums) window.analogDrums = new AnalogDrumMachine(audioCtx);
                                
                                const nodes = window.analogDrums.playNote(note.note, audioCtx.currentTime + whenToStart, note.velocity, trackOutput, savedPreset);
                                
                                if (nodes) audioSources.push(...nodes);
                            }
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

    const secondsPerClick = (60.0 / bpm) * (4 / timeSig[1]);
    const beatsPassed = Math.round((startOffset / secondsPerClick) * 10000) / 10000;
    const nextBeatIndex = Math.ceil(beatsPassed);
    currentQuarterNote = nextBeatIndex % timeSig[0];
    const nextBeatDelay = (nextBeatIndex - beatsPassed) * secondsPerClick;
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
        const secondsPerClick = (60.0 / bpm) * (4 / timeSig[1]);
        const beatsPassed = Math.round((startOffset / secondsPerClick) * 10000) / 10000;
        const nextBeatIndex = Math.ceil(beatsPassed);
        currentQuarterNote = nextBeatIndex % timeSig[0];
        const nextBeatDelay = (nextBeatIndex - beatsPassed) * secondsPerClick;
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

// ==========================================================
// --- BILLENTYŰZET PARANCSOK (SHORTCUTS) ---
// ==========================================================
document.addEventListener('keydown', (e) => {
    // VÉDELEM: Ha épp egy beviteli mezőben vagyunk (BPM, Jelszó, vagy Sávnév átírása), 
    // akkor ne süljenek el a DAW billentyűparancsai!
    const isTyping = e.target.tagName === 'INPUT' || 
                     e.target.tagName === 'TEXTAREA' || 
                     e.target.isContentEditable;
    
    if (isTyping) return;

    // --- ÚJ: CTRL + D (Duplikálás) ---
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault(); // Megakadályozzuk, hogy a böngésző könyvjelzőt csináljon
        const dupBtn = document.querySelector('.duplicate-btn');
        if (dupBtn) {
            dupBtn.classList.add('active'); // Vizuális gombnyomás
            performDuplicate(e);
        }
        return;
    }

    // 1. SZÓKÖZ (Space): Lejátszás / Megállítás
    if (e.code === 'Space') {
        e.preventDefault(); // Megakadályozza, hogy a szóköz legörgessen az oldal aljára
        const playBtn = document.querySelector('.play-btn');
        if (playBtn) playBtn.click();
    }

    // 2. DELETE vagy BACKSPACE: Kijelölt klipek törlése
    if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        const deleteBtn = document.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.classList.add('active'); // Vizuális felvillanás
            performDelete(e);
        }
    }

    // 3. ENTER: Ugrás a kezdetre (Return to Zero)
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        const rewindBtn = document.querySelector('.rewind-btn');
        if (rewindBtn) rewindBtn.click();
    }

    // 4. 'R' betű: Felvétel (Record) gomb ki/be kapcsolása
    if (e.key.toLowerCase() === 'r') {
        const recBtn = document.querySelector('.control-panel .rec-btn');
        if (recBtn) recBtn.click();
    }

    // 5. 'L' betű: Loop gomb ki/be
    if (e.key.toLowerCase() === 'l') {
        const loopBtn = document.querySelector('.loop-btn');
        if (loopBtn) loopBtn.click();
    }

    // 6. 'C' betű: Click (Metronóm) ki/be
    if (e.key.toLowerCase() === 'c') {
        const clickBtn = document.querySelector('.click-btn');
        if (clickBtn) clickBtn.click();
    }
    
    // 7. 'S' betű: Kijelölő eszköz (Select tool) ki/be
    if (e.key.toLowerCase() === 's') {
        const selectBtn = document.querySelector('.select-btn');
        if (selectBtn) selectBtn.click();
    }
});

// Alapállapot beállítása az induláskor
createTrack('guitar');
updateMeters();

// ==========================================================
// --- BÖNGÉSZŐ BEZÁRÁS / FRISSÍTÉS VÉDELEM ---
// ==========================================================
window.addEventListener('beforeunload', (e) => {
    const hasTracks = document.querySelectorAll('.track-container').length > 0;
    if (hasTracks) {
        e.preventDefault();
        e.returnValue = ''; // A modern böngészők ezt kérik a figyelmeztetéshez
    }
});

// --- AUDIO SEGÉDFÜGGVÉNYEK A MENTÉSHEZ ---
function audioBufferToWavBlob(buffer) {
    const left = [new Float32Array(buffer.getChannelData(0))];
    const right = buffer.numberOfChannels > 1 ? [new Float32Array(buffer.getChannelData(1))] : [new Float32Array(buffer.getChannelData(0))];
    return exportToWav(left, right, buffer.length, buffer.sampleRate);
}

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

// --- AUDIO SEGÉDFÜGGVÉNYEK A MENTÉSHEZ ---
function audioBufferToWavBlob(buffer) {
    const left = [new Float32Array(buffer.getChannelData(0))];
    const right = buffer.numberOfChannels > 1 ? [new Float32Array(buffer.getChannelData(1))] : [new Float32Array(buffer.getChannelData(0))];
    return exportToWav(left, right, buffer.length, buffer.sampleRate);
}

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

// --- PROJEKT MENTÉSE (SERIALIZÁCIÓ) - FELHŐ/LOKÁL LOGIKÁVAL ---
window.serializeProject = async function(isCloudSave = false) {
    const project = { bpm: bpm, timeSig: timeSig, tracks: [] };
    let uploadedFileIds = []; 

    // --- 1. LELTÁR KÉSZÍTÉSE: Mik az egyedi hangfájlok a projektben? ---
    const uniqueAssets = new Set();
    document.querySelectorAll('.audio-clip:not(.pattern-clip)').forEach(clip => {
        if (clip.dataset.assetId && clip.audioBuffer) {
            uniqueAssets.add(clip.dataset.assetId);
        }
    });

    const uploadedAssetsMap = {}; // Itt tároljuk: asset_123 -> Cloudinary URL

    // --- 2. CSAK AZ EGYEDI FÁJLOKAT TÖLTJÜK FEL / KÓDOLJUK! ---
    for (const assetId of uniqueAssets) {
        const buffer = window.audioPool[assetId];
        if (!buffer) continue;

        const wavBlob = audioBufferToWavBlob(buffer);

        if (isCloudSave) {
            const formData = new FormData();
            formData.append("file", wavBlob, assetId + ".wav");
            
            try {
                const response = await fetch("https://music-backend-jq1s.onrender.com/upload", {
                    method: "POST", body: formData
                });
                if (!response.ok) throw new Error("Szerver hiba");
                const data = await response.json();
                
                if (data.url) {
                    uploadedAssetsMap[assetId] = data.url; // URL elmentése a Pool-ba
                    uploadedFileIds.push(data.public_id);
                }
            } catch (e) {
                console.error("Hiba az asset feltöltésekor:", assetId, e);
                uploadedAssetsMap[assetId] = ""; 
            }
        } else {
            // Lokális PC mentésnél is spórolunk! Csak egyszer csinálunk Base64-et.
            const base64Audio = await blobToBase64(wavBlob);
            uploadedAssetsMap[assetId] = base64Audio;
        }
    }

    // --- 3. SÁVOK ÉS KLIPEK MENTÉSE AZ ÚJ, OKOS POOL ADATOKKAL ---
    const tracks = document.querySelectorAll('.track-container');
    for (let track of tracks) {
        const trackData = {
            type: track.classList[1],
            name: track.querySelector('.track-name').textContent,
            preset: track.dataset.preset || '',
            vol: track.querySelector('.trk-vol-slider') ? track.querySelector('.trk-vol-slider').value : 80,
            pan: track.querySelector('.trk-pan-slider') ? track.querySelector('.trk-pan-slider').value : 0,
            scAmount: track.querySelector('.trk-sc-slider') ? track.querySelector('.trk-sc-slider').value : 0,
            clips: [],
            fxChain: []
        };

        const clips = track.querySelectorAll('.audio-clip');
        for (let clip of clips) {
            if (clip.dataset.type === 'pattern' && clip.patternData) {
                trackData.clips.push({
                    type: 'pattern',
                    start: parseFloat(clip.dataset.start),
                    duration: parseFloat(clip.dataset.duration),
                    patternData: JSON.parse(JSON.stringify(clip.patternData)) 
                });
            } else if (clip.audioBuffer && clip.dataset.assetId) {
                // Audio klip mentése, most már a POOL URL-jével
                trackData.clips.push({
                    type: 'audio',
                    name: clip.querySelector('.clip-name').textContent,
                    start: parseFloat(clip.dataset.start),
                    duration: parseFloat(clip.dataset.duration),
                    trimOffset: parseFloat(clip.dataset.trimOffset || 0),
                    assetId: clip.dataset.assetId,
                    audioData: uploadedAssetsMap[clip.dataset.assetId] || "" // Itt kapja meg a közös URL-t!
                });
            }
        }

        if (track.fxChain) {
            track.fxChain.forEach(fxItem => {
                const pluginState = { name: fxItem.name, params: {} };
                fxItem.ui.querySelectorAll('.knob').forEach(knob => { pluginState.params[knob.dataset.param] = knob.dataset.val; });
                const toggle = fxItem.ui.querySelector('.toggle-switch');
                if (toggle) pluginState.params['mode'] = toggle.dataset.val;
                fxItem.ui.querySelectorAll('.max-slider').forEach(slider => { pluginState.params[slider.id] = slider.value; });
                trackData.fxChain.push(pluginState);
            });
        }
        project.tracks.push(trackData);
    }

    if (isCloudSave) return { projectData: project, uploadedFileIds };
    return project;
};

// ==========================================================
// --- ÚJ PROJEKT (NEW) GOMB LOGIKÁJA ---
// ==========================================================
const newProjectBtn = Array.from(document.querySelectorAll('.project-btn')).find(b => b.textContent === 'New');

if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => {
        const hasTracks = document.querySelectorAll('.track-container').length > 0;
        
        // 1. Biztonsági rákérdezés, ha már van sáv a projektben
        if (hasTracks) {
            if (!confirm("Biztosan új projektet kezdesz? Minden nem mentett változtatásod elvész!")) {
                return;
            }
        }

        // 2. Lejátszás és felvétel azonnali leállítása
        if (typeof stopPlayback === 'function') stopPlayback();
        
        // 3. Minden sáv kigyomlálása a DOM-ból ÉS a memóriából (AudioContext)
        document.querySelectorAll('.track-container').forEach(track => {
            // Audio node-ok leválasztása a memóriaszivárgás ellen
            if (track.trackGainNode) track.trackGainNode.disconnect();
            if (track.trackPannerNode) track.trackPannerNode.disconnect();
            if (track.analyserNode) track.analyserNode.disconnect();
            if (track.fxOutputNode) track.fxOutputNode.disconnect();
            track.remove();
        });
        
        // Keverő csatornák törlése (kivéve a Master)
        document.querySelectorAll('.mixer-channel:not(.master-channel)').forEach(m => m.remove());

        // 4. Globális változók és UI resetelése
        trackCounter = 0;
        bpm = 120;
        timeSig = [4, 4];
        currentPlayTime = 0;
        startOffset = 0;
        
        document.querySelector('.bpm-input').value = 120;
        document.querySelector('.time-signature-input').value = '4/4';
        document.getElementById('timelineRuler').style.display = 'none';
        
        // 5. Master csatorna resetelése (Hangerő 80%, Pan középen)
        masterGain.gain.value = 0.8;
        masterPanner.pan.value = 0;
        const masterVolSlider = document.querySelector('.master-vol-slider');
        const masterPanSlider = document.querySelector('.master-pan-slider');
        if (masterVolSlider) masterVolSlider.value = 80;
        if (masterPanSlider) masterPanSlider.value = 0;
        const masterVolVal = document.querySelector('.master-vol-val');
        if (masterVolVal) masterVolVal.textContent = '80%';

        // 6. Nézet (Scroll és Playhead) visszaállítása a nullára
        if (typeof setScroll === 'function') setScroll(0);
        updatePlayheadVisuals();
        
        // 7. Adunk egy friss, üres sávot indulásként (mint a program legelső megnyitásakor)
        createTrack('guitar');
    });
}
