// ==========================================================
// --- FX ENGINE: NEVE 1073 & LA-2A EMULÁCIÓ ---
// ==========================================================

const fxStyles = document.createElement('style');
fxStyles.innerHTML = `
    /* --- FX Modal Alap Stílusok (Reszponzív) --- */
    #fx-modal-overlay {
        position: fixed; 
        top: 0; bottom: 0; left: 0; right: 0;
        background: rgba(0,0,0,0.85); z-index: 3000;
        display: none; 
        align-items: flex-start; 
        justify-content: center;
        overflow-y: auto; 
        padding: 20px 0;
        backdrop-filter: blur(5px);
    }
    #fx-modal {
        background: #111; border: 1px solid var(--accent); border-radius: 4px;
        width: 90%; max-width: 800px; 
        min-height: 480px;
        flex-shrink: 0; 
        margin: auto; 
        display: flex; flex-direction: column;
        box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        overflow-y: auto;
    }
    .fx-header {
        background: #000; padding: 10px 20px; border-bottom: 1px solid #333;
        display: flex; justify-content: space-between; align-items: center;
        flex-shrink: 0; z-index: 20;
        text-transform: uppercase;
    }
    .fx-header h2 { margin: 0; font-size: 1rem; color: #fff; font-family: var(--font-mono); }
    .close-fx { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 1.5rem; }
    
    .fx-body { 
        display: flex; flex: 1; flex-direction: row; overflow: hidden; 
    }
    
    /* FX Lánc (Bal oldal) */
    .fx-chain-sidebar { 
        width: 200px; background: #0a0a0a; border-right: 1px solid #333; 
        padding: 10px; display: flex; flex-direction: column; flex-shrink: 0; 
    }
    #fx-list { flex: 1; overflow-y: auto; margin-bottom: 10px; min-height: 100px; }
    .fx-slot {
        background: #1a1a1a; border: 1px solid #333; padding: 10px; margin-bottom: 5px;
        color: #aaa; cursor: pointer; font-family: var(--font-mono); font-size: 0.8rem;
        display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; max-width: 200px;
    }
    .fx-slot:hover { border-color: var(--accent-soft); color: #fff; }
    .fx-slot.active { border-color: var(--accent); color: var(--accent); background: rgba(0,255,213,0.05); }
    
    /* Plugin Választó Menü */
    .add-fx-wrap { 
        position: relative; 
        max-width: 200px; 
        box-sizing: border-box; 
    }
    .add-fx-btn {
        max-width: 100%; background: transparent; border: 1px solid #555; color: #888;
        padding: 8px; cursor: pointer; font-family: var(--font-mono); font-size: 0.8rem;
        box-sizing: border-box; 
    }
    .add-fx-btn:hover { border-color: var(--accent); color: var(--accent); }
    
    #plugin-picker {
        display: none; position: absolute; 
        top: 100%; /* Mindig lefelé nyílik! */
        left: 0; width: 100%;
        background: #000; border: 1px solid var(--accent-soft); 
        margin-top: 4px; box-sizing: border-box; 
        z-index: 9999; /* Minden felett marad */
        box-shadow: 0 10px 40px rgba(0,0,0,0.9);
    }
    #plugin-picker.show { display: block; }
    .plugin-pick-btn {
        width: 100%; background: transparent; border: none; color: #fff;
        padding: 10px; cursor: pointer; font-family: var(--font-mono); font-size: 0.8rem; text-align: left;
        box-sizing: border-box; /* <-- ÉS A BELSŐ GOMBOKAT IS */
    }
    .plugin-pick-btn:hover { background: rgba(0,255,213,0.1); color: var(--accent); }

    .fx-plugin-area { 
        flex: 1; display: flex; align-items: center; justify-content: center; 
        background: #151515; padding: 20px; overflow-y: auto;
    }

    /* --- MOBIL NÉZET --- */
    @media (max-width: 768px) {
        .fx-body {
            flex-direction: column; 
            overflow: visible !important; 
        }
        .fx-chain-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #333;
            min-height: 120px; 
            max-height: 180px; 
            overflow: visible !important; 
        }
        
        /* ÚJ: Mobilspecifikus menü pozíció */
        #plugin-picker {
            bottom: auto; 
            top: 100%;    
            margin-bottom: 0;
            margin-top: 4px;
            z-index: 9999; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.9);
        }

        .fx-plugin-area {
            align-items: flex-start; 
            min-height: 300px; 
        }
        
        /* Hozzáadtam a listához a többi plugint is, hogy azok is méreteződjenek mobilon */
        .plugin-nv73, .plugin-la2a, .plugin-tape, .plugin-maximizer, .plugin-brit, .plugin-djent {
            transform: scale(0.85); 
            transform-origin: top center;
            margin-bottom: 40px;
        }
    }
    /* --- KÖZÖS POTMÉTER DIZÁJN --- */
    .knob-container { display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .knob-label { color: #aaa; font-size: 9px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
    .knob {
        width: 46px; height: 46px; border-radius: 50%; position: relative; cursor: ns-resize;
        box-shadow: 0 5px 10px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.2);
    }
    .knob::after {
        content: ''; position: absolute; top: 5px; left: 50%; transform: translateX(-50%);
        width: 2px; height: 10px; background: #fff; border-radius: 1px;
    }
    .knob-value { font-size: 9px; font-family: var(--font-mono); margin-top: 4px; min-height: 12px; }

    /* --- NEVE 1073 UI --- */
    .plugin-nv73 {
        background: #1e252c; border: 2px solid #111; border-radius: 2px;
        width: 100%; max-width: 500px; padding: 20px;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5); font-family: Arial, sans-serif;
    }
    .nv73-header { text-align: center; color: #d4d4d4; font-weight: bold; font-size: 1.2rem; letter-spacing: 2px; margin-bottom: 20px; border-bottom: 1px solid #0f1317; padding-bottom: 10px; }
    .nv73-panel { display: flex; justify-content: space-between; align-items: flex-end;}
    .nv73-section { display: flex; flex-direction: column; align-items: center; gap: 15px; }
    
    .knob.red { background: linear-gradient(135deg, #a62b2b, #6b1212); border: 2px solid #3a0a0a; }
    .knob.blue { background: linear-gradient(135deg, #324a6d, #1a2940); border: 2px solid #0f1622; }
    .knob.grey { background: linear-gradient(135deg, #5c6268, #34383c); border: 2px solid #1c1e20; width: 38px; height: 38px; }
    .plugin-nv73 .knob-value { color: #00ffd5; }

    /* --- LA-2A UI --- */
    .plugin-la2a {
        background: #cfd4d8; /* Klasszikus világosszürke/fém */
        border: 2px solid #888; border-radius: 4px;
        width: 100%; max-width: 450px; padding: 20px 30px;
        box-shadow: inset 0 0 40px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.7); font-family: 'Times New Roman', serif;
    }
    .la2a-header { text-align: center; color: #222; font-weight: bold; font-size: 1.4rem; letter-spacing: 1px; margin-bottom: 30px; }
    .la2a-header span { font-size: 0.7rem; display: block; letter-spacing: 3px; font-family: Arial, sans-serif; margin-top: 5px; color: #444;}
    .la2a-panel { display: flex; justify-content: space-between; align-items: center; }
    .la2a-section { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    
    .knob.black { 
        background: radial-gradient(circle at 30% 30%, #444, #111); border: 2px solid #000; 
        width: 60px; height: 60px; /* Nagyobb gombok */
    }
    .knob.black::after { width: 3px; height: 12px; background: #fff; }
    .plugin-la2a .knob-label { color: #111; font-size: 11px; font-family: Arial, sans-serif;}
    .plugin-la2a .knob-value { color: #d00; font-weight: bold; background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 2px;}

    /* LA-2A Kapcsoló */
    .toggle-switch {
        width: 24px; height: 40px; background: #222; border-radius: 12px; position: relative;
        cursor: pointer; border: 2px solid #555; box-shadow: inset 0 2px 5px rgba(0,0,0,0.8); margin: 10px auto;
    }
    .toggle-switch::before {
        content: ''; position: absolute; width: 20px; height: 20px; background: linear-gradient(to bottom, #ddd, #999);
        border-radius: 50%; left: 0; transition: top 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .toggle-switch[data-val="compress"]::before { top: 16px; } /* Lent */
    .toggle-switch[data-val="limit"]::before { top: 0px; }   /* Fent */
    .switch-labels { display: flex; flex-direction: column; align-items: center; font-size: 9px; font-weight: bold; color: #222; font-family: Arial, sans-serif; gap: 26px;}

    /* --- TAPE SATURATOR UI --- */
    .plugin-tape {
        background: #2a221d; border: 2px solid #111; border-radius: 4px;
        width: 100%; max-width: 400px; padding: 20px;
        box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.6);
        background-image: repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px);
    }
    .tape-header { text-align: center; color: #dcb37b; font-weight: bold; font-size: 1.2rem; letter-spacing: 3px; margin-bottom: 20px; font-family: serif;}
    .tape-panel { display: flex; justify-content: space-around; align-items: center; }
    .knob.tape-gold { background: radial-gradient(circle, #e0bc84, #8b6b3d); border: 2px solid #3d2a15; }
    .plugin-tape .knob-label { color: #dcb37b; }
    .plugin-tape .knob-value { color: #fff; }

    /* --- L-MAX MAXIMIZER UI --- */
    .plugin-maximizer {
        background: #19222b; border: 2px solid #000; border-radius: 2px;
        width: 100%; max-width: 350px; padding: 20px;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.7);
    }
    .max-header { text-align: center; color: #5bc0eb; font-weight: 800; font-size: 1.5rem; letter-spacing: -1px; margin-bottom: 20px; font-style: italic;}
    .max-panel { display: flex; justify-content: space-around; align-items: center; }
    /* Ebben csúszkák lesznek potik helyett! */
    .max-slider-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px;}
    .max-slider { -webkit-appearance: none; width: 120px; height: 6px; background: #000; border-radius: 3px; transform: rotate(-90deg); margin: 60px 0;}
    .max-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 12px; background: #5bc0eb; cursor: pointer; border-radius: 2px;}
    .max-label { color: #aaa; font-size: 10px; font-weight: bold; text-transform: uppercase;}
    .max-val { color: #5bc0eb; font-family: var(--font-mono); font-size: 11px;}

    /* --- AMP SIM UI --- */
    .amp-panel { display: flex; justify-content: space-around; align-items: center; gap: 10px; width: 100%;}
    .amp-header { text-align: center; font-weight: 900; font-size: 1.6rem; letter-spacing: 2px; margin-bottom: 25px; text-transform: uppercase;}
    .amp-header span { display: block; font-size: 0.6rem; letter-spacing: 5px; opacity: 0.7; margin-top: 4px; font-weight: normal;}
    
    /* Brit 800 (Marshall Vibe) */
    .plugin-brit {
        background: #111; border: 4px solid #bba057; border-radius: 6px;
        width: 100%; max-width: 550px; padding: 25px;
        box-shadow: inset 0 0 50px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.7);
        background-image: repeating-linear-gradient(45deg, #151515 25%, transparent 25%, transparent 75%, #151515 75%, #151515), repeating-linear-gradient(45deg, #151515 25%, #111 25%, #111 75%, #151515 75%, #151515);
        background-position: 0 0, 2px 2px; background-size: 4px 4px; /* Tolex textúra */
    }
    .brit-header { color: #bba057; font-family: Impact, sans-serif; }
    .plugin-brit .knob-label { color: #bba057; }
    .plugin-brit .knob-value { color: #fff; }
    .knob.amp-gold { background: radial-gradient(circle at 30% 30%, #e8c973, #a68428); border: 2px solid #5a4511; width: 42px; height: 42px;}
    .knob.amp-gold::after { background: #111; width: 3px; height: 12px;}

    /* Djent 51 (Modern Metal Vibe) */
    .plugin-djent {
        background: #1a1a1a; border: 2px solid #444; border-radius: 4px; border-top: 8px solid #900;
        width: 100%; max-width: 550px; padding: 25px;
        box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.7);
    }
    .djent-header { color: #ccc; font-family: 'Arial Black', sans-serif; }
    .djent-header span { color: #900; font-weight: bold;}
    .plugin-djent .knob-label { color: #aaa; }
    .plugin-djent .knob-value { color: #f00; font-weight: bold;}
    .knob.amp-black { background: radial-gradient(circle at 50% 10%, #444, #000); border: 1px solid #555; width: 42px; height: 42px; box-shadow: 0 5px 10px rgba(0,0,0,1);}
    .knob.amp-black::after { background: #f00; width: 2px; height: 14px;}
    
`;
document.head.appendChild(fxStyles);

