// src/js/highscore.js

/**
 * highscore.js
 * Verwalten der Highscores, einschließlich Anzeige und Zurücksetzung.
 */

import { resetGame, resetTimer, gameState } from './gameState.js';
import { updateDisplay } from './ui.js';
import { config } from './config.js';

/**
 * API-URL von SheetDB (ersetze 'g71evyeurmuit' durch deine eigene URL)
 */
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/g71evyeurmuit';

/* Deklariere die Swipe-Buttons einmal außerhalb der Funktion */
const swipeLeftButton = document.getElementById('swipeLeftButton');
const swipeRightButton = document.getElementById('swipeRightButton');

/* Event Listener für Swipe Buttons hinzufügen */
if (swipeLeftButton && swipeRightButton) {
    swipeLeftButton.addEventListener('click', () => {
        // Wechsel des viewMode nach links (nach 'normal')
        const newMode = gameState.viewMode === 'expert' ? 'normal' : 'expert';
        gameState.viewMode = newMode;
        showEndScreen(false, true);
    });

    swipeRightButton.addEventListener('click', () => {
        // Wechsel des viewMode nach rechts (nach 'expert')
        const newMode = gameState.viewMode === 'expert' ? 'normal' : 'expert';
        gameState.viewMode = newMode;
        showEndScreen(false, true);
    });
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
        const newMode = gameState.viewMode === 'expert' ? 'normal' : 'expert';
        gameState.viewMode = newMode;
        showEndScreen(false, true);
    }

    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe nach rechts
        const newMode = gameState.viewMode === 'expert' ? 'normal' : 'expert';
        gameState.viewMode = newMode;
        showEndScreen(false, true);
    }
}

/**
 * Funktion zur Anzeige des Endbildschirms und Verarbeitung der Highscores.
 * @param {boolean} won - Ob das Spiel gewonnen wurde.
 * @param {boolean} directAccess - Ob der Highscore-Bildschirm direkt aufgerufen wurde.
 */
