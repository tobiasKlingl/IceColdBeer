// src/js/input.js

/**
 * input.js
 * Verwalten der Benutzereingaben (Button- und Touch-Ereignisse).
 */

import { startMoving, stopMoving, resetGameLogic } from './gameLogic.js';

/**
 * Funktion zur Einrichtung der Eingabe-Handler.
 * Bindet Ereignisse an die Steuerungselemente.
 */
export function setupInputHandlers() {
    // Buttons für die linke Stange
    addButtonEvent('leftUp', 'left', -1);
    addButtonEvent('leftDown', 'left', 1);

    // Buttons für die rechte Stange
    addButtonEvent('rightUp', 'right', -1);
    addButtonEvent('rightDown', 'right', 1);

    // Neustart-Button während des Spiels
    const gameResetButton = document.getElementById('gameResetButton');
    gameResetButton.addEventListener('click', function() {
        resetGame();
    });
}

/**
 * Hilfsfunktion zum Hinzufügen von Ereignis-Handlern zu Buttons.
 * @param {string} buttonId - Die ID des Buttons.
 * @param {string} barSide - 'left' oder 'right'.
 * @param {number} direction - -1 für aufwärts, 1 für abwärts.
 */
function addButtonEvent(buttonId, barSide, direction) {
    const button = document.getElementById(buttonId);

    // Maus-Ereignisse
    button.addEventListener('mousedown', function(event) {
        event.preventDefault();
        startMoving(barSide, direction);
    });

    button.addEventListener('mouseup', function() {
        stopMoving(barSide);
    });

    button.addEventListener('mouseleave', function() {
        stopMoving(barSide);
    });

    // Touch-Ereignisse für mobile Geräte
    button.addEventListener('touchstart', function(event) {
        event.preventDefault();
        startMoving(barSide, direction);
    });

    button.addEventListener('touchend', function() {
        stopMoving(barSide);
    });

    button.addEventListener('touchcancel', function() {
        stopMoving(barSide);
    });
}
