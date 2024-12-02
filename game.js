window.onload = function() {
    // Konfiguration laden
    const script = document.createElement('script');
    script.src = 'config.js';
    script.onload = function() {
        initializeGame();
    };
    document.head.appendChild(script);

    function initializeGame() {
        // Canvas und Kontext initialisieren
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        // Kugel-Eigenschaften aus der Konfiguration
        const ballRadius = config.ballRadius; // Kugelradius aus config.js
        const ballColor = config.ballColor;
        let ballX;
        let ballY;
        let ballSpeedX = 0;
        let ballSpeedY = 0;

        // Stangen-Eigenschaften aus der Konfiguration
        const barHeight = config.barHeight; // Stangenhöhe aus config.js
        const barColor = config.barColor;
        let leftBarY;
        let rightBarY;
        const baseBarSpeed = config.baseBarSpeed;
        let barSpeed = baseBarSpeed;

        // Spielzustand
        let gameOver = false;
        let lives = config.maxLives;
        let currentTarget = 1; // Startet mit Loch 1

        // Schwerkraft und Reibung aus der Konfiguration
        const gravity = config.gravity;
        const friction = config.friction;

        // Loch-Eigenschaften
        let holes = [];

        // Timer
        let startTime;
        let elapsedTime = 0;
        let timerInterval;

        // HTML-Elemente für die Anzeige
        const livesDisplay = document.getElementById('lives');
        const currentHoleDisplay = document.getElementById('currentHole');
        const timerDisplay = document.getElementById('timer');
        const endScreen = document.getElementById('endScreen');
        const endMessage = document.getElementById('endMessage');
        const restartButton = document.getElementById('restartButton');

        // Highscore-Elemente
        const highScoreInput = document.getElementById('highScoreInput');
        const playerNameInput = document.getElementById('playerName');
        const submitScoreButton = document.getElementById('submitScoreButton');
        const highScoresList = document.getElementById('highScores');

        // Neustart-Button während des Spiels
        const gameResetButton = document.getElementById('gameResetButton');

        // Funktionen zum Deaktivieren/Aktivieren des Zooms
        function disableZoom() {
            document.head.insertAdjacentHTML('beforeend', '<meta name="viewport" id="noZoomMeta" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
        }

        function enableZoom() {
            const noZoomMeta = document.getElementById('noZoomMeta');
            if (noZoomMeta) {
                noZoomMeta.parentNode.removeChild(noZoomMeta);
            }
        }

        // Hole die Lochdaten aus der externen Datei
        loadHoleData();

        function loadHoleData() {
            const script = document.createElement('script');
            script.src = 'holesData.js';
            script.onload = function() {
                holes = window.holesData.map(hole => ({
                    x: hole.X,
                    y: hole.Y,
                    radius: hole.Radius,
                    Type: hole.Type
                }));
                resizeCanvas();
                resetGame();
                draw();
            };
            document.head.appendChild(script);
        }

        // Canvas-Größe anpassen
        function resizeCanvas() {
            const container = document.querySelector('.game-container');
            const width = container.clientWidth * config.canvasWidthPercentage;
            const height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }
        window.addEventListener('resize', function() {
            resizeCanvas();
            resetGame();
        });

        // Intervalle für die Stangenbewegung speichern
        let leftInterval = null;
        let rightInterval = null;

        // Spiel zurücksetzen
        function resetGame() {
            ballX = canvas.width - ballRadius - config.ballStartOffsetX; // Startposition der Kugel aus config.js
            ballY = canvas.height - config.ballStartOffsetY; // Startposition der Kugel aus config.js
            ballSpeedX = 0;
            ballSpeedY = 0;
            leftBarY = canvas.height - config.barStartOffsetY; // Startposition der Stange aus config.js
            rightBarY = canvas.height - config.barStartOffsetY;
            gameOver = false;

            // Bewegung der Stange stoppen
            if (leftInterval) {
                clearInterval(leftInterval);
                leftInterval = null;
            }
            if (rightInterval) {
                clearInterval(rightInterval);
                rightInterval = null;
            }

            // Löcher neu positionieren basierend auf Canvas-Größe
            holes.forEach(hole => {
                hole.actualX = hole.x * canvas.width;
                // Y-Position anpassen, um oben Leerraum zu lassen
                hole.actualY = hole.y * (canvas.height * (1 - config.topSpacingPercentage * 2)) + canvas.height * config.topSpacingPercentage;
                hole.actualRadius = hole.radius * canvas.width * 1.0; // Skalierungsfaktor auf 1.0 gesetzt
            });

            // Timer starten
            if (currentTarget === 1 && lives === config.maxLives) {
                startTime = Date.now();
                elapsedTime = 0;
                clearInterval(timerInterval);
                timerInterval = setInterval(function() {
                    elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                    updateDisplay();
                }, 1000);
            }

            updateDisplay();
        }

        // Anzeige aktualisieren
        function updateDisplay() {
            // Leben als Herz-Emojis anzeigen
            let hearts = '';
            for (let i = 0; i < lives; i++) {
                hearts += '❤️';
            }
            livesDisplay.textContent = 'Leben: ' + hearts;
            currentHoleDisplay.textContent = 'Aktuelles Ziel: Loch ' + currentTarget;

            // Timer aktualisieren
            const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
            const seconds = (elapsedTime % 60).toString().padStart(2, '0');
            timerDisplay.textContent = 'Zeit: ' + minutes + ':' + seconds;
        }

        // Spielschleife
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Löcher zeichnen und Nummern hinzufügen
            holes.forEach(hole => {
                ctx.beginPath();
                ctx.arc(hole.actualX, hole.actualY, hole.actualRadius, 0, Math.PI * 2);
                const holeTypeNum = parseInt(hole.Type);
                if (holeTypeNum === currentTarget) {
                    ctx.fillStyle = config.currentTargetHoleColor; // Farbe aus config.js
                } else if (holeTypeNum >= 1 && holeTypeNum <= config.totalLevels) {
                    ctx.fillStyle = config.otherTargetHoleColor; // Farbe aus config.js
                } else {
                    ctx.fillStyle = config.missHoleColor; // Farbe aus config.js
                }
                ctx.fill();
                ctx.closePath();

                // Text über dem Loch zeichnen
                if (holeTypeNum >= 1 && holeTypeNum <= config.totalLevels || config.showNumbersOnMissHoles) {
                    ctx.fillStyle = config.fontColor; // Schriftfarbe aus config.js
                    const fontSize = canvas.height * config.fontSizePercentage;
                    ctx.font = 'bold ' + fontSize + 'px ' + config.fontFamily;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(hole.Type, hole.actualX, hole.actualY - hole.actualRadius - fontSize / 2);
                }
            });

            // Stange zeichnen
            const leftX = 0;
            const rightX = canvas.width;
            ctx.beginPath();
            ctx.moveTo(leftX, leftBarY);
            ctx.lineTo(rightX, rightBarY);
            ctx.lineWidth = barHeight;
            ctx.strokeStyle = barColor;
            ctx.stroke();
            ctx.closePath();

            // Kugel zeichnen
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = ballColor;
            ctx.fill();
            ctx.closePath();

            if (!gameOver) {
                // Neigung der Stange berechnen
                const barWidth = rightX - leftX;
                const barSlope = (rightBarY - leftBarY) / barWidth;

                // Schwerkraft anwenden
                ballSpeedY += gravity;

                // Kugelposition aktualisieren
                ballX += ballSpeedX;
                ballY += ballSpeedY;

                // Kugel auf der Stange halten
                const barYAtBallX = leftBarY + barSlope * (ballX - leftX);
                if (ballY + ballRadius > barYAtBallX - barHeight / 2 && ballY + ballRadius < barYAtBallX + barHeight && ballX > leftX && ballX < rightX) {
                    ballY = barYAtBallX - ballRadius - barHeight / 2;
                    ballSpeedY = 0;

                    // Physik anpassen: Beschleunigung entlang der Stange
                    let sinTheta = barSlope / Math.sqrt(1 + barSlope * barSlope);
                    ballSpeedX += gravity * sinTheta;

                    // Reibung
                    ballSpeedX *= friction;
                }

                // Kollision mit den Rändern verhindern
                if (ballX - ballRadius < 0) {
                    ballX = ballRadius;
                    ballSpeedX = 0;
                }
                if (ballX + ballRadius > canvas.width) {
                    ballX = canvas.width - ballRadius;
                    ballSpeedX = 0;
                }

                // Überprüfen, ob die Kugel in ein Loch fällt
                holes.forEach(hole => {
                    const dx = ballX - hole.actualX;
                    const dy = ballY - hole.actualY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Anpassung der Kollisionserkennung
                    const overlapThreshold = config.holeOverlapThreshold;
                    if (distance + ballRadius <= hole.actualRadius * overlapThreshold) {
                        // Kugel überlappt das Loch entsprechend dem Schwellenwert
                        gameOver = true;
                        const holeTypeNum = parseInt(hole.Type);
                        if (holeTypeNum === currentTarget) {
                            alert('Gut gemacht! Du hast Loch ' + currentTarget + ' erreicht.');
                            currentTarget++;
                            if (currentTarget > config.totalLevels) {
                                showEndScreen(true);
                                return; // Beende die Funktion, um doppeltes Reset zu verhindern
                            }
                        } else {
                            lives--;
                            if (lives <= 0) {
                                showEndScreen(false);
                                return; // Beende die Funktion, um doppeltes Reset zu verhindern
                            } else {
                                alert('Falsches Loch! Du hast noch ' + lives + ' Leben.');
                            }
                        }
                        resetGame();
                    }
                });

                // Überprüfen, ob die Kugel unten aus dem Bildschirm fällt
                if (ballY - ballRadius > canvas.height) {
                    gameOver = true;
                    lives--;
                    if (lives <= 0) {
                        showEndScreen(false);
                        return; // Beende die Funktion, um doppeltes Reset zu verhindern
                    } else {
                        alert('Verloren! Du hast noch ' + lives + ' Leben.');
                        resetGame();
                    }
                }
            }

            requestAnimationFrame(draw);
        }

        // Endbildschirm anzeigen
        function showEndScreen(won) {
            endScreen.style.display = 'flex';
            clearInterval(timerInterval); // Timer stoppen

            if (won) {
                endMessage.textContent = 'Herzlichen Glückwunsch! Du hast das Spiel gewonnen!';
            } else {
                endMessage.textContent = 'Spiel vorbei! Du hast Level ' + (currentTarget - 1) + ' erreicht.';
            }

            // Highscore verarbeiten
            const score = {
                name: '',
                level: currentTarget - 1,
                lives: lives,
                time: elapsedTime
            };

            let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

            // Highscore-Liste aktualisieren
            highScores.push(score);
            highScores.sort((a, b) => {
                if (b.level !== a.level) {
                    return b.level - a.level; // Höheres Level ist besser
                } else {
                    return a.time - b.time; // Weniger Zeit ist besser
                }
            });
            if (highScores.length > 10) {
                highScores.pop();
            }

            // Prüfen, ob aktueller Score in Highscores ist
            const playerIsInHighScores = highScores.includes(score);

            if (playerIsInHighScores) {
                // Eingabefeld für Namen anzeigen
                highScoreInput.style.display = 'flex';
                // Zoom deaktivieren
                disableZoom();

                submitScoreButton.addEventListener('click', function submitHighScore() {
                    score.name = playerNameInput.value || 'Anonym';
                    // Event Listener entfernen, um Mehrfachaufrufe zu vermeiden
                    submitScoreButton.removeEventListener('click', submitHighScore);
                    // Highscores speichern
                    localStorage.setItem('highScores', JSON.stringify(highScores));
                    displayHighScores(highScores);
                    highScoreInput.style.display = 'none';
                    // Zoom wieder aktivieren
                    enableZoom();
                });
            } else {
                // Highscores anzeigen
                displayHighScores(highScores);
            }
        }

        // Highscores anzeigen
        function displayHighScores(highScores) {
            highScoresList.innerHTML = '';
            highScores.forEach((score, index) => {
                const li = document.createElement('li');
                const minutes = Math.floor(score.time / 60).toString().padStart(2, '0');
                const seconds = (score.time % 60).toString().padStart(2, '0');
                li.textContent = `${index + 1}. ${score.name} - Level: ${score.level}, Leben: ${score.lives}, Zeit: ${minutes}:${seconds}`;
                highScoresList.appendChild(li);
            });
        }

        // Neustart-Button im Endbildschirm
        restartButton.addEventListener('click', function() {
            endScreen.style.display = 'none';
            lives = config.maxLives;
            currentTarget = 1;
            resetGame();
            updateDisplay();
            playerNameInput.value = '';
            highScoreInput.style.display = 'none';
            // Zoom wieder aktivieren
            enableZoom();
        });

        // Neustart-Button während des Spiels
        gameResetButton.addEventListener('click', function() {
            lives = config.maxLives;
            currentTarget = 1;
            resetGame();
            updateDisplay();
        });

        // Steuerungsfunktionen
        function startMoving(barSide, direction) {
            const interval = setInterval(function() {
                // Geschwindigkeit der Stange
                barSpeed = baseBarSpeed;

                if (barSide === 'left') {
                    leftBarY += direction * barSpeed;
                    leftBarY = Math.max(0, Math.min(canvas.height, leftBarY));
                } else {
                    rightBarY += direction * barSpeed;
                    rightBarY = Math.max(0, Math.min(canvas.height, rightBarY));
                }
            }, 16);
            return interval;
        }

        function stopMoving(interval, barSide) {
            clearInterval(interval);
            if (barSide === 'left') {
                leftInterval = null;
            } else if (barSide === 'right') {
                rightInterval = null;
            }
        }

        // Event Listener für die Buttons
        function addButtonEvent(buttonId, barSide, direction) {
            const button = document.getElementById(buttonId);

            button.addEventListener('mousedown', function(event) {
                event.preventDefault();
                if (barSide === 'reset') {
                    lives = config.maxLives;
                    currentTarget = 1;
                    resetGame();
                } else {
                    if (barSide === 'left') {
                        if (leftInterval) clearInterval(leftInterval);
                        leftInterval = startMoving(barSide, direction);
                    } else {
                        if (rightInterval) clearInterval(rightInterval);
                        rightInterval = startMoving(barSide, direction);
                    }
                }
            });

            button.addEventListener('mouseup', function() {
                if (barSide !== 'reset') {
                    if (barSide === 'left') {
                        stopMoving(leftInterval, 'left');
                    } else {
                        stopMoving(rightInterval, 'right');
                    }
                }
            });

            button.addEventListener('mouseleave', function() {
                if (barSide !== 'reset') {
                    if (barSide === 'left' && leftInterval) {
                        stopMoving(leftInterval, 'left');
                    } else if (barSide === 'right' && rightInterval) {
                        stopMoving(rightInterval, 'right');
                    }
                }
            });

            // Für Touch-Events
            button.addEventListener('touchstart', function(event) {
                event.preventDefault();
                if (barSide === 'reset') {
                    lives = config.maxLives;
                    currentTarget = 1;
                    resetGame();
                } else {
                    if (barSide === 'left') {
                        if (leftInterval) clearInterval(leftInterval);
                        leftInterval = startMoving(barSide, direction);
                    } else {
                        if (rightInterval) clearInterval(rightInterval);
                        rightInterval = startMoving(barSide, direction);
                    }
                }
            });

            button.addEventListener('touchend', function() {
                if (barSide !== 'reset') {
                    if (barSide === 'left') {
                        stopMoving(leftInterval, 'left');
                    } else {
                        stopMoving(rightInterval, 'right');
                    }
                }
            });
        }

        // Buttons initialisieren
        addButtonEvent('leftUp', 'left', -1);
        addButtonEvent('leftDown', 'left', 1);
        addButtonEvent('rightUp', 'right', -1);
        addButtonEvent('rightDown', 'right', 1);
    }
};