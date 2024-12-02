// src/js/highscore.js

/**
 * highscore.js
 * Verwalten der Highscores, einschließlich Anzeige und Zurücksetzung.
 */

import { resetGameLogic } from './gameLogic.js';
import { resetGame } from './gameState.js';
import { updateDisplay } from './ui.js';
import { config } from './config.js';

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
    const highScoresList = document.getElementById('highScores');
    const restartButton = document.getElementById('restartButton');

    // Endscreen anzeigen und Timer stoppen
    endScreen.style.display = 'flex';
    clearInterval(timerInterval); // Timer stoppen

    // Nachricht basierend auf dem Spielstatus anzeigen
    if (won) {
        endMessage.textContent = 'Herzlichen Glückwunsch! Du hast das Spiel gewonnen!';
    } else {
        endMessage.textContent = 'Spiel vorbei! Du hast Level ' + (currentTarget - 1) + ' erreicht.';
    }

    // Highscore-Daten erstellen
    const score = {
        name: '',
        level: currentTarget - 1,
        lives: lives,
        time: elapsedTime
    };

    // Vorhandene Highscores aus localStorage abrufen
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Neuen Score hinzufügen und sortieren
    highScores.push(score);
    highScores.sort((a, b) => {
        if (b.level !== a.level) {
            return b.level - a.level; // Höheres Level ist besser
        } else {
            return a.time - b.time; // Weniger Zeit ist besser
        }
    });

    // Begrenzung auf Top 10 Highscores
    if (highScores.length > 10) {
        highScores.pop();
    }

    // Prüfen, ob der aktuelle Score in den Highscores ist
    const playerIsInHighScores = highScores.find(s => s.level === score.level && s.time === score.time && s.lives === score.lives);

    if (playerIsInHighScores) {
        // Eingabefeld für Namen anzeigen
        highScoreInput.style.display = 'flex';

        // Event Listener für den Submit-Button hinzufügen
        submitScoreButton.addEventListener('click', function submitHighScore() {
            score.name = playerNameInput.value || 'Anonym'; // Name des Spielers festlegen
            // Event Listener entfernen, um Mehrfachaufrufe zu vermeiden
            submitScoreButton.removeEventListener('click', submitHighScore);
            // Highscores speichern
            localStorage.setItem('highScores', JSON.stringify(highScores));
            displayHighScores(highScores);
            highScoreInput.style.display = 'none';
        });
    } else {
        // Highscores anzeigen, wenn der Score nicht in den Top 10 ist
        displayHighScores(highScores);
    }

    // Event Listener für den Neustart-Button hinzufügen
    restartButton.addEventListener('click', function() {
        endScreen.style.display = 'none';
        lives = config.maxLives;
        currentTarget = 1;
        resetGame();
        updateDisplay();
        playerNameInput.value = '';
        highScoreInput.style.display = 'none';
    });

    // Event Listener für den Reset-Button hinzufügen
    const resetHighscoresButton = document.getElementById('resetHighscoresButton');
    resetHighscoresButton.addEventListener('click', function() {
        if (confirm('Möchtest du wirklich alle Highscores zurücksetzen?')) {
            resetHighscores();
        }
    });
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
    localStorage.removeItem('highScores'); // Entfernt die Highscores aus localStorage
    alert('Highscores wurden zurückgesetzt!');
    displayHighScores([]); // Leere Highscore-Liste anzeigen
}