// ==========================================================
// --- DSP OSZTÁLYOK ---
// ==========================================================

// --- 1. NV-73 Preamp (Drive + EQ) ---
class NV73Preamp {
    constructor(audioCtx) {
        this.ctx = audioCtx;
        this.input = this.ctx.createGain();
        this.output = this.ctx.createGain();

        this.driveNode = this.ctx.createWaveShaper(); this.driveNode.oversample = '4x'; this.setDrive(0);
        this.hpf = this.ctx.createBiquadFilter(); this.hpf.type = 'highpass'; this.hpf.frequency.value = 10; 
        this.lf = this.ctx.createBiquadFilter(); this.lf.type = 'lowshelf'; this.lf.frequency.value = 60; this.lf.gain.value = 0;
        this.mf = this.ctx.createBiquadFilter(); this.mf.type = 'peaking'; this.mf.frequency.value = 1600; this.mf.Q.value = 1.2; this.mf.gain.value = 0;
        this.hf = this.ctx.createBiquadFilter(); this.hf.type = 'highshelf'; this.hf.frequency.value = 12000; this.hf.gain.value = 0;
        this.trim = this.ctx.createGain(); this.trim.gain.value = 1;

        this.input.connect(this.driveNode); this.driveNode.connect(this.hpf);
        this.hpf.connect(this.lf); this.lf.connect(this.mf); this.mf.connect(this.hf);
        this.hf.connect(this.trim); this.trim.connect(this.output);
    }
    makeDistortionCurve(amount) {
        let k = typeof amount === 'number' ? amount : 50;
        let n_samples = 44100; let curve = new Float32Array(n_samples); let deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            let x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
    setDrive(val) { this.driveNode.curve = this.makeDistortionCurve(val); }
    setHpf(val) { this.hpf.frequency.value = val; }
    setLfFreq(val) { this.lf.frequency.value = val; }
    setLfGain(val) { this.lf.gain.value = val; }
    setMfFreq(val) { this.mf.frequency.value = val; }
    setMfGain(val) { this.mf.gain.value = val; }
    setHfGain(val) { this.hf.gain.value = val; }
    setTrim(val) { this.trim.gain.value = Math.pow(10, val / 20); }
}

// --- 2. LA-2A Optical Compressor ---
class LA2ACompressor {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // A Web Audio Comp-ot használjuk, de optikai karakterre hangolva
        this.comp = this.ctx.createDynamicsCompressor();
        this.comp.knee.value = 15; // Nagyon lágy térd (soft knee)
        this.comp.attack.value = 0.01; // Optikaihoz képest közepesen lassú (~10ms)
        this.comp.release.value = 0.3; // Kétlépcsős release szimulálása (~300ms)
        this.comp.ratio.value = 3; // Alap kompresszió arány

