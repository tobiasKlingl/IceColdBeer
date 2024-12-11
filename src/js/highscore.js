// src/js/highscore.js
import { resetGameStats, resetGame, resetTimer, gameState } from './gameState.js';
import { updateDisplay } from './ui.js';
import { config } from './config.js';
import { db } from './firebaseConfig.js';
import { startGame } from './main.js';
import { formatTime, isWithinTopN, getPlayerRank, isNewScoreBetter, capitalizeName, sortScoresForDisplay } from './utils.js';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    setDoc,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const auth = getAuth();
signInAnonymously(auth)
  .then(() => {
    console.log('Erfolgreich anonym authentifiziert');
  })
  .catch((error) => {
    console.error('Fehler bei der anonymen Authentifizierung:', error);
  });

let currentModeIndex = config.modes.gameModeKeys.indexOf(gameState.viewMode);
let currentTab = 'overall';

function changeGameMode(direction) {
    currentModeIndex = (currentModeIndex + direction + config.modes.gameModeKeys.length) % config.modes.gameModeKeys.length;
    gameState.viewMode = config.modes.gameModeKeys[currentModeIndex];
    const endMessageElement = document.getElementById('endMessage');
    if (endMessageElement) {
        endMessageElement.textContent = '';
    }
    loadHighScores(currentTab);
}

const highScoreList = document.getElementById('highScoreList');

let touchStartX = 0;
let touchEndX = 0;

highScoreList.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

highScoreList.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
}, false);

function handleGesture() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        changeGameMode(1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        changeGameMode(-1);
    }
}

