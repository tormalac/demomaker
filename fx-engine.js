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
        display: flex; flex: 1; flex-direction: row; 
        overflow: visible;
    }
    
    /* FX Lánc (Bal oldal) */
    .fx-chain-sidebar { 
        width: 200px; background: #0a0a0a; border-right: 1px solid #333; 
        padding: 10px; display: flex; flex-direction: column; flex-shrink: 0; 
        position: relative; 
        z-index: 100;       
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
    /* Plugin Választó Menü */
    .add-fx-wrap { 
        position: relative; 
        width: 100%; 
        box-sizing: border-box; 
        margin-bottom: 10px; /* Egy kis hely, mielőtt jönnek a hozzáadott pluginok */
        z-index: 200; /* Magasabbra emeljük, hogy a legördülő menü minden felett legyen */
    }
    .add-fx-btn {
        width: 100%; background: transparent; border: 1px solid #555; color: #888;
        padding: 8px; cursor: pointer; font-family: var(--font-mono); font-size: 0.8rem;
        box-sizing: border-box; 
    }
    .add-fx-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,255,213,0.05); }
    
    #plugin-picker {
        display: none; 
        position: absolute; /* VISSZAKAPTA A LEBEGÉST! */
        top: 100%; left: 0; width: 100%;
        background: #000; border: 1px solid var(--accent-soft); 
        margin-top: 4px; box-sizing: border-box; 
        z-index: 9999; 
        box-shadow: 0 15px 40px rgba(0,0,0,0.95);
        border-radius: 4px;
        overflow: hidden;
    }
    #plugin-picker.show { display: block; }
    .plugin-pick-btn {
        width: 100%; background: transparent; border: none; color: #fff;
        padding: 10px; cursor: pointer; font-family: var(--font-mono); font-size: 0.8rem; text-align: left;
        box-sizing: border-box;
    }
    .plugin-pick-btn:hover { background: rgba(0,255,213,0.1); color: var(--accent); }
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

