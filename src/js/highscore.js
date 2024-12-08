// src/js/highscore.js

/**
 * highscore.js
 * Verwalten der Highscores, einschließlich Anzeige und Zurücksetzung.
 */

import { resetGame, resetTimer, gameState } from './gameState.js';
import { updateDisplay } from './ui.js';
import { config } from './config.js';
import { db } from './firebaseConfig.js';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    doc,
    getDoc,
    setDoc,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Initialisiere Firebase Authentication
const auth = getAuth();
signInAnonymously(auth)
  .then(() => {
    console.log('Erfolgreich anonym authentifiziert');
  })
  .catch((error) => {
    console.error('Fehler bei der anonymen Authentifizierung:', error);
  });

let currentModeIndex = config.gameModeKeys.indexOf(gameState.viewMode); // Aktuellen Modus im Array finden
let currentTab = 'overall'; // Standardmäßig auf 'overall' setzen

/**
 * Funktion zur Änderung des Spielmodus.
 * @param {number} direction - Richtung der Änderung (-1 für links, 1 für rechts)
 */
function changeGameMode(direction) {
    currentModeIndex = (currentModeIndex + direction + config.gameModeKeys.length) % config.gameModeKeys.length;
    gameState.viewMode = config.gameModeKeys[currentModeIndex];

     // Entferne die Nachricht vom Endbildschirm
     const endMessageElement = document.getElementById('endMessage');
     if (endMessageElement) {
         endMessageElement.textContent = '';
     }

    // Nach dem Wechsel des Spielmodus laden wir die Highscores neu für den aktuellen Modus und ausgewählten Reiter
    loadHighScores(currentTab);
}

/* Swipe-Gesten auf dem Highscore-Bereich erkennen */
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

/**
 * Funktion zur Handhabung von Swipe-Gesten
 */
function handleGesture() {
    const swipeThreshold = 50; // Mindestdistanz in Pixeln für eine Swipe-Geste

    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe nach links
        //currentModeIndex = (currentModeIndex === 0) ? config.gameModeKeys.length - 1 : currentModeIndex - 1;
        //gameState.viewMode = config.gameModeKeys[currentModeIndex];
        changeGameMode(1);
    }

    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe nach rechts
        //currentModeIndex = (currentModeIndex + 1) % config.gameModeKeys.length;
        //gameState.viewMode = config.gameModeKeys[currentModeIndex];
        changeGameMode(-1);
    }
}

/**
 * Funktion zur Anzeige des Endbildschirms und Verarbeitung der Highscores.
 * @param {boolean} won - Ob das Spiel gewonnen wurde.
 * @param {boolean} directAccess - Ob der Highscore-Bildschirm direkt aufgerufen wurde.
 */
