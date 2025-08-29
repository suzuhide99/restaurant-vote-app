// パスワード認証機能は削除済み

// 設定データ
let appSettings = {
    personCount: 3,
    choiceCount: 3,
    cheatingPrevention: 'strict' // 'strict' or 'flexible'
};

// 人の表示名を生成
function getPersonName(index, count) {
    if (count === 3) {
        const names = ['長女', '次女', '三女'];
        return names[index] || `${index + 1}番目`;
    }
    return `${index + 1}番目`;
}

// 人のクラス名を生成
function getPersonClassName(index) {
    const classes = ['sister1', 'sister2', 'sister3', 'sister4', 'sister5'];
    return classes[index] || `person${index + 1}`;
}

// 人の絵文字を生成
function getPersonEmoji(index) {
    const emojis = ['👩🏻‍🦰', '🧑🏻‍🦱', '👩🏼‍🦳', '👨🏻‍🦰', '👩🏻‍🦳'];
    return emojis[index] || '👤';
}

// 姉妹のデータを動的に生成
function generatePeople() {
    const people = [];
    for (let i = 0; i < appSettings.personCount; i++) {
        people.push({
            id: i + 1,
            name: getPersonName(i, appSettings.personCount),
            className: getPersonClassName(i),
            emoji: getPersonEmoji(i)
        });
    }
    return people;
}

// 投票データを初期化
function initializeVotingData() {
    const data = {
        currentPerson: 0,
        choices: {},
        choicesWithTags: {},
        spinCount: 0,
        peopleOrder: []
    };
    
    for (let i = 0; i < appSettings.personCount; i++) {
        const key = `person${i + 1}`;
        data.choices[key] = [];
        data.choicesWithTags[key] = [];
    }
    
    return data;
}

let votingData = initializeVotingData();

// アプリ開始
function startVoting() {
    console.log('startVoting called');
    soundEffects.playButtonClick();
    
    // 人の順番をランダムにシャッフル
    const people = generatePeople();
    votingData.peopleOrder = [...people].sort(() => Math.random() - 0.5);
    console.log('投票順番:', votingData.peopleOrder.map(p => p.name));
    
    // 投票データを初期化
    votingData = initializeVotingData();
    votingData.peopleOrder = [...people].sort(() => Math.random() - 0.5);
    votingData.currentPerson = 0;
    
    // 入力画面を生成
    generateInputFields();
    
    showScreen('voting-screen');
    showCurrentPerson();
}

// 入力フィールドを動的に生成
function generateInputFields() {
    const inputSection = document.getElementById('input-section');
    inputSection.innerHTML = '';
    
    for (let i = 1; i <= appSettings.choiceCount; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';
        
        const inputNumber = document.createElement('span');
        inputNumber.className = 'input-number';
        inputNumber.textContent = `${i}.`;
        
        const autocompleteContainer = document.createElement('div');
        autocompleteContainer.className = 'autocomplete-container';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `choice${i}`;
        input.className = 'restaurant-input';
        input.placeholder = `${i}つ目のお店`;
        input.autocomplete = 'off';
        
        const autocompleteDiv = document.createElement('div');
        autocompleteDiv.id = `autocomplete${i}`;
        autocompleteDiv.className = 'autocomplete-items';
        
        const tagsDiv = document.createElement('div');
        tagsDiv.id = `tags${i}`;
        tagsDiv.className = 'selected-tags';
        
        autocompleteContainer.appendChild(input);
        autocompleteContainer.appendChild(autocompleteDiv);
        autocompleteContainer.appendChild(tagsDiv);
        
        wrapper.appendChild(inputNumber);
        wrapper.appendChild(autocompleteContainer);
        
        inputSection.appendChild(wrapper);
    }
    
    // オートコンプリートを再設定
    for (let i = 1; i <= appSettings.choiceCount; i++) {
        setupAutocomplete(`choice${i}`, `autocomplete${i}`, `tags${i}`);
        
        // Enterキーでの移動/送信を設定
        const input = document.getElementById(`choice${i}`);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (i < appSettings.choiceCount) {
                        // 次の入力フィールドへ
                        const nextInput = document.getElementById(`choice${i + 1}`);
                        if (nextInput) nextInput.focus();
                    } else {
                        // 最後のフィールドなら送信
                        submitChoices();
                    }
                }
            });
        }
    }
}

// 画面切り替え
function showScreen(screenId) {
    console.log(`画面切り替え: ${screenId}`);
    const screens = document.querySelectorAll('.screen');
    console.log('全画面数:', screens.length);
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    console.log(`ターゲット画面 ${screenId}:`, targetScreen);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log(`画面 ${screenId} をアクティブにしました`);
    } else {
        console.error(`画面 ${screenId} が見つかりません！`);
    }
}