/* --- DBX 160 UI (Punch Comp) --- */
    .plugin-dbx {
        background: #111; border: 2px solid #333; border-radius: 4px; border-top: 15px solid #000;
        width: 100%; max-width: 400px; padding: 25px 20px;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.7);
    }
    .dbx-header { text-align: center; color: #fff; font-family: 'Arial Black', sans-serif; font-size: 1.5rem; letter-spacing: 2px; margin-bottom: 20px;}
    .dbx-header span { color: #d00; font-size: 1rem; vertical-align: super;}
    .plugin-dbx .knob-label { color: #ccc; }
    .plugin-dbx .knob-value { color: #fff; font-family: var(--font-mono); }
    .knob.dbx-knob { background: #222; border: 1px solid #555; width: 45px; height: 45px; }

    /* --- SSL G BUS COMP UI --- */
    .plugin-ssl {
        background: #2b2e33; border: 2px solid #1a1c1f; border-radius: 2px;
        width: 100%; max-width: 550px; padding: 20px;
        box-shadow: inset 0 0 15px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.7);
    }
    .ssl-header { text-align: center; color: #e0e0e0; font-family: Arial, sans-serif; font-weight: bold; font-size: 1.2rem; letter-spacing: 1px; margin-bottom: 25px; border-bottom: 1px solid #111; padding-bottom: 10px;}
    .plugin-ssl .knob-label { color: #b0b0b0; font-size: 8px;}
    .plugin-ssl .knob-value { color: #fff; }
    .knob.ssl-blue { background: #254b73; border: 2px solid #111; width: 40px; height: 40px;}
    .knob.ssl-red { background: #8a2525; border: 2px solid #111; width: 40px; height: 40px;}
    .knob.ssl-grey { background: #555; border: 2px solid #111; width: 40px; height: 40px;}

    /* --- ROLAND RE-201 SPACE ECHO UI --- */
    .plugin-re201 {
        background: #1a1a1a; border: 2px solid #000; border-radius: 4px;
        width: 100%; max-width: 550px; padding: 20px;
        box-shadow: inset 0 0 30px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.7);
        border-bottom: 15px solid #111;
    }
    .re201-header { text-align: left; color: #00ff66; font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 1.4rem; letter-spacing: 1px; margin-bottom: 25px;}
    .re201-header span { color: #ccc; font-size: 0.8rem; letter-spacing: 3px; display: block; margin-top: 5px;}
    .plugin-re201 .knob-label { color: #00ff66; font-family: 'Courier New', Courier, monospace; font-weight: normal;}
    .plugin-re201 .knob-value { color: #fff; }
    .knob.re-knob { background: radial-gradient(circle at 50% 50%, #333, #000); border: 1px solid #444; width: 50px; height: 50px; }
    .knob.re-knob::after { background: #00ff66; width: 3px; height: 10px; top: 8px;}
   
    /* --- LEXICON 224 REVERB UI --- */
    .plugin-lexicon {
        background: #e6e4dc; border: 2px solid #ccc; border-radius: 4px;
        width: 100%; max-width: 500px; padding: 25px 20px;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.7);
    }
    .lexicon-header { text-align: left; color: #111; font-family: 'Arial', sans-serif; font-weight: 900; font-size: 1.6rem; letter-spacing: -1px; margin-bottom: 25px; border-bottom: 2px solid #111; padding-bottom: 5px;}
    .lexicon-header span { font-size: 0.9rem; font-weight: normal; margin-left: 10px; letter-spacing: 1px;}
    .plugin-lexicon .knob-label { color: #333; font-weight: bold;}
    .plugin-lexicon .knob-value { color: #111; background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 2px;}
    .knob.lex-knob { background: #f4f4f4; border: 1px solid #aaa; width: 45px; height: 45px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);}
    .knob.lex-knob::after { background: #222; width: 3px; height: 12px;}

    /* --- JUNO-60 CHORUS UI --- */
    .plugin-juno {
        background: #111; border: 2px solid #222; border-top: 10px solid #222; border-bottom: 10px solid #222;
        width: 100%; max-width: 450px; padding: 20px;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.7);
        position: relative;
    }
    .plugin-juno::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #d00, #ff8c00, #ffd93d, #00ffd5, #3fa9f5); }
    .juno-header { text-align: right; color: #fff; font-family: 'Arial Black', sans-serif; font-size: 1.2rem; letter-spacing: 2px; margin-bottom: 25px;}
    .plugin-juno .knob-label { color: #ccc; }
    .plugin-juno .knob-value { color: #00ffd5; }
    .knob.juno-knob { background: #1a1a1a; border: 1px solid #333; width: 40px; height: 40px; }
    .knob.juno-knob::after { background: #fff; width: 2px; height: 10px;}

    /* --- MXR PHASE 90 UI --- */
    .plugin-mxr {
        background: #f05a28; border: 2px solid #c03a08; border-radius: 8px;
        width: 100%; max-width: 250px; padding: 40px 20px;
        box-shadow: inset 0 0 15px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.7);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .mxr-header { text-align: center; color: #111; font-family: 'Brush Script MT', cursive, sans-serif; font-size: 2.5rem; margin-bottom: 30px; transform: rotate(-3deg);}
    .plugin-mxr .knob-label { color: #111; font-size: 14px;}
    .plugin-mxr .knob-value { color: #fff; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px; margin-bottom: 10px;}
    .knob.mxr-knob { background: #111; border: 2px solid #222; width: 70px; height: 70px; }
    .knob.mxr-knob::after { background: #fff; width: 4px; height: 15px; top: 5px;}

    /* --- IBANEZ TS808 TUBE SCREAMER UI --- */
    .plugin-ts808 {
        background: #4caf50; border: 2px solid #2e7d32; border-radius: 6px;
        width: 100%; max-width: 300px; padding: 25px 20px;
        box-shadow: inset 0 0 15px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.7);
    }
    .ts808-header { text-align: center; color: #fff; font-family: Arial, sans-serif; font-style: italic; font-weight: bold; font-size: 1.5rem; letter-spacing: 1px; margin-bottom: 25px; text-shadow: 1px 1px 2px #000;}
    .plugin-ts808 .knob-label { color: #fff; text-shadow: 1px 1px 1px #000; font-size: 10px; margin-top: 8px;}
    .plugin-ts808 .knob-value { color: #fff; background: rgba(0,0,0,0.3); padding: 2px 5px; border-radius: 2px;}
    .knob.ts-knob { background: #111; border: 1px solid #000; width: 45px; height: 45px; }

    /* --- BIG MUFF PI UI --- */
    .plugin-muff {
        background: #dcdcdc; border: 2px solid #aaa; border-radius: 4px;
        width: 100%; max-width: 350px; padding: 30px 20px;
        box-shadow: inset 0 0 20px rgba(255,255,255,0.5), 0 10px 30px rgba(0,0,0,0.7);
        background-image: radial-gradient(circle, #e8e8e8, #c4c4c4);
    }
    .muff-header { text-align: center; color: #d00; font-family: 'Arial Black', sans-serif; font-size: 1.8rem; letter-spacing: -1px; margin-bottom: 30px; text-transform: uppercase; text-shadow: 1px 1px 0px #fff;}
    .muff-header span { color: #000; font-size: 1rem; vertical-align: super; font-family: serif;}
    .plugin-muff .knob-label { color: #000; font-weight: 900; font-family: sans-serif; font-size: 11px;}
    .plugin-muff .knob-value { color: #d00; font-weight: bold;}
    .knob.muff-knob { background: #111; border: 2px solid #444; width: 55px; height: 55px; box-shadow: 0 5px 10px rgba(0,0,0,0.5);}

    /* --- MXR M-117 FLANGER UI --- */
    .plugin-flanger {
        background: #333; border: 2px solid #111; border-radius: 4px;
        width: 100%; max-width: 350px; padding: 25px;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.7);
    }
    .flanger-header { text-align: left; color: #fff; font-family: 'Arial Black', sans-serif; font-size: 1.5rem; margin-bottom: 25px; font-style: italic;}
    .plugin-flanger .knob-label { color: #aaa; font-size: 9px;}
    .plugin-flanger .knob-value { color: #fff; }

    /* --- Q-TRON ENVELOPE FILTER UI --- */
    .plugin-qtron {
        background: #a3b8c7; border: 2px solid #5a6e7a; border-radius: 8px;
        width: 100%; max-width: 350px; padding: 30px;
        box-shadow: inset 0 0 15px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.7);
    }
    .qtron-header { text-align: center; color: #222; font-family: 'Arial Black', sans-serif; font-size: 1.8rem; margin-bottom: 25px; letter-spacing: 2px;}
    .plugin-qtron .knob-label { color: #222; font-weight: bold; font-size: 10px;}
    .plugin-qtron .knob-value { color: #222; background: rgba(255,255,255,0.5); padding: 2px 4px; border-radius: 2px;}
    .knob.q-knob { background: #111; border: 2px solid #333; width: 50px; height: 50px;}
    
`;
document.head.appendChild(fxStyles);

// ==========================================================
// --- DSP OSZTÁLYOK ---
// ==========================================================

// ==========================================================
// --- SYNTH ENGINE: VIRTUAL ANALOG DRUM MACHINE (MULTI-PRESET) ---
// ==========================================================

class AnalogDrumMachine {
    constructor(ctx) {
        this.ctx = ctx;
        this.noiseBuffer = this.createNoiseBuffer();
        this.setPreset('TR-808 (Deep)'); // Alapértelmezett legenda!
    }

    // --- ÚJ: DOBGÉP VÁLASZTÓ MOTOR ---
    setPreset(presetName) {
        this.preset = presetName;
    }

    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2; 
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1; 
        return buffer;
    }

    playNote(midiNote, time, velocity = 100, destinationNode, presetName = null) {
        if (presetName) this.setPreset(presetName);

        const vel = velocity / 127; 
        const dest = destinationNode || this.ctx.destination; 
        
        if (midiNote === 36) return this.playKick(time, vel, dest);
        else if (midiNote === 38) return this.playSnare(time, vel, dest);
        else if (midiNote === 42) return this.playHiHat(time, vel, 0.05, dest); 
        else if (midiNote === 46) return this.playHiHat(time, vel, 0.3, dest);  
        else if (midiNote === 48) return this.playTom(time, vel, 200, dest);    
        else if (midiNote === 45) return this.playTom(time, vel, 130, dest);    
        else if (midiNote === 41) return this.playTom(time, vel, 80, dest);     
        else if (midiNote === 49) return this.playCrash(time, vel, dest);       
        else if (midiNote === 51) return this.playRide(time, vel, dest);
        return [];
    }

    playKick(time, velocity, dest) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(dest); 
        osc.type = 'sine';

        // --- STÍLUS FÜGGŐ LÁBDOB ---
        if (this.preset === 'TR-808 (Deep)') {
            // Hosszú, mély, szubos bumm
            osc.frequency.setValueAtTime(120, time);
            osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
            gain.gain.setValueAtTime(velocity, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8); // Nagyon hosszú lecsengés
            osc.start(time); osc.stop(time + 0.9);
        } 
        else if (this.preset === 'TR-909 (Punchy)') {
            // Rövid, nagyon agresszív kattanással induló lábdob
            osc.frequency.setValueAtTime(250, time);
            osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);
            gain.gain.setValueAtTime(velocity, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3); // Rövid, feszes
            osc.start(time); osc.stop(time + 0.4);
        }
        else {
            // Synthwave / Retro
            osc.type = 'triangle'; // Kicsit "műanyagosabb"
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);
            gain.gain.setValueAtTime(velocity, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
            osc.start(time); osc.stop(time + 0.5);
        }
        return [osc];
    }

    playSnare(time, velocity, dest) {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.connect(oscGain); oscGain.connect(dest); 

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        const noiseGain = this.ctx.createGain();
        noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(dest); 

        // --- STÍLUS FÜGGŐ PERGŐ ---
        if (this.preset === 'TR-808 (Deep)') {
            // Vékony, pattanós (magasabb test)
            osc.frequency.setValueAtTime(250, time);
            oscGain.gain.setValueAtTime(velocity * 0.5, time);
            oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            noiseFilter.type = 'highpass'; noiseFilter.frequency.value = 2000;
            noiseGain.gain.setValueAtTime(velocity * 0.8, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
            osc.start(time); osc.stop(time + 0.15);
            noise.start(time); noise.stop(time + 0.25);
        } 
        else if (this.preset === 'TR-909 (Punchy)') {
            // Vastag, zizegős, "csapkodós" pergő
            osc.frequency.setValueAtTime(180, time);
            oscGain.gain.setValueAtTime(velocity * 0.7, time);
            oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 1500; noiseFilter.Q.value = 0.5;
            noiseGain.gain.setValueAtTime(velocity, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.35); // Hosszabb zizegés
            osc.start(time); osc.stop(time + 0.2);
            noise.start(time); noise.stop(time + 0.4);
        }
        else {
            // Synthwave (Lézeres hatás)
            osc.frequency.setValueAtTime(400, time);
            osc.frequency.exponentialRampToValueAtTime(100, time + 0.15); // Pew-pew effekt!
            oscGain.gain.setValueAtTime(velocity * 0.6, time);
            oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
            noiseFilter.type = 'highpass'; noiseFilter.frequency.value = 1000;
            noiseGain.gain.setValueAtTime(velocity * 0.7, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
            osc.start(time); osc.stop(time + 0.25);
            noise.start(time); noise.stop(time + 0.3);
        }
        return [osc, noise];
    }

    playHiHat(time, velocity, decay, dest) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass'; 
        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass'; 
        const gain = this.ctx.createGain();
        noise.connect(bandpass); bandpass.connect(highpass); highpass.connect(gain); gain.connect(dest); 

        // --- STÍLUS FÜGGŐ HI-HAT ---
        if (this.preset === 'TR-808 (Deep)') {
            bandpass.frequency.value = 10000; highpass.frequency.value = 7000;
        } else if (this.preset === 'TR-909 (Punchy)') {
            bandpass.frequency.value = 8000; highpass.frequency.value = 4000; // Kicsit vastagabb, fémesebb
        } else {
            bandpass.frequency.value = 12000; highpass.frequency.value = 8000; // Nagyon sziszegős retro
        }

        gain.gain.setValueAtTime(velocity * 0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
        noise.start(time); noise.stop(time + decay + 0.1);
        return [noise];
    }

    // A Tomok is megkapják a "Pew-Pew" effektet a Synthwave-hez!
    playTom(time, velocity, freq, dest) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(dest);
        osc.type = this.preset === 'Synthwave' ? 'square' : 'sine'; // A retro műanyag tomnak négyszögjel áll jól!
        
        const endFreq = this.preset === 'Synthwave' ? freq * 0.1 : freq * 0.2; // Mélyebbre esik a hangja
        const dropTime = this.preset === 'Synthwave' ? 0.15 : 0.3; // Gyorsabban esik a pitch

        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + dropTime);
        gain.gain.setValueAtTime(velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
        osc.start(time); osc.stop(time + 0.7);
        return [osc];
    }

    // A Crash és a Ride marad az eredeti "generikus" (azok nagyon jól szólnak), 
    // de később azokat is lehet finomhangolni.
    playCrash(time, velocity, dest) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 7000; filter.Q.value = 0.5;
        const gain = this.ctx.createGain();
        noise.connect(filter); filter.connect(gain); gain.connect(dest);
        gain.gain.setValueAtTime(velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 2.5);
        noise.start(time); noise.stop(time + 2.6);
        return [noise];
    }

    playRide(time, velocity, dest) {
        const nodes = [];
        const gain = this.ctx.createGain();
        gain.connect(dest);
        gain.gain.setValueAtTime(velocity * 0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);

        [3200, 4800, 6200].forEach(f => {
            const osc = this.ctx.createOscillator();
            osc.type = 'square'; 
            osc.frequency.setValueAtTime(f, time);
            osc.connect(gain);
            osc.start(time); osc.stop(time + 1.6);
            nodes.push(osc);
        });

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 8000;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(velocity * 0.15, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 1.0);
        noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(dest);
        noise.start(time); noise.stop(time + 1.1);
        nodes.push(noise); 
        return nodes;
    }
}

// ==========================================================
// --- SYNTH ENGINE: VIRTUAL ANALOG SYNTHESIZER (MULTI-PRESET) ---
// ==========================================================
class AnalogSynth {
    constructor(ctx) {
        this.ctx = ctx;
        this.setPreset('Classic Saw'); // Alapértelmezett
    }

    setPreset(presetName) {
        this.preset = presetName;
        
        switch(presetName) {
            case 'Deep Bass':
                // Sokkal vastagabb, telítettebb basszus, ami mobilon is átjön
                this.oscType = 'triangle';
                this.osc2Type = 'square';
                this.osc2Detune = -1200; // Egy komplett oktávval lejjebb szól a 2. oszcillátor!
                this.cutoff = 1000;
                this.resonance = 3;
                this.attack = 0.02;
                this.decay = 0.4;
                this.sustain = 0.2;
                this.release = 0.2;
                break;
            case '8-Bit Square':
                // Rövid, éles, "Nintendo" stílusú hang
                this.oscType = 'square';
                this.osc2Type = 'square';
                this.osc2Detune = 7; 
                this.cutoff = 8000;  
                this.resonance = 0;
                this.attack = 0.01;
                this.decay = 0.1;
                this.sustain = 0.001;  // <-- EZT JAVÍTSD KI ERRE! (0.0 helyett)
                this.release = 0.05;
                break;
            case 'Classic Saw':
            default:
                // Vastag, retro "Stranger Things" fűrészfog pad
                this.oscType = 'sawtooth';
                this.osc2Type = 'sawtooth';
                this.osc2Detune = 15; // Kórusos, széles hatás
                this.cutoff = 2000;
                this.resonance = 5;
                this.attack = 0.05;
                this.decay = 0.3;
                this.sustain = 0.5;
                this.release = 0.5;
                break;
        }
    }

    playNote(midiNote, time, duration, velocity = 100, destinationNode, presetName = null) {
        // Ha jön parancs, átváltjuk az "agyát" az adott presetre!
        if (presetName) this.setPreset(presetName);

        const dest = destinationNode || this.ctx.destination;
        const vel = velocity / 127;
        const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator(); 
        
        osc1.type = this.oscType;
        osc2.type = this.osc2Type || this.oscType;
        
        osc1.frequency.value = freq;
        osc2.frequency.value = freq;
        // Ha van elhangolás (detune), rárakjuk a második oszcillátorra
        if (this.osc2Detune) osc2.detune.value = this.osc2Detune;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = this.resonance;
        
        filter.frequency.setValueAtTime(this.cutoff / 4, time);
        filter.frequency.linearRampToValueAtTime(this.cutoff * 2, time + this.attack);
        filter.frequency.exponentialRampToValueAtTime(this.cutoff, time + this.attack + this.decay);

        const vca = this.ctx.createGain();
        
        vca.gain.setValueAtTime(0, time);
        vca.gain.linearRampToValueAtTime(vel * 0.5, time + this.attack); 
        vca.gain.exponentialRampToValueAtTime((vel * 0.5) * this.sustain, time + this.attack + this.decay); 
        vca.gain.setValueAtTime((vel * 0.5) * this.sustain, time + duration); 
        vca.gain.linearRampToValueAtTime(0.001, time + duration + this.release); 

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(vca);
        vca.connect(dest);

        osc1.start(time);
        osc2.start(time);
        
        osc1.stop(time + duration + this.release + 0.1);
        osc2.stop(time + duration + this.release + 0.1);
        
        return [osc1, osc2]; 
    }
}

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

// --- 7. DBX 160 Punch Compressor ---
class DBX160Compressor {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        this.comp = ctx.createDynamicsCompressor();
        this.comp.knee.value = 0; // Hard knee a klasszikus csattanásért
        this.comp.attack.value = 0.005; // Nagyon gyors (5ms)
        this.comp.release.value = 0.05; // Gyors felengedés (50ms)
        
        this.makeup = ctx.createGain();

        this.input.connect(this.comp);
        this.comp.connect(this.makeup);
        this.makeup.connect(this.output);
    }
    setThreshold(val) { this.comp.threshold.value = val; }
    setRatio(val) { this.comp.ratio.value = val; }
    setOutput(val) { this.makeup.gain.value = Math.pow(10, val / 20); }
}

// --- 8. SSL G-Master Buss Compressor ---
class SSLBusCompressor {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        this.comp = ctx.createDynamicsCompressor();
        this.comp.knee.value = 5; // Kicsit lágyabb, zeneibb
        
        this.makeup = ctx.createGain();

        this.input.connect(this.comp);
        this.comp.connect(this.makeup);
        this.makeup.connect(this.output);
        
        // Alap beállítások
        this.setAttack(30);
        this.setRelease(300);
        this.setRatio(4);
    }
    setThreshold(val) { this.comp.threshold.value = val; }
    setMakeup(val) { this.makeup.gain.value = Math.pow(10, val / 20); }
    setAttack(val) { this.comp.attack.value = val / 1000; } // ms to sec
    setRelease(val) { this.comp.release.value = val / 1000; } // ms to sec
    setRatio(val) { this.comp.ratio.value = val; }
}

// --- 9. Roland RE-201 Space Echo ---
class SpaceEchoDelay {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // Dry/Wet arányhoz
        this.dryGain = ctx.createGain();
        this.wetGain = ctx.createGain();
        
        // Maga a szalag emuláció (Delay + Szaturáció + EQ)
        this.delay = ctx.createDelay(5.0); // Max 5 mp
        this.feedback = ctx.createGain();
        
        // Szalag EQ
        this.tapeLpf = ctx.createBiquadFilter();
        this.tapeLpf.type = 'lowpass';
        this.tapeLpf.frequency.value = 3500; // Tompa szalagos hang
        this.tapeHpf = ctx.createBiquadFilter();
        this.tapeHpf.type = 'highpass';
        this.tapeHpf.frequency.value = 200;

        // Szaturáció a delay láncban (hogy minden ismétlés koszosabb legyen)
        this.tapeSat = ctx.createWaveShaper();
        this.tapeSat.curve = this.makeSaturationCurve(20);

        // Routing
        this.input.connect(this.dryGain);
        this.dryGain.connect(this.output);

        this.input.connect(this.delay);
        this.delay.connect(this.tapeLpf);
        this.tapeLpf.connect(this.tapeHpf);
        this.tapeHpf.connect(this.tapeSat);
        this.tapeSat.connect(this.wetGain);
        this.wetGain.connect(this.output);

        // Feedback hurok (A szaturált/EQ-zott jel megy vissza a delay-be)
        this.tapeSat.connect(this.feedback);
        this.feedback.connect(this.delay);

        // Alapértékek
        this.setRate(300);
        this.setIntensity(40);
        this.setMix(30);
    }
    
    makeSaturationCurve(amount) {
        let k = amount;
        let n_samples = 44100;
        let curve = new Float32Array(n_samples);
        for (let i = 0; i < n_samples; ++i) {
            let x = i * 2 / n_samples - 1;
            curve[i] = Math.tanh(x * (1 + k / 10)); 
        }
        return curve;
    }

    setRate(val) { this.delay.delayTime.value = val / 1000; } // ms to sec
    setIntensity(val) { this.feedback.gain.value = val / 100; } // 0 - 1.0 feedback
    setMix(val) { 
        this.wetGain.gain.value = val / 100; 
        this.dryGain.gain.value = 1 - (val / 100); 
    }
    setBass(val) { this.tapeHpf.frequency.value = 200 - (val * 1.5); } // 0-100 érték
    setTreble(val) { this.tapeLpf.frequency.value = 1000 + (val * 50); } // 0-100 érték
}

// --- 10. Lexicon 224 Digital Reverb (Algoritmikus) ---
class LexiconReverb {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        this.dryGain = ctx.createGain();
        this.wetGain = ctx.createGain();

        // ConvolverNode szintetikus IR (Impulse Response) generálással
        this.convolver = ctx.createConvolver();
        
        // Magas és mélyvágó a zengésen (hogy ne zengjen össze mindent)
        this.lowpass = ctx.createBiquadFilter();
        this.lowpass.type = 'lowpass';
        this.lowpass.frequency.value = 4000;
        
        this.highpass = ctx.createBiquadFilter();
        this.highpass.type = 'highpass';
        this.highpass.frequency.value = 300;

        this.input.connect(this.dryGain);
        this.dryGain.connect(this.output);

        this.input.connect(this.highpass);
        this.highpass.connect(this.lowpass);
        this.lowpass.connect(this.convolver);
        this.convolver.connect(this.wetGain);
        this.wetGain.connect(this.output);

        // Alap beállítás generálása
        this.generateReverb(3.0, 2.0); // 3mp hosszú, normál csengés
        this.setMix(25); // 25% wet
    }

    generateReverb(duration, decay) {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            // Exponenciális lecsengésű zaj generálása
            const envelope = Math.pow(1 - i / length, decay);
            left[i] = (Math.random() * 2 - 1) * envelope;
            right[i] = (Math.random() * 2 - 1) * envelope;
        }
        this.convolver.buffer = impulse;
    }

    setTime(val) { 
        // 0-100 értékből csinálunk 0.5 - 6.0 másodpercet
        const timeSec = 0.5 + (val / 100) * 5.5;
        this.generateReverb(timeSec, 2.0); 
    }
    
    setDamping(val) {
        // Magasvágás (Minél nagyobb a damping, annál lejjebb vág)
        this.lowpass.frequency.value = 10000 - (val * 80); 
    }

    setMix(val) { 
        this.wetGain.gain.value = val / 100; 
        this.dryGain.gain.value = 1 - (val / 100); 
    }
}

// --- 11. Roland Juno-60 Analóg Chorus ---
class JunoChorus {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        this.dryGain = ctx.createGain();
        this.wetGain = ctx.createGain();

        // Két késleltető vonal a széles sztereó képhez
        this.delayL = ctx.createDelay();
        this.delayR = ctx.createDelay();
        this.delayL.delayTime.value = 0.015; // 15ms alap késleltetés
        this.delayR.delayTime.value = 0.020; // 20ms alap késleltetés

        // LFO a lebegéshez
        this.lfo = ctx.createOscillator();
        this.lfo.type = 'sine';
        
        this.lfoGainL = ctx.createGain();
        this.lfoGainR = ctx.createGain();
        
        // LFO bekötése a késleltetési idő rángatására
        this.lfo.connect(this.lfoGainL);
        this.lfoGainL.connect(this.delayL.delayTime);
        
        // Invertáljuk az LFO fázisát a jobb oldalon a sztereó hatásért
        this.lfo.connect(this.lfoGainR);
        this.lfoGainR.gain.value = -1;
        this.lfoGainR.connect(this.delayR.delayTime);
        
        // Panner a jobb-bal szétválasztáshoz
        this.panL = ctx.createStereoPanner(); this.panL.pan.value = -1;
        this.panR = ctx.createStereoPanner(); this.panR.pan.value = 1;

        this.input.connect(this.dryGain);
        this.dryGain.connect(this.output);

        this.input.connect(this.delayL); this.delayL.connect(this.panL); this.panL.connect(this.wetGain);
        this.input.connect(this.delayR); this.delayR.connect(this.panR); this.panR.connect(this.wetGain);
        
        this.wetGain.connect(this.output);
        this.lfo.start();

        // Alapértelmezések (Juno "Mode I" stílus)
        this.setRate(30);
        this.setDepth(50);
        this.setMix(50);
    }

    setRate(val) { 
        // 0-100 értékből 0.1Hz - 5Hz sebesség
        this.lfo.frequency.value = 0.1 + (val / 100) * 4.9; 
    }
    setDepth(val) { 
        // LFO mélység (max 5ms moduláció)
        const depthSec = (val / 100) * 0.005;
        this.lfoGainL.gain.value = depthSec;
    }
    setMix(val) { 
        this.wetGain.gain.value = val / 100; 
        this.dryGain.gain.value = 1 - (val / 100); 
    }
}

// --- 12. MXR Phase 90 (4 fokozatú Allpass) ---
class MXRPhaser {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        this.dryGain = ctx.createGain();
        this.wetGain = ctx.createGain();
        
        // 4 darab Allpass szűrő sorbakötve (ez okozza a fáziseltolódást)
        this.filters = [];
        let prevNode = this.input;
        
        for (let i = 0; i < 4; i++) {
            let filter = ctx.createBiquadFilter();
            filter.type = 'allpass';
            filter.frequency.value = 1000;
            prevNode.connect(filter);
            this.filters.push(filter);
            prevNode = filter;
        }
        
        // A 4. szűrő után megy a nedves jelbe
        prevNode.connect(this.wetGain);

        // LFO a szűrők frekvenciájának mozgatására
        this.lfo = ctx.createOscillator();
        this.lfo.type = 'sine';
        
        this.lfoGain = ctx.createGain();
        this.lfoGain.gain.value = 800; // Moduláció mélysége Hz-ben
        
        this.lfo.connect(this.lfoGain);
        
        // Bekötjük az LFO-t mind a 4 szűrő frekvenciájára
        this.filters.forEach(f => {
            this.lfoGain.connect(f.frequency);
        });

        this.input.connect(this.dryGain);
        this.dryGain.connect(this.output);
        this.wetGain.connect(this.output);
        
        this.lfo.start();

        // 50-50% mix a fáziskioltásért
        this.dryGain.gain.value = 0.5;
        this.wetGain.gain.value = 0.5;

        this.setSpeed(30);
    }

    setSpeed(val) { 
        // 0-100 értékből 0.1Hz - 8Hz sebesség (Az eredetin csak egyetlen "Speed" poti van!)
        this.lfo.frequency.value = 0.1 + (val / 100) * 7.9; 
    }
}

// --- 13. Ibanez TS808 Tube Screamer (Overdrive) ---
class TS808Overdrive {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // TS jellegzetes mid-hump: vágja a mélyet, kiemeli a 720Hz-et
        this.preEq = ctx.createBiquadFilter();
        this.preEq.type = 'bandpass';
        this.preEq.frequency.value = 720;
        this.preEq.Q.value = 0.5;

        // Aszimmetrikus (soft) torzítás
        this.driveNode = ctx.createWaveShaper();
        this.driveNode.oversample = '4x';

        // Tone poti (Lowpass szűrő)
        this.toneFilter = ctx.createBiquadFilter();
        this.toneFilter.type = 'lowpass';
        
        this.levelNode = ctx.createGain();

        this.input.connect(this.preEq);
        this.preEq.connect(this.driveNode);
        
        // Hozzákeverünk egy kis tiszta jelet is, ez adja a TS karakterét!
        this.cleanBlend = ctx.createGain();
        this.cleanBlend.gain.value = 0.3;
        this.input.connect(this.cleanBlend);
        this.cleanBlend.connect(this.toneFilter);

        this.driveNode.connect(this.toneFilter);
        this.toneFilter.connect(this.levelNode);
        this.levelNode.connect(this.output);

        this.setDrive(50);
        this.setTone(50);
        this.setLevel(50);
    }

    makeSoftCurve(amount) {
        let k = amount * 1.5;
        let n_samples = 44100;
        let curve = new Float32Array(n_samples);
        for (let i = 0; i < n_samples; ++i) {
            let x = i * 2 / n_samples - 1;
            // Aszimmetrikus, csöves jellegű vágás
            if (x < 0) curve[i] = -1 + Math.exp(x * (1 + k/10));
            else curve[i] = Math.tanh(x * (1 + k/5));
        }
        return curve;
    }

    setDrive(val) { this.driveNode.curve = this.makeSoftCurve(val); }
    setTone(val) { this.toneFilter.frequency.value = 500 + (val * 45); } // 500Hz - 5000Hz
    setLevel(val) { this.levelNode.gain.value = val / 50; } // 0 - 2.0x gain
}

// --- 14. Electro-Harmonix Big Muff Pi (Fuzz) ---
class BigMuffFuzz {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // Extrém erősítés mielőtt a torzítóba ér
        this.preGain = ctx.createGain();
        
        // Szigorú, szimmetrikus Hard Clipping (Fuzz)
        this.fuzzNode = ctx.createWaveShaper();
        this.fuzzNode.oversample = '4x';

        // A klasszikus "Scooped" Big Muff Tone Stack
        // Két szűrő: egy mély és egy magas, ezek arányát állítja a Tone poti
        this.lowFilter = ctx.createBiquadFilter();
        this.lowFilter.type = 'lowpass';
        this.lowFilter.frequency.value = 300; // Mélyek átengedése

        this.highFilter = ctx.createBiquadFilter();
        this.highFilter.type = 'highpass';
        this.highFilter.frequency.value = 1200; // Magasak átengedése, közép kivágva!

        this.toneMixL = ctx.createGain();
        this.toneMixH = ctx.createGain();
        
        this.volumeNode = ctx.createGain();

        this.input.connect(this.preGain);
        this.preGain.connect(this.fuzzNode);
        
        this.fuzzNode.connect(this.lowFilter);
        this.lowFilter.connect(this.toneMixL);
        this.toneMixL.connect(this.volumeNode);

        this.fuzzNode.connect(this.highFilter);
        this.highFilter.connect(this.toneMixH);
        this.toneMixH.connect(this.volumeNode);
        
        this.volumeNode.connect(this.output);

        this.setSustain(50);
        this.setTone(50);
        this.setLevel(50);
    }

    makeFuzzCurve(amount) {
        let k = amount * 10; // Brutál gain
        let n_samples = 44100;
        let curve = new Float32Array(n_samples);
        for (let i = 0; i < n_samples; ++i) {
            let x = i * 2 / n_samples - 1;
            // Szinte négyszögesítjük a jelet (Hard clipping)
            curve[i] = Math.sign(x) * (1 - Math.exp(-Math.abs(x) * (10 + k)));
        }
        return curve;
    }

    setSustain(val) { 
        this.preGain.gain.value = 1 + (val / 10); // Hajtjuk befelé a jelet
        this.fuzzNode.curve = this.makeFuzzCurve(val); 
    }
    setTone(val) { 
        // 0 = csak mély, 100 = csak magas
        let mix = val / 100;
        this.toneMixL.gain.value = 1 - mix;
        this.toneMixH.gain.value = mix;
    }
    setLevel(val) { this.volumeNode.gain.value = val / 50; }
}

// --- 15. MXR M-117R Flanger ---
class M117Flanger {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        this.dry = ctx.createGain();
        this.wet = ctx.createGain();
        this.dry.gain.value = 0.5;
        this.wet.gain.value = 0.5;

        // Rövid delay (0-10ms)
        this.delay = ctx.createDelay(0.02);
        
        // Visszacsatolás (Resonance/Regen) - ez adja a jet repülő hangot
        this.regenGain = ctx.createGain();
        
        // LFO a késleltetés mozgatásához
        this.lfo = ctx.createOscillator();
        this.lfo.type = 'triangle';
        this.lfoGain = ctx.createGain();

        // Routing
        this.input.connect(this.dry);
        this.dry.connect(this.output);

        this.input.connect(this.delay);
        this.delay.connect(this.wet);
        this.wet.connect(this.output);

        // Regen (Feedback) loop
        this.delay.connect(this.regenGain);
        this.regenGain.connect(this.delay);

        // LFO rákötve a delay idejére
        this.lfo.connect(this.lfoGain);
        this.lfoGain.connect(this.delay.delayTime);
        this.lfo.start();

        this.setManual(50);
        this.setWidth(50);
        this.setSpeed(20);
        this.setRegen(50);
    }

    setManual(val) { 
        // Alap delay idő (0.001 - 0.01 sec)
        this.baseDelay = 0.001 + (val / 100) * 0.009;
        this.delay.delayTime.value = this.baseDelay;
    }
    setWidth(val) { 
        // LFO kitérése (mennyire másszon el a baseDelay-től)
        this.lfoGain.gain.value = (val / 100) * 0.005;
    }
    setSpeed(val) { 
        // 0.1Hz - 5Hz
        this.lfo.frequency.value = 0.1 + (val / 100) * 4.9;
    }
    setRegen(val) { 
        // Visszacsatolás (-0.9-től +0.9-ig, hogy ne szálljon el)
        // Általában a negatív feedback adja a klasszikus "csöves" flanger hangot
        this.regenGain.gain.value = (val / 100) * 0.9;
    }
}

// --- 16. Electro-Harmonix Q-Tron (Envelope Filter) ---
class QTronFilter {
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // Bandpass (vagy Lowpass) szűrő
        this.filter = ctx.createBiquadFilter();
        this.filter.type = 'bandpass';
        this.filter.Q.value = 10;
        this.filter.frequency.value = 300; // Alap freki

        // --- ENVELOPE FOLLOWER (Burkológörbe követő) ---
        // Mivel Web Audio-ban nincs natív env follower paraméter rángatásra,
        // ScriptProcessor-ral csináljuk (analizáljuk a hangerőt blokkonként)
        this.analyzer = ctx.createScriptProcessor(1024, 1, 1);
        
        this.sensitivity = 0.5;
        this.baseFreq = 300;
        this.peakFreq = 5000;

        // Ezt folyamatosan hívja a rendszer, ha hang megy át rajta
        this.analyzer.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
            }
            // RMS (átlagos hangerő) kiszámítása
            let rms = Math.sqrt(sum / inputData.length);
            
            // Jelerősség felnagyítása a sensitivity (drive) poti alapján
            let driveLvl = rms * (this.sensitivity * 50); 
            if (driveLvl > 1) driveLvl = 1;

            // Új frekvencia beállítása (Sweep)
            let targetFreq = this.baseFreq + (driveLvl * (this.peakFreq - this.baseFreq));
            
            // Smootholás, hogy ne pattogjon (Glide effect)
            this.filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.02);
        };

        // Dummy node, hogy a script processor biztosan fusson
        this.dummyOutput = ctx.createGain();
        this.dummyOutput.gain.value = 0;

        // Routing
        this.input.connect(this.filter);
        this.filter.connect(this.output);

        // Párhuzamos út az analizáláshoz
        this.input.connect(this.analyzer);
        this.analyzer.connect(this.dummyOutput);
        this.dummyOutput.connect(this.ctx.destination); // Kell egy valós végpont a működéshez

        this.setDrive(50);
        this.setQ(50);
    }

    setDrive(val) { this.sensitivity = val / 100; }
    setQ(val) { this.filter.Q.value = 2 + (val / 100) * 18; } // Q = 2 - 20
    setMode(val) { 
        // Választható Lowpass vagy Bandpass (valami egyszerű switch-ként a UI-on)
        this.filter.type = val > 50 ? 'bandpass' : 'lowpass'; 
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

// --- DBX 160 UI ---
function createDBXUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-dbx';
    wrapper.innerHTML = `
        <div class="dbx-header">dbx<span>®</span> 160</div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob dbx-knob" data-param="threshold" data-min="-40" data-max="10" data-val="0"></div><div class="knob-value">0 dB</div><div class="knob-label">THRESHOLD</div></div>
            <div class="knob-container"><div class="knob dbx-knob" data-param="ratio" data-min="1" data-max="20" data-val="4"></div><div class="knob-value">4:1</div><div class="knob-label">COMPRESSION</div></div>
            <div class="knob-container"><div class="knob dbx-knob" data-param="output" data-min="-20" data-max="20" data-val="0"></div><div class="knob-value">0 dB</div><div class="knob-label">OUTPUT GAIN</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'nv73'); // Használhatjuk az nv73 decibel/normál logikáját
    return wrapper;
}

// --- SSL BUS COMP UI ---
function createSSLUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-ssl';
    wrapper.innerHTML = `
        <div class="ssl-header">G-MASTER BUSS COMPRESSOR</div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob ssl-blue" data-param="threshold" data-min="-20" data-max="15" data-val="0"></div><div class="knob-value">0</div><div class="knob-label">THRESHOLD</div></div>
            <div class="knob-container"><div class="knob ssl-grey" data-param="ratio" data-min="2" data-max="10" data-val="4" data-step="true" data-steps="2,4,10"></div><div class="knob-value">4</div><div class="knob-label">RATIO</div></div>
            <div class="knob-container"><div class="knob ssl-grey" data-param="attack" data-min="0.1" data-max="30" data-val="10" data-step="true" data-steps="0.1,0.3,1,3,10,30"></div><div class="knob-value">10</div><div class="knob-label">ATTACK (mS)</div></div>
            <div class="knob-container"><div class="knob ssl-grey" data-param="release" data-min="100" data-max="1200" data-val="300" data-step="true" data-steps="100,300,600,1200"></div><div class="knob-value">300</div><div class="knob-label">RELEASE (mS)</div></div>
            <div class="knob-container"><div class="knob ssl-red" data-param="makeup" data-min="0" data-max="15" data-val="0"></div><div class="knob-value">0</div><div class="knob-label">MAKE-UP</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'nv73'); 
    return wrapper;
}

// --- SPACE ECHO UI ---
function createSpaceEchoUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-re201';
    wrapper.innerHTML = `
        <div class="re201-header">SPACE ECHO<span>RE-201</span></div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob re-knob" data-param="rate" data-min="50" data-max="1000" data-val="300"></div><div class="knob-value">300</div><div class="knob-label">REPEAT RATE</div></div>
            <div class="knob-container"><div class="knob re-knob" data-param="intensity" data-min="0" data-max="95" data-val="40"></div><div class="knob-value">40</div><div class="knob-label">INTENSITY</div></div>
            <div class="knob-container"><div class="knob re-knob" data-param="bass" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">BASS</div></div>
            <div class="knob-container"><div class="knob re-knob" data-param="treble" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">TREBLE</div></div>
            <div class="knob-container"><div class="knob re-knob" data-param="mix" data-min="0" data-max="100" data-val="30"></div><div class="knob-value">30</div><div class="knob-label">ECHO VOL</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'amp'); // A potik tekerési logikájához az "amp" (0-100) típus tökéletes
    return wrapper;
}

// --- LEXICON 224 UI ---
function createLexiconUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-lexicon';
    wrapper.innerHTML = `
        <div class="lexicon-header">224 <span>DIGITAL REVERBERATOR</span></div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob lex-knob" data-param="time" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">DECAY TIME</div></div>
            <div class="knob-container"><div class="knob lex-knob" data-param="damping" data-min="0" data-max="100" data-val="20"></div><div class="knob-value">20</div><div class="knob-label">DAMPING</div></div>
            <div class="knob-container"><div class="knob lex-knob" data-param="mix" data-min="0" data-max="100" data-val="25"></div><div class="knob-value">25</div><div class="knob-label">MIX</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'amp'); 
    return wrapper;
}

// --- JUNO CHORUS UI ---
function createJunoUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-juno';
    wrapper.innerHTML = `
        <div class="juno-header">CHORUS-60</div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob juno-knob" data-param="rate" data-min="0" data-max="100" data-val="30"></div><div class="knob-value">30</div><div class="knob-label">RATE</div></div>
            <div class="knob-container"><div class="knob juno-knob" data-param="depth" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">DEPTH</div></div>
            <div class="knob-container"><div class="knob juno-knob" data-param="mix" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">WET/DRY</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'amp'); 
    return wrapper;
}

// --- MXR PHASE 90 UI ---
function createMXRUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-mxr';
    wrapper.innerHTML = `
        <div class="mxr-header">Phase 90</div>
        <div class="knob-container">
            <div class="knob mxr-knob" data-param="speed" data-min="0" data-max="100" data-val="30"></div>
            <div class="knob-value">30</div>
            <div class="knob-label">SPEED</div>
        </div>
    `;
    // Mivel az MXR-en csak egyetlen "Speed" poti van paraméterként, használhatunk itt is egy egyedi setup-ot
    setupKnobs(wrapper, pluginInstance, 'amp'); 
    return wrapper;
}

// --- TS808 UI ---
function createTS808UI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-ts808';
    wrapper.innerHTML = `
        <div class="ts808-header">TS-808 OVERDRIVE</div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob ts-knob" data-param="drive" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">OVERDRIVE</div></div>
            <div class="knob-container"><div class="knob ts-knob" data-param="tone" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">TONE</div></div>
            <div class="knob-container"><div class="knob ts-knob" data-param="level" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">LEVEL</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'amp'); // amp logika (0-100 értékek)
    return wrapper;
}

// --- BIG MUFF UI ---
function createMuffUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-muff';
    wrapper.innerHTML = `
        <div class="muff-header">Big Muff<span> π</span></div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob muff-knob" data-param="sustain" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">VOLUME</div></div>
            <div class="knob-container"><div class="knob muff-knob" data-param="tone" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">TONE</div></div>
            <div class="knob-container"><div class="knob muff-knob" data-param="level" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">SUSTAIN</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'amp'); 
    return wrapper;
}

// --- M117 FLANGER UI ---
function createFlangerUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-flanger';
    wrapper.innerHTML = `
        <div class="flanger-header">M-117 FLANGER</div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob mxr-knob" data-param="manual" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">MANUAL</div></div>
            <div class="knob-container"><div class="knob mxr-knob" data-param="width" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">WIDTH</div></div>
            <div class="knob-container"><div class="knob mxr-knob" data-param="speed" data-min="0" data-max="100" data-val="20"></div><div class="knob-value">20</div><div class="knob-label">SPEED</div></div>
            <div class="knob-container"><div class="knob mxr-knob" data-param="regen" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">REGEN</div></div>
        </div>
    `;
    setupKnobs(wrapper, pluginInstance, 'amp'); 
    return wrapper;
}

// --- Q-TRON UI ---
function createQTronUI(pluginInstance) {
    const wrapper = document.createElement('div');
    wrapper.className = 'plugin-qtron';
    wrapper.innerHTML = `
        <div class="qtron-header">Q-TRON</div>
        <div class="amp-panel">
            <div class="knob-container"><div class="knob q-knob" data-param="mode" data-min="0" data-max="100" data-val="100" data-step="true" data-steps="0,100"></div><div class="knob-value">BP</div><div class="knob-label">MODE (LP/BP)</div></div>
            <div class="knob-container"><div class="knob q-knob" data-param="q" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">PEAK (Q)</div></div>
            <div class="knob-container"><div class="knob q-knob" data-param="drive" data-min="0" data-max="100" data-val="50"></div><div class="knob-value">50</div><div class="knob-label">DRIVE</div></div>
        </div>
    `;
    
    // Kicsi hack a "Mode" kijelzésére
    wrapper.querySelector('.knob[data-param="mode"]').addEventListener('mouseup', function() {
        setTimeout(() => {
            const val = parseFloat(this.dataset.val);
            this.nextElementSibling.textContent = val > 50 ? 'BP' : 'LP';
        }, 10);
    });

    setupKnobs(wrapper, pluginInstance, 'amp'); 
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
            if (param === 'drive') pluginInstance.setDrive?.(newVal);
            else if (param === 'bass') pluginInstance.setBass?.(newVal);
            else if (param === 'mid') pluginInstance.setMid?.(newVal);
            else if (param === 'treble') pluginInstance.setTreble?.(newVal);
            else if (param === 'presence') pluginInstance.setPresence?.(newVal);
            else if (param === 'depth') pluginInstance.setDepth?.(newVal);
            else if (param === 'volume') pluginInstance.setVolume?.(newVal);
            
            // --- ÚJ PEDÁLOK PARAMÉTEREI ---
            else if (param === 'sustain') pluginInstance.setSustain?.(newVal);
            else if (param === 'tone') pluginInstance.setTone?.(newVal);
            else if (param === 'level') pluginInstance.setLevel?.(newVal);
            else if (param === 'manual') pluginInstance.setManual?.(newVal);
            else if (param === 'width') pluginInstance.setWidth?.(newVal);
            else if (param === 'speed') pluginInstance.setSpeed?.(newVal);
            else if (param === 'regen') pluginInstance.setRegen?.(newVal);
            else if (param === 'q') pluginInstance.setQ?.(newVal);
            else if (param === 'mode') pluginInstance.setMode?.(newVal);
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
                    
                    <div class="add-fx-wrap">
                        <button class="add-fx-btn" id="add-fx-btn">+ Add Plugin</button>
                        <div id="plugin-picker">
                            <button class="plugin-pick-btn" data-plugin="nv73">N-73 Preamp & EQ</button>
                            <button class="plugin-pick-btn" data-plugin="la2a">L-2A Leveler</button>
                            <button class="plugin-pick-btn" data-plugin="dbx">dbx 160 Punch Comp</button>
                            <button class="plugin-pick-btn" data-plugin="ts808">TS-808 Tube Screamer</button>
                            <button class="plugin-pick-btn" data-plugin="muff">Big Muff Fuzz</button>
                            <button class="plugin-pick-btn" data-plugin="qtron">Q-Tron Env Filter</button>
                            <button class="plugin-pick-btn" data-plugin="flanger">M-117 Flanger</button>
                            <button class="plugin-pick-btn" data-plugin="mxr">Phase 90</button>                            
                            <button class="plugin-pick-btn" data-plugin="brit">Brit 800 Amp</button>
                            <button class="plugin-pick-btn" data-plugin="djent">Djent 51 Amp</button>
                            <button class="plugin-pick-btn" data-plugin="juno">Juno-60 Chorus</button>
                            <button class="plugin-pick-btn" data-plugin="lexicon">224 Digital Reverb</button>
                            <button class="plugin-pick-btn" data-plugin="spaceecho">RE-201 Space Echo</button>
                            <button class="plugin-pick-btn" data-plugin="tape">Vintage Tape Sat</button>
                            <button class="plugin-pick-btn" data-plugin="ssl">SSL Master Bus Comp</button>
                            <button class="plugin-pick-btn" data-plugin="maximizer">L-MAX Brickwall</button>
                        </div>
                    </div>

                    <div id="fx-list"></div>

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
        } else if (pluginType === 'dbx') { 
            plugin = new DBX160Compressor(audioCtx); ui = createDBXUI(plugin); name = 'dbx 160';
        } else if (pluginType === 'ssl') { 
            plugin = new SSLBusCompressor(audioCtx); ui = createSSLUI(plugin); name = 'SSL G-Bus';
        } else if (pluginType === 'spaceecho') {
            plugin = new SpaceEchoDelay(audioCtx); ui = createSpaceEchoUI(plugin); name = 'Space Echo';
        } else if (pluginType === 'lexicon') { 
            plugin = new LexiconReverb(audioCtx); ui = createLexiconUI(plugin); name = '224 Reverb';
        } else if (pluginType === 'juno') { 
            plugin = new JunoChorus(audioCtx); ui = createJunoUI(plugin); name = 'Juno Chorus';
        } else if (pluginType === 'ts808') { 
            plugin = new TS808Overdrive(audioCtx); ui = createTS808UI(plugin); name = 'TS-808'; 
        } else if (pluginType === 'muff') { 
            plugin = new BigMuffFuzz(audioCtx); ui = createMuffUI(plugin); name = 'Big Muff'; 
        } else if (pluginType === 'flanger') { 
            plugin = new M117Flanger(audioCtx); ui = createFlangerUI(plugin); name = 'M-117 Flanger'; 
        } else if (pluginType === 'qtron') { 
            plugin = new QTronFilter(audioCtx); ui = createQTronUI(plugin); name = 'Q-Tron'; 
        } else if (pluginType === 'mxr') { 
            plugin = new MXRPhaser(audioCtx); ui = createMXRUI(plugin); name = 'Phase 90';
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
