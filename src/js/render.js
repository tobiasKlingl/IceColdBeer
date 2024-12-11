// src/js/render.js
import { gameState } from './gameState.js';
import { applyPhysics } from './physics.js';
import { config } from './config.js';

function rotate90(nx, ny) {
    return { ox: ny, oy: -nx };
}

function scaleVector(x, y, scale) {
    return { x: x * scale, y: y * scale };
}

function addVectors(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function draw(deltaTime) {
    gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    gameState.holes.forEach(hole => {
        let holeColor;
        const holeTypeNum = parseInt(hole.Type, 10);
        if (holeTypeNum === gameState.currentTarget) {
            holeColor = config.display.colors.currentTargetHoleColor;
        } else if (holeTypeNum >= 1 && holeTypeNum <= config.gameplay.totalLevels) {
            holeColor = config.display.colors.otherTargetHoleColor;
        } else {
            holeColor = config.display.colors.missHoleColor;
        }

        // Loch
        gameState.ctx.beginPath();
        gameState.ctx.arc(hole.actualX, hole.actualY, hole.actualRadius, 0, Math.PI * 2);
        gameState.ctx.fillStyle = holeColor;
        gameState.ctx.fill();
        gameState.ctx.closePath();

        // Zahlen auf dem Loch
        if ((holeTypeNum >= 1 && holeTypeNum <= config.gameplay.totalLevels) || (config.holes.showNumbersOnMissHoles === true )) {
            // Lochrand als offener Kreis
            const borderColor = (holeTypeNum === gameState.currentTarget) ? config.holes.currentHoleBorderColor : config.holes.otherHoleBorderColor;
            const holeBorderWidth = (holeTypeNum === gameState.currentTarget) ? config.holes.currentHoleBorderWidth : config.holes.otherHoleBorderWidth;
            const holeMargin = config.holes.holeBorderMargin;
            const gapAngle = config.holes.holeBorderGapAngle;
            const outerRadius = hole.actualRadius + holeMargin;
            const startAngle = gapAngle - Math.PI/2;
            const endAngle = 2 * Math.PI - gapAngle - Math.PI/2;
            gameState.ctx.beginPath();
            gameState.ctx.arc(hole.actualX, hole.actualY, outerRadius, startAngle, endAngle);
            gameState.ctx.lineWidth = holeBorderWidth;
            gameState.ctx.strokeStyle = borderColor;
            gameState.ctx.stroke();
            gameState.ctx.closePath();

            gameState.ctx.fillStyle = config.display.fontColor;
            const fontSize = gameState.canvas.height * config.display.fontSizePercentage / (window.devicePixelRatio || 1);
            let holeNumberFontWeight = (holeTypeNum === gameState.currentTarget) ? 'normal ' : 'normal ';
            gameState.ctx.font = holeNumberFontWeight + fontSize + 'px ' + config.display.fontFamily;
            gameState.ctx.textAlign = 'center';
            gameState.ctx.textBaseline = 'middle';
            gameState.ctx.fillText(
                holeTypeNum,
                hole.actualX,
                hole.actualY - hole.actualRadius - 4 * holeBorderWidth
            );
        }
    });

    const W = config.canvasWidthInLogicalPixels;
    const startX = W * config.bar.startPercentage;
    const endX = W * config.bar.endPercentage;
    const barSlope = (gameState.bar.rightY - gameState.bar.leftY) / W;

    const startY = gameState.bar.leftY + barSlope * startX;
    const endY = gameState.bar.leftY + barSlope * endX;

    // Stange
    gameState.ctx.beginPath();
    gameState.ctx.moveTo(startX, startY);
    gameState.ctx.lineTo(endX, endY);
    gameState.ctx.lineWidth = config.bar.height;
    gameState.ctx.strokeStyle = config.bar.color;
    gameState.ctx.stroke();
    gameState.ctx.closePath();

    // Ball
    gameState.ctx.beginPath();
    gameState.ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    gameState.ctx.fillStyle = gameState.ball.color;
    gameState.ctx.fill();
    gameState.ctx.closePath();

    // Constraints
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / length;
    const uy = dy / length;

    const nx = uy;
    const ny = -ux;

    const barLineWidth = config.bar.height;
    const constraintLineWidth = config.bar.constraintWidth;
    const shiftAmountNormal = -barLineWidth / 2;
    const rotated = rotate90(nx, ny);
    const shiftAmount90 = config.bar.constraintWidth / 2;
    const shiftNormal = scaleVector(nx, ny, shiftAmountNormal);
    const shiftOrthogonal = scaleVector(rotated.ox, rotated.oy, shiftAmount90);
    const shiftOrthogonalNegative = scaleVector(-rotated.ox, -rotated.oy, shiftAmount90);

    const totalShift = addVectors(shiftNormal, shiftOrthogonal);
    const totalShiftNegative = addVectors(shiftNormal, shiftOrthogonalNegative);

    const startConstraintPos = addVectors({ x: startX, y: startY }, totalShift);
    const endConstraintPos = addVectors({ x: endX, y: endY }, totalShiftNegative);

    const constraintVec = scaleVector(nx, ny, config.bar.constraintHeight);

    gameState.ctx.lineWidth = constraintLineWidth;
    gameState.ctx.strokeStyle = config.bar.constraintColor;
    gameState.ctx.beginPath();
    gameState.ctx.moveTo(startConstraintPos.x, startConstraintPos.y);
    gameState.ctx.lineTo(
        startConstraintPos.x + constraintVec.x,
        startConstraintPos.y + constraintVec.y
    );

    gameState.ctx.moveTo(endConstraintPos.x, endConstraintPos.y);
    gameState.ctx.lineTo(
        endConstraintPos.x + constraintVec.x,
        endConstraintPos.y + constraintVec.y
    );

    gameState.ctx.stroke();
    gameState.ctx.closePath();

    // Physik anwenden
    applyPhysics(deltaTime);
}