export function showEndScreen(won, directAccess = false) {
    const endScreen = document.getElementById('endScreen');
    const endMessage = document.getElementById('endMessage');
    const highScoreInput = document.getElementById('highScoreInput');
    const playerNameInput = document.getElementById('playerName');
    const submitScoreButton = document.getElementById('submitScoreButton');
    const restartButton = document.getElementById('restartButton');
    const resetHighscoresButton = document.getElementById('resetHighscoresButton');
    const highScoreTitle = document.getElementById('highScoreTitle');
    const swipeHint = document.getElementById('swipeHint');

    // Bestimme den Modus für die Highscore-Anzeige
    const displayMode = directAccess ? gameState.viewMode : gameState.mode;

    // Highscore-Titel setzen mit Emoji
    highScoreTitle.textContent = `Highscore - ${displayMode === 'expert' ? 'Experte 💀' : 'Normal 😀'}`;

    // Swipe-Hinweis anpassen (die Pfeile wurden bereits durch Buttons ersetzt)
    //swipeHint.textContent = 'TEST'; // Entferne den vorhandenen Text

    // Endscreen anzeigen und Timer stoppen
    endScreen.style.display = 'flex';
    document.body.classList.add('showing-end-screen'); // Klasse hinzufügen
    clearInterval(gameState.timerInterval); // Timer stoppen

    if (directAccess) {
        endMessage.textContent = '';
        highScoreInput.style.display = 'none';
    } else {
        // Nachricht basierend auf dem Spielstatus anzeigen
        if (won) {
            endMessage.textContent = '🏆 Grandios! Du hast alle Level geschafft!';
        } else {
            const levelReached = gameState.currentTarget - 1;
            let message = '';

            if (levelReached < 3) {
                message = '🌱 Du stehst noch am Anfang. Übung macht den Meister!';
            } else if (levelReached < 6) {
                message = '💪 Schon gut dabei! Weiter so!';
            } else if (levelReached < 9) {
                message = '🔥 Heiß! Du kommst dem Ziel näher!';
            } else {
                message = '🚀 Fast geschafft! Noch ein paar Level!';
            }

            endMessage.textContent = `${message} Du hast Level ${levelReached} erreicht.`;
        }
    }

    // Highscore-Daten erstellen
    const score = {
        name: '',
        level: parseInt(gameState.currentTarget - 1, 10),
        lives: parseInt(gameState.lives, 10),
        time: parseInt(gameState.elapsedTime, 10)
    };

    // Sheet-Name basierend auf dem displayMode
    const sheetName = displayMode === 'expert' ? config.highscoreSheetNames.expert : config.highscoreSheetNames.normal;

    // Highscores von SheetDB abrufen, unter Verwendung des entsprechenden Sheets
    fetch(`${SHEETDB_API_URL}?sheet=${sheetName}`)
        .then(response => response.json())
        .then(highScores => {
            // Konvertiere alle Highscores zu Zahlen
            highScores = highScores.map(hs => ({
                ...hs,
                level: parseInt(hs.level, 10),
                lives: parseInt(hs.lives, 10),
                time: parseInt(hs.time, 10)
            }));

            // Wenn nicht direkt aufgerufen und Spieler ist in Highscores
            if (!directAccess && shouldEnterHighScore(highScores, score)) {
                // Eingabefeld für Namen anzeigen
                highScoreInput.style.display = 'flex';

                // Event Listener für den Submit-Button hinzufügen
                submitScoreButton.onclick = function submitHighScore() {
                    score.name = playerNameInput.value.trim() || 'Anonym'; // Name des Spielers festlegen
                    submitScoreButton.onclick = null; // Event Listener entfernen

                    // Score in SheetDB speichern
                    fetch(`${SHEETDB_API_URL}?sheet=${sheetName}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ data: [score] })
                    })
                    .then(() => {
                        highScoreInput.style.display = 'none';
                        // Highscores aktualisieren und anzeigen
                        highScores.push(score);
                        displayHighScores(highScores);
                    })
                    .catch(error => {
                        console.error('Fehler beim Speichern des Highscores:', error);
                        alert('Fehler beim Speichern des Highscores.');
                    });
                };
            } else {
                if (!directAccess && !shouldEnterHighScore(highScores, score)) {
                    // Wenn der Score nicht in die Highscores kommt, trotzdem die aktuelle Liste anzeigen
                    endMessage.textContent += '\n\nLeider hast du es nicht in die Top 10 geschafft.';
                }
                displayHighScores(highScores);
            }
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Highscores:', error);
            alert('Fehler beim Abrufen der Highscores.');
        });

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
        highScoreInput.style.display = 'none';

        // Spiel-Elemente anzeigen
        document.querySelector('header').style.display = 'flex';
        document.querySelector('.game-container').style.display = 'block';
        document.querySelector('.game-info').style.display = 'flex';
        document.querySelector('.controls').style.display = 'flex';
    };

    // Event Listener für den Reset-Button hinzufügen
    resetHighscoresButton.onclick = resetHighscores;

    /**
     * Funktion zur Anzeige der Highscores.
     * @param {Array} highScores - Array der Highscore-Objekte.
     */
    function displayHighScores(highScores) {
        const highScoresList = document.getElementById('highScores');
        const highScoreTitle = document.getElementById('highScoreTitle');
        const sheetName = gameState.viewMode === 'expert' ? config.highscoreSheetNames.expert : config.highscoreSheetNames.normal;

        highScoreTitle.textContent = `Highscore - ${gameState.viewMode === 'expert' ? 'Experte 💀' : 'Normal 😀'}`;

        // Sortieren der Highscores
        highScores.sort((a, b) => {
            if (b.level !== a.level) {
                return b.level - a.level; // Höheres Level ist besser
            } else {
                return a.time - b.time; // Weniger Zeit ist besser
            }
        });

        // Begrenzung auf Top 10 Highscores
        highScores = highScores.slice(0, 10);

        highScoresList.innerHTML = '';
        highScores.forEach((score, index) => {
            const li = document.createElement('li');
            const minutes = Math.floor(score.time / 60).toString().padStart(2, '0');
            const seconds = (score.time % 60).toString().padStart(2, '0');
            li.textContent = `${index + 1}. ${score.name} - Level: ${score.level}, Leben: ${score.lives}, Zeit: ${minutes}:${seconds}`;
            highScoresList.appendChild(li);
        });
    }

    /**
     * Funktion zum Zurücksetzen der Highscores.
     */
    function resetHighscores() {
        const password = prompt('Bitte gib das Passwort zum Zurücksetzen der Highscores ein:');
        if (password === '2003') {
            if (confirm('Möchtest du wirklich alle Highscores zurücksetzen?')) {
                const sheetName = gameState.viewMode === 'expert' ? config.highscoreSheetNames.expert : config.highscoreSheetNames.normal;
                fetch(`${SHEETDB_API_URL}/all?sheet=${sheetName}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(() => {
                    alert('Highscores wurden zurückgesetzt!');
                    displayHighScores([]);
                })
                .catch(error => {
                    console.error('Fehler beim Zurücksetzen der Highscores:', error);
                    alert('Fehler beim Zurücksetzen der Highscores.');
                });
            }
        } else {
            alert('Falsches Passwort! Highscores wurden nicht zurückgesetzt.');
        }
    }

    /**
     * Funktion, um zu prüfen, ob der Spieler in die Highscores kommen sollte.
     */
    function shouldEnterHighScore(highScores, score) {
        // Sortieren der Highscores
        highScores.sort((a, b) => {
            if (b.level !== a.level) {
                return b.level - a.level; // Höheres Level ist besser
            } else {
                return a.time - b.time; // Weniger Zeit ist besser
            }
        });

        // Wenn weniger als 10 Highscores vorhanden sind
        if (highScores.length < 10) return true;

        // Prüfen, ob der Score besser ist als der letzte Highscore
        const lastScore = highScores[highScores.length - 1];
        if (score.level > lastScore.level) {
            return true;
        } else if (score.level === lastScore.level && score.time < lastScore.time) {
            return true;
        }
        return false;
    }
}
