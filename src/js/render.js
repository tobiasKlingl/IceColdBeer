// src/js/render.js

/**
 * render.js
 * Kümmert sich um das Zeichnen der Spielgrafiken auf dem Canvas.
 */

import { canvas, ctx, ball, bar, holes, currentTarget, gameOver } from './gameState.js';
import { applyPhysics } from './physics.js';
import { config } from './config.js';

/**
 * Hauptzeichnungsfunktion, die kontinuierlich aufgerufen wird.
 */
export function draw() {
    // Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Löcher zeichnen und nummerieren
    holes.forEach(hole => {
        ctx.beginPath();
        ctx.arc(hole.actualX, hole.actualY, hole.actualRadius, 0, Math.PI * 2);

        // Farbe basierend auf dem Typ des Lochs festlegen
        const holeTypeNum = hole.Type;
        if (holeTypeNum === 'M') {
            ctx.fillStyle = config.missHoleColor; // Farbe für Verlustlöcher
        } else if (holeTypeNum === currentTarget.toString()) {
            ctx.fillStyle = config.currentTargetHoleColor; // Farbe für aktuelles Ziel
        } else if (parseInt(holeTypeNum) >= 1 && parseInt(holeTypeNum) <= config.totalLevels) {
            ctx.fillStyle = config.otherTargetHoleColor; // Farbe für andere Ziele
        } else {
            ctx.fillStyle = config.otherTargetHoleColor; // Standardfarbe
        }

        ctx.fill();
        ctx.closePath();

        // Nummer über dem Loch zeichnen, falls erforderlich
        if ((parseInt(holeTypeNum) >= 1 && parseInt(holeTypeNum) <= config.totalLevels) || config.showNumbersOnMissHoles) {
            ctx.fillStyle = config.fontColor; // Schriftfarbe aus config.js
            const fontSize = canvas.height * config.fontSizePercentage;
            ctx.font = 'bold ' + fontSize + 'px ' + config.fontFamily;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(holeTypeNum, hole.actualX, hole.actualY - hole.actualRadius - fontSize / 2);
        }
    });

    // Stange zeichnen
    ctx.beginPath();
    ctx.moveTo(0, bar.leftY);
    ctx.lineTo(canvas.width, bar.rightY);
    ctx.lineWidth = bar.height;
    ctx.strokeStyle = bar.color;
    ctx.stroke();
    ctx.closePath();

    // Ball zeichnen
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();

    // Physik anwenden (Schwerkraft, Kollisionen etc.)
    applyPhysics();

    // Nächsten Frame anfordern
    requestAnimationFrame(draw);
}
