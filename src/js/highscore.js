// src/js/highscore.js

/**
 * highscore.js
 * Verwalten der Highscores, einschließlich Anzeige und Zurücksetzung.
 */

import { resetGame, resetTimer, gameState } from './gameState.js';
import { updateDisplay } from './ui.js';
import { config } from './config.js';
import { db } from './firebaseConfig.js';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    doc,
    getDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Initialisiere Firebase Authentication
const auth = getAuth();
signInAnonymously(auth)
  .then(() => {
    console.log('Erfolgreich anonym authentifiziert');
  })
  .catch((error) => {
    console.error('Fehler bei der anonymen Authentifizierung:', error);
  });

/* Deklariere die Swipe-Buttons einmal außerhalb der Funktion */
const swipeLeftButton = document.getElementById('swipeLeftButton');
const swipeRightButton = document.getElementById('swipeRightButton');

/* Event Listener für Swipe Buttons hinzufügen */
if (swipeLeftButton && swipeRightButton) {
    swipeLeftButton.addEventListener('click', () => {
        // Wechsel zu 'normal' bei Swipe nach links
        const newMode = gameState.viewMode === 'expert' ? 'normal' : 'expert';
        gameState.viewMode = newMode;
        showEndScreen(false, true);
    });

    swipeRightButton.addEventListener('click', () => {
        // Wechsel zu 'expert' bei Swipe nach rechts
        const newMode = gameState.viewMode === 'expert' ? 'normal' : 'expert';
        gameState.viewMode = newMode;
        showEndScreen(false, true);
    });
}

/* Swipe-Gesten auf dem Highscore-Bereich erkennen */
const highScoreList = document.getElementById('highScoreList');

let touchStartX = 0;
let touchEndX = 0;

highScoreList.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

highScoreList.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
}, false);

/**
 * Funktion zur Handhabung von Swipe-Gesten
 */
function handleGesture() {
    const swipeThreshold = 50; // Mindestdistanz in Pixeln für eine Swipe-Geste

    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe nach links
        const newMode = gameState.viewMode === 'expert' ? 'normal' : 'expert';
        gameState.viewMode = newMode;
        showEndScreen(false, true);
    }

    if (touchEndX > touchStartX + swipeThreshold) {
        const newMode = gameState.viewMode === 'expert' ? 'normal' : 'expert';
        gameState.viewMode = newMode;
        showEndScreen(false, true);
    }
}

/**
 * Funktion zur Anzeige des Endbildschirms und Verarbeitung der Highscores.
 * @param {boolean} won - Ob das Spiel gewonnen wurde.
 * @param {boolean} directAccess - Ob der Highscore-Bildschirm direkt aufgerufen wurde.
 */
