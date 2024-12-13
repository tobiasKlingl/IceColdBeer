// src/js/main.js

/**
 * main.js
 * Der Haupt-Einstiegspunkt des Spiels.
 * Importiert und initialisiert alle notwendigen Module.
 */

import { showEndScreen } from './highscore.js';
import { initializeGame, gameState, resetGame} from './gameState.js';
import { setCSSVariables } from './utils.js';
import { config, } from './config.js';

/**
 * Funktion zum Umschalten des Version-Tags.
 */
function toggleVersionDisplay() {
    const versionDisplay = document.querySelector('.version-display');
    const modeSelectionScreen = document.getElementById('modeSelectionScreen');
    const gameContainer = document.querySelector('.game-container');
    const highScoreScreen = document.getElementById('endScreen');

    if (versionDisplay) {
        if (modeSelectionScreen.style.display !== 'none') {
            // Nur auf dem Hauptbildschirm anzeigen
            versionDisplay.style.display = 'block';
        } else if (gameContainer.style.display !== 'none' || highScoreScreen.style.display !== 'none') {
            // Ausblenden, wenn Spiel oder Highscore angezeigt werden
            versionDisplay.style.display = 'none';
        }
    }
}

/**
 * Funktion zum Starten des Spiels.
 */
function startGame() {
    // Modus-Auswahlbildschirm ausblenden
    document.getElementById('modeSelectionScreen').style.display = 'none';

    // Spiel-Elemente anzeigen
    document.querySelector('header').style.display = 'flex';
    document.querySelector('.game-container').style.display = 'block';
    document.querySelector('.game-info').style.display = 'flex';
    document.querySelector('.controls').style.display = 'flex';

    // Initialize game
    toggleVersionDisplay()
    initializeGame();
}

// Sobald das Fenster vollständig geladen ist, initialisiere das Spiel
window.onload = function() {
    setCSSVariables(); // CSS-Variablen setzen

    // Version Tag aktualisieren
    toggleVersionDisplay();

    // Modus-Auswahl-Buttons
    const beginnerModeButton = document.getElementById('beginnerModeButton');
    const advancedModeButton = document.getElementById('advancedModeButton');
    const expertModeButton = document.getElementById('expertModeButton');
    const viewHighscoresButton = document.getElementById('viewHighscoresButton');
    const backToModeSelectionButton = document.getElementById('backToModeSelectionButton');

    if (beginnerModeButton && advancedModeButton && expertModeButton && viewHighscoresButton && backToModeSelectionButton) {
        beginnerModeButton.addEventListener('click', () => {
            const mode = 'beginner';
            gameState.mode = mode;
            gameState.viewMode = mode;
            startGame();
        });

        advancedModeButton.addEventListener('click', () => {
            const mode = 'advanced'
            gameState.mode = mode;
            gameState.viewMode = mode;
            startGame();
        });

        expertModeButton.addEventListener('click', () => {
            const mode = 'expert'
            gameState.mode = mode;
            gameState.viewMode = mode;
            startGame();
        });

        viewHighscoresButton.addEventListener('click', () => {
            // Überprüfe, ob der aktuelle viewMode ein gültiger Modus ist
            if (!config.gameModeKeys.includes(gameState.viewMode)) {
                gameState.viewMode = 'beginner'; // Setze einen Standardmodus (z. B. 'beginner')
            }
            showEndScreen(false, true); // Zeige Highscore-Bildschirm ohne Spielende
        });

        backToModeSelectionButton.addEventListener('click', () => {
            // Zurück zur Modus-Auswahl
            location.reload(); // Seite neu laden
        });
    }
};
