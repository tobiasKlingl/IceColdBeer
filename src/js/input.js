// src/js/input.js
import { gameState } from './gameState.js';
import { config } from './config.js';
import { resetGameStats, resetGame, resetTimer } from './gameState.js';
import { hideOverlay } from './ui.js';

export function setupInputHandlers() {
    setupJoystick('leftJoystick', 'left');
    setupJoystick('rightJoystick', 'right');

    document.getElementById('gameResetButton').addEventListener('click', () => {
        hideOverlay();
        gameState.overlayCancelled = true;
        resetGameStats();
        resetGame();
        resetTimer();
    });
}

function setupJoystick(joystickId, side) {
    const joystick = document.getElementById(joystickId);
    const joystickContainer = joystick.parentElement;

    let touchId = null;
    const maxMovement = config.bar.joystickMaxMovement;
    const deadzone = config.bar.joystickDeadzone;

    const touchStart = (e) => {
        e.preventDefault();
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

        if (Math.abs(deltaY) < deadzone) {
            deltaY = 0;
        } else {
            deltaY -= Math.sign(deltaY) * deadzone;
        }

        deltaY = Math.max(-maxMovement, Math.min(maxMovement, deltaY));
        joystick.style.top = `calc(50% - var(--joystick-handle-height) / 2 + ${deltaY}px)`;

        const speed = (deltaY / maxMovement) * config.bar.baseSpeed * config.bar.joystickSensitivity;

        if (side === 'left') {
            gameState.bar.leftYSpeed = speed;
        } else if (side === 'right') {
            gameState.bar.rightYSpeed = speed;
        }
    }

    function resetJoystick() {
        joystick.style.transition = 'top 0.3s ease-out';
        joystick.style.top = 'calc(50% - var(--joystick-handle-height) / 2)';
        if (side === 'left') {
            gameState.bar.leftYSpeed = 0;
        } else if (side === 'right') {
            gameState.bar.rightYSpeed = 0;
        }
        setTimeout(() => {
            joystick.style.transition = '';
        }, 300);
    }

    joystickContainer.addEventListener('touchstart', touchStart, { passive: false });
    joystickContainer.addEventListener('touchmove', touchMove, { passive: false });
    joystickContainer.addEventListener('touchend', touchEnd);

    joystickContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (touchId === null) {
            touchId = 'mouse';
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

        if (Math.abs(deltaY) < deadzone) {
            deltaY = 0;
        } else {
            deltaY -= Math.sign(deltaY) * deadzone;
        }

        deltaY = Math.max(-maxMovement, Math.min(maxMovement, deltaY));
        joystick.style.top = `calc(50% - var(--joystick-handle-height) / 2 + ${deltaY}px)`;

        const speed = (deltaY / maxMovement) * config.bar.baseSpeed * config.bar.joystickSensitivity;

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

export function updateBars(deltaTime) {
    gameState.bar.leftY += gameState.bar.leftYSpeed * deltaTime;
    gameState.bar.rightY += gameState.bar.rightYSpeed * deltaTime;

    const minY = gameState.ball.radius + gameState.bar.height / 2;
    if (gameState.bar.leftY < minY) gameState.bar.leftY = minY;
    if (gameState.bar.rightY < minY) gameState.bar.rightY = minY;
}
