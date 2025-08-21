// パスワード認証
const CORRECT_PASSWORD = '3sisters'; // パスワードを設定

// 姉妹のデータ
const sisters = [
    { id: 1, name: '長女', className: 'sister1', emoji: '👩🏻‍🦰' },
    { id: 2, name: '次女', className: 'sister2', emoji: '🧑🏻‍🦱' },
    { id: 3, name: '三女', className: 'sister3', emoji: '👩🏼‍🦳' }
];

// 投票データを保存
let votingData = {
    currentSister: 0,
    choices: {
        sister1: [],
        sister2: [],
        sister3: []
    },
    choicesWithTags: {
        sister1: [],
        sister2: [],
        sister3: []
    }
};

// アプリ開始
function startVoting() {
    console.log('startVoting called');
    soundEffects.playButtonClick();
    
    // 姉妹の順番をランダムにシャッフル
    votingData.sistersOrder = [...sisters].sort(() => Math.random() - 0.5);
    console.log('姉妹の順番:', votingData.sistersOrder.map(s => s.name));
    
    votingData.currentSister = 0;
    votingData.choices = {
        sister1: [],
        sister2: [],
        sister3: []
    };
    votingData.choicesWithTags = {
        sister1: [],
        sister2: [],
        sister3: []
    };
    
    showScreen('voting-screen');
    showCurrentSister();
}

// 画面切り替え
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// 現在の姉妹の投票画面を表示
function showCurrentSister() {
    const sister = votingData.sistersOrder[votingData.currentSister];
    
    document.getElementById('current-avatar').className = `sister-avatar ${sister.className}`;
    document.getElementById('sister-name').textContent = `${sister.name}の番`;
    
    // 入力フィールドとタグをクリア
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`choice${i}`).value = '';
        document.getElementById(`tags${i}`).innerHTML = '';
        document.getElementById(`autocomplete${i}`).innerHTML = '';
        document.getElementById(`autocomplete${i}`).classList.remove('show');
    }
    
    // 最初の入力フィールドにフォーカス
    document.getElementById('choice1').focus();
}

// 選択を送信
function submitChoices() {
    console.log('submitChoices関数が呼びれました！');
    soundEffects.playSubmitSound();
    const choices = [];
    const choicesWithTags = [];
    
    // デバッグ用：入力値をチェック
    for (let i = 1; i <= 3; i++) {
        const input = document.getElementById(`choice${i}`);
        const value = input ? input.value.trim() : '';
        console.log(`choice${i}の値:`, `"${value}"`);
    }
    
    for (let i = 1; i <= 3; i++) {
        const input = document.getElementById(`choice${i}`).value.trim();
        if (!input) {
            console.log(`choice${i}が空です！`);
            alert('3つすべてのお店を入力してください！');
            return;
        }
        
        // 正規化してタグを取得
        const normalized = normalizeRestaurantName(input);
        choices.push(normalized.name);
        choicesWithTags.push(normalized);
    }
    
    // データ保存（実際の姉妹IDに基づいて保存）
    const sister = votingData.sistersOrder[votingData.currentSister];
    const sisterKey = `sister${sister.id}`;
    votingData.choices[sisterKey] = choices;
    votingData.choicesWithTags[sisterKey] = choicesWithTags;
    
    console.log(`${sisterKey}の選択:`, choices);
    console.log(`${sisterKey}のタグ付き選択:`, choicesWithTags);
    
    // 次の姉妹へ
    votingData.currentSister++;
    
    if (votingData.currentSister < 3) {
        // まだ投票が残っている
        showCurrentSister();
    } else {
        // 全員終了 - 結果発表待機画面へ
        showReadyScreen();
    }
}

// 結果発表待機画面を表示
function showReadyScreen() {
    showScreen('ready-screen');
    soundEffects.playButtonClick();
}

// 結果を表示
function showResults() {
    console.log('showResults関数が呼ばれました！');
    
    // すぐに結果を表示
    showResultsAfterDrumroll();
}

