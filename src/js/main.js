// src/js/main.js

/**
 * main.js
 * Der Haupt-Einstiegspunkt des Spiels.
 * Importiert und initialisiert alle notwendigen Module.
 */

import { initializeGame, gameState } from './gameState.js';
import { setCSSVariables } from './utils.js';
import { showEndScreen } from './highscore.js';

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

    initializeGame();
}

// Sobald das Fenster vollständig geladen ist, initialisiere das Spiel
window.onload = function() {
    setCSSVariables(); // CSS-Variablen setzen

    // Modus-Auswahl-Buttons
    const normalModeButton = document.getElementById('normalModeButton');
    const expertModeButton = document.getElementById('expertModeButton');
    const viewHighscoresButton = document.getElementById('viewHighscoresButton');
    const backToModeSelectionButton = document.getElementById('backToModeSelectionButton');

    normalModeButton.addEventListener('click', () => {
        gameState.mode = 'normal';
        gameState.viewMode = 'normal'; // Setze viewMode auf 'normal'
        startGame();
    });

    expertModeButton.addEventListener('click', () => {
        gameState.mode = 'expert';
        gameState.viewMode = 'expert'; // Setze viewMode auf 'expert'
        startGame();
    });

    viewHighscoresButton.addEventListener('click', () => {
        // Setze viewMode auf 'normal' als Standard, falls nicht bereits gesetzt
        if (!['normal', 'expert'].includes(gameState.viewMode)) {
            gameState.viewMode = 'normal';
        }
        showEndScreen(false, true); // Zeige Highscore-Bildschirm ohne Spielende
    });

    backToModeSelectionButton.addEventListener('click', () => {
        // Zurück zur Modus-Auswahl
        location.reload(); // Seite neu laden
    });
};