export async function showEndScreen(won, directAccess = false) {
    const endScreen = document.getElementById('endScreen');
    const endMessage = document.getElementById('endMessage');
    const highScoreInput = document.getElementById('highScoreInput');
    const playerNameInput = document.getElementById('playerName');
    const submitScoreButton = document.getElementById('submitScoreButton');
    const restartButton = document.getElementById('restartButton');
    const highScoreTitle = document.getElementById('highScoreTitle');

    const displayMode = directAccess ? gameState.viewMode : gameState.mode;
    const modeConfig = config.modes.gameModes[displayMode];

    highScoreTitle.innerHTML = `
    <span class="highscore-main">Highscore 🏆</span>
    <div class="highscore-header">
        <button id="swipeLeftButton" class="swipe-button">⇐</button>
        <span class="highscore-mode">${modeConfig.title.toUpperCase()} ${modeConfig.emoji}</span>
        <button id="swipeRightButton" class="swipe-button">⇒</button>
    </div>
    `;

    const swipeLeftButton = document.getElementById('swipeLeftButton');
    const swipeRightButton = document.getElementById('swipeRightButton');

    if (swipeLeftButton && swipeRightButton) {
        swipeLeftButton.addEventListener('click', () => {
            changeGameMode(-1);
        });
        swipeRightButton.addEventListener('click', () => {
            changeGameMode(+1);
        });
    }

    endScreen.style.display = 'flex';
    document.body.classList.add('showing-end-screen');
    clearInterval(gameState.timerInterval);

    if (directAccess) {
        endMessage.textContent = '';
        highScoreInput.classList.remove('active');
    } else {
        if (won) {
            endMessage.textContent = '🏆 Grandios! Du hast alle Level geschafft!';
        } else {
            const levelReached = gameState.currentTarget - 1;
            let message = '';
            if (levelReached < 3) {
                message = '🌱 Jeder fängt mal klein an.';
            } else if (levelReached < 6) {
                message = '💪 Stark! Weiter so.';
            } else if (levelReached < 9) {
                message = '🔥 Du kommst dem Ziel näher.';
            } else {
                message = '🚀 Fast geschafft.';
            }
            endMessage.textContent = `Level ${levelReached} erreicht! ${message}`;
        }
    }

    const score = {
        name: '',
        level: parseInt(gameState.currentTarget - 1, 10),
        lives: parseInt(gameState.lives, 10),
        time: parseInt(gameState.timeLastHole, 10),
        level_info: gameState.level_info,
        date: Timestamp.now()
    };

    const modeForScore = config.modes.gameModes[displayMode];
    const highscoreCollection = collection(db, modeForScore.highscoreSheetName);

    try {
        const q = query(
            highscoreCollection,
            orderBy('level', 'desc'),
            orderBy('time', 'asc'),
            orderBy('lives', 'desc'),
            limit(100)
        );
        const querySnapshot = await getDocs(q);
        let highScores = [];
        querySnapshot.forEach((doc) => {
            highScores.push({ id: doc.id, ...doc.data() });
        });

        if (!directAccess) {
            highScoreInput.classList.add('active');
            const cachedName = localStorage.getItem('playerName');
            if (cachedName) {
                playerNameInput.value = capitalizeName(cachedName);
            }

            submitScoreButton.onclick = async function submitHighScore() {
                const playerName = playerNameInput.value.trim().toLowerCase();
                if (playerName === '') {
                    Swal.fire('Bitte gib einen Namen ein.');
                    return;
                }
                score.name = playerName;
                submitScoreButton.disabled = true;

                try {
                    const qName = query(highscoreCollection, where('name', '==', playerName));
                    const querySnapshotName = await getDocs(qName);
                    const messages = [];
                    const playerRank = getPlayerRank(highScores, score);
                    const inTopTen = playerRank <= 10;
                    const inTopHundred = playerRank <= 100;

                    if (!querySnapshotName.empty) {
                        const existingDoc = querySnapshotName.docs[0];
                        const existingScore = existingDoc.data();
                        existingScore.level = Number(existingScore.level);
                        existingScore.time = Number(existingScore.time);
                        existingScore.lives = Number(existingScore.lives);

                        const updatedLevels = [];
                        const newScoreIsBetter = isNewScoreBetter(existingScore, score);

                        for (const info of score.level_info) {
                            const existingLevelInfoIndex = existingScore.level_info.findIndex(existingInfo => existingInfo.level === info.level);
                            if (existingLevelInfoIndex !== -1) {
                                const existingInfo = existingScore.level_info[existingLevelInfoIndex];
                                const existingTime = existingInfo.time;
                                if (info.time < existingTime) {
                                    existingScore.level_info[existingLevelInfoIndex].time = info.time;
                                    existingScore.level_info[existingLevelInfoIndex].lives = info.lives;
                                    existingScore.level_info[existingLevelInfoIndex].date = info.date;
                                    updatedLevels.push(info.level);
                                }
                            } else {
                                existingScore.level_info.push({
                                    level: info.level,
                                    time: info.time,
                                    lives: info.lives,
                                    date: info.date
                                });
                            }
                        }

                        if (newScoreIsBetter) {
                            existingScore.level = score.level;
                            existingScore.lives = score.lives;
                            existingScore.time = score.time;
                            existingScore.date = score.date;
                        }

                        if (updatedLevels.length > 0 || newScoreIsBetter) {
                            await setDoc(existingDoc.ref, existingScore, { merge: true });

                            if (newScoreIsBetter) {
                                let displayTime = formatTime(score.time);
                                messages.push(`🥇 Neuer Highscore!<br> Level ${score.level} in ${displayTime}.<br> Du bist nun auf Platz ${playerRank}.`);
                            } else {
                                messages.push('📈 Kein neuer Highscore.');
                            }

                            if (updatedLevels.length > 0) {
                                const levelsText = updatedLevels.length === 1
                                    ? `Zeit für Level ${updatedLevels[0]}`
                                    : `Zeiten für die Level ${updatedLevels.slice(0, -1).join(', ')} und ${updatedLevels.slice(-1)}`;
                                messages.push(`🔥 ${levelsText} verbessert.`);
                            }
                        } else {
                            messages.push('🚫 Zeiten nicht verbessert.');
                        }

                    } else {
                        await addDoc(highscoreCollection, score);
                        let displayTime = formatTime(score.time);
                        messages.push(`🏅 Dein erster Highscore!<br> Level ${score.level} in ${displayTime}.<br> Du bist auf Platz ${playerRank}.`);
                    }

                    if (inTopTen === true) {
                        messages.push('🎉 Glückwunsch! Du hast es in die TOP 10 geschafft!')
                    } else {
                        messages.push('😞 Du hast es leider nicht in die TOP 10 geschafft.')
                    }

                    Swal.fire({
                        html: messages.map(msg => `<p>${msg}</p>`).join(''),
                        icon: inTopTen ? 'success' : 'info',
                        confirmButtonText: 'OK',
                        background: '#2c2c2c',
                        color: '#ffffff',
                        iconColor: inTopTen ? '#4CAF50' : '#2196F3',
                        customClass: {
                            popup: 'swal2-dark-popup'
                        }
                    });

                    highScoreInput.classList.remove('active');
                    localStorage.setItem('playerName', playerName);
                    loadHighScores(currentTab);
                } catch (error) {
                    console.error('Fehler beim Speichern des Highscores:', error);
                    Swal.fire('❌ Fehler beim Speichern des Highscores.');
                } finally {
                    endMessage.textContent = ''
                    submitScoreButton.disabled = false;
                }
            };
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Highscores:', error);
        Swal.fire('❌ Fehler beim Abrufen der Highscores.');
    }

    restartButton.onclick = function() {
        endScreen.style.display = 'none';
        document.body.classList.remove('showing-end-screen');
        gameState.mode = gameState.viewMode;
        if (!gameState.canvas) {
            startGame();
        }

        resetGameStats();
        resetGame();
        resetTimer();
        updateDisplay();
        playerNameInput.value = '';
        highScoreInput.classList.remove('active');

        document.querySelector('header').style.display = 'flex';
        document.querySelector('.game-container').style.display = 'block';
        document.querySelector('.game-info').style.display = 'flex';
        document.querySelector('.controls').style.display = 'flex';
    };
}

function displayHighScores(highScores, tab = 'overall') {
    const highScoresTableBody = document.getElementById('highScoreItems');
    const highScoreTitle = document.getElementById('highScoreTitle');
    const highscoreTabs = document.querySelectorAll('.highscore-tab');

    highscoreTabs.forEach(tabButton => {
        if (tabButton.getAttribute('data-level') === tab.toString()) {
            tabButton.classList.add('active');
        } else {
            tabButton.classList.remove('active');
        }
    });

    const modeConfig = config.modes.gameModes[gameState.viewMode];

    if (tab === 'overall') {
        highScoreTitle.innerHTML = `
        <span class="highscore-main">Highscore 🏆</span>
        <div class="highscore-header">
            <button id="swipeLeftButton" class="swipe-button">⇐</button>
            <span class="highscore-mode">${modeConfig.title.toUpperCase()} ${modeConfig.emoji}</span>
            <button id="swipeRightButton" class="swipe-button">⇒</button>
        </div>
        `;
    } else {
        highScoreTitle.innerHTML = `
            <span class="highscore-main">Highscore 🏆</span>
            <div class="highscore-header">
                <button id="swipeLeftButton" class="swipe-button">⇐</button>
                <span class="highscore-mode">Level ${tab} ${modeConfig.emoji}</span>
                <button id="swipeRightButton" class="swipe-button">⇒</button>
            </div>
        `;
    }

    const swipeLeftButton = document.getElementById('swipeLeftButton');
    const swipeRightButton = document.getElementById('swipeRightButton');

    if (swipeLeftButton && swipeRightButton) {
        swipeLeftButton.addEventListener('click', () => {
            changeGameMode(-1);
        });
        swipeRightButton.addEventListener('click', () => {
            changeGameMode(+1);
        });
    }

    highScores = sortScoresForDisplay(highScores, tab);
    highScores = highScores.slice(0, 100);
    highScoresTableBody.innerHTML = '';

    const localStoragePlayerName = localStorage.getItem('playerName');

    highScores.forEach((score, index) => {
        let level;
        let displayTime;
        let lives;
        let formattedDate;

        if (tab == 'overall') {
            level = score.level;
            displayTime = formatTime(score.time);
            lives = score.lives;
            formattedDate = score.date.toDate().toLocaleDateString();
        } else {
            const levelNum = parseInt(tab, 10);
            const levelInfo = score.level_info.find(info => info.level === levelNum);
            displayTime = formatTime(levelInfo.time);
            lives = levelInfo.lives;
            formattedDate = levelInfo.date.toDate().toLocaleDateString();
            level = levelNum;
        }

        const isLastPlayer = score.name === localStoragePlayerName;

        const tr = document.createElement('tr');
        if (score.name === localStoragePlayerName) {
            tr.innerHTML = `
            <td class="highlight">${index + 1}.</td>
            <td class="highlight">${capitalizeName(score.name)}</td>
            <td class="highlight">${level}</td>
            <td class="highlight">${displayTime}</td>
            <td class="highlight">${lives}</td>
            <td class="highlight">${formattedDate}</td>
        `;
        } else {
            tr.innerHTML = `
            <td>${index + 1}.</td>
            <td>${capitalizeName(score.name)}</td>
            <td>${level}</td>
            <td>${displayTime}</td>
            <td>${lives}</td>
            <td>${formattedDate}</td>
        `;
        }
        
        highScoresTableBody.appendChild(tr);
    });

    // Scrollen zur hervorgehobenen Zeile, wenn sie nicht in den Top 10 ist
    const highlightCell = highScoresTableBody.querySelector('.highlight');
    if (highlightCell) {
        const tr = highlightCell.parentElement;
        const tableBody = highScoresTableBody.parentElement; // Annahme: tbody ist direkt unter #highScoreTable
        const rowTop = tr.offsetTop;
        const rowHeight = tr.offsetHeight;
        const tableHeight = highScoresTableBody.clientHeight;
    
        // Berechne die neue ScrollTop-Position
        const newScrollTop = rowTop - (tableHeight / 2) + (rowHeight / 2);
        highScoresTableBody.scrollTop = newScrollTop;
    }
}

async function loadHighScores(tab = 'overall') {
    const modeConfig = config.modes.gameModes[gameState.viewMode];
    const highscoreCollection = collection(db, modeConfig.highscoreSheetName);
    let q;

    if (tab === 'overall') {
        q = query(
            highscoreCollection, 
            orderBy('level', 'desc'), 
            orderBy('time', 'asc'), 
            orderBy('lives', 'desc'),
            limit(100));
    } else {
        const level = parseInt(tab, 10);
        q = query(
            highscoreCollection,
            where('level', '>=', level),
            orderBy('level', 'desc'),
            limit(100)
        );
    }

    try {
        const querySnapshot = await getDocs(q);
        let highScores = [];
        querySnapshot.forEach((doc) => {
            highScores.push({ id: doc.id, ...doc.data() });
        });
        displayHighScores(highScores, tab);
    } catch (error) {
        console.error('Fehler beim Abrufen der Highscores:', error);
        Swal.fire('❌ Fehler beim Abrufen der Highscores.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const highscoreTabs = document.querySelectorAll('.highscore-tab');
    highscoreTabs.forEach(tabButton => {
        tabButton.addEventListener('click', async () => {
            currentTab = tabButton.getAttribute('data-level');
            highscoreTabs.forEach(btn => btn.classList.remove('active'));
            tabButton.classList.add('active');
            loadHighScores(currentTab);
        });
    });
    loadHighScores(currentTab);
});
