// src/js/main.js
import { showEndScreen } from './highscore.js';
import { initializeGame, gameState } from './gameState.js';
import { setCSSVariables } from './utils.js';
import { config } from './config.js';

function toggleVersionDisplay() {
    const versionDisplay = document.querySelector('.version-display');
    const modeSelectionScreen = document.getElementById('modeSelectionScreen');
    const gameContainer = document.querySelector('.game-container');
    const highScoreScreen = document.getElementById('endScreen');

    if (versionDisplay) {
        if (modeSelectionScreen.style.display !== 'none') {
            versionDisplay.style.display = 'block';
        } else if (gameContainer.style.display !== 'none' || highScoreScreen.style.display !== 'none') {
            versionDisplay.style.display = 'none';
        }
    }
}

export function startGame() {
    document.getElementById('modeSelectionScreen').style.display = 'none';
    document.querySelector('header').style.display = 'flex';
    document.querySelector('.game-container').style.display = 'block';
    document.querySelector('.game-info').style.display = 'flex';
    document.querySelector('.controls').style.display = 'flex';

    toggleVersionDisplay();
    initializeGame();
}

window.onload = function() {
    setCSSVariables();
    toggleVersionDisplay();

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
            const mode = 'advanced';
            gameState.mode = mode;
            gameState.viewMode = mode;
            startGame();
        });

        expertModeButton.addEventListener('click', () => {
            const mode = 'expert';
            gameState.mode = mode;
            gameState.viewMode = mode;
            startGame();
        });

        viewHighscoresButton.addEventListener('click', () => {
            if (!config.modes.gameModeKeys.includes(gameState.viewMode)) {
                gameState.viewMode = 'beginner';
            }
            showEndScreen(false, true);
        });

        backToModeSelectionButton.addEventListener('click', () => {
            location.reload();
        });
    }
};