// ドラムロール後の結果表示
function showResultsAfterDrumroll() {
    // 各姉妹の選択を表示
    for (let i = 1; i <= 3; i++) {
        const choices = votingData.choices[`sister${i}`];
        const listElement = document.getElementById(`sister${i}-choices`);
        listElement.innerHTML = '';
        
        choices.forEach(choice => {
            const li = document.createElement('li');
            li.textContent = choice;
            listElement.appendChild(li);
        });
    }
    
    // 部分一致をチェック
    const partialMatches = checkPartialMatches();
    
    // タグ一致をチェック
    const tagMatches = checkTagMatches();
    console.log('タグ一致チェック結果:', tagMatches);
    
    // 投票結果を集計（同一人物の重複は除外）
    const voteCount = {};
    
    // 各姉妹の選択を個別に処理（重複除去）
    for (let i = 1; i <= 3; i++) {
        const sisterChoices = votingData.choices[`sister${i}`];
        const uniqueChoices = [...new Set(sisterChoices.map(choice => choice.toLowerCase()))];
        
        uniqueChoices.forEach(choice => {
            voteCount[choice] = (voteCount[choice] || 0) + 1;
        });
    }
    
    // 最多得票数を見つける
    const maxVotes = Math.max(...Object.values(voteCount));
    const winners = Object.entries(voteCount)
        .filter(([choice, count]) => count === maxVotes)
        .map(([choice]) => choice);
    
    // 結果を表示
    const winnerResultDiv = document.getElementById('winner-result');
    
    // ルーレットボタンの表示制御
    const rouletteBtn = document.querySelector('.roulette-start-btn');
    let isUnanimous = false; // 全員一致フラグ
    
    // タグ一致がある場合の勝者を決定
    let tagMatchWinner = null;
    if (tagMatches.length > 0) {
        // タグ一致している店舗の中から最多票を選ぶ（重複除去）
        const taggedChoices = {};
        for (let i = 1; i <= 3; i++) {
            const sisterTaggedChoices = new Set();
            votingData.choicesWithTags[`sister${i}`].forEach((choice, index) => {
                const hasMatchingTag = choice.tags.some(tag => tagMatches.includes(tag));
                if (hasMatchingTag) {
                    const name = votingData.choices[`sister${i}`][index].toLowerCase();
                    sisterTaggedChoices.add(name);
                }
            });
            
            // この姉妹のユニークな選択肢をカウント
            sisterTaggedChoices.forEach(name => {
                taggedChoices[name] = (taggedChoices[name] || 0) + 1;
            });
        }
        
        if (Object.keys(taggedChoices).length > 0) {
            const maxTagVotes = Math.max(...Object.values(taggedChoices));
            const tagWinners = Object.entries(taggedChoices)
                .filter(([choice, count]) => count === maxTagVotes)
                .map(([choice]) => choice);
            tagMatchWinner = tagWinners[0];
        }
    }
    
    if (partialMatches.length > 0 && maxVotes >= 3) {
        // 部分一致がある場合（3人が同じ店を選んだ）- これを最優先に
        isUnanimous = true; // 全員一致
        showPartialMatchCelebration(partialMatches[0], maxVotes);
        soundEffects.playFanfare();
    } else if (tagMatches.length > 0) {
        // タグ一致（3人全員が同じジャンルを選んだが、店は異なる）
        isUnanimous = true; // 全員一致
        showTagMatchCelebration(tagMatches);
        soundEffects.playTagMatch();
    } else if (maxVotes >= 3) {
        // 3票以上獲得（ただし、全員一致ではない - 1人が同じ店を3つ選んだ場合など）
        isUnanimous = false; // 全員一致ではない
        if (winners.length === 1) {
            // 単独勝利
            winnerResultDiv.innerHTML = `
                <div>🏆 ${capitalizeFirst(winners[0])} 🏆</div>
                <span class="vote-count">${maxVotes}票</span>
            `;
        } else {
            // 同票
            winnerResultDiv.innerHTML = `
                <div>同票で決まらず！</div>
                <div class="tie-message">
                    ${winners.map(w => capitalizeFirst(w)).join(' と ')} が${maxVotes}票で同じ！
                    <br>じゃんけんで決めよう！
                </div>
            `;
        }
    } else {
        // 票が分散
        soundEffects.playDisappointment();
        if (winners.length === 1) {
            winnerResultDiv.innerHTML = `
                <div>🍴 ${capitalizeFirst(winners[0])} 🍴</div>
                <span class="vote-count">${maxVotes}票</span>
                <div style="margin-top: 10px; color: #666; font-size: 0.9em;">
                    みんなの意見がバラバラだね！
                </div>
            `;
        } else {
            // 複数が同票
            const topChoices = winners.slice(0, 3).map(w => capitalizeFirst(w)).join('、');
            winnerResultDiv.innerHTML = `
                <div>意見が分かれちゃった！</div>
                <div class="tie-message">
                    ${topChoices} などが${maxVotes}票
                    <br>話し合って決めよう！
                </div>
            `;
        }
    }
    
    // ルーレットボタンの表示/非表示を制御
    if (rouletteBtn) {
        if (isUnanimous) {
            rouletteBtn.style.display = 'none'; // 全員一致の場合は非表示
        } else {
            rouletteBtn.style.display = 'block'; // 意見が分かれた場合は表示
        }
    }
    
    showScreen('result-screen');
}

