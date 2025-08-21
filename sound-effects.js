// Web Audio APIを使った効果音生成
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Safariの場合、ユーザーインタラクション後にコンテキストを開始する必要がある
            if (this.audioContext.state === 'suspended') {
                const startAudio = () => {
                    this.audioContext.resume().then(() => {
                        console.log('AudioContext resumed');
                    });
                    document.removeEventListener('click', startAudio);
                    document.removeEventListener('touchstart', startAudio);
                };
                document.addEventListener('click', startAudio);
                document.addEventListener('touchstart', startAudio);
            }
        } catch (e) {
            console.warn('Web Audio API is not supported in this browser');
        }
    }

    // ボタンクリック音
    playButtonClick() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
            return;
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // 決定ボタン音
    playSubmitSound() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
            return;
        }
        
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(659.25, this.audioContext.currentTime); // E5
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime + 0.05);
        oscillator1.stop(this.audioContext.currentTime + 0.2);
        oscillator2.stop(this.audioContext.currentTime + 0.25);
    }

    // ファンファーレ（全員一致）
    playFanfare() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
            return;
        }
        
        // 口笛効果音
        this.playWhistle();
        
        // ファンファーレ（音量を下げる）
        setTimeout(() => {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.5);
                }, index * 100);
            });
        }, 300);

        // セリフに変更（よりハイテンション）
        setTimeout(() => {
            this.speakText("AMAZING! EVERYONE AGREED!", 1.3, 0.85);
        }, 400);
    }

    // 中程度の祝福音（部分一致）
    playMediumCelebration() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
            return;
        }
        
        // 短い口笛だけ
        this.playShortWhistle();
        
        const notes = [440, 554.37, 659.25]; // A4, C#5, E5
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, index * 80);
        });

        // セリフに変更（よりハイテンション）
        setTimeout(() => {
            this.speakText("FANTASTIC! You guys are amazing!", 1.8, 1.3);
        }, 300);
    }

    // 短い口笛効果音
    playShortWhistle() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
            return;
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        
        // 短い口笛
        const now = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(1000, now);
        oscillator.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
        
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    // 残念音（バラバラ）
    playDisappointment() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
            return;
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);

        // 音声は無し（音割れ防止）
    }

    // ルーレット回転音
    playRouletteSpinning() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
            return;
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(10, this.audioContext.currentTime);
        lfo.frequency.exponentialRampToValueAtTime(2, this.audioContext.currentTime + 6);
        
        lfoGain.gain.setValueAtTime(50, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime + 5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 7);
        
        lfo.start(this.audioContext.currentTime);
        oscillator.start(this.audioContext.currentTime);
        lfo.stop(this.audioContext.currentTime + 7);
        oscillator.stop(this.audioContext.currentTime + 7);
    }

    // ルーレット停止音
    playRouletteStop() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
            return;
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        oscillator.frequency.setValueAtTime(1108.73, this.audioContext.currentTime + 0.1); // C#6
        oscillator.frequency.setValueAtTime(1318.51, this.audioContext.currentTime + 0.2); // E6
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);

        // シンプルに "Winner!" だけ（ハイテンション）
        setTimeout(() => {
            this.speakText("IT'S DECIDED!", 1.8, 1.1);
        }, 300);
    }

    // 音声合成（アメリカンな感じ）
    speakText(text, pitch = 1, rate = 1) {
        if ('speechSynthesis' in window) {
            // 既存の音声をキャンセル
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US'; // アメリカ英語
            utterance.pitch = pitch;
            utterance.rate = rate;
            utterance.volume = 0.8; // 音量を上げてはっきり
            
            // アメリカンなアクセントの音声を選択（女性の声を優先）
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.lang === 'en-US' && (voice.name.includes('Samantha') || voice.name.includes('Female') || voice.name.includes('Karen'))
            ) || voices.find(voice => 
                voice.lang === 'en-US'
            );
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    }

    // タグ一致の特別音
    playTagMatch() {
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume();
            return;
        }
        
        // 口笛効果音
        this.playWhistle();
        
        // アルペジオ風の音（音量を下げる）
        setTimeout(() => {
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4-C6
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 1);
                }, index * 50);
            });
        }, 400);

        // セリフに変更（よりハイテンション）
        setTimeout(() => {
            this.speakText("OH MY GOD! Same category!", 1.5, 0.9);
        }, 600);
    }

    // ドラムロール効果音（よくあるポップなドラムロール）
    playDrumroll() {
        if (!this.audioContext) return;
        
        const duration = 2; // 2秒間のドラムロール
        const now = this.audioContext.currentTime;
        
        // ドゥるるるる…スタイルのドラヤロール
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const lfoOsc = this.audioContext.createOscillator(); // トレモロ用
        const lfoGain = this.audioContext.createGain();
        
        // トレモロ設定
        lfoOsc.type = 'sine';
        lfoOsc.frequency.setValueAtTime(20, this.audioContext.currentTime); // 20Hzのトレモロ
        lfoOsc.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + duration * 0.8); // 徐々に早く
        
        lfoGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        
        // 接続
        lfoOsc.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // メイン音
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        
        // 音量変化（徐々に大きく）
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, this.audioContext.currentTime + duration * 0.9);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        // 開始
        lfoOsc.start(this.audioContext.currentTime);
        oscillator.start(this.audioContext.currentTime);
        
        // 停止
        lfoOsc.stop(this.audioContext.currentTime + duration);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        // 最後に「バン！」
        setTimeout(() => {
            this.playBangSound();
        }, duration * 1000);
    }
    
    // バン！効果音（シンバル）
    playBangSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(4000, this.audioContext.currentTime); // 高いシンバル音
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 1.5);
        
        // ハイパスフィルターでシンバルらしさを演出
        filterNode.type = 'highpass';
        filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        filterNode.Q.setValueAtTime(0.5, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1.5);
    }
    
    // ポップなシンバルクラッシュ効果音
    playPopCymbalCrash() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 1);
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }
    
    // シンバルクラッシュ効果音
    playCymbalCrash() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(5000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 2);
        
        filterNode.type = 'highpass';
        filterNode.frequency.setValueAtTime(3000, this.audioContext.currentTime);
        filterNode.Q.setValueAtTime(0.5, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 2);
    }

    // 口笛効果音
    playWhistle() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        
        // 口笛のような周波数変化
        const now = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
        oscillator.frequency.setValueAtTime(1600, now + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.setValueAtTime(0.1, now + 0.3);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        
        // ビブラート効果
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        
        vibrato.frequency.setValueAtTime(5, now);
        vibratoGain.gain.setValueAtTime(15, now);
        
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        
        vibrato.start(now);
        vibrato.stop(now + 0.4);
    }
}

// グローバル変数として音響効果インスタンスを作成
const soundEffects = new SoundEffects();