        this.makeupGain = this.ctx.createGain();
        this.makeupGain.gain.value = 1;

        this.input.connect(this.comp);
        this.comp.connect(this.makeupGain);
        this.makeupGain.connect(this.output);
    }

    setPeakReduction(val) {
        // Val = 0-100. Minél feljebb tekerjük, annál lejjebb megy a Threshold (0 -> -40dB)
        let threshold = (val / 100) * -40;
        this.comp.threshold.value = threshold;
    }

    setGain(val) {
        // Val = 0-100. Makeup Gain 0dB -> +24dB
        let db = (val / 100) * 24;
        this.makeupGain.gain.value = Math.pow(10, db / 20);
    }

    setMode(mode) {
        // Compress = lágyabb arány, Limit = keményebb
        this.comp.ratio.value = mode === 'limit' ? 20 : 3;
        this.comp.knee.value = mode === 'limit' ? 5 : 15; 
    }
}

// --- 3. Brit 800 (Vintage British Stack - Marshall JCM800 style) ---
class Brit800Amp {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // Bemeneti vágás (ne legyen túl iszapos a mélye)
        this.preEQ = ctx.createBiquadFilter();
        this.preEQ.type = 'highpass';
        this.preEQ.frequency.value = 120;

        // Csöves aszimmetrikus torzító
        this.driveNode = ctx.createWaveShaper();
        this.driveNode.oversample = '4x';

        // Klasszikus Tone Stack (Passzív EQ szimuláció)
        this.bass = ctx.createBiquadFilter(); this.bass.type = 'lowshelf'; this.bass.frequency.value = 120;
        this.mid = ctx.createBiquadFilter(); this.mid.type = 'peaking'; this.mid.frequency.value = 700; this.mid.Q.value = 0.7;
        this.treble = ctx.createBiquadFilter(); this.treble.type = 'highshelf'; this.treble.frequency.value = 3500;
        this.presence = ctx.createBiquadFilter(); this.presence.type = 'peaking'; this.presence.frequency.value = 5000; this.presence.Q.value = 1.5;

        // 4x12 Cabinet Simulator (Hangszóró szimuláció) - Enélkül darázs hangja van!
        this.cabSimHp = ctx.createBiquadFilter(); this.cabSimHp.type = 'highpass'; this.cabSimHp.frequency.value = 80; this.cabSimHp.Q.value = 1.0;
        this.cabSimLp = ctx.createBiquadFilter(); this.cabSimLp.type = 'lowpass'; this.cabSimLp.frequency.value = 5500; this.cabSimLp.Q.value = 0.5;

        this.masterVolume = ctx.createGain();

        // Jelút felépítése
        this.input.connect(this.preEQ);
        this.preEQ.connect(this.driveNode);
        this.driveNode.connect(this.bass);
        this.bass.connect(this.mid);
        this.mid.connect(this.treble);
        this.treble.connect(this.presence);
        this.presence.connect(this.cabSimHp);
        this.cabSimHp.connect(this.cabSimLp);
        this.cabSimLp.connect(this.masterVolume);
        this.masterVolume.connect(this.output);