// 全員一致の特別演出
function showUnanimousCelebration(restaurant) {
    const celebrationDiv = document.getElementById('celebration');
    const unanimousDiv = document.getElementById('unanimous-choice');
    
    unanimousDiv.textContent = `みんな「${capitalizeFirst(restaurant)}」で一致！`;
    
    celebrationDiv.style.display = 'flex';
    
    // 花火エフェクト
    createFireworks();
    
    // 紙吹雪エフェクト
    startConfetti();
    
    // 6秒後に通常の結果画面も表示
    setTimeout(() => {
        celebrationDiv.style.display = 'none';
        showScreen('result-screen');
        
        // 結果画面にも特別なメッセージを表示
        const winnerResultDiv = document.getElementById('winner-result');
        winnerResultDiv.innerHTML = `
            <div style="font-size: 2.5em;">🎊 ${capitalizeFirst(restaurant)} 🎊</div>
            <div style="color: #ff6b6b; margin-top: 15px;">
                奇跡の全員一致！！！
            </div>
        `;
    }, 6000);
}

// 花火エフェクト
function createFireworks() {
    const fireworksDiv = document.querySelector('.fireworks');
    fireworksDiv.innerHTML = '';
    
    for (let i = 0; i < 60; i++) {  // 30→60に倍増
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            firework.style.background = getRandomColor();
            firework.style.boxShadow = `0 0 6px ${getRandomColor()}`;
            
            // ランダムな方向に飛ばす
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 200;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            firework.style.animation = `firework-burst 1s ease-out forwards`;
            firework.style.transform = `translate(${x}px, ${y}px) scale(0)`;
            
            fireworksDiv.appendChild(firework);
            
            setTimeout(() => {
                firework.remove();
            }, 1000);
        }, i * 50);  // 間隔を100ms→50msに短縮してより密に
    }
}

// 紙吹雪エフェクト
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const confettiCount = 150;
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8cc8', '#6c5ce7'];
    
    // 紙吹雪を作成
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 5 + 3,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 360,
            angleSpeed: Math.random() * 5 + 2
        });
    }
    
    // アニメーション
    let animationId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((c, index) => {
            c.y += c.vy;
            c.x += c.vx;
            c.angle += c.angleSpeed;
            
            ctx.save();
            ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
            ctx.rotate(c.angle * Math.PI / 180);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
            ctx.restore();
            
            // 画面外に出たら削除
            if (c.y > canvas.height) {
                confetti.splice(index, 1);
            }
        });
        
        if (confetti.length > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
    
    // 4秒後にクリア
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4000);
}

