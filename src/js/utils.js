// src/js/utils.js

/**
 * utils.js
 * Enthält Hilfsfunktionen, die im gesamten Spiel verwendet werden können.
 */

/**
 * Funktion zum Deaktivieren des Zooms auf mobilen Geräten.
 * Verhindert, dass Benutzer versehentlich das Spiel vergrößern oder verkleinern.
 */
export function disableZoom() {
    const meta = document.createElement('meta');
    meta.name = "viewport";
    meta.id = "noZoomMeta";
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.head.appendChild(meta);
}

/**
 * Funktion zum Aktivieren des Zooms auf mobilen Geräten.
 * Entfernt die Deaktivierung des Zooms.
 */
export function enableZoom() {
    const noZoomMeta = document.getElementById('noZoomMeta');
    if (noZoomMeta) {
        noZoomMeta.parentNode.removeChild(noZoomMeta);
    }
}