        this.setDrive(50);
        this.setVolume(50);
    }

    makeTubeCurve(amount) {
        let k = amount * 1.5; // Gain skálázása
        let n_samples = 44100;
        let curve = new Float32Array(n_samples);
        for (let i = 0; i < n_samples; ++i) {
            let x = i * 2 / n_samples - 1;
            // Enyhén aszimmetrikus (páros harmonikusok) a Marshallos "karcért"
            if (x < 0) curve[i] = -1 + Math.exp(x * (1 + k/10));
            else curve[i] = Math.tanh(x * (1 + k/5));
        }
        return curve;
    }

    setDrive(val) { this.driveNode.curve = this.makeTubeCurve(val); }
    setBass(val) { this.bass.gain.value = (val - 50) / 3; } // -16dB to +16dB
    setMid(val) { this.mid.gain.value = (val - 50) / 4; }
    setTreble(val) { this.treble.gain.value = (val - 50) / 3; }
    setPresence(val) { this.presence.gain.value = (val - 50) / 4; }
    setVolume(val) { this.masterVolume.gain.value = val / 100; }
}

// --- 4. Djent 51 (Modern High Gain - Mesa/5150 style) ---
class Djent51Amp {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // TIGHT PRE-BOOST (Tube Screamer szimuláció a torzító előtt)
        // Levágja a sarat a mélyekről és kiemeli a pengetést
        this.tsBoost = ctx.createBiquadFilter();
        this.tsBoost.type = 'bandpass';
        this.tsBoost.frequency.value = 750;
        this.tsBoost.Q.value = 0.5; 

        // Brutális, szimmetrikus torzítás
        this.driveNode = ctx.createWaveShaper();
        this.driveNode.oversample = '4x';

        // Tone Stack (Mélyebb basszusok, élesebb magasak)
        this.bass = ctx.createBiquadFilter(); this.bass.type = 'lowshelf'; this.bass.frequency.value = 90;
        this.mid = ctx.createBiquadFilter(); this.mid.type = 'peaking'; this.mid.frequency.value = 500; this.mid.Q.value = 1.0;
        this.treble = ctx.createBiquadFilter(); this.treble.type = 'highshelf'; this.treble.frequency.value = 4000;
        this.depth = ctx.createBiquadFilter(); this.depth.type = 'peaking'; this.depth.frequency.value = 100; this.depth.Q.value = 2.0;

        // Modern V30 4x12 Cabinet Simulator (Kicsit sötétebb, fókuszáltabb)
        this.cabSimHp = ctx.createBiquadFilter(); this.cabSimHp.type = 'highpass'; this.cabSimHp.frequency.value = 90; this.cabSimHp.Q.value = 1.2;
        this.cabSimLp = ctx.createBiquadFilter(); this.cabSimLp.type = 'lowpass'; this.cabSimLp.frequency.value = 6500; this.cabSimLp.Q.value = 0.7;
        
        // Scoop filter a klasszikus "V" EQ-hoz
        this.cabScoop = ctx.createBiquadFilter(); this.cabScoop.type = 'peaking'; this.cabScoop.frequency.value = 400; this.cabScoop.Q.value = 1.0; this.cabScoop.gain.value = -4;

        this.masterVolume = ctx.createGain();

        // Gate a zaj ellen (nagyon egyszerű noise gate)
        this.gate = ctx.createDynamicsCompressor();
        this.gate.threshold.value = -50; 
        this.gate.ratio.value = 20;

        // Jelút
        this.input.connect(this.gate);
        this.gate.connect(this.tsBoost);
        this.tsBoost.connect(this.driveNode);
        this.driveNode.connect(this.bass);
        this.bass.connect(this.mid);
        this.mid.connect(this.treble);
        this.treble.connect(this.depth);
        this.depth.connect(this.cabSimHp);
        this.cabSimHp.connect(this.cabScoop);
        this.cabScoop.connect(this.cabSimLp);
        this.cabSimLp.connect(this.masterVolume);
        this.masterVolume.connect(this.output);

        this.setDrive(70);
        this.setVolume(50);
    }

    makeHighGainCurve(amount) {
        let k = amount * 4; // Extrém gain
        let n_samples = 44100;
        let curve = new Float32Array(n_samples);
        for (let i = 0; i < n_samples; ++i) {
            let x = i * 2 / n_samples - 1;
            // Kemény szimmetrikus vágás (Hard clipping)
            curve[i] = Math.tanh(x * (1 + k/2)); 
        }
        return curve;
    }

    setDrive(val) { this.driveNode.curve = this.makeHighGainCurve(val); }
    setBass(val) { this.bass.gain.value = (val - 50) / 2.5; }
    setMid(val) { this.mid.gain.value = (val - 50) / 2; }
    setTreble(val) { this.treble.gain.value = (val - 50) / 2.5; }
    setDepth(val) { this.depth.gain.value = val / 10; } // 0-10dB mély rezonancia (Mesa style)
    setVolume(val) { this.masterVolume.gain.value = val / 100; }
}

// --- 5. Vintage Tape Saturator ---
class TapeSaturator {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();
        
        // Szalag szaturáció (WaveShaper)
        this.driveNode = ctx.createWaveShaper();
        this.driveNode.oversample = '4x';
        
        // Szalagos magnó EQ karakterisztika (mély emelés, magas vágás)
        this.headBump = ctx.createBiquadFilter();
        this.headBump.type = 'lowshelf';
        this.headBump.frequency.value = 80;
        this.headBump.gain.value = 1.5; 
        
        this.highRollOff = ctx.createBiquadFilter();
        this.highRollOff.type = 'lowpass';
        this.highRollOff.frequency.value = 15000;
        
        this.input.connect(this.headBump);
        this.headBump.connect(this.driveNode);
        this.driveNode.connect(this.highRollOff);
        this.highRollOff.connect(this.output);
        
        this.setDrive(0);
    }
    
    makeTapeCurve(amount) {
        let k = amount * 2; // 0-100 skálázása
        let n_samples = 44100;
        let curve = new Float32Array(n_samples);
        for (let i = 0; i < n_samples; ++i) {
            let x = i * 2 / n_samples - 1;
            // Tanh (hiperbolikus tangens) görbe a természetes analóg telítéshez
            curve[i] = Math.tanh(x * (1 + k / 10)); 
        }
        return curve;
    }
    
    setDrive(val) { this.driveNode.curve = this.makeTapeCurve(val); }
    setIPS(val) {
        // IPS (szalagsebesség): 15 ips jobban vágja a magasat és melegebb, 30 ips tisztább
        this.highRollOff.frequency.value = val === 15 ? 12000 : 18000;
        this.headBump.frequency.value = val === 15 ? 60 : 100;
    }
}