// 現在の人の投票画面を表示
function showCurrentPerson() {
    const person = votingData.peopleOrder[votingData.currentPerson];
    
    document.getElementById('current-avatar').className = `sister-avatar ${person.className}`;
    document.getElementById('sister-name').textContent = `${person.name}の番`;
    
    // 指示テキストを更新
    const instructionText = document.getElementById('instruction-text');
    if (appSettings.choiceCount === 1) {
        instructionText.textContent = '食べたいお店を1つ書いてね！';
    } else {
        instructionText.textContent = `食べたいお店を${appSettings.choiceCount}つ書いてね！`;
    }
    
    // ナビゲーションボタンの表示制御
    updateNavigationButtons();
    
    // 既存の選択肢があれば復元、なければクリア
    const personKey = `person${person.id}`;
    const existingChoices = votingData.choices[personKey] || [];
    
    for (let i = 1; i <= appSettings.choiceCount; i++) {
        const choiceInput = document.getElementById(`choice${i}`);
        const tagsDiv = document.getElementById(`tags${i}`);
        const autocompleteDiv = document.getElementById(`autocomplete${i}`);
        
        if (choiceInput) {
            // 既存の選択肢があれば復元
            choiceInput.value = existingChoices[i-1] || '';
            
            // タグを復元
            if (existingChoices[i-1]) {
                const normalized = normalizeRestaurantName(existingChoices[i-1]);
                showTags(normalized.tags, tagsDiv);
            } else if (tagsDiv) {
                tagsDiv.innerHTML = '';
            }
        }
        
        if (autocompleteDiv) {
            autocompleteDiv.innerHTML = '';
            autocompleteDiv.classList.remove('show');
        }
    }
    
    // 最初の入力フィールドにフォーカス
    const firstInput = document.getElementById('choice1');
    if (firstInput) firstInput.focus();
}

// ナビゲーションボタンの表示制御
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-person-btn');
    const nextBtn = document.getElementById('next-person-btn');
    
    if (appSettings.cheatingPrevention === 'flexible') {
        // 柔軟モード：ナビゲーションボタンを表示
        if (prevBtn) {
            prevBtn.style.display = votingData.currentPerson > 0 ? 'inline-block' : 'none';
        }
        if (nextBtn) {
            // 次の人に投票済みデータがある場合のみ表示
            const nextPersonIndex = votingData.currentPerson + 1;
            if (nextPersonIndex < appSettings.personCount) {
                const nextPerson = votingData.peopleOrder[nextPersonIndex];
                const nextPersonKey = `person${nextPerson.id}`;
                const hasNextData = votingData.choices[nextPersonKey] && votingData.choices[nextPersonKey].length > 0;
                nextBtn.style.display = hasNextData ? 'inline-block' : 'none';
            } else {
                nextBtn.style.display = 'none';
            }
        }
    } else {
        // 厳格モード：ナビゲーションボタンを非表示
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    }
}

// 前の人に戻る
function goToPreviousPerson() {
    if (votingData.currentPerson > 0) {
        // 現在の入力を保存
        saveCurrentPersonChoices();
        
        votingData.currentPerson--;
        showCurrentPerson();
    }
}

// 次の人に進む
function goToNextPerson() {
    if (votingData.currentPerson < appSettings.personCount - 1) {
        // 現在の入力を保存
        saveCurrentPersonChoices();
        
        votingData.currentPerson++;
        showCurrentPerson();
    }
}

// 現在の人の選択肢を保存
function saveCurrentPersonChoices() {
    const person = votingData.peopleOrder[votingData.currentPerson];
    const personKey = `person${person.id}`;
    const choices = [];
    const choicesWithTags = [];
    
    for (let i = 1; i <= appSettings.choiceCount; i++) {
        const input = document.getElementById(`choice${i}`);
        if (input && input.value.trim()) {
            const normalized = normalizeRestaurantName(input.value.trim());
            choices.push(normalized.name);
            choicesWithTags.push(normalized);
        }
    }
    
    votingData.choices[personKey] = choices;
    votingData.choicesWithTags[personKey] = choicesWithTags;
}

