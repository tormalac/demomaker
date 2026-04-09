if (editBtn) {
    let selectedClip = document.querySelector('.audio-clip.selected-clip');
    const trackContainer = editBtn.closest('.track-container');
    const isDrum = trackContainer.classList.contains('drum'); // Előre kiszámoljuk a sáv típusát

    // 1. Meglévő klip keresése (ha nincs kijelölve semmi)
    if (!selectedClip) {
        const allClips = Array.from(trackContainer.querySelectorAll('.audio-clip'));
        selectedClip = allClips.find(c => {
            const start = parseFloat(c.dataset.start);
            const end = start + parseFloat(c.dataset.duration);
            return currentPlayTime >= start && currentPlayTime <= end; 
        });
        
        if (selectedClip) {
            document.querySelectorAll('.audio-clip').forEach(c => c.classList.remove('selected-clip'));
            selectedClip.classList.add('selected-clip');
        }
    }

    // 2. HA VAN KLIP: Megnyitjuk a szerkesztőt
    if (selectedClip) {
        if (isPlaying) stopPlayback(); 
        
        if (selectedClip.dataset.type === 'pattern') {
            if (isDrum) openDrumEditor(selectedClip); 
            else openPianoRoll(selectedClip);         
        }
    } 
    // 3. HA NINCS KLIP: Létrehozunk egyet ÉS megnyitjuk
    else {
        if (isPlaying) stopPlayback();
        
        let startTime = currentPlayTime;
        const snapPx = getSnapPx();
        if (snapPx > 0) {
            startTime = (Math.round((startTime * PX_PER_SECOND) / snapPx) * snapPx) / PX_PER_SECOND;
        }

        const clipsContainer = trackContainer.querySelector('.clips');
        const newClip = addPatternClipToTrack(clipsContainer, "Pattern " + Math.floor(Math.random()*100), startTime, 1);
        
        // Alapértelmezett hangok dob esetén
        if (isDrum) {
           const secPerBeat = 60 / bpm; 
           newClip.patternData.notes.push({note: 36, start: 0, duration: 0.1, velocity: 100}); 
           newClip.patternData.notes.push({note: 38, start: secPerBeat, duration: 0.1, velocity: 100}); 
           newClip.patternData.notes.push({note: 36, start: secPerBeat*2, duration: 0.1, velocity: 100}); 
           newClip.patternData.notes.push({note: 38, start: secPerBeat*3, duration: 0.1, velocity: 100}); 
        }

        const waveColor = getTrackColor(trackContainer);
        drawPattern(newClip.querySelector('canvas'), newClip, waveColor);

        // Kijelöljük az új klipet (hogy vizuálisan is látszódjon, mi nyílt meg)
        document.querySelectorAll('.audio-clip').forEach(c => c.classList.remove('selected-clip'));
        newClip.classList.add('selected-clip');
        
        // AZONNALI MEGNYITÁS (Kivettem a selectBtn feltételt, hogy mindig fusson)
        if (isDrum) openDrumEditor(newClip); 
        else openPianoRoll(newClip);
    }
    return;
}
