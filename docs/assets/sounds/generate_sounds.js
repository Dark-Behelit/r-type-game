// Función para generar sonidos retro
function generateSounds() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Disparo láser
    generateSound('shoot.wav', {
        type: 'square',
        frequency: 880,
        duration: 0.1,
        slide: true,
        slideFrequency: 440
    });

    // Explosión
    generateSound('explosion.wav', {
        type: 'sawtooth',
        frequency: 100,
        duration: 0.3,
        noise: true
    });

    // Game Over
    generateSound('gameover.wav', {
        type: 'sine',
        frequency: 440,
        duration: 1,
        slide: true,
        slideFrequency: 220
    });

    // Música de fondo
    generateBackgroundMusic();

    function generateSound(filename, options) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = options.type;
        oscillator.frequency.setValueAtTime(options.frequency, audioContext.currentTime);
        
        if (options.slide) {
            oscillator.frequency.exponentialRampToValueAtTime(
                options.slideFrequency,
                audioContext.currentTime + options.duration
            );
        }

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + options.duration
        );

        if (options.noise) {
            const noiseBuffer = audioContext.createBuffer(
                1, audioContext.sampleRate * options.duration, audioContext.sampleRate
            );
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = audioContext.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.connect(gainNode);
            noise.start();
        }

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + options.duration);

        // Guardar el audio como WAV
        const offlineContext = new OfflineAudioContext(
            1,
            audioContext.sampleRate * options.duration,
            audioContext.sampleRate
        );

        const source = offlineContext.createBufferSource();
        const offline_gainNode = offlineContext.createGain();

        if (options.noise) {
            const noiseBuffer = offlineContext.createBuffer(
                1, offlineContext.sampleRate * options.duration, offlineContext.sampleRate
            );
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = offlineContext.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.connect(offline_gainNode);
            noise.start();
        }

        source.connect(offline_gainNode);
        offline_gainNode.connect(offlineContext.destination);

        offlineContext.startRendering().then(function(renderedBuffer) {
            const wav = audioBufferToWav(renderedBuffer);
            const blob = new Blob([wav], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
        });
    }

    function generateBackgroundMusic() {
        const duration = 30; // 30 segundos de música de fondo
        const offlineContext = new OfflineAudioContext(
            2,
            audioContext.sampleRate * duration,
            audioContext.sampleRate
        );

        // Base rítmica
        const bassline = createArpeggio(offlineContext, [220, 165, 196, 147], 0.25, duration);
        bassline.connect(offlineContext.destination);

        // Melodía
        const melody = createArpeggio(offlineContext, [440, 330, 392, 294], 0.125, duration);
        const melodyGain = offlineContext.createGain();
        melodyGain.gain.value = 0.5;
        melody.connect(melodyGain);
        melodyGain.connect(offlineContext.destination);

        offlineContext.startRendering().then(function(renderedBuffer) {
            const wav = audioBufferToWav(renderedBuffer);
            const blob = new Blob([wav], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'background.mp3';
            link.click();
        });
    }

    function createArpeggio(context, frequencies, noteLength, duration) {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.type = 'square';
        oscillator.connect(gainNode);
        
        let time = 0;
        while (time < duration) {
            frequencies.forEach((freq, index) => {
                oscillator.frequency.setValueAtTime(freq, time + index * noteLength);
                gainNode.gain.setValueAtTime(0.3, time + index * noteLength);
                gainNode.gain.setValueAtTime(0.0, time + (index + 0.8) * noteLength);
            });
            time += frequencies.length * noteLength;
        }
        
        oscillator.start();
        oscillator.stop(duration);
        
        return gainNode;
    }

    function audioBufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2;
        const buffer_data = new ArrayBuffer(44 + length);
        const view = new DataView(buffer_data);
        
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numOfChan, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
        view.setUint16(32, numOfChan * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, length, true);
        
        const channelData = [];
        for (let channel = 0; channel < numOfChan; channel++) {
            channelData.push(buffer.getChannelData(channel));
        }
        
        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numOfChan; channel++) {
                const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return buffer_data;
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

// Ejecutar cuando se cargue la página
window.onload = generateSounds; 