// --- 6. L-MAX Brickwall Maximizer (L2 Stílus) ---
class BrickwallMaximizer {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // 1. A bemenetet felerősítjük a küszöbérték (Threshold) alapján
        this.inputGain = ctx.createGain();

        // 2. Extrém gyors és agresszív kompresszor a fal (brickwall) képzésére
        this.limiter = ctx.createDynamicsCompressor();
        this.limiter.threshold.value = -0.1; // 0 dB körüli betonfal
        this.limiter.knee.value = 0;         // Hard knee
        this.limiter.ratio.value = 20;       // Max limitálás
        this.limiter.attack.value = 0.001;   // Azonnali
        this.limiter.release.value = 0.05;   // Gyors visszaállás

        // 3. A kimenetet pedig lehúzzuk a Ceiling (plafon) alapján
        this.ceilingGain = ctx.createGain();

        this.input.connect(this.inputGain);
        this.inputGain.connect(this.limiter);
        this.limiter.connect(this.ceilingGain);
        this.ceilingGain.connect(this.output);
    }

    setThreshold(val) {
        // Ha Threshold -10dB, akkor 10dB-t ERŐSÍTÜNK a limiter ELŐTT (mint a Waves L2-ben)
        let boostDb = Math.abs(val); 
        this.inputGain.gain.value = Math.pow(10, boostDb / 20);
    }

    setCeiling(val) {
        // A végső kimenet lehalkítása (pl. -0.1 dB True Peak védelem)
        this.ceilingGain.gain.value = Math.pow(10, val / 20);
    }
    
    setRelease(val) {
        // 0.01-től 1000 ms-ig
        this.limiter.release.value = val / 1000;
    }
}


// ==========================================================
// --- UI GENERÁTOROK ---
// ==========================================================

// --- NV73 UI ---
function createNV73UI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-nv73';
    wrapper.innerHTML = `
        <div class="nv73-header">N-73 PREAMP & EQ</div>
        <div class="nv73-panel">
            <div class="nv73-section"><div class="knob-container"><div class="knob red" data-param="drive" data-min="0" data-max="100" data-val="0"></div><div class="knob-value">0</div><div class="knob-label">Drive</div></div></div>
            <div class="nv73-section"><div class="knob-container"><div class="knob blue" data-param="hfGain" data-min="-16" data-max="16" data-val="0"></div><div class="knob-value">0 dB</div><div class="knob-label">High 12k</div></div></div>
            <div class="nv73-section"><div class="knob-container"><div class="knob blue" data-param="mfGain" data-min="-18" data-max="18" data-val="0"></div><div class="knob-value">0 dB</div><div class="knob-label">Mid Gain</div></div><div class="knob-container"><div class="knob grey" data-param="mfFreq" data-min="360" data-max="7200" data-val="1600" data-step="true" data-steps="360,700,1600,3200,4800,7200"></div><div class="knob-value">1.6k</div><div class="knob-label">Mid Hz</div></div></div>
            <div class="nv73-section"><div class="knob-container"><div class="knob blue" data-param="lfGain" data-min="-16" data-max="16" data-val="0"></div><div class="knob-value">0 dB</div><div class="knob-label">Low Gain</div></div><div class="knob-container"><div class="knob grey" data-param="lfFreq" data-min="35" data-max="220" data-val="60" data-step="true" data-steps="35,60,110,220"></div><div class="knob-value">60 Hz</div><div class="knob-label">Low Hz</div></div></div>
            <div class="nv73-section"><div class="knob-container"><div class="knob grey" data-param="hpf" data-min="10" data-max="300" data-val="10" data-step="true" data-steps="10,50,80,160,300"></div><div class="knob-value">OFF</div><div class="knob-label">HPF</div></div><div class="knob-container"><div class="knob grey" data-param="trim" data-min="-24" data-max="24" data-val="0"></div><div class="knob-value">0 dB</div><div class="knob-label">Trim</div></div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'nv73');
    return wrapper;
}

// --- LA-2A UI ---
function createLA2AUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-la2a';
    wrapper.innerHTML = `
        <div class="la2a-header">TELETRONIX<span>LEVELING AMPLIFIER</span></div>
        <div class="la2a-panel">
            
            <div class="la2a-section">
                <div class="knob-container">
                    <div class="knob black" data-param="gain" data-min="0" data-max="100" data-val="0"></div>
                    <div class="knob-value">0</div>
                    <div class="knob-label">GAIN</div>
                </div>
            </div>

            <div class="la2a-section" style="flex-direction: row; gap: 5px;">
                <div class="switch-labels"><span>LIMIT</span><span>COMP</span></div>
                <div class="toggle-switch" data-val="compress"></div>
            </div>

            <div class="la2a-section">
                <div class="knob-container">
                    <div class="knob black" data-param="peakReduction" data-min="0" data-max="100" data-val="0"></div>
                    <div class="knob-value">0</div>
                    <div class="knob-label">PEAK REDUCTION</div>
                </div>
            </div>

        </div>
    `;

    // LA-2A Kapcsoló esemény
    const toggle = wrapper.querySelector('.toggle-switch');
    toggle.addEventListener('click', () => {
        const current = toggle.dataset.val;
        const next = current === 'compress' ? 'limit' : 'compress';
        toggle.dataset.val = next;
        pluginInstance.setMode(next);
    });

    setupKnobs(wrapper, pluginInstance, 'la2a');
    return wrapper;
}

// --- BRIT 800 UI ---
function createBritUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-brit';
    wrapper.innerHTML = `
        <div class="amp-header brit-header">BRITISH 800<span>LEAD SERIES</span></div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob amp-gold" data-param="drive" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">PRE-AMP</div></div>
            <div class="knob-container"><div class="knob amp-gold" data-param="bass" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">BASS</div></div>
            <div class="knob-container"><div class="knob amp-gold" data-param="mid" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">MIDDLE</div></div>
            <div class="knob-container"><div class="knob amp-gold" data-param="treble" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">TREBLE</div></div>
            <div class="knob-container"><div class="knob amp-gold" data-param="presence" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">PRESENCE</div></div>
            <div class="knob-container"><div class="knob amp-gold" data-param="volume" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">MASTER</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'amp');
    return wrapper;
}

