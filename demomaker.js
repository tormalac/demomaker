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
