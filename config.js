// Konfigurationsdatei für das Spiel

const config = {
    // Canvas-Einstellungen
    canvasWidthPercentage: 1.0,    // 100% der verfügbaren Breite
    canvasHeightPercentage: 0.7,   // 70% der verfügbaren Höhe

    // Ball-Eigenschaften
    ballRadius: 5,                 // Kugelradius um 50% reduziert
    ballColor: "#cccccc",          // Helleres Grau für die Kugel
    ballStartOffsetX: 10,          // Horizontaler Abstand vom rechten Rand
    ballStartOffsetY: 100,         // Vertikaler Abstand vom unteren Rand

    // Stangen-Eigenschaften
    barHeight: 4,                  // Stangenhöhe um 70% reduziert
    barColor: "#00bcd4",           // Farbe der Stange
    baseBarSpeed: 2,               // Grundgeschwindigkeit der Stange
    barStartOffsetY: 80,           // Vertikaler Abstand vom unteren Rand

    // Spielparameter
    gravity: 0.5,                  // Schwerkraft
    friction: 0.95,                // Reibung (niedrigerer Wert = mehr Reibung)

    // Loch-Einstellungen
    holeOverlapThreshold: 1.0,          // Prozentsatz der Überlappung für Kollision (1.0 = 100%)
    currentTargetHoleColor: "#FFD700",  // Farbe für aktuelles Ziel (Gold)
    otherTargetHoleColor: "#90EE90",    // Farbe für andere Ziele (Hellgrün)
    missHoleColor: "#000000",           // Farbe für Verlustlöcher (Schwarz)
    holeNumberColor: "#000000",         // Farbe der Zahlen über den Löchern
    totalLevels: 10,                    // Gesamtanzahl der Level

    // Layout-Einstellungen
    topSpacingPercentage: 0.05,    // 5% Leerraum oben

    // Schrift-Einstellungen
    fontSizePercentage: 0.03,      // Schriftgröße relativ zur Canvas-Höhe
    fontFamily: 'Arial',           // Schriftart
    fontColor: '#000000',          // Farbe der Schrift über den Löchern

    // Lebenssystem
    maxLives: 3,                   // Maximale Anzahl an Leben

    // Anzeige-Einstellungen
    showNumbersOnMissHoles: false, // Nummern über Verlustlöchern anzeigen (true oder false)
};