// --- DJENT 51 UI ---
function createDjentUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-djent';
    wrapper.innerHTML = `
        <div class="amp-header djent-header">DJENT 51<span>HIGH GAIN TERROR</span></div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob amp-black" data-param="drive" data-min="0" data-max="100" data-val="70"></div><div class="knob-value">70</div><div class="knob-label">GAIN</div></div>
            <div class="knob-container"><div class="knob amp-black" data-param="bass" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">LOW</div></div>
            <div class="knob-container"><div class="knob amp-black" data-param="mid" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">MID</div></div>
            <div class="knob-container"><div class="knob amp-black" data-param="treble" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">HIGH</div></div>
            <div class="knob-container"><div class="knob amp-black" data-param="depth" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">DEPTH</div></div>
            <div class="knob-container"><div class="knob amp-black" data-param="volume" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">VOLUME</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'amp');
    return wrapper;
}

// --- TAPE UI ---
function createTapeUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-tape';
    wrapper.innerHTML = `
        <div class="tape-header">STUDIO TAPE MACHINE</div>
        <div class="tape-panel">
            <div class="knob-container"><div class="knob tape-gold" data-param="drive" data-min="0" data-max="100" data-val="0"></div><div class="knob-value">0</div><div class="knob-label">SATURATION</div></div>
            <div class="knob-container"><div class="knob tape-gold" data-param="ips" data-min="15" data-max="30" data-val="30" data-step="true" data-steps="15,30"></div><div class="knob-value">30 IPS</div><div class="knob-label">SPEED</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'tape');
    return wrapper;
}

// --- MAXIMIZER UI ---
function createMaximizerUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-maximizer';
    wrapper.innerHTML = `
        <div class="max-header">L-MAX LIMITER</div>
        <div class="max-panel">
            <div class="max-slider-wrap">
                <div class="max-val" id="max-thresh-val">0.0 dB</div>
                <input type="range" class="max-slider" min="-30" max="0" step="0.1" value="0" id="max-thresh">
                <div class="max-label">THRESHOLD</div>
            </div>
            <div class="max-slider-wrap">
                <div class="max-val" id="max-ceil-val">0.0 dB</div>
                <input type="range" class="max-slider" min="-30" max="0" step="0.1" value="0" id="max-ceil">
                <div class="max-label">CEILING</div>
            </div>
        </div>
    `;
    
    // A Maximizer csúszkáinak eseménykezelése
    wrapper.querySelector('#max-thresh').addEventListener('input', (e) => {
        wrapper.querySelector('#max-thresh-val').textContent = parseFloat(e.target.value).toFixed(1) + ' dB';
        pluginInstance.setThreshold(e.target.value);
    });
    wrapper.querySelector('#max-ceil').addEventListener('input', (e) => {
        wrapper.querySelector('#max-ceil-val').textContent = parseFloat(e.target.value).toFixed(1) + ' dB';
        pluginInstance.setCeiling(e.target.value);
    });

    return wrapper;
}

// --- KÖZÖS POTMÉTER LOGIKA ---
function setupKnobs(wrapper, pluginInstance, type) {
    const knobs = wrapper.querySelectorAll('.knob');
    let activeKnob = null; let startY = 0; let startVal = 0;

    // --- INTERAKCIÓ INDÍTÁSA (Egér + Érintés) ---
    const startDrag = (e, knob) => {
        if(e.cancelable) e.preventDefault(); // Megakadályozza a görgetést
        activeKnob = knob; 
        // Megnézzük, hogy touch esemény-e, vagy egér
        startY = e.touches ? e.touches[0].clientY : e.clientY; 
        startVal = parseFloat(knob.dataset.val);
        document.body.style.cursor = 'ns-resize';
    };

    knobs.forEach(knob => {
        updateKnobVisuals(knob, parseFloat(knob.dataset.val), type);
        knob.addEventListener('mousedown', (e) => startDrag(e, knob));
        knob.addEventListener('touchstart', (e) => startDrag(e, knob), {passive: false});
    });

    // --- HÚZÁS KEZELÉSE ---
    const moveDrag = (e) => {
        if (!activeKnob || !wrapper.contains(activeKnob)) return;
        e.preventDefault(); // Ne görgessen az oldal tekerés közben!
        
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const min = parseFloat(activeKnob.dataset.min); const max = parseFloat(activeKnob.dataset.max);
        const param = activeKnob.dataset.param; const isStep = activeKnob.dataset.step === 'true';
        
        let deltaY = startY - clientY;
        let newVal = startVal + (deltaY * ((max - min) / 150)); 
        
        if (newVal < min) newVal = min; if (newVal > max) newVal = max;
        if (isStep) {
            const steps = activeKnob.dataset.steps.split(',').map(Number);
            newVal = steps.reduce((prev, curr) => Math.abs(curr - newVal) < Math.abs(prev - newVal) ? curr : prev);
        }

        activeKnob.dataset.val = newVal;
        updateKnobVisuals(activeKnob, newVal, type);

        // DSP Hívások
        if (type === 'nv73') {
            if (param === 'drive') pluginInstance.setDrive(newVal);
            else if (param === 'hfGain') pluginInstance.setHfGain(newVal);
            else if (param === 'mfGain') pluginInstance.setMfGain(newVal);
            else if (param === 'lfGain') pluginInstance.setLfGain(newVal);
            else if (param === 'trim') pluginInstance.setTrim(newVal);
            else if (param === 'mfFreq') pluginInstance.setMfFreq(newVal);
            else if (param === 'lfFreq') pluginInstance.setLfFreq(newVal);
            else if (param === 'hpf') pluginInstance.setHpf(newVal);
        } else if (type === 'la2a') {
            if (param === 'gain') pluginInstance.setGain(newVal);
            else if (param === 'peakReduction') pluginInstance.setPeakReduction(newVal);
        } else if (type === 'tape') {
            if (param === 'drive') pluginInstance.setDrive(newVal);
            else if (param === 'ips') pluginInstance.setIPS(newVal);
        } else if (type === 'amp') {
            if (param === 'drive') pluginInstance.setDrive(newVal);
            else if (param === 'bass') pluginInstance.setBass(newVal);
            else if (param === 'mid') pluginInstance.setMid(newVal);
            else if (param === 'treble') pluginInstance.setTreble(newVal);
            else if (param === 'presence') pluginInstance.setPresence?.(newVal);
            else if (param === 'depth') pluginInstance.setDepth?.(newVal);
            else if (param === 'volume') pluginInstance.setVolume(newVal);
        }
    };

    // --- INTERAKCIÓ BEFEJEZÉSE ---
    const endDrag = () => { 
        activeKnob = null; 
        document.body.style.cursor = ''; 
    };

    // Eseményfigyelők rögzítése a teljes dokumentumra
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag, {passive: false});

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
}

