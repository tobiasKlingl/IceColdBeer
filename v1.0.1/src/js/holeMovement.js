// src/js/holeMovement.js

/**
 * holeMovement.js
 * Kümmert sich um die Bewegung der Löcher im Expert-Modus.
 */

import { gameState } from './gameState.js';
import { config } from './config.js';

let holeMovementIntervals = {};

export function moveHoles() {
    // Alle vorhandenen Intervalle löschen
    for (let key in holeMovementIntervals) {
        clearInterval(holeMovementIntervals[key]);
    }
    holeMovementIntervals = {};

    gameState.holes.forEach(hole => {
        const holeTypeNum = parseInt(hole.Type);
        let radius, speed, angleRange;

        if (holeTypeNum === gameState.currentTarget) {
            // Ziel-Loch
            radius = config.expertModeHoleMovementRadiusTarget;
            speed = config.expertModeHoleMovementSpeedTarget;
            angleRange = config.expertModeHoleDirectionAngleRange;
        } else if (holeTypeNum >= 1 && holeTypeNum <= config.totalLevels) {
            // Andere Ziel-Löcher
            radius = config.expertModeHoleMovementRadiusTarget;
            speed = config.expertModeHoleMovementSpeedTarget;
            angleRange = config.expertModeHoleDirectionAngleRange;
        } else {
            // Nieten-Loch
            radius = config.expertModeHoleMovementRadiusMiss;
            speed = config.expertModeHoleMovementSpeedMiss;
            angleRange = config.expertModeHoleDirectionAngleRange;
        }

        const originalX = hole.actualX;
        const originalY = hole.actualY;
        let currentAngle = Math.random() * 2 * Math.PI;

        // Bewegung aktualisieren
        holeMovementIntervals[hole.Type] = setInterval(() => {
            // Position aktualisieren
            hole.actualX += Math.cos(currentAngle) * speed;
            hole.actualY += Math.sin(currentAngle) * speed;

            // Entfernung vom Ursprung berechnen
            const dx = hole.actualX - originalX;
            const dy = hole.actualY - originalY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Wenn Maximalradius erreicht, Richtung invertieren
            if (distance >= radius) {
                currentAngle += Math.PI; // Richtung umkehren
                currentAngle += (Math.random() - 0.5) * (angleRange * Math.PI / 180);
                hole.actualX = originalX + (dx / distance) * radius;
                hole.actualY = originalY + (dy / distance) * radius;
            }

            // Alle Sekunde die Richtung leicht ändern
            if (Math.random() < (1000 / config.expertModeHoleDirectionChangeInterval)) {
                currentAngle += (Math.random() - 0.5) * (angleRange * Math.PI / 180);
            }

        }, 30); // Aktualisierung alle 30 ms
    });
}

export function stopHoleMovement() {
    for (let key in holeMovementIntervals) {
        clearInterval(holeMovementIntervals[key]);
    }
    holeMovementIntervals = {};
}
