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

        const nodes = [osc]; // Ebbe gyűjtjük a hangforrásokat, hogy meg lehessen őket állítani

        // --- ÚJ: DARK MATTER (MODERN) LÁBDOB ---
        if (this.preset === 'Dark Matter (Modern)') {
            // Agresszív "katt" a legelején (pitch drop)
            osc.frequency.setValueAtTime(350, time); // Nagyon magasról indul
            osc.frequency.exponentialRampToValueAtTime(45, time + 0.03); // Fülnek alig észrevehetően gyorsan zuhan le
            osc.frequency.exponentialRampToValueAtTime(30, time + 0.3); // Kitartott, feszes sub basszus
            
            gain.gain.setValueAtTime(velocity, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35); // Rövid, de nagyon vastag lecsengés

            // Egy pici, tűhegyes zaj-burst (click) a dob legelejére a "csattanás" miatt
            const clickNoise = this.ctx.createBufferSource();
            clickNoise.buffer = this.noiseBuffer;
            const clickFilter = this.ctx.createBiquadFilter();
            clickFilter.type = 'highpass'; clickFilter.frequency.value = 4000; // Csak a legteteje
            const clickGain = this.ctx.createGain();
            
            clickGain.gain.setValueAtTime(velocity * 0.8, time);
            clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015); // Mindössze 15ms-ig szól!
            
            clickNoise.connect(clickFilter); clickFilter.connect(clickGain); clickGain.connect(dest);
            clickNoise.start(time); clickNoise.stop(time + 0.02);
            nodes.push(clickNoise);

            osc.start(time); osc.stop(time + 0.4);
        }
        else if (this.preset === 'TR-808 (Deep)') {
            osc.frequency.setValueAtTime(120, time);
            osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
            gain.gain.setValueAtTime(velocity, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
            osc.start(time); osc.stop(time + 0.9);
        } 
        else if (this.preset === 'TR-909 (Punchy)') {
            osc.frequency.setValueAtTime(250, time);
            osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);
            gain.gain.setValueAtTime(velocity, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
            osc.start(time); osc.stop(time + 0.4);
        }
        else {
            osc.type = 'triangle'; 
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);
            gain.gain.setValueAtTime(velocity, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
            osc.start(time); osc.stop(time + 0.5);
        }
        return nodes;
    }

    playSnare(time, velocity, dest) {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.connect(oscGain); oscGain.connect(dest); 

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        const noiseGain = this.ctx.createGain();
        noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(dest); 

        const nodes = [osc, noise];

        // --- ÚJ: DARK MATTER (MODERN) PERGŐ ---
        if (this.preset === 'Dark Matter (Modern)') {
            osc.type = 'sine'; // Tiszta, nagyot ütő test
            osc.frequency.setValueAtTime(220, time);
            osc.frequency.exponentialRampToValueAtTime(150, time + 0.1);
            oscGain.gain.setValueAtTime(velocity, time);
            oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

            // A "Darkglass" jellegű fémes felhanghoz egy második, négyszögjel oszcillátor
            const ringOsc = this.ctx.createOscillator();
            ringOsc.type = 'square';
            ringOsc.frequency.setValueAtTime(330, time); // Magasabb, diszonánsabb felhang
            const ringGain = this.ctx.createGain();
            ringGain.gain.setValueAtTime(velocity * 0.25, time); // Halkabbra keverve
            ringGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
            ringOsc.connect(ringGain); ringGain.connect(dest);
            ringOsc.start(time); ringOsc.stop(time + 0.15);
            nodes.push(ringOsc);

            // Brutálisan szétpréselt, vastag zaj a lecsengéshez
            noiseFilter.type = 'bandpass'; 
            noiseFilter.frequency.value = 2500; 
            noiseFilter.Q.value = 0.6; // Széles tartományt enged át
            noiseGain.gain.setValueAtTime(velocity, time); // Erős kezdés
            noiseGain.gain.setTargetAtTime(velocity * 0.4, time + 0.05, 0.05); // Kompresszor szerű plató
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.35); // Hosszú, zizegős lecsengés
            
            osc.start(time); osc.stop(time + 0.25);
            noise.start(time); noise.stop(time + 0.4);
        }
        else if (this.preset === 'TR-808 (Deep)') {
            osc.type = 'triangle';
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
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, time);
            oscGain.gain.setValueAtTime(velocity * 0.7, time);
            oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 1500; noiseFilter.Q.value = 0.5;
            noiseGain.gain.setValueAtTime(velocity, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.35); 
            osc.start(time); osc.stop(time + 0.2);
            noise.start(time); noise.stop(time + 0.4);
        }
        else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, time);
            osc.frequency.exponentialRampToValueAtTime(100, time + 0.15); 
            oscGain.gain.setValueAtTime(velocity * 0.6, time);
            oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
            noiseFilter.type = 'highpass'; noiseFilter.frequency.value = 1000;
            noiseGain.gain.setValueAtTime(velocity * 0.7, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
            osc.start(time); osc.stop(time + 0.25);
            noise.start(time); noise.stop(time + 0.3);
        }
        return nodes;
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
            case 'Telecaster (Twang)':
                // Fényes, csattanós, vékonyabb "Single Coil" hangzás
                this.oscType = 'sawtooth';
                this.osc2Type = 'square';
                this.osc2Detune = 5; // Egy icipici kórus hatás
                this.cutoff = 4500;  // Nagyon nyitott szűrő a fényes hangért
                this.resonance = 2;
                this.attack = 0.01;  // Határozott, gyors pengetés
                this.decay = 0.2;
                this.sustain = 0.3;  // Hamarabb elhaló hang
                this.release = 0.3;
                break;                
            case 'Les Paul (Warm)':
                // Vastag, meleg, dús "Humbucker" hangzás
                this.oscType = 'triangle'; // Lágyabb alap
                this.osc2Type = 'sawtooth';
                this.osc2Detune = -12; // Vastagítja a hangot
                this.cutoff = 1200;  // Tompább, sötétebb tónus
                this.resonance = 1;
                this.attack = 0.03;  // Kicsit "lustább" felfutás
                this.decay = 0.4;
                this.sustain = 0.6;  // Hosszabb kitartás
                this.release = 0.5;
                break;
            case 'Precision Bass (Punchy)':
                // Erőteljes, átszóló basszus (Rock / Funk vibe)
                this.oscType = 'triangle'; // Vastag alap
                this.osc2Type = 'square';  // Kicsit karcosabb felhangok a "pengetéshez"
                this.osc2Detune = 0;
                this.cutoff = 1800;  // Közepesen nyitott
                this.resonance = 2;
                this.attack = 0.01;  // Határozott indítás
                this.decay = 0.3;
                this.sustain = 0.4;
                this.release = 0.2;
                break;
            case 'Jazz Bass (Mellow)':
                this.oscType = 'triangle';
                this.osc2Type = 'sine'; // Nagyon tiszta, kerek sub
                this.osc2Detune = 2;    // Pici lebegés a "fretless" hatásért
                this.cutoff = 800;   // Jóval sötétebb tónus
                this.resonance = 0;
                this.attack = 0.03;  // Ujjas pengetés, picit puhább
                this.decay = 0.4;
                this.sustain = 0.6;
                this.release = 0.4;
                break;
            case 'Acoustic Piano':
                this.oscType = 'triangle';
                this.osc2Type = 'sawtooth';
                this.osc2Detune = 3; // Gazdagítja a felhangokat
                this.cutoff = 3500;  // Elég nyitott a kalapácsütéshez
                this.resonance = 1;
                this.attack = 0.01;  // Azonnali, ütős (kalapács)
                this.decay = 0.4;    // Gyorsan halkul a kezdeti ütés után
                this.sustain = 0.1;  // Csak halkan zeng tovább
                this.release = 0.6;  // Természetes lecsengés (mint a pedál nélküli zongora)
                break;
            case 'Minimoog (Fat Lead)':
                // A legendás Moog Model D: Vastag, átszólós lead vagy basszus (Funk / Prog Rock)
                this.oscType = 'sawtooth';
                this.osc2Type = 'square';
                this.osc2Detune = 15; // Kicsit elhangolva a kövérségért
                this.cutoff = 3500;
                this.resonance = 4;   // Kellemesen harapós szűrő
                this.attack = 0.01;   // Azonnal üt
                this.decay = 0.3;
                this.sustain = 0.5;
                this.release = 0.2;
                break;
            case 'TB-303 (Acid Bass)':
                // A savazós techno alapja a Roland TB-303. "Cuppogós", agresszív.
                this.oscType = 'sawtooth';
                this.osc2Type = 'sawtooth';
                this.osc2Detune = 0; 
                this.cutoff = 600;    // Alapból sötét...
                this.resonance = 14;  // ...de extrém magas rezonancia, amitől "visít" a szűrő!
                this.attack = 0.01;
                this.decay = 0.2;     // Nagyon rövid, pattogós
                this.sustain = 0.1;
                this.release = 0.1;
                this.masterLevel = 0.3;
                break;
            case 'CS-80 (Blade Runner)':
                // Yamaha CS-80: Vangelis stílusú fenséges, lassan kinyíló rézfúvós pad
                this.oscType = 'sawtooth';
                this.osc2Type = 'sawtooth';
                this.osc2Detune = 20; // Erősen elhangolt a széles, kórusos hangzásért
                this.cutoff = 2000;
                this.resonance = 1;
                this.attack = 0.3;    // Lassan úszik be
                this.decay = 0.5;
                this.sustain = 0.8;   // Hosszan kitartott akkordokhoz
                this.release = 0.9;   // Gyönyörű hosszú lecsengés
                break;
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
        
        // --- ÚJ LOGIKA: Kiszámoljuk a csúcs-hangerőt a preset saját kompenzációjával ---
        const peakLvl = vel * 0.5 * (this.masterLevel || 1.0); 
        
        vca.gain.setValueAtTime(0, time);
        vca.gain.linearRampToValueAtTime(peakLvl, time + this.attack); 
        vca.gain.exponentialRampToValueAtTime(peakLvl * this.sustain, time + this.attack + this.decay); 
        vca.gain.setValueAtTime(peakLvl * this.sustain, time + duration); 
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