// アプリをリセット
function resetApp() {
    soundEffects.playButtonClick();
    votingData = {
        currentSister: 0,
        choices: {
            sister1: [],
            sister2: [],
            sister3: []
        },
        choicesWithTags: {
            sister1: [],
            sister2: [],
            sister3: []
        }
    };
    
    // 紙吹雪エフェクトをクリア
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    showScreen('welcome-screen');
}

// ランダムカラー生成
function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8cc8', '#6c5ce7', '#fd79a8', '#fdcb6e'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 最初の文字を大文字に
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// 部分一致をチェック
function checkPartialMatches() {
    const sister1 = votingData.choices.sister1.map(c => c.toLowerCase());
    const sister2 = votingData.choices.sister2.map(c => c.toLowerCase());
    const sister3 = votingData.choices.sister3.map(c => c.toLowerCase());
    
    const matches = [];
    
    // 各選択肢をチェック
    sister1.forEach(choice => {
        if (sister2.includes(choice) && sister3.includes(choice)) {
            if (!matches.includes(choice)) {
                matches.push(choice);
            }
        }
    });
    
    return matches;
}

// 部分一致の演出
function showPartialMatchCelebration(restaurant, votes) {
    soundEffects.playMediumCelebration();
    const celebrationDiv = document.getElementById('partial-celebration');
    const matchDiv = document.getElementById('partial-match-choice');
    
    matchDiv.textContent = `「${capitalizeFirst(restaurant)}」に${votes}票！`;
    
    celebrationDiv.style.display = 'flex';
    
    // スター エフェクト
    createStars();
    
    // 軽い紙吹雪
    startLightConfetti();
    
    // 5秒後に通常の結果画面も表示
    setTimeout(() => {
        celebrationDiv.style.display = 'none';
        showScreen('result-screen');
        
        // 結果画面にも特別なメッセージを表示
        const winnerResultDiv = document.getElementById('winner-result');
        winnerResultDiv.innerHTML = `
            <div style="font-size: 2em;">⭐ ${capitalizeFirst(restaurant)} ⭐</div>
            <span class="vote-count">${votes}票</span>
            <div style="color: #4ecdc4; margin-top: 15px;">
                みんなの気持ちが重なった！
            </div>
        `;
    }, 5000);
}

// スターエフェクト
function createStars() {
    const starsDiv = document.querySelector('.stars');
    if (!starsDiv) return;
    
    starsDiv.innerHTML = '';
    
    for (let i = 0; i < 40; i++) {  // 20→40に倍増
        setTimeout(() => {
            const star = document.createElement('div');
            star.className = 'star';
            star.innerHTML = '⭐';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.fontSize = (15 + Math.random() * 25) + 'px';
            
            starsDiv.appendChild(star);
            
            setTimeout(() => {
                star.remove();
            }, 2000);
        }, i * 50);  // 間隔を100ms→50msに短縮してより密に
    }
}

// 軽い紙吹雪エフェクト
function startLightConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const confettiCount = 80; // 通常より少なめ
    const colors = ['#4ecdc4', '#95e1d3', '#f38181', '#fce38a', '#a8d8ea'];
    
    // 紙吹雪を作成
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 8 + 3,
            h: Math.random() * 4 + 2,
            vx: Math.random() * 1 - 0.5,
            vy: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 360,
            angleSpeed: Math.random() * 3 + 1
        });
    }
    
    // アニメーション
    let animationId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((c, index) => {
            c.y += c.vy;
            c.x += c.vx;
            c.angle += c.angleSpeed;
            
            ctx.save();
            ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
            ctx.rotate(c.angle * Math.PI / 180);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
            ctx.restore();
            
            // 画面外に出たら削除
            if (c.y > canvas.height) {
                confetti.splice(index, 1);
            }
        });
        
        if (confetti.length > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
    
    // 2.5秒後にクリア
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 2500);
}

