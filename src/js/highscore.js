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

/**
 * Funktion zur Anzeige des Endbildschirms und Verarbeitung der Highscores.
 * @param {boolean} won - Ob das Spiel gewonnen wurde.
 */
export function showEndScreen(won) {
    const endScreen = document.getElementById('endScreen');
    const endMessage = document.getElementById('endMessage');
    const highScoreInput = document.getElementById('highScoreInput');
    const playerNameInput = document.getElementById('playerName');
    const submitScoreButton = document.getElementById('submitScoreButton');
    const restartButton = document.getElementById('restartButton');
    const resetHighscoresButton = document.getElementById('resetHighscoresButton');

    // Endscreen anzeigen und Timer stoppen
    endScreen.style.display = 'flex';
    document.body.classList.add('showing-end-screen'); // Klasse hinzufügen
    clearInterval(gameState.timerInterval); // Timer stoppen

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

        endMessage.textContent = message + ' Du hast Level ' + levelReached + ' erreicht.';
    }

    // Highscore-Daten erstellen
    const score = {
        name: '',
        level: gameState.currentTarget - 1,
        lives: gameState.lives,
        time: gameState.elapsedTime
    };

    // Highscores von SheetDB abrufen
    fetch(SHEETDB_API_URL)
        .then(response => response.json())
        .then(highScores => {
            // Neuen Score hinzufügen
            highScores.push(score);

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

            // Prüfen, ob der aktuelle Score in den Highscores ist
            const playerIsInHighScores = highScores.find(s => s.level === score.level && s.time === score.time && s.lives === score.lives);

            if (playerIsInHighScores) {
                // Eingabefeld für Namen anzeigen
                highScoreInput.style.display = 'flex';

                // Event Listener für den Submit-Button hinzufügen
                submitScoreButton.onclick = function submitHighScore() {
                    score.name = playerNameInput.value || 'Anonym'; // Name des Spielers festlegen
                    submitScoreButton.onclick = null; // Event Listener entfernen

                    // Score in SheetDB speichern
                    fetch(SHEETDB_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ data: [score] })
                    })
                    .then(() => {
                        displayHighScores(highScores);
                        highScoreInput.style.display = 'none';
                    });
                };
            } else {
                // Highscores anzeigen, wenn der Score nicht in den Top 10 ist
                displayHighScores(highScores);
            }
        });

    // Event Listener für den Neustart-Button hinzufügen
    restartButton.onclick = function() {
        endScreen.style.display = 'none';
        document.body.classList.remove('showing-end-screen'); // Klasse entfernen
        gameState.lives = config.maxLives;
        gameState.currentTarget = 1;
        resetGame();
        resetTimer(); // Timer zurücksetzen beim Neustart
        updateDisplay();
        playerNameInput.value = '';
        highScoreInput.style.display = 'none';
    };

    // Event Listener für den Reset-Button hinzufügen
    resetHighscoresButton.onclick = resetHighscores;
}

/**
 * Funktion zur Anzeige der Highscores.
 * @param {Array} highScores - Array der Highscore-Objekte.
 */
function displayHighScores(highScores) {
    const highScoresList = document.getElementById('highScores');
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
    if (confirm('Möchtest du wirklich alle Highscores zurücksetzen?')) {
        fetch(SHEETDB_API_URL + '/all', {
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
}
