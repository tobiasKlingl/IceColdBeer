// src/js/config.js

/**
 * config.js
 * Enthält alle konfigurierbaren Parameter des Spiels.
 */

export const config = {
    withLogging: false,

    // Anzeigeeinstellungen
    showNumbersOnMissHoles: true, // Zeige Nummern auf Miss-Löchern

    // Maximale Spielzeit
    maxGameDuration: 60 * 60 * 1000, // 60 Minuten in Millisekunden

    // Prozentsatz der Höhe, den das Canvas einnimmt
    canvasHeightPercentage: 0.63,

    // Header-Einstellungen
    headerHeight: '5vh',
    headerBackgroundOpacity: 0.8,

    // Abstände für das Spielfeld
    playfieldTopMargin: '0.5vh',
    playfieldBottomMargin: '0.5vh',

    // Transparenzeinstellungen für Elemente
    elementBackgroundOpacity: 0.7,

    // Ball-Eigenschaften
    ballRadius: 0.017, // Radius der Kugel relativen Breite des Spielfeldes (0.8cm/47cm)
    ballStartXFraction: 0.85, // Startposition relativ zur Breite
    ballColor: '#494949',

    // Stangen-Eigenschaften
    barHeight: 5, // Höhe der Stange
    barWidth: 90, // Breite der Stange
    barColor: 'rgba(255, 165, 0, 0.8)',
    baseBarSpeed: 10, // Grundgeschwindigkeit der Stange
    barSpeedDampingFactor: 1.0, // Controls the deceleration rate (0 < dampingFactor < 1)
    barStartYPercentage: 0.96, // Startposition der Stange (relativ zur Höhe)

    // Physikparameter
    gravity: 9.81, // Erdbeschleunigung in m/s²
    airDensity: 1.225, // Dichte der Luft (kg/m³)
    dragCoefficient: 0.5, // Luftwiderstandsbeiwert für eine Kugel
    ballMass: 0.016, // Masse des Balls (kg)

    // Reibung
    staticFrictionCoefficient: 0.080, // klassische Haftreibung (typisch mu_h = 0.2, mit Öl 0.05-0.1) + Gleichreibung durch schräges Anlehnen an die Wand (mu_H = 0.1, Winkel ungefähr alpha = 87grad => mu_g = mu_H*cos(alpha) = 0.005)
    kineticFrictionCoefficient: 0.055, // Gleitreibungskoeffizient (typisch: mu_g = 0.1, mit Öl 0.02-0.05) + Gleichreibung durch schräges Anlehnen an die Wand
    rotationFrictionCoefficient: 0.007, // Rollreibungskoeffizient (typisch: mu_r = 0.002, Öl hat kaum Einfluß) + Gleichreibung durch schräges Anlehnen an die Wand
    wallBounceDamping: 0.66, // Energieverlust bei Kollision mit Wänden

    // Loch-Einstellungen
    holeOverlapThresholdMiss: 0.99, // Schwellenwert für Miss-Löcher
    holeOverlapThresholdTarget: 0.95, // Schwellenwert für Ziel-Löcher
    holeBorderWidth: 3, // Breite des Lochrandes

    // Farben
    colors: {
        currentTargetHoleColor: 'rgba(186, 85, 211, 0.8)', /* Kräftiges Lila für das aktuelle Ziel */
        otherTargetHoleColor: 'rgba(0, 255, 0, 0.8)', // Grün für andere Ziele
        missHoleColor: 'rgba(255, 0, 0, 0.8)', // Rot für Verlustlöcher
        holeBorderColor: 'rgba(255, 255, 255, 1)', // Weißer Rand für Löcher
        playfieldBorderColor: 'rgba(139, 69, 19, 0.8)', // Braun für Spielfeldrand
        buttonColor: 'rgba(0, 128, 255, 0.8)', // Blau für Buttons
        buttonHoverColor: 'rgba(0, 102, 204, 0.8)', // Dunkleres Blau für Hover-Effekt
        headerBackgroundColor: 'rgba(255, 215, 0, 0.8)', // Goldgelb für Header
    },
    playfieldBorderWidth: '5px', // Breite des Spielfeldrandes

    // Schriftart-Einstellungen
    fontSizePercentage: 0.03, // Schriftgröße relativ zur Höhe
    fontFamily: 'Arial', // Schriftart
    fontColor: '#000000', // Schriftfarbe

    // Lebenssystem
    maxLives: 3, // Maximale Anzahl an Leben

    // Timer-Einstellungen
    timerUpdateInterval: 10, // Aktualisierungsintervall des Timers in ms

    // Gesamtanzahl der Level
    totalLevels: 10, // Anzahl der Ziel-Löcher

    // Margin unter den Steuerungselementen
    controlsBottomMargin: '2vh', // Abstand unter den Steuerungselementen

    // Joystick-Einstellungen
    joystickSize: '11vh', // Größe des Joysticks
    joystickHandleHeight: '40%', // Höhe des Joystick-Griffs
    joystickMaxMovement: 51, // Maximale Bewegung des Joysticks in Pixel
    joystickSensitivity: 8, // Empfindlichkeit des Joysticks
    joystickDeadzone: 0, // Deadzone für minimale Bewegungen

    // Expert Mode Einstellungen
    expertModeHoleMovementRadiusTarget: 7, // Bewegungsspielraum für Ziel-Löcher
    expertModeHoleMovementSpeedTarget: 0.08, // Geschwindigkeit der Ziel-Löcher
    expertModeHoleMovementRadiusMiss: 5, // Bewegungsspielraum für Miss-Löcher
    expertModeHoleMovementSpeedMiss: 0.13, // Geschwindigkeit der Miss-Löcher
    expertModeHoleDirectionChangeInterval: 1500, // Intervall für Richtungsänderung in Millisekunden
    expertModeHoleDirectionAngleRange: 20, // Winkelbereich für Richtungsänderung in Grad

    // Spielmodi
    gameModeKeys: ['beginner', 'advanced', 'expert'], // Schlüssel für Spielmodi
    gameModes: {
        'beginner': { 
            title: 'Beginner',
            highscoreSheetName: 'highscores_beginner_v2',
            emoji: '🐣' // Symbol für Anfänger
        }, 
        'advanced': { 
            title: 'Fortgeschritten',
            highscoreSheetName: 'highscores_advanced_v2',
            emoji: '🚀' // Symbol für Fortgeschrittene
        }, 
        'expert': { 
            title: 'Experte',
            highscoreSheetName: 'highscores_expert_v2',
            emoji: '💀' // Symbol für Experten
        },
    },

     // Physische Breite des Spiels in Metern (realer Wert des originalen Spiels)
     realGameWidthInMeters: 0.47, // Beispiel: 64 cm Breite des Apparates. Spielfeld ungefähr 11/15 davon.

     // Dynamische Werte (während Laufzeit gesetzt)
     canvasWidthInLogicalPixels: null, // Logische Breite des Canvas
     canvasHeightInLogicalPixels: null, // Logische Höhe des Canvas
     canvasWidthInPhysicalPixels: null, // Physische Breite des Canvas
     canvasHeightInPhysicalPixels: null, // Physische Höhe des Canvas

     metersToLogicalPixels: null, // Logische Pixel pro Meter
     logicalPixelsToMeters: null, // Meter pro logische Pixel
     metersToPhysicalPixels: null, // Physische Pixel pro Meter
     physicalPixelsToMeters: null, // Meter pro physische Pixel
};