// タグ一致をチェック
function checkTagMatches() {
    const allTags = [];
    
    // 各姉妹のタグを収集
    for (let i = 1; i <= 3; i++) {
        const sisterTags = new Set();
        votingData.choicesWithTags[`sister${i}`].forEach(choice => {
            choice.tags.forEach(tag => sisterTags.add(tag));
        });
        allTags.push(sisterTags);
        console.log(`姉妹${i}のタグ:`, Array.from(sisterTags));
    }
    
    // 共通のタグを見つける
    const commonTags = [];
    allTags[0].forEach(tag => {
        if (allTags[1].has(tag) && allTags[2].has(tag)) {
            commonTags.push(tag);
        }
    });
    
    console.log('共通タグ:', commonTags);
    return commonTags;
}

// タグ一致の演出（最高レベル！）
function showTagMatchCelebration(tags) {
    const celebrationDiv = document.getElementById('celebration');
    const messageDiv = document.querySelector('.celebration-message h1');
    const choiceDiv = document.getElementById('unanimous-choice');
    
    // 一致したタグの中で最も具体的なものを選ぶ（例：「寿司」より「回転寿司」を優先）
    let displayTag = tags[0];
    if (tags.includes('回転寿司')) {
        displayTag = '回転寿司';
    } else if (tags.includes('寿司')) {
        displayTag = '寿司';
    }
    
    const tagIcon = tagDescriptions[displayTag] || '🏷️';
    
    // 全員一致の演出を流用（最高レベルの演出）
    messageDiv.textContent = '🎉 みんなの好みが完璧に一致！ 🎉';
    choiceDiv.innerHTML = `
        <div style="font-size: 1.5em;">みんな${tagIcon} ${displayTag}が大好き！</div>
        <div style="margin-top: 15px;">今日は「${displayTag}」で決まり！</div>
    `;
    
    celebrationDiv.style.display = 'flex';
    
    // 花火エフェクト（最高レベル）
    createFireworks();
    
    // 紙吹雪エフェクト（最高レベル）
    startConfetti();
    
    // 6秒後に通常の結果画面も表示
    setTimeout(() => {
        celebrationDiv.style.display = 'none';
        showScreen('result-screen');
        
        // 結果画面にも特別なメッセージを表示
        const winnerResultDiv = document.getElementById('winner-result');
        winnerResultDiv.innerHTML = `
            <div style="font-size: 2.5em;">🎊 ${tagIcon} ${displayTag} 🎊</div>
            <div style="color: #ff6b6b; margin-top: 15px;">
                奇跡の${displayTag}一致！！！
            </div>
        `;
    }, 6000);
}

// バブルエフェクト
function createBubbles() {
    const bubblesDiv = document.querySelector('.tag-bubbles');
    if (!bubblesDiv) return;
    
    bubblesDiv.innerHTML = '';
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'tag-bubble';
            const size = 20 + Math.random() * 40;
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.left = Math.random() * 100 + '%';
            
            bubblesDiv.appendChild(bubble);
            
            setTimeout(() => {
                bubble.remove();
            }, 3000);
        }, i * 200);
    }
}

// オートコンプリート機能を設定
function setupAutocomplete(inputId, autocompleteId, tagsId) {
    const input = document.getElementById(inputId);
    const autocompleteDiv = document.getElementById(autocompleteId);
    const tagsDiv = document.getElementById(tagsId);
    let selectedIndex = -1;
    
    // 入力イベント
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        const suggestions = getAutocompleteSuggestions(value);
        
        if (suggestions.length > 0 && value.length > 0) {
            showSuggestions(suggestions, autocompleteDiv, input, tagsDiv);
            selectedIndex = -1;
        } else {
            hideSuggestions(autocompleteDiv);
        }
    });
    
    // キーボードナビゲーション
    input.addEventListener('keydown', (e) => {
        const items = autocompleteDiv.querySelectorAll('.autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            selectSuggestion(items[selectedIndex].textContent, input, tagsDiv, autocompleteDiv);
        } else if (e.key === 'Escape') {
            hideSuggestions(autocompleteDiv);
        }
    });
    
    // フォーカスアウト時
    input.addEventListener('blur', () => {
        setTimeout(() => {
            hideSuggestions(autocompleteDiv);
            // 入力値を正規化してタグを表示
            const value = input.value.trim();
            if (value) {
                const normalized = normalizeRestaurantName(value);
                input.value = normalized.name;
                showTags(normalized.tags, tagsDiv);
            }
        }, 200);
    });
}