export async function showEndScreen(won, directAccess = false) {
    const endScreen = document.getElementById('endScreen');
    const endMessage = document.getElementById('endMessage');
    const highScoreInput = document.getElementById('highScoreInput');
    const playerNameInput = document.getElementById('playerName');
    const submitScoreButton = document.getElementById('submitScoreButton');
    const restartButton = document.getElementById('restartButton');
    const highScoreTitle = document.getElementById('highScoreTitle');

    // Bestimme den Modus für die Highscore-Anzeige
    const displayMode = directAccess ? gameState.viewMode : gameState.mode;
    const modeConfig = config.gameModes[displayMode];

    // Setze den Titel in zwei Zeilen
    highScoreTitle.innerHTML = `
    <span class="highscore-main">Highscore 🏆</span>
    <div class="highscore-header">
        <button id="swipeLeftButton" class="swipe-button">⇐</button>
        <span class="highscore-mode">${modeConfig.title.toUpperCase()} ${modeConfig.emoji}</span>
        <button id="swipeRightButton" class="swipe-button">⇒</button>
    </div>
    `;

    // Nach dem Setzen von highScoreTitle.innerHTML
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

    // Endscreen anzeigen und Timer stoppen
    endScreen.style.display = 'flex';
    document.body.classList.add('showing-end-screen'); // Klasse hinzufügen
    clearInterval(gameState.timerInterval); // Timer stoppen

    if (directAccess) {
        endMessage.textContent = '';
        highScoreInput.classList.remove('active');
    } else {
        // Nachricht basierend auf dem Spielstatus anzeigen
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

    // Highscore-Daten erstellen
    const score = {
        name: '',
        level: parseInt(gameState.currentTarget - 1, 10),
        lives: parseInt(gameState.lives, 10),
        time: parseInt(gameState.timeLastHole, 10),
        level_info: gameState.level_info,
        date: Timestamp.now()
    };
    
    const highscoreCollection = collection(db, modeConfig.highscoreSheetName);

    try {
        // Highscores abrufen
        const q = query(
            highscoreCollection, 
            orderBy('level', 'desc'), 
            orderBy('time', 'asc'), 
            orderBy('lives', 'desc'), 
            limit(10));
        const querySnapshot = await getDocs(q);
        let highScores = [];
        querySnapshot.forEach((doc) => {
            highScores.push({ id: doc.id, ...doc.data() });
        });

        if (!directAccess) {
            // Eingabefeld für Namen anzeigen
            highScoreInput.classList.add('active');

            // Vorausfüllen des Namensfeldes mit dem gespeicherten Namen, falls vorhanden
            const cachedName = localStorage.getItem('playerName');
            if (cachedName) {
                playerNameInput.value = capitalizeName(cachedName);
            }

            // Event Listener für den Submit-Button hinzufügen
            submitScoreButton.onclick = async function submitHighScore() {
                const playerName = playerNameInput.value.trim().toLowerCase(); // Name in Kleinbuchstaben umwandeln

                if (playerName === '') {
                    Swal.fire('Bitte gib einen Namen ein.');
                    return;
                }

                score.name = playerName;

                // Deaktiviere den Button, um Mehrfachklicks zu verhindern
                submitScoreButton.disabled = true;

                try {
                    // Überprüfen, ob der Name bereits existiert
                    const qName = query(highscoreCollection, where('name', '==', playerName));
                    const querySnapshotName = await getDocs(qName);

                    const messages = [];

                    // Ergebnis von topTenReached speichern
                    const inTopTen = topTenReached(highScores, score);

                    if (!querySnapshotName.empty) {
                        // Eintrag mit diesem Namen existiert bereits
                        const existingDoc = querySnapshotName.docs[0];
                        const existingScore = existingDoc.data();

                        // Sicherstellen, dass die vorhandenen Daten numerisch sind
                        existingScore.level = Number(existingScore.level);
                        existingScore.time = Number(existingScore.time);
                        existingScore.lives = Number(existingScore.lives);

                        const updatedLevels = [];

                        const newScoreIsBetter = isNewScoreBetter(existingScore, score);

                        // 1. Aktualisiere immer die Array Felder von Level n, wenn der neue Wert besser ist

                        for (const info of score.level_info) {
                            // Finde das entsprechende level_info Objekt im bestehenden Score
                            const existingLevelInfoIndex = existingScore.level_info.findIndex(existingInfo => existingInfo.level === info.level);
                            console.log("existingLevelInfoIndex = " + existingLevelInfoIndex);
                            if (existingLevelInfoIndex !== -1) {
                                const existingInfo = existingScore.level_info[existingLevelInfoIndex];
                                const existingTime = existingInfo.time;
                                // Aktualisiere nur, wenn der neue Time-Wert besser ist
                                if (info.time < existingTime) {
                                    existingScore.level_info[existingLevelInfoIndex].time = info.time;
                                    existingScore.level_info[existingLevelInfoIndex].lives = info.lives;
                                    existingScore.level_info[existingLevelInfoIndex].date = info.date;
                                    updatedLevels.push(info.level); // Füge das aktualisierte Level zum Array hinzu
                                }
                            } else {
                                // Wenn das Level nicht existiert, füge es hinzu
                                existingScore.level_info.push({
                                    level: info.level,
                                    time: info.time,
                                    lives: info.lives,
                                    date: info.date
                                });
                            }
                        }

                        // 2. Zusätzlich, wenn der gesamte Score besser ist, aktualisiere lives, time und date
                        if (newScoreIsBetter) {
                            // Erstelle ein Update-Objekt mit den Feldern, die aktualisiert werden sollen
                            existingScore.level = score.level;
                            existingScore.lives = score.lives;
                            existingScore.time = score.time;
                            existingScore.date = score.date;
                        }
                        
                        // 3. Überprüfe, ob es Felder gibt, die aktualisiert werden müssen
                        if (updatedLevels.length > 0 || newScoreIsBetter) {
                            await setDoc(existingDoc.ref, existingScore, { merge: true });

                            if (newScoreIsBetter) {
                                let displayTime = formatTime(score.time);
                                messages.push(`🥇 Neuer Highscore! Level ${score.level} in ${displayTime}`);
                            } else {
                                messages.push('📈 Kein neuer Highscore.');
                            }

                            if (updatedLevels.length > 0) {
                                // Erstelle eine string-Repräsentation der aktualisierten Level
                                const levelsText = updatedLevels.length === 1 
                                    ? `Zeit für Level ${updatedLevels[0]}`
                                    : `Zeiten für die Level ${updatedLevels.slice(0, -1).join(', ')} und ${updatedLevels.slice(-1)}`;
                                messages.push(`🔥 ${levelsText} verbessert.`);
                            }
                        } else {
                            messages.push('🚫 Zeiten nicht verbessert.');
                        }
                        
                    } else {
                        // Kein bestehender Eintrag - füge neuen Highscore hinzu
                        await addDoc(highscoreCollection, score);
                        let displayTime = formatTime(score.time);
                        messages.push(`🏅 Dein erster Highscore! Level ${score.level} in ${displayTime}`);
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
                        background: '#2c2c2c', // Dunkler Hintergrund
                        color: '#ffffff',        // Heller Text
                        iconColor: inTopTen ? '#4CAF50' : '#2196F3', // Anpassung der Icon-Farbe
                        customClass: {
                            popup: 'swal2-dark-popup'
                        }
                    });

                    // Blende das Eingabefeld nach der Bestätigung aus
                    highScoreInput.classList.remove('active');;

                    // Speichere den Namen im localStorage
                    localStorage.setItem('playerName', playerName);

                    // Highscores aktualisieren und anzeigen
                    loadHighScores(currentTab);
                } catch (error) {
                    console.error('Fehler beim Speichern des Highscores:', error);
                    Swal.fire('❌ Fehler beim Speichern des Highscores.');
                } finally {
                    submitScoreButton.disabled = false; // Button wieder aktivieren
                }
            };
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Highscores:', error);
        Swal.fire('❌ Fehler beim Abrufen der Highscores.');
    }

    // Event Listener für den Neustart-Button hinzufügen
    restartButton.onclick = function() {
        endScreen.style.display = 'none';
        document.body.classList.remove('showing-end-screen'); // Klasse entfernen
        gameState.lives = config.maxLives;
        gameState.currentTarget = 1;
        gameState.mode = gameState.viewMode;
        resetGame();
        resetTimer(); // Timer zurücksetzen beim Neustart
        updateDisplay();
        playerNameInput.value = '';
        highScoreInput.classList.remove('active');;

        // Spiel-Elemente anzeigen
        document.querySelector('header').style.display = 'flex';
        document.querySelector('.game-container').style.display = 'block';
        document.querySelector('.game-info').style.display = 'flex';
        document.querySelector('.controls').style.display = 'flex';
    };
}

/**
 * Funktion zur Anzeige der Highscores.
 * @param {Array} highScores - Array der Highscore-Objekte.
 */
function displayHighScores(highScores, tab = 'overall') {
    if (config.withLogging === true) {
    console.log(`displayHighScores aufgerufen für Tab: ${tab}`);
    }

    const highScoresTableBody = document.getElementById('highScoreItems');
    const highScoreTitle = document.getElementById('highScoreTitle');
    const highscoreTabs = document.querySelectorAll('.highscore-tab');

    // Setze den aktiven Tab
    highscoreTabs.forEach(tabButton => {
        if (tabButton.getAttribute('data-level') === tab.toString()) {
            tabButton.classList.add('active');
        } else {
            tabButton.classList.remove('active');
        }
    });

    // Hole die Konfiguration für den aktuellen Modus
    const modeConfig = config.gameModes[gameState.viewMode];

    // Passe den Titel an
    if (tab === 'overall') {
        highScoreTitle.innerHTML = `
        <span class="highscore-main">Highscore 🏆</span>
        <div class="highscore-header">
            <button id="swipeLeftButton" class="swipe-button">⇐</button>
            <span class="highscore-mode">${config.gameModes[gameState.viewMode].title.toUpperCase()} ${config.gameModes[gameState.viewMode].emoji}</span>
            <button id="swipeRightButton" class="swipe-button">⇒</button>
        </div>
        `;
    } else {
        highScoreTitle.innerHTML = `
            <span class="highscore-main">Highscore 🏆</span>
            <div class="highscore-header">
                <button id="swipeLeftButton" class="swipe-button">⇐</button>
                <span class="highscore-mode">Level ${tab} ${config.gameModes[gameState.viewMode].emoji}</span>
                <button id="swipeRightButton" class="swipe-button">⇒</button>
            </div>
        `;
    }

     // Nach dem Setzen von highScoreTitle.innerHTML
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

    // Sortiere die Highscores
    if (tab === 'overall') {
        highScores.sort((a, b) => {
            if (b.level !== a.level) {
                return b.level - a.level; // Höheres Level ist besser
            } else if (a.time !== b.time) {
                return a.time - b.time; // Weniger Zeit ist besser
            } else {
                return b.lives - a.lives; // Mehr Leben ist besser
            }
        });
    } else {
        const level = parseInt(tab, 10);
        highScores.sort((a, b) => {
            // Zugriff auf das level_info Element mit dem spezifischen Level
            const levelInfoA = a.level_info.find(info => info.level === level);
            const levelInfoB = b.level_info.find(info => info.level === level);
            if (levelInfoA.time !== levelInfoB.time) {
                return levelInfoA.time - levelInfoB.time; // Weniger Zeit ist besser
            } else {
                return levelInfoB.lives - levelInfoA.lives; // Mehr Leben ist besser
            }
        });
    }

    // Begrenze auf Top 10
    highScores = highScores.slice(0, 10);

    // Tabelle leeren
    highScoresTableBody.innerHTML = '';

    // Highscores einfügen
    highScores.forEach((score, index) => {
        let level;
        let displayTime;
        let lives;
        let formattedDate;

        if (tab == 'overall') {
            level = score.level;
            displayTime = formatTime(score.time);
            lives = score.lives;
            formattedDate = score.date.toDate().toLocaleDateString(); // Datum formatieren
        } else {
            level = parseInt(tab, 10);
            // Zugriff auf das level_info Element mit dem spezifischen Level
            const levelInfo = score.level_info.find(info => info.level === level);
            displayTime = formatTime(levelInfo.time);
            lives = levelInfo.lives;
            formattedDate = levelInfo.date.toDate().toLocaleDateString();
        }

        // Erstelle eine neue Tabellenzeile
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}.</td>
            <td>${capitalizeName(score.name)}</td>
            <td>${level}</td>
            <td>${displayTime}</td>
            <td>${lives}</td>
            <td>${formattedDate}</td>
        `;
        highScoresTableBody.appendChild(tr);
    });
}

function formatTime(milliseconds) {
    if (milliseconds === null || milliseconds === undefined || milliseconds < 0) {
        return 'N/A'; // Für ungültige Zeiten
    }

    const totalSeconds = milliseconds / 1000; // Sekunden als Dezimalzahl
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    const thousandths  = Math.floor((milliseconds % 1000)).toString().padStart(3, '0');

    return `${minutes}:${seconds}.${thousandths }`;
}

/**
 * Funktion zur Anzeige der Highscores basierend auf dem ausgewählten Tab.
 * @param {string|number} tab - Der ausgewählte Tab ('overall' oder Levelnummer als String).
 */
async function loadHighScores(tab = 'overall') {
    const modeConfig = config.gameModes[gameState.viewMode];
    const highscoreCollection = collection(db, modeConfig.highscoreSheetName);
    let q;

    if (tab === 'overall') {
        q = query(
            highscoreCollection, 
            orderBy('level', 'desc'), 
            orderBy('time', 'asc'), 
            orderBy('lives', 'desc'), 
            limit(10));
        console.log('Executing query for Overall high scores');
    } else {
        const level = parseInt(tab, 10);
        q = query(
            highscoreCollection,
            where('level', '>=', level),
            orderBy('level', 'desc'),
            limit(10)
        );
        console.log(`Executing query for Level ${level} high scores`);
    }

    try {
        const querySnapshot = await getDocs(q);
        let highScores = [];
        querySnapshot.forEach((doc) => {
            highScores.push({ id: doc.id, ...doc.data() });
        });

        console.log(`Fetched ${highScores.length} high scores for ${tab} tab`);

        displayHighScores(highScores, tab);
    } catch (error) {
        console.error('Fehler beim Abrufen der Highscores:', error);
        Swal.fire('❌ Fehler beim Abrufen der Highscores.');
    }
}

/**
 * Funktion, um zu prüfen, ob der Spieler in die Overall Highscore kommen sollte.
 * @param {Array} highScores - Aktuelle Highscores im Overall Reiter.
 * @param {Object} score - Neuer Score im Overall Reiter.
 * @returns {boolean} - True, wenn der Spieler in die Overall Highscores aufgenommen werden sollte.
 */
function topTenReached(highScores, score) {
    // Sortieren der Highscores nach den gleichen Kriterien wie in displayHighScores
    highScores.sort((a, b) => {
        if (b.level !== a.level) {
            return b.level - a.level; // Höheres Level ist besser
        } else if (a.time !== b.time) {
            return a.time - b.time; // Weniger Zeit ist besser
        } else {
            return b.lives - a.lives; // Mehr Leben ist besser
        }
    });

    // Wenn weniger als 10 Highscores vorhanden sind
    if (highScores.length < 10) return true;

    // Prüfen, ob der Score besser ist als der letzte Highscore
    const lastScore = highScores[highScores.length - 1];
    if (score.level > lastScore.level) {
        return true;
    } else if (score.level === lastScore.level) {
        if (score.time < lastScore.time) {
            return true;
        } else if (score.time === lastScore.time && score.lives > lastScore.lives) {
            return true;
        }
    }
    return false;
}

/**
 * Funktion, um zu prüfen, ob der neue Score besser ist als der bestehende.
 * @param {Object} existingScore - Das bestehende Highscore-Objekt.
 * @param {Object} newScore - Das neue Highscore-Objekt.
 * @returns {boolean} - True, wenn der neue Score besser ist.
 */
function isNewScoreBetter(existingScore, newScore) {
    if (newScore.level > existingScore.level) {
        return true;
    } else if (newScore.level === existingScore.level) {
        if (newScore.time < existingScore.time) {
            return true;
        } else if (newScore.time === existingScore.time && newScore.lives > existingScore.lives) {
            return true;
        }
    }
    return false;
}

/**
 * Funktion zur Großschreibung des ersten Buchstabens des Namens.
 * @param {string} name - Der Name des Spielers.
 * @returns {string} - Der Name mit großgeschriebenem ersten Buchstaben.
 */
function capitalizeName(name) {
    if (name.length === 0) return name;
    return name.charAt(0).toUpperCase() + name.slice(1);
}

/* Hinzufügen von Tab-Event-Listenern nach dem Laden des DOM */
document.addEventListener('DOMContentLoaded', () => {
    const highscoreTabs = document.querySelectorAll('.highscore-tab');
    highscoreTabs.forEach(tabButton => {
        tabButton.addEventListener('click', async () => {
            currentTab = tabButton.getAttribute('data-level');
            console.log(`Tab clicked: ${currentTab}`);

            // Entferne alle aktiven Tabs und setze den aktuellen Tab als aktiv
            highscoreTabs.forEach(btn => btn.classList.remove('active'));
            tabButton.classList.add('active');

            // Lade die Highscores für den ausgewählten Tab
            loadHighScores(currentTab);
        });
    });

    // Automatisches Laden des 'overall' Reiters beim Seitenladen
    loadHighScores(currentTab);
});