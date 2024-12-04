// src/js/utils.js

/**
 * utils.js
 * Enthält Hilfsfunktionen, die im gesamten Spiel verwendet werden können.
 */

import { config } from './config.js';

/**
 * Funktion zum Setzen der CSS-Variablen basierend auf config.js
 */
export function setCSSVariables() {
    const root = document.documentElement;

    root.style.setProperty('--header-height', config.headerHeight);
    root.style.setProperty('--header-opacity', config.headerBackgroundOpacity);
    root.style.setProperty('--element-opacity', config.elementBackgroundOpacity);
    root.style.setProperty('--button-size', config.buttonSize);
    root.style.setProperty('--restart-button-size', config.restartButtonSize);
    root.style.setProperty('--button-font-size', config.buttonFontSize);
    root.style.setProperty('--config-playfield-border-width', config.playfieldBorderWidth);
    root.style.setProperty('--config-playfield-border-color', config.colors.playfieldBorderColor);
    root.style.setProperty('--config-header-background-color', config.colors.headerBackgroundColor);
    root.style.setProperty('--config-button-color', config.colors.buttonColor);
    root.style.setProperty('--config-button-hover-color', config.colors.buttonHoverColor);

    // Neue CSS-Variablen für Margins
    root.style.setProperty('--playfield-top-margin', config.playfieldTopMargin);
    root.style.setProperty('--playfield-bottom-margin', config.playfieldBottomMargin);
    root.style.setProperty('--controls-bottom-margin', config.controlsBottomMargin);
}