// 候補を表示
function showSuggestions(suggestions, autocompleteDiv, input, tagsDiv) {
    autocompleteDiv.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = suggestion;
        
        item.addEventListener('click', () => {
            selectSuggestion(suggestion, input, tagsDiv, autocompleteDiv);
        });
        
        autocompleteDiv.appendChild(item);
    });
    
    autocompleteDiv.classList.add('show');
}

// 候補を隠す
function hideSuggestions(autocompleteDiv) {
    autocompleteDiv.classList.remove('show');
    autocompleteDiv.innerHTML = '';
}

// 選択状態を更新
function updateSelection(items, index) {
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// 候補を選択
function selectSuggestion(suggestion, input, tagsDiv, autocompleteDiv) {
    input.value = suggestion;
    const normalized = normalizeRestaurantName(suggestion);
    showTags(normalized.tags, tagsDiv);
    hideSuggestions(autocompleteDiv);
}

// タグを表示
function showTags(tags, tagsDiv) {
    tagsDiv.innerHTML = '';
    
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        const icon = tagDescriptions[tag] || '🏷️';
        tagElement.innerHTML = `<span class="tag-icon">${icon}</span>${tag}`;
        tagsDiv.appendChild(tagElement);
    });
}

// 初期化とイベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    // パスワードが既に入力済みかチェック
    if (sessionStorage.getItem('authenticated') === 'true') {
        showScreen('welcome-screen');
        startApp();
    } else {
        setupPasswordScreen();
    }
});

// パスワード認証画面の設定
function setupPasswordScreen() {
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');
    
    // エンターキーでも認証
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // ボタンクリックで認証
    passwordSubmit.addEventListener('click', checkPassword);
    
    function checkPassword() {
        const inputPassword = passwordInput.value;
        
        if (inputPassword === CORRECT_PASSWORD) {
            // 認証成功
            sessionStorage.setItem('authenticated', 'true');
            passwordError.style.display = 'none';
            showScreen('welcome-screen');
            startApp();
            soundEffects.playSubmitSound();
        } else {
            // 認証失敗
            passwordError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.classList.add('shake');
            soundEffects.playButtonClick();
            
            setTimeout(() => {
                passwordInput.classList.remove('shake');
            }, 500);
        }
    }
}

function startApp() {
    // オートコンプリートを設定
    for (let i = 1; i <= 3; i++) {
        setupAutocomplete(`choice${i}`, `autocomplete${i}`, `tags${i}`);
    }
    
    // スタートボタンのイベントリスナー
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startVoting);
        console.log('Start button event listener added');
    }
    
    // 送信ボタンのイベントリスナー
    console.log('送信ボタンを探しています...');
    const submitBtn = document.querySelector('.submit-btn');
    console.log('送信ボタン:', submitBtn);
    
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            console.log('決定ボタンがクリックされました！');
            e.preventDefault();
            submitChoices();
        });
        console.log('Submit button event listener added');
    } else {
        console.log('Submit button not found!');
    }
    
    // イベント委譲でも試してみる
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('submit-btn')) {
            console.log('イベント委譲で決定ボタンがクリックされました！');
            e.preventDefault();
            submitChoices();
        }
    });
    
    // 結果発表ボタンのイベントリスナー
    const revealBtn = document.querySelector('.reveal-btn');
    if (revealBtn) {
        revealBtn.addEventListener('click', showResults);
        console.log('Reveal button event listener added');
    }
    
    // ルーレット開始ボタンのイベントリスナー
    const rouletteStartBtn = document.querySelector('.roulette-start-btn');
    if (rouletteStartBtn) {
        rouletteStartBtn.addEventListener('click', startRoulette);
        console.log('Roulette start button event listener added');
    }
    
    // ルーレット回転ボタンのイベントリスナー
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) {
        spinBtn.addEventListener('click', spinRoulette);
        console.log('Spin button event listener added');
    }
    
    // リスタートボタンのイベントリスナー
    const restartBtn = document.querySelector('.restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', resetApp);
        console.log('Restart button event listener added');
    }
    
    // ルーレット画面のリスタートボタン
    const restartBtnRoulette = document.querySelector('.restart-btn-roulette');
    if (restartBtnRoulette) {
        restartBtnRoulette.addEventListener('click', resetApp);
        console.log('Roulette restart button event listener added');
    }
    
    // Enterキーで送信
    const inputs = document.querySelectorAll('.restaurant-input');
    inputs.forEach((input, index) => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (index < inputs.length - 1) {
                    // 次の入力フィールドへ
                    inputs[index + 1].focus();
                } else {
                    // 最後のフィールドなら送信
                    submitChoices();
                }
            }
        });
    });
});

