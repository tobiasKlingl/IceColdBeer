// src/js/input.js

/**
 * input.js
 * Verarbeitet die Benutzereingaben über die Schaltknüppel.
 */

import { gameState } from './gameState.js';
import { config } from './config.js';
import { resetGame, resetTimer } from './gameState.js';

export function setupInputHandlers() {
    setupJoystick('leftJoystick', 'left');
    setupJoystick('rightJoystick', 'right');

    document.getElementById('gameResetButton').addEventListener('click', () => {
        gameState.lives = config.maxLives;
        gameState.currentTarget = 1;
        resetGame();
        resetTimer(); // Timer zurücksetzen beim Neustart
    });
}

function setupJoystick(joystickId, side) {
    const joystick = document.getElementById(joystickId);
    const joystickContainer = joystick.parentElement;

    let touchId = null; // Speichert die Touch-ID für diesen Joystick

    const maxMovement = config.joystickMaxMovement; // Aus config.js
    const deadzone = config.joystickDeadzone; // Aus config.js

    const touchStart = (e) => {
        e.preventDefault(); // Verhindert das Scrollen bei Touch-Geräten
        for (let touch of e.changedTouches) {
            if (touchId === null) {
                if (touch.target === joystickContainer || joystickContainer.contains(touch.target)) {
                    touchId = touch.identifier;
                    handleTouchMove(touch);
                }
            }
        }
    };

    const touchMove = (e) => {
        for (let touch of e.changedTouches) {
            if (touch.identifier === touchId) {
                handleTouchMove(touch);
            }
        }
    };

    const touchEnd = (e) => {
        for (let touch of e.changedTouches) {
            if (touch.identifier === touchId) {
                touchId = null;
                resetJoystick();
            }
        }
    };

    function handleTouchMove(touch) {
        const rect = joystickContainer.getBoundingClientRect();
        const offsetY = touch.clientY - rect.top;
        let deltaY = offsetY - rect.height / 2;

        // Deadzone anwenden
        if (Math.abs(deltaY) < deadzone) {
            deltaY = 0;
        } else {
            deltaY -= Math.sign(deltaY) * deadzone; // Deadzone abziehen
        }

        // Begrenzen des Ausschlags
        deltaY = Math.max(-maxMovement, Math.min(maxMovement, deltaY));

        // Position des Joysticks anpassen
        joystick.style.top = `calc(50% - var(--joystick-handle-height) / 2 + ${deltaY}px)`;

        // Geschwindigkeit der Stange anpassen
        const speed = (deltaY / maxMovement) * config.baseBarSpeed * config.joystickSensitivity;

        if (side === 'left') {
            gameState.bar.leftYSpeed = speed;
        } else if (side === 'right') {
            gameState.bar.rightYSpeed = speed;
        }
    }

    function resetJoystick() {
        // Joystick zurück zur Ausgangsposition animieren
        joystick.style.transition = 'top 0.3s ease-out';
        joystick.style.top = 'calc(50% - var(--joystick-handle-height) / 2)';

        // Geschwindigkeit der Stange auf Null setzen
        if (side === 'left') {
            gameState.bar.leftYSpeed = 0;
        } else if (side === 'right') {
            gameState.bar.rightYSpeed = 0;
        }

        setTimeout(() => {
            joystick.style.transition = '';
        }, 300);
    }

    // Event Listener für Touch-Geräte
    joystickContainer.addEventListener('touchstart', touchStart, { passive: false });
    joystickContainer.addEventListener('touchmove', touchMove, { passive: false });
    joystickContainer.addEventListener('touchend', touchEnd);

    // Event Listener für Maus (für Tests am PC)
    joystickContainer.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Verhindert Textauswahl
        if (touchId === null) {
            touchId = 'mouse'; // Verwende 'mouse' als ID
            handleMouseMove(e);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', mouseUp);
        }
    });

    function handleMouseMove(e) {
        if (touchId !== 'mouse') return;
        const rect = joystickContainer.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        let deltaY = offsetY - rect.height / 2;

        // Deadzone anwenden
        if (Math.abs(deltaY) < deadzone) {
            deltaY = 0;
        } else {
            deltaY -= Math.sign(deltaY) * deadzone;
        }

        // Begrenzen des Ausschlags
        deltaY = Math.max(-maxMovement, Math.min(maxMovement, deltaY));

        // Position des Joysticks anpassen
        joystick.style.top = `calc(50% - var(--joystick-handle-height) / 2 + ${deltaY}px)`;

        // Geschwindigkeit der Stange anpassen
        const speed = (deltaY / maxMovement) * config.baseBarSpeed * config.joystickSensitivity;

        if (side === 'left') {
            gameState.bar.leftYSpeed = speed;
        } else if (side === 'right') {
            gameState.bar.rightYSpeed = speed;
        }
    }

    function mouseUp() {
        if (touchId !== 'mouse') return;
        touchId = null;
        resetJoystick();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', mouseUp);
    }
}

/**
 * Funktion zum Aktualisieren der Stangenpositionen.
 */
export function updateBars() {
    const adjustedHeight = gameState.canvas.height / (window.devicePixelRatio || 1);

    // Linke Stange bewegen
    gameState.bar.leftY += gameState.bar.leftYSpeed;
    gameState.bar.leftY = Math.max(0, Math.min(adjustedHeight, gameState.bar.leftY));

    // Rechte Stange bewegen
    gameState.bar.rightY += gameState.bar.rightYSpeed;
    gameState.bar.rightY = Math.max(0, Math.min(adjustedHeight, gameState.bar.rightY));
}
