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
 */
export function draw() {
    // Canvas leeren
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    // Löcher zeichnen
    gameState.holes.forEach(hole => {
        gameState.ctx.beginPath();
        gameState.ctx.arc(hole.actualX, hole.actualY, hole.actualRadius, 0, Math.PI * 2);

        // Farbe festlegen
        const holeTypeNum = parseInt(hole.Type);

        if (holeTypeNum === gameState.currentTarget) {
            gameState.ctx.fillStyle = config.currentTargetHoleColor;
        } else if (holeTypeNum >= 1 && holeTypeNum <= config.totalLevels) {
            gameState.ctx.fillStyle = config.otherTargetHoleColor;
        } else {
            gameState.ctx.fillStyle = config.missHoleColor;
        }

        gameState.ctx.fill();
        gameState.ctx.closePath();

        // Nummer anzeigen
        if ((holeTypeNum >= 1 && holeTypeNum <= config.totalLevels) || config.showNumbersOnMissHoles) {
            gameState.ctx.fillStyle = config.fontColor;
            const fontSize = gameState.canvas.height * config.fontSizePercentage;
            gameState.ctx.font = 'bold ' + fontSize + 'px ' + config.fontFamily;
            gameState.ctx.textAlign = 'center';
            gameState.ctx.textBaseline = 'middle';
            gameState.ctx.fillText(holeTypeNum, hole.actualX, hole.actualY - hole.actualRadius - fontSize / 2);
        }
    });

    // Stange zeichnen
    gameState.ctx.beginPath();
    gameState.ctx.moveTo(0, gameState.bar.leftY);
    gameState.ctx.lineTo(gameState.canvas.width, gameState.bar.rightY);
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
    applyPhysics();

    // Nächsten Frame anfordern
    requestAnimationFrame(draw);
}