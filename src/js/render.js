// src/js/render.js

/**
 * render.js
 * Kümmert sich um das Zeichnen der Spielgrafiken auf dem Canvas.
 */

import { gameState } from './gameState.js';
import { applyPhysics } from './physics.js';
import { config } from './config.js';

/**
 * Hauptzeichnungsfunktion.
 * @param {number} deltaTime - Zeit seit dem letzten Frame in Sekunden.
 */
export function draw(deltaTime) {
    // Canvas leeren
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    // Löcher zeichnen
    gameState.holes.forEach(hole => {
        // Lochfarbe bestimmen
        let holeColor;
        const holeTypeNum = parseInt(hole.Type, 10);

        if (holeTypeNum === gameState.currentTarget) {
            holeColor = config.colors.currentTargetHoleColor;
        } else if (holeTypeNum >= 1 && holeTypeNum <= config.totalLevels) {
            holeColor = config.colors.otherTargetHoleColor;
        } else {
            holeColor = config.colors.missHoleColor;
        }

        // Loch füllen
        gameState.ctx.beginPath();
        gameState.ctx.arc(hole.actualX, hole.actualY, hole.actualRadius, 0, Math.PI * 2);
        gameState.ctx.fillStyle = holeColor;
        gameState.ctx.fill();
        gameState.ctx.closePath();

        // Weißen Rand zeichnen
        if ( holeTypeNum <= config.totalLevels) {
            gameState.ctx.beginPath();
            gameState.ctx.arc(hole.actualX, hole.actualY, hole.actualRadius + config.holeBorderWidth / 2, 0, Math.PI * 2);
            gameState.ctx.lineWidth = config.holeBorderWidth;
            gameState.ctx.strokeStyle = config.colors.holeBorderColor;
            gameState.ctx.stroke();
            gameState.ctx.closePath();
        }

        // Nummer anzeigen
        if ((holeTypeNum >= 1 && holeTypeNum <= config.totalLevels) || config.showNumbersOnMissHoles) {
            gameState.ctx.fillStyle = config.fontColor;
            const fontSize = gameState.canvas.height * config.fontSizePercentage / (window.devicePixelRatio || 1);
            gameState.ctx.font = 'bold ' + fontSize + 'px ' + config.fontFamily;
            gameState.ctx.textAlign = 'center';
            gameState.ctx.textBaseline = 'middle';
            gameState.ctx.fillText(
                holeTypeNum,
                hole.actualX,
                hole.actualY - hole.actualRadius - 2.5 * config.holeBorderWidth
            );
        }
    });

    // Stange zeichnen
    gameState.ctx.beginPath();
    gameState.ctx.moveTo(0, gameState.bar.leftY);
    gameState.ctx.lineTo(gameState.canvas.width / (window.devicePixelRatio || 1), gameState.bar.rightY);
    gameState.ctx.lineWidth = gameState.bar.height;
    gameState.ctx.strokeStyle = gameState.bar.color;
    gameState.ctx.stroke();
    gameState.ctx.closePath();

    // Kugel zeichnen
    gameState.ctx.beginPath();
    gameState.ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    gameState.ctx.fillStyle = gameState.ball.color;
    gameState.ctx.fill();
    gameState.ctx.closePath();

    // Physik anwenden
    applyPhysics(deltaTime);
}