// src/js/config.js
export const config = {
    withLogging: false,

    display: {
        canvasHeightPercentage: 0.63,
        headerHeight: '5vh',
        headerBackgroundOpacity: 0.8,
        playfieldTopMargin: '0.5vh',
        playfieldBottomMargin: '0.5vh',
        elementBackgroundOpacity: 0.7,
        fontSizePercentage: 0.026,
        fontFamily: 'Arial',
        fontColor: '#000000',
        colors: {
            currentTargetHoleColor: 'rgba(186, 85, 211, 0.8)',
            otherTargetHoleColor: 'rgba(0, 200, 30, 0.8)',
            missHoleColor: 'rgba(255, 0, 0, 0.8)',
            playfieldBorderColor: 'rgba(139, 69, 19, 0.8)',
            buttonColor: 'rgba(0, 128, 255, 0.8)',
            buttonHoverColor: 'rgba(0, 102, 204, 0.8)',
            headerBackgroundColor: 'rgba(255, 215, 0, 0.8)'
        },
        playfieldBorderWidth: '5px',
    },

    physics: {
        gravity: 9.81,
        ballMass: 0.016,
        staticFrictionCoefficient: 0.1,
        kineticFrictionCoefficient: 0.06,
        rollingFrictionCoefficient: 0.01,
        wallBounceDamping: 0.66,
        maxGameDuration: 60 * 60 * 1000,
        timerUpdateInterval: 10,
        subSteps: 4,
    },

    ball: {
        radiusFraction: 0.017,
        startXFraction: 0.95,
        color: '#494949'
    },

    bar: {
        height: 5,
        color: 'rgba(255, 165, 0, 0.8)',
        baseSpeed: 7.5,
        speedDampingFactor: 1.0,
        startYPercentage: 0.96,
        joystickMaxMovement: 51,
        joystickSensitivity: 8,
        joystickDeadzone: 0,
        startPercentage: 0.0275,
        endPercentage: 0.975,
        constraintHeight: 16,
        constraintWidth: 5,
        constraintColor: 'rgba(255, 165, 0, 0.8)'
    },

    holes: {
        scaleFactorHoleVelocityAdvanced: 0.5,
        scaleFactorHoleVelocityExtrem: 1,
        holeOverlapThresholdMiss: 0.975,
        holeOverlapThresholdTargetMax: 0.7,
        holeOverlapThresholdTargetMin: 0.925,
        holeOverlapThresholdTargetMaxVelocity: 200,
        showNumbersOnMissHoles: true,
        holeBorderMargin: 3,
        holeBorderGapAngle: 0.50,
        currentHoleBorderWidth: 1,
        otherHoleBorderWidth: 1,
        currentHoleBorderColor: '#999999',
        otherHoleBorderColor: '#999999'
    },

    gameplay: {
        maxLives: 3,
        totalLevels: 10,
    },

    modes: {
        gameModeKeys: ['beginner', 'advanced', 'expert'],
        gameModes: {
            'beginner': {
                title: 'Beginner',
                highscoreSheetName: 'highscores_beginner_v2',
                emoji: '🐣'
            },
            'advanced': {
                title: 'Fortgeschritten',
                highscoreSheetName: 'highscores_advanced_v2',
                emoji: '🚀'
            },
            'expert': {
                title: 'Experte',
                highscoreSheetName: 'highscores_expert_v2',
                emoji: '💀'
            },
        }
    },

    realGameWidthInMeters: 0.47,

    canvasWidthInLogicalPixels: null,
    canvasHeightInLogicalPixels: null,
    canvasWidthInPhysicalPixels: null,
    canvasHeightInPhysicalPixels: null,
    metersToLogicalPixels: null,
    logicalPixelsToMeters: null,
    metersToPhysicalPixels: null,
    physicalPixelsToMeters: null
};
