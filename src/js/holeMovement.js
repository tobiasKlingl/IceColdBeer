// src/js/holeMovement.js
import { gameState } from './gameState.js';
import { getCachedSin, getCachedCos } from './angleCache.js';

let holeMovementStates = {};

function initializeHoleMovements() {
    gameState.holes.forEach(hole => {
        const movement = hole.movement;
        if (movement && movement.type !== 'Stationary') {
            holeMovementStates[hole.Type] = {
                type: movement.type,
                originalX: hole.actualX,
                originalY: hole.actualY,
                currentAngle: 0,
                step: 0,
                ...(movement.type === 'LeftRight' ? {
                    magnitude: movement.scaledMagnitude,
                    velocity: movement.scaledVelocity
                } : {}),
                ...(movement.type === 'UpDown' ? {
                    magnitude: movement.scaledMagnitude,
                    velocity: movement.scaledVelocity
                } : {}),
                ...(movement.type === 'Circle' ? {
                    radius: movement.scaledRadius,
                    angularVelocity: movement.scaledAngularVelocity,
                    angleOffset: movement.angleOffset
                } : {}),
                ...(movement.type === 'Rectangle' ? {
                    width: movement.scaledWidth,
                    height: movement.scaledHeight,
                    velocity: movement.scaledVelocity
                } : {})
            };
        }
    });
}

export function updateHolePositions(deltaTime) {
    for (const hole of gameState.holes) {
        const state = holeMovementStates[hole.Type];
        if (!state) continue;

        switch (state.type) {
            case 'LeftRight':
                hole.actualX += state.velocity * deltaTime;
                if (Math.abs(hole.actualX - state.originalX) >= state.magnitude) {
                    hole.actualX = state.originalX + Math.sign(state.velocity) * state.magnitude;
                    state.velocity *= -1;
                }
                break;
            case 'UpDown':
                hole.actualY += state.velocity * deltaTime;
                if (Math.abs(hole.actualY - state.originalY) >= state.magnitude) {
                    hole.actualY = state.originalY + Math.sign(state.velocity) * state.magnitude;
                    state.velocity *= -1;
                }
                break;
            case 'Circle':
                state.currentAngle += state.angularVelocity * deltaTime;
                hole.actualX = state.originalX + state.radius * getCachedCos(state.currentAngle + state.angleOffset);
                hole.actualY = state.originalY + state.radius * getCachedSin(state.currentAngle + state.angleOffset);
                break;
            case 'Rectangle':
                state.step += state.velocity * deltaTime;
                const perimeter = 2 * (state.width + state.height);
                const progress = ((state.step % perimeter) + perimeter) % perimeter;
                if (progress < state.width) {
                    hole.actualX = state.originalX + progress;
                    hole.actualY = state.originalY;
                } else if (progress < state.width + state.height) {
                    hole.actualX = state.originalX + state.width;
                    hole.actualY = state.originalY + (progress - state.width);
                } else if (progress < 2 * state.width + state.height) {
                    hole.actualX = state.originalX + state.width - (progress - state.width - state.height);
                    hole.actualY = state.originalY + state.height;
                } else {
                    hole.actualX = state.originalX;
                    hole.actualY = state.originalY + state.height - (progress - 2 * state.width - state.height);
                }
                break;
            default:
                break;
        }
    }
}

export function startHoleMovements() {
    initializeHoleMovements();
}

export function stopHoleMovement() {
    holeMovementStates = {};
}
