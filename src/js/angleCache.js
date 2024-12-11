// src/js/angleCache.js
const DECIMALS = 3;
const PRECISION = Math.pow(10, DECIMALS);
const STEP = 2 * Math.PI / PRECISION;
const sinCache = [];
const cosCache = [];

for (let i = 0; i < PRECISION; i++) {
    const angle = i * STEP;
    sinCache[i] = Math.sin(angle);
    cosCache[i] = Math.cos(angle);
}

function roundAngle(angle) {
    return Math.round(angle * PRECISION) / PRECISION;
}

export function getCachedSin(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) angle += 2 * Math.PI;
    const roundedAngle = roundAngle(angle);
    const index = Math.round(roundedAngle / STEP) % PRECISION;
    return sinCache[index] !== undefined ? sinCache[index] : Math.sin(angle);
}

export function getCachedCos(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) angle += 2 * Math.PI;
    const roundedAngle = roundAngle(angle);
    const index = Math.round(roundedAngle / STEP) % PRECISION;
    return cosCache[index] !== undefined ? cosCache[index] : Math.cos(angle);
}