export async function showEndScreen(won, directAccess = false) {
    const endScreen = document.getElementById('endScreen');
    const endMessage = document.getElementById('endMessage');
    const highScoreInput = document.getElementById('highScoreInput');
    const playerNameInput = document.getElementById('playerName');
    const submitScoreButton = document.getElementById('submitScoreButton');
    const restartButton = document.getElementById('restartButton');
    const resetHighscoresButton = document.getElementById('resetHighscoresButton');
    const highScoreTitle = document.getElementById('highScoreTitle');

    // Bestimme den Modus für die Highscore-Anzeige
    const displayMode = directAccess ? gameState.viewMode : gameState.mode;

    // Highscore-Titel setzen mit Emoji
    highScoreTitle.textContent = `Highscore - ${displayMode === 'expert' ? 'Experte 💀' : 'Normal 😀'}`;

    // Endscreen anzeigen und Timer stoppen
    endScreen.style.display = 'flex';
    document.body.classList.add('showing-end-screen'); // Klasse hinzufügen
    clearInterval(gameState.timerInterval); // Timer stoppen

    if (directAccess) {
        endMessage.textContent = '';
        highScoreInput.style.display = 'none';
    } else {
        // Nachricht basierend auf dem Spielstatus anzeigen
        if (won) {
            endMessage.textContent = '🏆 Grandios! Du hast alle Level geschafft!';
        } else {
            const levelReached = gameState.currentTarget - 1;
            let message = '';

            if (levelReached < 3) {
                message = '🌱 Du stehst noch am Anfang. Übung macht den Meister!';
            } else if (levelReached < 6) {
                message = '💪 Schon gut dabei! Weiter so!';
            } else if (levelReached < 9) {
                message = '🔥 Heiß! Du kommst dem Ziel näher!';
            } else {
                message = '🚀 Fast geschafft! Noch ein paar Level!';
            }

            endMessage.textContent = `${message} Du hast Level ${levelReached} erreicht.`;
        }
    }

    // Highscore-Daten erstellen
    const score = {
        name: '',
        level: parseInt(gameState.currentTarget - 1, 10),
        lives: parseInt(gameState.lives, 10),
        time: parseInt(gameState.elapsedTime, 10)
    };

    // Firestore Collection basierend auf dem displayMode
    const collectionName = displayMode === 'expert' ? 'highscores_expert' : 'highscores_normal';
    const highscoreCollection = collection(db, collectionName);

    try {
        // Highscores abrufen
        const q = query(highscoreCollection, orderBy('level', 'desc'), orderBy('time', 'asc'), limit(10));
        const querySnapshot = await getDocs(q);
        let highScores = [];
        querySnapshot.forEach((doc) => {
            highScores.push({ id: doc.id, ...doc.data() });
        });

        // Überprüfen, ob der neue Score in die Highscores aufgenommen werden sollte
        if (!directAccess && shouldEnterHighScore(highScores, score)) {
            // Eingabefeld für Namen anzeigen
            highScoreInput.style.display = 'flex';

            // Event Listener für den Submit-Button hinzufügen
            submitScoreButton.onclick = async function submitHighScore() {
                const playerName = playerNameInput.value.trim().toLowerCase(); // Name in Kleinbuchstaben umwandeln

                if (playerName === '') {
                    alert('Bitte gib einen Namen ein.');
                    return;
                }

                score.name = playerName;

                // Deaktiviere den Button, um Mehrfachklicks zu verhindern
                submitScoreButton.disabled = true;

                try {
                    // Überprüfen, ob der Name bereits existiert
                    const qName = query(highscoreCollection, where('name', '==', playerName));
                    const querySnapshotName = await getDocs(qName);

                    if (!querySnapshotName.empty) {
                        // Eintrag mit diesem Namen existiert bereits
                        const existingDoc = querySnapshotName.docs[0];
                        const existingScore = existingDoc.data();

                        // Sicherstellen, dass die vorhandenen Daten numerisch sind
                        existingScore.level = Number(existingScore.level);
                        existingScore.time = Number(existingScore.time);
                        existingScore.lives = Number(existingScore.lives);

                        if (isNewScoreBetter(existingScore, score)) {
                            // Neuer Score ist besser - aktualisiere den bestehenden Eintrag
                            await setDoc(existingDoc.ref, score, { merge: true });
                            alert('Dein Highscore wurde aktualisiert!');
                        } else {
                            // Neuer Score ist nicht besser
                            alert('Dein neuer Score ist nicht besser als dein bestehender Highscore.');
                        }
                    } else {
                        // Kein bestehender Eintrag - füge neuen Highscore hinzu
                        await addDoc(highscoreCollection, score);
                        alert('Dein Highscore wurde hinzugefügt!');
                    }

                    // Highscores aktualisieren und anzeigen
                    showEndScreen(false, true);
                } catch (error) {
                    console.error('Fehler beim Speichern des Highscores:', error);
                    alert('Fehler beim Speichern des Highscores.');
                } finally {
                    submitScoreButton.disabled = false; // Button wieder aktivieren
                }
            };
        } else {
            if (!directAccess && !shouldEnterHighScore(highScores, score)) {
                // Wenn der Score nicht in die Highscores kommt, trotzdem die aktuelle Liste anzeigen
                endMessage.textContent += '\n\nLeider hast du es nicht in die Top 10 geschafft.';
            }
            displayHighScores(highScores);
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Highscores:', error);
        alert('Fehler beim Abrufen der Highscores.');
    }

    // Event Listener für den Neustart-Button hinzufügen
    restartButton.onclick = function() {
        endScreen.style.display = 'none';
        document.body.classList.remove('showing-end-screen'); // Klasse entfernen
        gameState.lives = config.maxLives;
        gameState.currentTarget = 1;
        gameState.mode = gameState.viewMode;
        resetGame();
        resetTimer(); // Timer zurücksetzen beim Neustart
        updateDisplay();
        playerNameInput.value = '';
        highScoreInput.style.display = 'none';

        // Spiel-Elemente anzeigen
        document.querySelector('header').style.display = 'flex';
        document.querySelector('.game-container').style.display = 'block';
        document.querySelector('.game-info').style.display = 'flex';
        document.querySelector('.controls').style.display = 'flex';
    };

    // Event Listener für den Reset-Button hinzufügen
    resetHighscoresButton.onclick = async function resetHighscores() {
        const password = prompt('Bitte gib das Passwort zum Zurücksetzen der Highscores ein:');
        if (password === '2003') { // WARNUNG: Aus Sicherheitsgründen nicht empfohlen
            if (confirm('Möchtest du wirklich alle Highscores zurücksetzen?')) {
                try {
                    const querySnapshot = await getDocs(highscoreCollection);
                    const batch = writeBatch(db);
                    querySnapshot.forEach((doc) => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    alert('Highscores wurden zurückgesetzt!');
                    displayHighScores([]);
                } catch (error) {
                    console.error('Fehler beim Zurücksetzen der Highscores:', error);
                    alert('Fehler beim Zurücksetzen der Highscores.');
                }
            }
        } else {
            alert('Falsches Passwort! Highscores wurden nicht zurückgesetzt.');
        }
    };

    /**
     * Funktion zur Anzeige der Highscores.
     * @param {Array} highScores - Array der Highscore-Objekte.
     */
    function displayHighScores(highScores) {
        const highScoresList = document.getElementById('highScores');
        const highScoreTitle = document.getElementById('highScoreTitle');

        highScoreTitle.textContent = `Highscore - ${gameState.viewMode === 'expert' ? 'Experte 💀' : 'Normal 😀'}`;

        // Sortieren der Highscores
        highScores.sort((a, b) => {
            if (b.level !== a.level) {
                return b.level - a.level; // Höheres Level ist besser
            } else if (b.lives !== a.lives) {
                return b.lives - a.lives; // Mehr Leben ist besser
            } else {
                return a.time - b.time; // Weniger Zeit ist besser
            }
        });

        // Begrenzung auf Top 10 Highscores
        highScores = highScores.slice(0, 10);

        highScoresList.innerHTML = '';
        highScores.forEach((score, index) => {
            const li = document.createElement('li');
            const minutes = Math.floor(score.time / 60).toString().padStart(2, '0');
            const seconds = (score.time % 60).toString().padStart(2, '0');
            li.textContent = `${capitalizeName(score.name)} - Level: ${score.level}, Leben: ${score.lives}, Zeit: ${minutes}:${seconds}`;
            highScoresList.appendChild(li);
        });
    }

    /**
     * Funktion, um zu prüfen, ob der Spieler in die Highscores kommen sollte.
     */
    function shouldEnterHighScore(highScores, score) {
        // Sortieren der Highscores
        highScores.sort((a, b) => {
            if (b.level !== a.level) {
                return b.level - a.level; // Höheres Level ist besser
            } else if (b.lives !== a.lives) {
                return b.lives - a.lives; // Mehr Leben ist besser    
            } else {
                return a.time - b.time; // Weniger Zeit ist besser
            }
        });

        // Wenn weniger als 10 Highscores vorhanden sind
        if (highScores.length < 10) return true;

        // Prüfen, ob der Score besser ist als der letzte Highscore
        const lastScore = highScores[highScores.length - 1];
        if (score.level > lastScore.level) {
            return true;
        } else if (score.level === lastScore.level && score.lives > lastScore.lives) {
            return true;
        } else if (score.level === lastScore.level && score.lives === lastScore.lives && score.time < lastScore.time) {
            return true;
        }
        return false;
    }

    /**
     * Funktion, um zu prüfen, ob der neue Score besser ist als der bestehende.
     * @param {Object} existingScore - Das bestehende Highscore-Objekt.
     * @param {Object} newScore - Das neue Highscore-Objekt.
     * @returns {boolean} - True, wenn der neue Score besser ist.
     */
    function isNewScoreBetter(existingScore, newScore) {
        if (newScore.level > existingScore.level) {
            return true;
        } else if (newScore.level === existingScore.level && newScore.lives > existingScore.lives) {
            return true;
        } else if (newScore.level === existingScore.level && newScore.lives === existingScore.lives && newScore.time < existingScore.time) {
            return true;
        }
        return false;
    }

    /**
     * Funktion zur Großschreibung des ersten Buchstabens des Namens.
     * @param {string} name - Der Name des Spielers.
     * @returns {string} - Der Name mit großgeschriebenem ersten Buchstaben.
     */
    function capitalizeName(name) {
        if (name.length === 0) return name;
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
}
