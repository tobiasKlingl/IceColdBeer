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

    root.style.setProperty('--config-header-height', config.headerHeight);
    root.style.setProperty('--config-header-opacity', config.headerBackgroundOpacity);
    root.style.setProperty('--config-element-opacity', config.elementBackgroundOpacity);
    root.style.setProperty('--config-playfield-border-width', config.playfieldBorderWidth);
    root.style.setProperty('--config-playfield-border-color', config.colors.playfieldBorderColor);
    root.style.setProperty('--config-header-background-color', config.colors.headerBackgroundColor);
    root.style.setProperty('--config-button-color', config.colors.buttonColor);
    root.style.setProperty('--config-button-hover-color', config.colors.buttonHoverColor);
    root.style.setProperty('--config-playfield-top-margin', config.playfieldTopMargin);
    root.style.setProperty('--config-playfield-bottom-margin', config.playfieldBottomMargin);
    root.style.setProperty('--config-controls-bottom-margin', config.controlsBottomMargin);
    root.style.setProperty('--config-joystick-size', config.joystickSize);
    root.style.setProperty('--config-joystick-handle-height', config.joystickHandleHeight);
}
