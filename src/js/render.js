// src/js/render.js

/**
 * render.js
 * Kümmert sich um das Zeichnen der Spielgrafiken auf dem Canvas.
 */

import { gameState } from './gameState.js';
import { applyPhysics } from './physics.js';
import { config } from './config.js';

/**
 * Hauptzeichnungsfunktion, die kontinuierlich aufgerufen wird.
 */
export function draw() {
    // Canvas leeren
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    // Löcher zeichnen und nummerieren
    gameState.holes.forEach(hole => {
        gameState.ctx.beginPath();
        gameState.ctx.arc(hole.actualX, hole.actualY, hole.actualRadius, 0, Math.PI * 2);

        // Farbe basierend auf dem Typ des Lochs festlegen
        const holeTypeNum = hole.Type;
        if (holeTypeNum === 'M') {
            gameState.ctx.fillStyle = config.missHoleColor; // Farbe für Verlustlöcher
        } else if (holeTypeNum === gameState.currentTarget.toString()) {
            gameState.ctx.fillStyle = config.currentTargetHoleColor; // Farbe für aktuelles Ziel
        } else if (parseInt(holeTypeNum) >= 1 && parseInt(holeTypeNum) <= config.totalLevels) {
            gameState.ctx.fillStyle = config.otherTargetHoleColor; // Farbe für andere Ziele
        } else {
            gameState.ctx.fillStyle = config.otherTargetHoleColor; // Standardfarbe
        }

        gameState.ctx.fill();
        gameState.ctx.closePath();

        // Nummer über dem Loch zeichnen, falls erforderlich
        if ((parseInt(holeTypeNum) >= 1 && parseInt(holeTypeNum) <= config.totalLevels) || config.showNumbersOnMissHoles) {
            gameState.ctx.fillStyle = config.fontColor; // Schriftfarbe aus config.js
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

    // Ball zeichnen
    gameState.ctx.beginPath();
    gameState.ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    gameState.ctx.fillStyle = gameState.ball.color;
    gameState.ctx.fill();
    gameState.ctx.closePath();

    // Physik anwenden (Schwerkraft, Kollisionen etc.)
    applyPhysics();

    // Nächsten Frame anfordern
    requestAnimationFrame(draw);
}
