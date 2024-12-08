// src/js/angleCache.js

/**
 * angleCache.js
 * Erstellt einen Cache für Sinus- und Cosinus-Werte mit 3 Dezimalstellen.
 */

// Anzahl der Dezimalstellen zur Rundung
const DECIMALS = 3;
const PRECISION = Math.pow(10, DECIMALS);

// Schrittgröße für die Winkel (0 bis 2π)
const STEP = 2 * Math.PI / PRECISION;

// Arrays zur Speicherung der Werte
const sinCache = [];
const cosCache = [];

// Vorab berechnen und speichern
for (let i = 0; i < PRECISION; i++) {
    const angle = i * STEP;
    sinCache[i] = Math.sin(angle);
    cosCache[i] = Math.cos(angle);
}

/**
 * Rundet den Winkel auf die festgelegte Präzision.
 * @param {number} angle - Der Winkel in Radiant.
 * @returns {number} - Der gerundete Winkel.
 */
function roundAngle(angle) {
    return Math.round(angle * PRECISION) / PRECISION;
}

/**
 * Gibt den Sinus des gerundeten Winkels aus dem Cache zurück.
 * @param {number} angle - Der Winkel in Radiant.
 * @returns {number} - Der Sinus des Winkels.
 */
function getCachedSin(angle) {
    // Normalisieren des Winkels
    angle = angle % (2 * Math.PI);
    if (angle < 0) angle += 2 * Math.PI;
    
    // Runden des Winkels
    const roundedAngle = roundAngle(angle);
    
    // Index berechnen
    const index = Math.round(roundedAngle / STEP) % PRECISION;
    
    return sinCache[index] !== undefined ? sinCache[index] : Math.sin(angle);
}

/**
 * Gibt den Cosinus des gerundeten Winkels aus dem Cache zurück.
 * @param {number} angle - Der Winkel in Radiant.
 * @returns {number} - Der Cosinus des Winkels.
 */
function getCachedCos(angle) {
    // Normalisieren des Winkels
    angle = angle % (2 * Math.PI);
    if (angle < 0) angle += 2 * Math.PI;
    
    // Runden des Winkels
    const roundedAngle = roundAngle(angle);
    
    // Index berechnen
    const index = Math.round(roundedAngle / STEP) % PRECISION;
    
    return cosCache[index] !== undefined ? cosCache[index] : Math.cos(angle);
}

export { getCachedSin, getCachedCos };