// ルーレット機能
function startRoulette() {
    soundEffects.playButtonClick();
    // 全ての選択肢を集める（9個）
    const allChoices = [];
    for (let i = 1; i <= 3; i++) {
        const choices = votingData.choices[`sister${i}`];
        choices.forEach(choice => {
            allChoices.push(choice);
        });
    }
    
    // ルーレット画面をリセット
    resetRouletteScreen();
    
    // ルーレットを作成
    createRouletteWheel(allChoices);
    
    // ルーレット画面を表示
    showScreen('roulette-screen');
}

// ルーレット画面をリセット
function resetRouletteScreen() {
    const wheel = document.getElementById('roulette-wheel');
    const spinBtn = document.getElementById('spin-btn');
    const resultDiv = document.getElementById('roulette-result');
    const restartBtn = document.querySelector('.restart-btn-roulette');
    
    // ルーレットの回転をリセット
    wheel.style.transform = 'rotate(0deg)';
    wheel.innerHTML = '';
    
    // ボタンの状態をリセット
    spinBtn.disabled = false;
    spinBtn.textContent = 'ルーレット開始！';
    spinBtn.style.display = 'block';
    spinBtn.style.transform = 'scale(1)';
    
    // 結果表示を隠す
    resultDiv.style.display = 'none';
    restartBtn.style.display = 'none';
}

