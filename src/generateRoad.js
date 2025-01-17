import { house, rock, palm, bridge, tree } from './gameElements.js';
import { r } from './utils.js';
export const road = [];
export const roadSegmentSize = 5; // ??? roadparam.length
export const numberOfSegmentPerColor = 4;

// TODO: hacer las zonesectino variables en un array

export const roadParam = {
    curvy: 1.8,
    mountainy: 1.8,
    maxHeight: 900,
    maxCurve: 200,
    zoneSection: 1000, // cada section es una fase! Largo fijo de cada fase, pude ser un array?
    length: 10, // largo de toda la pista zoneSection x length
};

// -------------------------------------
// ---  Generates the road randomly  ---
// -------------------------------------
export const generateRoad = () => {
    //HEIGHT & CURVES
    let currentStateH = 0; //0=flat 1=up 2= down
    const transitionH = [
        [0, 1, 2],
        [0, 2, 2],
        [0, 1, 1],
        [0, 2, 1],
    ];

    let currentStateC = 0; //0=straight 1=left 2= right
    const transitionC = [
        [0, 1, 2],
        [0, 2, 2],
        [0, 1, 1],
        [0, 2, 1],
    ];

    let currentHeight = 0;
    let currentCurve = 0;

    console.log('%c Racer! ', 'background: #222; color: #bada55');
    console.log('%c ---------------- ', 'background: #222; color: #bada55');
    console.log('longitud de pista: roadparam.lenght', roadParam.length);
    console.log('logitud de cada fase: zoneSection', roadParam.zoneSection);
    console.log(
        'roadparam.length x zoneSection',
        roadParam.zoneSection * roadParam.length
    );

    // ZONAS, roadParam
    let zones = roadParam.length;

    while (zones--) {
        let finalHeight;
        switch (currentStateH) {
            case 0:
                finalHeight = 0;
                break;
            case 1:
                finalHeight = roadParam.maxHeight * r();
                break;
            case 2:
                finalHeight = -roadParam.maxHeight * r();
                break;
        }

        var finalCurve;
        switch (currentStateC) {
            case 0:
                finalCurve = 0;
                break;
            case 1:
                finalCurve = -roadParam.maxCurve * r();
                break;
            case 2:
                finalCurve = roadParam.maxCurve * r();
                break;
        }

        const currentStage = roadParam.length - zones; // solo para debug, se generan las stages
        for (var i = 0; i < roadParam.zoneSection; i++) {
            // --------------------------
            // -- PROPS AND SPRITES!   --
            // --------------------------
            let sprite = false;

            // separar por stage
            const CASAS = currentStage === 1;
            const PUENTES = currentStage === 2;
            const DESIERTO = currentStage === 3;
            const PALMERAS = currentStage === 4;

            const freqCasas = 20;
            const freqPuentes = 10;
            const freqPalmeras = 6;
            const freqCactus = r() < 0.09;

            // console.log('zoneSection', i);
            // console.log('roadParam.length ', roadParam.length);
            // console.log('zones', zones);
            // console.log('stage', Math.round(roadParam.length / (zones + 1)));

            // console.log(i, zones, CASAS, PUENTES, DESIERTO);
            const chosenValue = r() < 0.5 ? -0.55 : 1.1;
            if (CASAS && i % freqCasas === 0) {
                sprite = { type: house, pos: chosenValue }; //0.55 best for left
            } else if (PUENTES && i % freqPuentes === 0) {
                sprite = { type: bridge, pos: 0.8 };
            } else if (PALMERAS && i % freqPalmeras === 0) {
                sprite = { type: palm, pos: chosenValue * chosenValue }; //0.55 best for left
            } else if (DESIERTO && freqCactus) {
                var spriteType = [tree, rock][Math.floor(r() * 1.9)];
                sprite = { type: spriteType, pos: 0.9 + 4 * r() };
                if (r() < 0.5) {
                    sprite.pos = -sprite.pos;
                }
            } else {
                sprite = false;
            }

            road.push({
                height:
                    currentHeight +
                    (finalHeight / 2) *
                        (1 +
                            Math.sin(
                                (i / roadParam.zoneSection) * Math.PI -
                                    Math.PI / 2
                            )),
                curve:
                    currentCurve +
                    (finalCurve / 2) *
                        (1 +
                            Math.sin(
                                (i / roadParam.zoneSection) * Math.PI -
                                    Math.PI / 2
                            )),
                sprite: sprite,
                stage: currentStage, // solo para debug
            });

            // console.log('(finalHeight / 2)',(finalHeight / 2))
            // console.log('i',i);
            // console.log('(roadParam.zoneSection)',(roadParam.zoneSection));
            // console.log('(i / roadParam.zoneSection)',((i / roadParam.zoneSection)));
            // console.log('(1 + Math.sin((i / roadParam.zoneSection)',(Math.sin((i / roadParam.zoneSection))));
            // console.log(' Math.PI - Math.PI / 2', Math.PI - Math.PI / 2);
            // console.log('(1 + Math.sin((i / roadParam.zoneSection) * Math.PI - Math.PI / 2))',(1 + Math.sin((i / roadParam.zoneSection) * Math.PI - Math.PI / 2)))
        }

        currentHeight += finalHeight;
        currentCurve += finalCurve;

        // console.log('2*** finalHeight', finalHeight)
        // console.log('2*** currentStateH', currentStateH)
        // Find next zone
        if (r() < roadParam.mountainy) {
            //   console.log('*** next', transitionH[currentStateH][1 + Math.round(r())])
            //   console.log('*** calc', [1 + Math.round(r())]);

            currentStateH = transitionH[currentStateH][1 + Math.round(r())];
        } else {
            currentStateH = transitionH[currentStateH][0];
        }

        if (r() < roadParam.curvy) {
            currentStateC = transitionC[currentStateC][1 + Math.round(r())];
        } else {
            currentStateC = transitionC[currentStateC][0];
        }
    }

    roadParam.length = roadParam.length * roadParam.zoneSection;
};