function updateKnobVisuals(knob, val, type) {
    const min = parseFloat(knob.dataset.min); const max = parseFloat(knob.dataset.max);
    const param = knob.dataset.param; const valDisplay = knob.nextElementSibling;
    
    const percent = (val - min) / (max - min);
    const degree = -135 + (percent * 270);
    knob.style.transform = `rotate(${degree}deg)`;

    if (type === 'nv73') {
        if (param === 'hpf' && val === 10) valDisplay.textContent = 'OFF';
        else if (param.includes('Freq') || param === 'hpf') valDisplay.textContent = val >= 1000 ? (val/1000).toFixed(1) + 'k' : val + ' Hz';
        else if (param === 'drive') valDisplay.textContent = Math.round(val);
        else valDisplay.textContent = (val > 0 ? '+' : '') + Math.round(val) + ' dB';
    } else if (type === 'la2a') {
        valDisplay.textContent = Math.round(val);
    } else if (type === 'tape') {
        // --- ÚJ: Tape Saturator vizuális frissítése ---
        if (param === 'ips') valDisplay.textContent = Math.round(val) + ' IPS';
        else valDisplay.textContent = Math.round(val);
    }
}

// ==========================================================
// --- FX LÁNC ÉS ABLAK KEZELŐ ---
// ==========================================================

