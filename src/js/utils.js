// src/js/utils.js
import { config } from './config.js';

export function formatTime(milliseconds) {
    if (milliseconds === null || milliseconds === undefined || milliseconds < 0) {
        return 'N/A';
    }

    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    const thousandths  = Math.floor((milliseconds % 1000)).toString().padStart(3, '0');
    return `${minutes}:${seconds}.${thousandths }`;
}

export function isWithinTopN(highScores, score, topN) {
    console.log("Checking top ten reached...");
    highScores.sort(compareScoresOverall);
    if (highScores.length < topN) return true;
    const lastScore = highScores[highScores.length - 1];
    if (score.level > lastScore.level) {
        return true;
    } else if (score.level === lastScore.level) {
        if (score.time < lastScore.time) {
            return true;
        } else if (score.time === lastScore.time && score.lives > lastScore.lives) {
            return true;
        }
    }
    return false;
}

export function getPlayerRank(highScores, playerScore) {
    const updatedScores = [...highScores, playerScore];
    updatedScores.sort(compareScoresOverall);
    const rank = updatedScores.findIndex(score =>
        score.name === playerScore.name &&
        score.level === playerScore.level &&
        score.time === playerScore.time &&
        score.lives === playerScore.lives &&
        score.date.seconds === playerScore.date.seconds
    );
    return rank + 1;
}

export function isNewScoreBetter(existingScore, newScore) {
    console.log("Comparing new and existing score...");
    if (newScore.level > existingScore.level) {
        return true;
    } else if (newScore.level === existingScore.level) {
        if (newScore.time < existingScore.time) {
            return true;
        } else if (newScore.time === existingScore.time && newScore.lives > existingScore.lives) {
            return true;
        }
    }
    return false;
}

export function capitalizeName(name) {
    if (name.length === 0) return name;
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function compareScoresOverall(a, b) {
    if (b.level !== a.level) {
        return b.level - a.level;
    } else if (a.time !== b.time) {
        return a.time - b.time;
    } else if (b.lives !== a.lives) {
        return b.lives - a.lives;
    } else {
        const dateA = a.date.toDate().getTime();
        const dateB = b.date.toDate().getTime();
        return dateA - dateB;
    }
}

function compareScoresForLevel(level) {
    return (a, b) => {
        const levelInfoA = a.level_info.find(info => info.level === level);
        const levelInfoB = b.level_info.find(info => info.level === level);
        if (levelInfoA.time !== levelInfoB.time) {
            return levelInfoA.time - levelInfoB.time;
        } else if (levelInfoA.lives !== levelInfoB.lives) {
            return levelInfoA.lives - levelInfoB.lives;
        } else {
            const dateA = levelInfoA.date.toDate().getTime();
            const dateB = levelInfoB.date.toDate().getTime();
            return dateA - dateB;
        }
    };
}

export function sortScoresForDisplay(highScores, tab) {
    console.log("Sorting scores with tab: ", tab);
    if (tab === 'overall') {
        highScores.sort(compareScoresOverall);
    } else {
        const level = parseInt(tab, 10);
        highScores.sort(compareScoresForLevel(level));
    }
    return highScores;
}

export function setCSSVariables() {
    const root = document.documentElement;
    root.style.setProperty('--config-header-height', config.display.headerHeight);
    root.style.setProperty('--config-header-opacity', config.display.headerBackgroundOpacity);
    root.style.setProperty('--config-element-opacity', config.display.elementBackgroundOpacity);
    root.style.setProperty('--config-playfield-border-width', config.display.playfieldBorderWidth);
    root.style.setProperty('--config-playfield-border-color', config.display.colors.playfieldBorderColor);
    root.style.setProperty('--config-header-background-color', config.display.colors.headerBackgroundColor);
    root.style.setProperty('--config-button-color', config.display.colors.buttonColor);
    root.style.setProperty('--config-button-hover-color', config.display.colors.buttonHoverColor);
    root.style.setProperty('--config-playfield-top-margin', config.display.playfieldTopMargin);
    root.style.setProperty('--config-playfield-bottom-margin', config.display.playfieldBottomMargin);
    root.style.setProperty('--config-controls-bottom-margin', '2vh');
    root.style.setProperty('--config-joystick-size', '11vh');
    root.style.setProperty('--config-joystick-handle-height', '40%');
}