// 選択を送信
function submitChoices() {
    console.log('submitChoices関数が呼ばれました！');
    soundEffects.playSubmitSound();
    const choices = [];
    const choicesWithTags = [];
    
    // デバッグ用：入力値をチェック
    for (let i = 1; i <= appSettings.choiceCount; i++) {
        const input = document.getElementById(`choice${i}`);
        const value = input ? input.value.trim() : '';
        console.log(`choice${i}の値:`, `"${value}"`);
    }
    
    for (let i = 1; i <= appSettings.choiceCount; i++) {
        const input = document.getElementById(`choice${i}`);
        if (!input) continue;
        
        const inputValue = input.value.trim();
        if (!inputValue) {
            console.log(`choice${i}が空です！`);
            const countText = appSettings.choiceCount === 1 ? '1つ' : `${appSettings.choiceCount}つすべて`;
            alert(`${countText}のお店を入力してください！`);
            return;
        }
        
        // 正規化してタグを取得
        const normalized = normalizeRestaurantName(inputValue);
        choices.push(normalized.name);
        choicesWithTags.push(normalized);
    }
    
    // データ保存
    const person = votingData.peopleOrder[votingData.currentPerson];
    const personKey = `person${person.id}`;
    votingData.choices[personKey] = choices;
    votingData.choicesWithTags[personKey] = choicesWithTags;
    
    console.log(`${personKey}の選択:`, choices);
    console.log(`${personKey}のタグ付き選択:`, choicesWithTags);
    
    // 次の人へ
    votingData.currentPerson++;
    
    if (votingData.currentPerson < appSettings.personCount) {
        // まだ投票が残っている
        showCurrentPerson();
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

// 結果表示エリアを動的に生成
function generateResultDisplay() {
    const sistersChoicesDiv = document.getElementById('sisters-choices');
    sistersChoicesDiv.innerHTML = '';
    
    for (let i = 0; i < appSettings.personCount; i++) {
        const person = votingData.peopleOrder[i];
        
        const sisterResult = document.createElement('div');
        sisterResult.className = 'sister-result';
        
        const avatar = document.createElement('div');
        avatar.className = `sister-avatar ${person.className}`;
        
        const name = document.createElement('h3');
        name.textContent = person.name;
        
        const choicesList = document.createElement('ul');
        choicesList.id = `person${person.id}-choices`;
        
        sisterResult.appendChild(avatar);
        sisterResult.appendChild(name);
        sisterResult.appendChild(choicesList);
        
        sistersChoicesDiv.appendChild(sisterResult);
    }
}

// ドラムロール後の結果表示
function showResultsAfterDrumroll() {
    // 結果表示エリアを生成
    generateResultDisplay();
    
    // 各人の選択を表示
    for (let i = 0; i < appSettings.personCount; i++) {
        const person = votingData.peopleOrder[i];
        const personKey = `person${person.id}`;
        const choices = votingData.choices[personKey];
        const listElement = document.getElementById(`${personKey}-choices`);
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
    
    // 各人の選択を個別に処理（重複除去）
    for (let i = 0; i < appSettings.personCount; i++) {
        const person = votingData.peopleOrder[i];
        const personKey = `person${person.id}`;
        const personChoices = votingData.choices[personKey];
        const uniqueChoices = [...new Set(personChoices.map(choice => choice.toLowerCase()))];
        
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
    let shouldShowRoulette = false; // ルーレットボタン表示フラグ
    
    // タグ一致がある場合の勝者を決定
    let tagMatchWinner = null;
    if (tagMatches.length > 0) {
        // タグ一致している店舗の中から最多票を選ぶ（重複除去）
        const taggedChoices = {};
        for (let i = 0; i < appSettings.personCount; i++) {
            const person = votingData.peopleOrder[i];
            const personKey = `person${person.id}`;
            const personTaggedChoices = new Set();
            votingData.choicesWithTags[personKey].forEach((choice, index) => {
                const hasMatchingTag = choice.tags.some(tag => tagMatches.includes(tag));
                if (hasMatchingTag) {
                    const name = votingData.choices[personKey][index].toLowerCase();
                    personTaggedChoices.add(name);
                }
            });
            
            // この人のユニークな選択肢をカウント
            personTaggedChoices.forEach(name => {
                taggedChoices[name] = (taggedChoices[name] || 0) + 1;
            });
        }
        
        if (Object.keys(taggedChoices).length > 0) {
            const maxTagVotes = Math.max(...Object.values(taggedChoices));
            const tagWinners = Object.entries(taggedChoices)
                .filter(([, count]) => count === maxTagVotes)
                .map(([choice]) => choice);
            tagMatchWinner = tagWinners[0];
        }
    }
    
    if (partialMatches.length > 0 && maxVotes >= appSettings.personCount) {
        // 部分一致がある場合（全員が同じ店を選んだ）- これを最優先に
        isUnanimous = true; // 全員一致
        shouldShowRoulette = false; // 真の全員一致なのでルーレット不要
        showPartialMatchCelebration(partialMatches[0], maxVotes);
        soundEffects.playFanfare();
    } else if (tagMatches.length > 0) {
        // タグ一致（全員が共通のジャンルを選んだ - 真の全員一致）
        isUnanimous = true; // 全員一致
        shouldShowRoulette = false; // 真の全員一致なのでルーレット不要
        showTagMatchCelebration(tagMatches);
        soundEffects.playTagMatch();
    } else if (maxVotes >= Math.ceil(appSettings.personCount / 2)) {
        // 過半数以上獲得（単なる人気店・人気ジャンル含む）
        isUnanimous = false; // 全員一致ではない
        if (winners.length === 1) {
            // 単独勝利
            shouldShowRoulette = false; // 勝者が決まっているのでルーレット不要
            winnerResultDiv.innerHTML = `
                <div>🏆 ${capitalizeFirst(winners[0])} 🏆</div>
                <span class="vote-count">${maxVotes}票</span>
            `;
        } else {
            // 同票
            shouldShowRoulette = true; // 同票なのでルーレットで決定
            winnerResultDiv.innerHTML = `
                <div>同票で決まらず！</div>
                <div class="tie-message">
                    ${winners.map(w => capitalizeFirst(w)).join(' と ')} が${maxVotes}票で同じ！
                    <br>ルーレットで決めよう！
                </div>
            `;
        }
    } else {
        // 票が分散（人気ジャンルでも決定的でない場合含む）
        soundEffects.playDisappointment();
        shouldShowRoulette = true; // 票が分散した場合はルーレットで決定
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
                    <br>ルーレットで決めよう！
                </div>
            `;
        }
    }
    
    // ルーレットボタンの表示/非表示を制御
    if (rouletteBtn) {
        if (isUnanimous || !shouldShowRoulette) {
            rouletteBtn.style.display = 'none'; // 全員一致または単独勝利の場合は非表示
        } else {
            rouletteBtn.style.display = 'block'; // 決着がつかない場合は表示
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
    votingData = initializeVotingData();
    
    // 紙吹雪エフェクトをクリア
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // サブタイトルを更新
    updateSubtitle();
    
    showScreen('welcome-screen');
}

// サブタイトルを更新
function updateSubtitle() {
    const subtitleText = document.getElementById('subtitle-text');
    if (appSettings.personCount === 3) {
        subtitleText.textContent = '3姉妹でレストランを決めよう！';
    } else {
        subtitleText.textContent = `${appSettings.personCount}人でレストランを決めよう！`;
    }
}

// 設定を表示
function showSettings() {
    soundEffects.playButtonClick();
    
    // 現在の設定値をセット
    document.getElementById('person-count').value = appSettings.personCount;
    document.getElementById('choice-count').value = appSettings.choiceCount;
    document.getElementById('cheating-prevention').value = appSettings.cheatingPrevention;
    
    showScreen('settings-screen');
}

// 設定を保存
function saveSettings() {
    soundEffects.playButtonClick();
    
    const personCount = parseInt(document.getElementById('person-count').value);
    const choiceCount = parseInt(document.getElementById('choice-count').value);
    const cheatingPrevention = document.getElementById('cheating-prevention').value;
    
    appSettings.personCount = personCount;
    appSettings.choiceCount = choiceCount;
    appSettings.cheatingPrevention = cheatingPrevention;
    
    // 投票データを初期化
    votingData = initializeVotingData();
    
    // サブタイトルを更新
    updateSubtitle();
    
    showScreen('welcome-screen');
}

// 設定をキャンセル
function cancelSettings() {
    soundEffects.playButtonClick();
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
    if (appSettings.personCount < 2) return [];
    
    const allChoices = [];
    for (let i = 0; i < appSettings.personCount; i++) {
        const person = votingData.peopleOrder[i];
        const personKey = `person${person.id}`;
        const personChoices = votingData.choices[personKey].map(c => c.toLowerCase());
        allChoices.push(personChoices);
    }
    
    const matches = [];
    
    // 最初の人の選択肢をチェック
    if (allChoices.length > 0) {
        allChoices[0].forEach(choice => {
            let isInAll = true;
            for (let i = 1; i < allChoices.length; i++) {
                if (!allChoices[i].includes(choice)) {
                    isInAll = false;
                    break;
                }
            }
            if (isInAll && !matches.includes(choice)) {
                matches.push(choice);
            }
        });
    }
    
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
    if (appSettings.personCount < 2) return [];
    
    const allTags = [];
    
    // 各人のタグを収集
    for (let i = 0; i < appSettings.personCount; i++) {
        const person = votingData.peopleOrder[i];
        const personKey = `person${person.id}`;
        const personTags = new Set();
        votingData.choicesWithTags[personKey].forEach(choice => {
            choice.tags.forEach(tag => personTags.add(tag));
        });
        allTags.push(personTags);
        console.log(`${person.name}のタグ:`, Array.from(personTags));
    }
    
    // 共通のタグを見つける
    const commonTags = [];
    if (allTags.length > 0) {
        allTags[0].forEach(tag => {
            let isCommon = true;
            for (let i = 1; i < allTags.length; i++) {
                if (!allTags[i].has(tag)) {
                    isCommon = false;
                    break;
                }
            }
            if (isCommon) {
                commonTags.push(tag);
            }
        });
    }
    
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
    
    // 直接ウェルカム画面を表示
    showScreen('welcome-screen');
    startApp();
});

// パスワード認証機能は削除済み

function startApp() {
    // 設定関連のイベントリスナー
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
        console.log('Settings button event listener added');
    }
    
    const saveSettingsBtn = document.querySelector('.save-settings-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
        console.log('Save settings button event listener added');
    }
    
    const cancelSettingsBtn = document.querySelector('.cancel-settings-btn');
    if (cancelSettingsBtn) {
        cancelSettingsBtn.addEventListener('click', cancelSettings);
        console.log('Cancel settings button event listener added');
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
        } else if (e.target.classList.contains('prev-person-btn')) {
            console.log('前の人ボタンがクリックされました！');
            e.preventDefault();
            goToPreviousPerson();
        } else if (e.target.classList.contains('next-person-btn')) {
            console.log('次の人ボタンがクリックされました！');
            e.preventDefault();
            goToNextPerson();
        }
    });
    
    // 結果発表ボタンのイベントリスナー
    const revealBtn = document.querySelector('.reveal-btn');
    if (revealBtn) {
        revealBtn.addEventListener('click', showResults);
        console.log('Reveal button event listener added');
    }
    
    // ルーレット開始ボタンのイベントリスナー（イベント委譲）
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('roulette-start-btn')) {
            console.log('ルーレット開始ボタンがクリックされました！');
            e.preventDefault();
            startRoulette();
        }
    });
    
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
    
    // Enterキーの処理は動的に設定されるため、ここでは削除
    // generateInputFields()内でオートコンプリート設定時に一緒に設定される
}

// ルーレット機能
function startRoulette() {
    soundEffects.playButtonClick();
    console.log('startRoulette関数が呼ばれました');
    console.log('現在の設定:', appSettings);
    console.log('投票データ:', votingData);
    
    // 全ての選択肢を集める
    const allChoices = [];
    
    // peopleOrderが存在しない場合は投票データのキーから直接取得
    if (!votingData.peopleOrder || votingData.peopleOrder.length === 0) {
        console.log('peopleOrderが空です。投票データのキーから直接取得します。');
        Object.keys(votingData.choices).forEach(personKey => {
            const choices = votingData.choices[personKey];
            console.log(`${personKey}の選択 (直接取得):`, choices);
            if (choices && choices.length > 0) {
                choices.forEach(choice => {
                    allChoices.push(choice);
                });
            }
        });
    } else {
        // 通常のpeopleOrderを使用した取得
        for (let i = 0; i < appSettings.personCount; i++) {
            const person = votingData.peopleOrder[i];
            const personKey = `person${person.id}`;
            console.log(`${i+1}番目の人: ${person.name}, キー: ${personKey}`);
            
            const choices = votingData.choices[personKey];
            console.log(`${personKey}の選択:`, choices);
            
            if (choices && choices.length > 0) {
                choices.forEach(choice => {
                    allChoices.push(choice);
                });
            }
        }
    }
    
    console.log('ルーレット用の全選択肢:', allChoices);
    
    if (allChoices.length === 0) {
        console.error('ルーレット用の選択肢が空です！');
        alert('ルーレットに使用する選択肢がありません。投票を確認してください。');
        return;
    }
    
    // ルーレット画面をリセット
    resetRouletteScreen();
    
    // ルーレットを作成
    createRouletteWheel(allChoices);
    
    // ルーレット画面を表示
    console.log('ルーレット画面に遷移します');
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
        
        // ボタンを再表示して再利用可能にする
        spinBtn.disabled = false;
        spinBtn.textContent = '泣きの一回！';
        spinBtn.style.display = 'block';
    }, 7000);
}