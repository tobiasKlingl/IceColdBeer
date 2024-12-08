// src/js/holeMovement.js

/**
 * holeMovement.js
 * Kümmert sich um die Bewegung der Löcher im Expert-Modus.
 */

import { gameState } from './gameState.js';
import { getCachedSin, getCachedCos } from './angleCache.js'; // Importiere den Winkel-Cache

// Speicher für die Bewegungszustände der Löcher
let holeMovementStates = {};

/**
 * Initialisiert die Bewegungszustände für alle Löcher basierend auf ihren Bewegungstypen.
 */
function initializeHoleMovements() {
    gameState.holes.forEach(hole => {
        const movement = hole.movement;
        if (movement && movement.type !== 'Stationary') {
            holeMovementStates[hole.Type] = {
                type: movement.type,
                originalX: hole.actualX,
                originalY: hole.actualY,
                currentAngle: 0, // Für Kreisbewegungen
                direction: 1,     // Für Rechteckbewegungen
                step: 0,          // Fortschritt auf dem Pfad
                // Skalierte Parameter
                ...(
                    movement.type === 'LeftRight' ? {
                        magnitude: movement.scaledMagnitude,
                        velocity: movement.scaledVelocity
                    } : {}
                ),
                ...(
                    movement.type === 'UpDown' ? {
                        magnitude: movement.scaledMagnitude,
                        velocity: movement.scaledVelocity
                    } : {}
                ),
                ...(
                    movement.type === 'Circle' ? {
                        radius: movement.scaledRadius,
                        angularVelocity: movement.angularVelocity // bleibt unverändert
                    } : {}
                ),
                ...(
                    movement.type === 'Rectangle' ? {
                        width: movement.scaledWidth,
                        height: movement.scaledHeight,
                        velocity: movement.scaledVelocity
                    } : {}
                )
            };
        }
    });
}

/**
 * Bewegt die Löcher gemäß ihrer definierten Bewegungstypen.
 * @param {number} deltaTime - Zeit seit dem letzten Frame in Sekunden.
 */
export function updateHolePositions(deltaTime) {
    for (const hole of gameState.holes) {
        const state = holeMovementStates[hole.Type];
        if (!state) continue;

        switch (state.type) {
            case 'LeftRight':
                hole.actualX += state.velocity * state.direction * deltaTime;
                if (Math.abs(hole.actualX - state.originalX) >= state.magnitude) {
                    hole.actualX = state.originalX + state.direction * state.magnitude;
                    state.direction *= -1;
                }
                break;

            case 'UpDown':
                hole.actualY += state.velocity * state.direction * deltaTime;
                if (Math.abs(hole.actualY - state.originalY) >= state.magnitude) {
                    hole.actualY = state.originalY + state.direction * state.magnitude;
                    state.direction *= -1;
                }
                break;

            case 'Circle':
                state.currentAngle += state.angularVelocity * deltaTime;
                hole.actualX = state.originalX + state.radius * getCachedCos(state.currentAngle);
                hole.actualY = state.originalY + state.radius * getCachedSin(state.currentAngle);
                break;

            case 'Rectangle':
                state.step += state.velocity * deltaTime;
                const perimeter = 2 * (state.width + state.height);
                const progress = state.step % perimeter;

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
                // Stationary oder unbekannter Typ
                break;
        }
    }
}

/**
 * Initialisiert die Lochbewegungen.
 */
export function startHoleMovements() {
    initializeHoleMovements();
}

/**
 * Stoppt die Bewegung der Löcher, indem die Zustände zurückgesetzt werden.
 */
export function stopHoleMovement() {
    holeMovementStates = {};
}