function createRouletteWheel(choices) {
    const wheel = document.getElementById('roulette-wheel');
    wheel.innerHTML = '';
    
    const colors = [
        '#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8cc8',
        '#6c5ce7', '#fd79a8', '#fdcb6e', '#74b9ff'
    ];
    
    // SVGを作成
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 400 400');
    
    const segmentAngle = 360 / choices.length;
    const radius = 200;
    const centerX = 200;
    const centerY = 200;
    
    choices.forEach((choice, index) => {
        const startAngle = index * segmentAngle - 90; // 上から開始
        const endAngle = (index + 1) * segmentAngle - 90;
        
        // パスを計算
        const x1 = centerX + radius * Math.cos(startAngle * Math.PI / 180);
        const y1 = centerY + radius * Math.sin(startAngle * Math.PI / 180);
        const x2 = centerX + radius * Math.cos(endAngle * Math.PI / 180);
        const y2 = centerY + radius * Math.sin(endAngle * Math.PI / 180);
        
        // セグメントのパス
        const largeArcFlag = segmentAngle > 180 ? 1 : 0;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`);
        path.setAttribute('fill', colors[index % colors.length]);
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '2');
        
        svg.appendChild(path);
        
        // テキストを配置
        const textAngle = startAngle + segmentAngle / 2;
        const textRadius = radius * 0.65; // 中心から少し離れた位置
        const textX = centerX + textRadius * Math.cos(textAngle * Math.PI / 180);
        const textY = centerY + textRadius * Math.sin(textAngle * Math.PI / 180);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('style', 'text-shadow: 1px 1px 2px rgba(0,0,0,0.5);');
        
        // 長いテキストの場合は改行
        if (choice.length > 6) {
            const lines = splitText(choice, 6);
            lines.forEach((line, lineIndex) => {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.setAttribute('x', textX);
                tspan.setAttribute('dy', lineIndex === 0 ? '-0.5em' : '1em');
                tspan.textContent = line;
                text.appendChild(tspan);
            });
        } else {
            text.textContent = choice;
        }
        
        svg.appendChild(text);
    });
    
    // 中心に円を追加（デザイン的なアクセント）
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', centerX);
    centerCircle.setAttribute('cy', centerY);
    centerCircle.setAttribute('r', '30');
    centerCircle.setAttribute('fill', 'white');
    centerCircle.setAttribute('stroke', '#ff6b6b');
    centerCircle.setAttribute('stroke-width', '3');
    
    svg.appendChild(centerCircle);
    
    wheel.appendChild(svg);
    
    // ルーレットのデータを保存
    votingData.rouletteChoices = choices;
}

// テキストを分割する補助関数
function splitText(text, maxLength) {
    if (text.length <= maxLength) return [text];
    
    const middle = Math.floor(text.length / 2);
    let splitIndex = middle;
    
    // できるだけ単語の境界で分割
    for (let i = 0; i < maxLength; i++) {
        if (middle + i < text.length && (text[middle + i] === ' ' || text[middle + i].match(/[ー・]/))) {
            splitIndex = middle + i;
            break;
        }
        if (middle - i >= 0 && (text[middle - i] === ' ' || text[middle - i].match(/[ー・]/))) {
            splitIndex = middle - i;
            break;
        }
    }
    
    return [text.substring(0, splitIndex), text.substring(splitIndex)];
}

function spinRoulette() {
    const wheel = document.getElementById('roulette-wheel');
    const spinBtn = document.getElementById('spin-btn');
    const resultDiv = document.getElementById('roulette-result');
    const finalRestaurant = document.getElementById('final-restaurant');
    const restartBtn = document.querySelector('.restart-btn-roulette');
    
    // ボタンを無効化してテキストを変更
    spinBtn.disabled = true;
    spinBtn.textContent = '回転中...';
    
    // ルーレット回転音
    soundEffects.playRouletteSpinning();
    
    // ランダムな回転数を生成（5〜8回転 + ランダムな角度）
    const spins = Math.floor(Math.random() * 4) + 5;
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = spins * 360 + randomAngle;
    
    // 回転アニメーション
    wheel.style.transform = `rotate(${totalRotation}deg)`;
    
    // ドラムロール音のような演出のためのパルス効果
    let pulseCount = 0;
    const pulseInterval = setInterval(() => {
        spinBtn.style.transform = `scale(${1 + Math.sin(pulseCount * 0.3) * 0.1})`;
        pulseCount++;
    }, 100);
    
    // 結果が近づいてきたら「もうすぐ...」を表示
    setTimeout(() => {
        spinBtn.textContent = 'もうすぐ...！';
    }, 5000);
    
    // アニメーション完了後に結果を表示
    setTimeout(() => {
        clearInterval(pulseInterval);
        spinBtn.style.transform = 'scale(1)';
        
        // 選ばれた店を計算
        const segmentAngle = 360 / votingData.rouletteChoices.length;
        const normalizedAngle = (360 - (randomAngle % 360)) % 360;
        const selectedIndex = Math.floor(normalizedAngle / segmentAngle);
        const selectedRestaurant = votingData.rouletteChoices[selectedIndex];
        
        // 結果を表示
        finalRestaurant.textContent = `🎊 ${selectedRestaurant} 🎊`;
        resultDiv.style.display = 'block';
        restartBtn.style.display = 'inline-block';
        
        // ルーレット停止音
        soundEffects.playRouletteStop();
        
        // 紙吹雪エフェクト
        startLightConfetti();
        
        // ボタンを隠す
        spinBtn.style.display = 'none';
    }, 7000);
}