const modalHTML = `
    <div id="fx-modal-overlay">
        <div id="fx-modal">
            <div class="fx-header">
                <h2 id="fx-track-title">Track FX</h2>
                <button class="close-fx">×</button>
            </div>
            <div class="fx-body">
                <div class="fx-chain-sidebar">
                    <div id="fx-list"></div>
                    <div class="add-fx-wrap">
                        <button class="add-fx-btn" id="add-fx-btn">+ Add Plugin</button>
                        <div id="plugin-picker">
                            <button class="plugin-pick-btn" data-plugin="nv73">N-73 Preamp & EQ</button>
                            <button class="plugin-pick-btn" data-plugin="la2a">L-2A Leveler</button>
                            <button class="plugin-pick-btn" data-plugin="brit">Brit 800 Amp</button>
                            <button class="plugin-pick-btn" data-plugin="djent">Djent 51 Amp</button>
                            <button class="plugin-pick-btn" data-plugin="tape">Vintage Tape Sat</button>
                            <button class="plugin-pick-btn" data-plugin="maximizer">L-MAX Brickwall</button>
                        </div>
                    </div>
                </div>
                <div class="fx-plugin-area" id="fx-plugin-area">
                    <div style="color:#555; font-family:monospace;">Select or Add a plugin...</div>
                </div>
            </div>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

const fxOverlay = document.getElementById('fx-modal-overlay');
const fxList = document.getElementById('fx-list');
const fxArea = document.getElementById('fx-plugin-area');
const pluginPicker = document.getElementById('plugin-picker');
let currentTrackId = null;

document.addEventListener('click', (e) => {
    // 1. Felugró ablak megnyitása a track VAGY a master gombjára
    if (e.target.classList.contains('track-inserts') || e.target.classList.contains('mix-inserts')) {
        const isMaster = e.target.classList.contains('mix-inserts');
        const track = isMaster ? e.target.closest('.master-channel') : e.target.closest('.track-container');
        currentTrackId = track.dataset.trackId;
        
        const titleText = isMaster ? 'MASTER BUS' : track.querySelector('.track-name').textContent;
        document.getElementById('fx-track-title').textContent = titleText + ' - Inserts';
        fxOverlay.style.display = 'flex';
        pluginPicker.classList.remove('show');
        
        // Ha még nem inicializáltuk az FX láncot ezen a sávon
        if (!track.fxInputNode) {
            track.fxInputNode = audioCtx.createGain();
            track.fxOutputNode = audioCtx.createGain();
            track.fxInputNode.connect(track.fxOutputNode);
            track.fxChain = []; 
            
            if (isMaster) {
                // MASTER SÁV ROUTING: Panner -> [FX] -> Analyser
                if (typeof masterPanner !== 'undefined') {
                    masterPanner.disconnect();
                    masterPanner.connect(track.fxInputNode);
                    track.fxOutputNode.connect(masterAnalyser); // masterAnalyser-be megy vissza!
                }
            } else {
                // NORMÁL SÁV ROUTING
                track.trackPannerNode.disconnect(); 
                track.trackPannerNode.connect(track.fxInputNode);
                track.fxOutputNode.connect(track.trackGainNode);
            }
        }
        renderFxList(track);

        if (track.fxChain.length > 0) {
            openPluginUI(track, 0);
            setTimeout(() => {
                const firstSlot = document.querySelector('.fx-slot');
                if (firstSlot) firstSlot.classList.add('active');
            }, 10);
        } else {
            fxArea.innerHTML = '<div style="color:#555; font-family:var(--font-mono); font-size: 0.9rem;">Select or Add a plugin...</div>';
        }
    }

    // 2. Bezárás
    if (e.target.classList.contains('close-fx') || e.target === fxOverlay) {
        fxOverlay.style.display = 'none';
        pluginPicker.classList.remove('show');
    }

    // 3. Plugin választó menü nyitás/zárás
    if (e.target.id === 'add-fx-btn') {
        pluginPicker.classList.toggle('show');
    } else if (!e.target.classList.contains('plugin-pick-btn')) {
        pluginPicker.classList.remove('show');
    }

    // 4. Plugin kiválasztása a listából
    if (e.target.classList.contains('plugin-pick-btn')) {
        const pluginType = e.target.dataset.plugin;
        const track = currentTrackId === 'master' 
            ? document.querySelector('.master-channel') 
            : document.querySelector(`.track-container[data-track-id="${currentTrackId}"]`);
        
        let plugin, ui, name;
        if (pluginType === 'nv73') {
            plugin = new NV73Preamp(audioCtx); ui = createNV73UI(plugin); name = 'N-73 Preamp';
        } else if (pluginType === 'la2a') {
            plugin = new LA2ACompressor(audioCtx); ui = createLA2AUI(plugin); name = 'LA-2A Leveler';
        } else if (pluginType === 'tape') {
            plugin = new TapeSaturator(audioCtx); ui = createTapeUI(plugin); name = 'Vintage Tape';
        } else if (pluginType === 'brit') {
            plugin = new Brit800Amp(audioCtx); ui = createBritUI(plugin); name = 'Brit 800';
        } else if (pluginType === 'djent') {
            plugin = new Djent51Amp(audioCtx); ui = createDjentUI(plugin); name = 'Djent 51';
        } else if (pluginType === 'maximizer') {
            plugin = new BrickwallMaximizer(audioCtx); ui = createMaximizerUI(plugin); name = 'L-MAX Limiter';
        }
        
        track.fxChain.push({ name, instance: plugin, ui });
        rebuildFxRouting(track);
        renderFxList(track);
        openPluginUI(track, track.fxChain.length - 1);
        pluginPicker.classList.remove('show');
    }
});

function renderFxList(track) {
    fxList.innerHTML = '';
    
    // Változó a húzott elem indexének tárolására
    let draggedIndex = null;

    track.fxChain.forEach((fx, index) => {
        const slot = document.createElement('div');
        slot.className = 'fx-slot';
        
        // --- DRAG AND DROP AKTIVÁLÁSA ---
        slot.setAttribute('draggable', 'true');
        
        slot.innerHTML = `<span>${fx.name}</span> <span style="color: var(--accent); font-size: 1.1em; transition: text-shadow 0.2s;" onmouseover="this.style.textShadow='0 0 8px var(--accent)'" onmouseout="this.style.textShadow='none'">×</span>`;
        
        // 1. Amikor elkezdjük húzni
        slot.addEventListener('dragstart', (e) => {
            draggedIndex = index;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', 'fx-plugin'); // Kötelező a Firefoxhoz
            setTimeout(() => slot.style.opacity = '0.4', 0); // Vizuális visszajelzés
        });

        // 2. Amikor egy másik elem fölé érünk húzás közben
        slot.addEventListener('dragover', (e) => {
            e.preventDefault(); // Ez engedélyezi, hogy rá lehessen dobni
            e.dataTransfer.dropEffect = 'move';
            
            // Ha nem önmaga fölött van, mutassunk egy vonalat, ahova kerülni fog
            if (draggedIndex !== index) {
                slot.style.borderTop = '2px solid var(--accent)'; 
            }
        });

        // 3. Amikor elhagyjuk az elemet húzás közben
        slot.addEventListener('dragleave', () => {
            slot.style.borderTop = ''; // Vonal eltüntetése
        });

        // 4. Amikor ráengedjük (DROP)
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.style.borderTop = '';
            
            const dropIndex = index;
            
            // Ha tényleg elmozdítottuk (nem ugyanoda engedtük el)
            if (draggedIndex !== null && draggedIndex !== dropIndex) {
                
                // 1. Kivesszük az eredeti helyéről
                const draggedItem = track.fxChain.splice(draggedIndex, 1)[0];
                
                // 2. Beszúrjuk az új helyére
                track.fxChain.splice(dropIndex, 0, draggedItem);
                
                // 3. AUDIÓ JELÚT ÚJRAÉPÍTÉSE AZ ÚJ SORREND ALAPJÁN!
                rebuildFxRouting(track);
                
                // 4. Újrarajzoljuk a listát
                renderFxList(track);
                
                // 5. Automatikusan megnyitjuk és kijelöljük a mozgatott plugint
                openPluginUI(track, dropIndex);
                setTimeout(() => {
                    const slots = document.querySelectorAll('.fx-slot');
                    slots.forEach(s => s.classList.remove('active'));
                    if(slots[dropIndex]) slots[dropIndex].classList.add('active');
                }, 10);
            }
        });

        // 5. Húzás befejezése (Takarítás)
        slot.addEventListener('dragend', () => {
            slot.style.opacity = '1';
            document.querySelectorAll('.fx-slot').forEach(s => s.style.borderTop = '');
        });

        // --- KLIKK ESEMÉNYEK (Megnyitás / Törlés) ---
        slot.onclick = (e) => {
            if (e.target.tagName === 'SPAN' && e.target.textContent === '×') {
                track.fxChain.splice(index, 1);
                rebuildFxRouting(track);
                fxArea.innerHTML = '<div style="color:#555; font-family:var(--font-mono); font-size: 0.9rem;">Select or Add a plugin...</div>';
                renderFxList(track);
            } else {
                document.querySelectorAll('.fx-slot').forEach(s => s.classList.remove('active'));
                slot.classList.add('active');
                openPluginUI(track, index);
            }
        };
        fxList.appendChild(slot);
    });

    // --- ZÖLDÍTÉS LOGIKA ---
    const insertBtn = track.classList.contains('master-channel') ? track.querySelector('.mix-inserts') : track.querySelector('.track-inserts');
    if (insertBtn) {
        if (track.fxChain.length > 0) {
            insertBtn.style.color = '#00ffd5';
            insertBtn.style.borderColor = 'rgba(0, 255, 213, 0.4)';
            insertBtn.style.background = 'rgba(0, 255, 213, 0.05)';
        } else {
            insertBtn.style.color = '';
            insertBtn.style.borderColor = '';
            insertBtn.style.background = '';
        }
    }
}

function openPluginUI(track, index) {
    fxArea.innerHTML = '';
    fxArea.appendChild(track.fxChain[index].ui);
}

function rebuildFxRouting(track) {
    track.fxInputNode.disconnect();
    track.fxChain.forEach(fx => {
        fx.instance.output.disconnect();
    });

    if (track.fxChain.length === 0) {
        track.fxInputNode.connect(track.fxOutputNode);
    } else {
        let currentNode = track.fxInputNode;
        for (let i = 0; i < track.fxChain.length; i++) {
            currentNode.connect(track.fxChain[i].instance.input);
            currentNode = track.fxChain[i].instance.output;
        }
        currentNode.connect(track.fxOutputNode);
    }
}
