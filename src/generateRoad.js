import { roadParam, house, rock, palm, bridge, tree } from './gameElements.js';
// import { road } from '../racer.js';
import { r } from '../utils.js';
export const road = [];
export const roadSegmentSize = 5;
export const numberOfSegmentPerColor = 4;
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

    // VALORES?
    let currentHeight = 0;
    let currentCurve = 0;

    console.log('roadparam', roadParam);

    // ZONAS, roadParam
    let zones = roadParam.length;

    // debugger;

    // ?? que es este --
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

        for (var i = 0; i < roadParam.zoneSection; i++) {
            // --------------------------
            // -- PROPS AND SPRITES!   --
            // --------------------------
            let sprite = false;
            const currentStage = roadParam.length - zones; // solo para debug

            // separar por stage
            const CASAS = currentStage === 1;
            const PUENTES = currentStage === 2;
            const DESIERTO = currentStage === 3;
            const PALMERAS = currentStage === 4;

            const freqCasas = 20;
            const freqPuentes = 4;
            const freqCactus = r() < 0.09;

            console.log('zoneSection', i);
            console.log('roadParam.length ', roadParam.length);
            console.log('zones', zones);
            console.log('stage', Math.round(roadParam.length / (zones + 1)));

            // console.log(i, zones, CASAS, PUENTES, DESIERTO);
            if (CASAS && i % freqCasas === 0) {
                const chosenValue = Math.random() < 0.5 ? -0.55 : 1.1;
                sprite = { type: house, pos: chosenValue }; //0.55 best for left
                // sprite = { type: palm, pos: chosenValue }; //0.55 best for left
            } else if (PUENTES && i % freqPuentes === 0) {
                sprite = { type: bridge, pos: 0.8 };
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

    // const thing = JSON.stringify(roadJson)
    // const roadPlot = JSON.parse(thing)
    // console.log('roadPlot',roadPlot)

    // roadPlot.map(part => road.push(part))
    // console.log('road',road)

    roadParam.length = roadParam.length * roadParam.zoneSection;
    console.log('roadParam.length', roadParam.length);
};
