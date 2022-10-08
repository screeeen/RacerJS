import {roadParam, house,rock,bridge,tree} from './gameElements.js'
import {road} from '../racer.js'

// -------------------------------------
// ---  Generates the road randomly  ---
// -------------------------------------
export const  generateRoad = () => {

  const r = Math.random;

  //HEIGHT & CURVES
  let currentStateH = 0; //0=flat 1=up 2= down
  const transitionH = [
    [0, 1, 2],
    [0, 2, 2],
    [0, 1, 1],
  ];

  let currentStateC = 0; //0=straight 1=left 2= right
  const transitionC = [
    [0, 1, 2],
    [0, 2, 2],
    [0, 1, 1],
  ];

  // VALORES?
  let currentHeight = 0;
  let currentCurve = 0;

  // ZONAS, roadParam
  let zones = roadParam.length;
  
  

  // ?? que es este --
  while (zones--) {
    // Generate current Zone
    // console.warn('~~ GENERA ~~');
    // console.log('zone', zones);

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

    //add props and sprites
    for (var i = 0; i < roadParam.zoneSize; i++) {
      // add a bridge
      const CASAS = zones > 19 && zones <= 21;
      const PUENTES = zones > 18 && zones <= 19;
      const DESIERTO = zones >= 6 && zones <= 18;
      const freqCasas = 20;
      const freqPuentes = 4;
      const freqCactus = r() < 0.09;
      let sprite = false;

      // console.log(i, zones, CASAS, PUENTES, DESIERTO);

      // debugger;
      if (CASAS && i % freqCasas === 0) {
         sprite = { type: house, pos: -0.55 };
      } else if (PUENTES && i % freqPuentes === 0) {
         sprite = { type: bridge, pos: 0.8 };
      } else if (DESIERTO && freqCactus) {
        var spriteType = [tree, rock][Math.floor(r() * 1.9)];
         sprite = { type: spriteType, pos: 0.9 + 4 * r() };
        if (r() < 0.5) {
          sprite.pos = -sprite.pos;
        }
      } 
      // else {
      //   sprite = false;
      // }

      // road.push({
      //   height:
      //     currentHeight +
      //     (finalHeight / 2) *
      //       (1 + Math.sin((i / roadParam.zoneSize) * Math.PI - Math.PI / 2)),
      //   curve:
      //     currentCurve +
      //     (finalCurve / 2) *
      //       (1 + Math.sin((i / roadParam.zoneSize) * Math.PI - Math.PI / 2)),
      //   sprite: sprite,
      // });

      // console.log('(finalHeight / 2)',(finalHeight / 2))
      // console.log('((i / roadParam.zoneSize))',((i / roadParam.zoneSize)));
      // console.log('(1 + Math.sin((i / roadParam.zoneSize)',(Math.sin((i / roadParam.zoneSize))));
      // console.log(' Math.PI - Math.PI / 2', Math.PI - Math.PI / 2);
      // console.log('(1 + Math.sin((i / roadParam.zoneSize) * Math.PI - Math.PI / 2))',(1 + Math.sin((i / roadParam.zoneSize) * Math.PI - Math.PI / 2)))

      road.push({
        height:
          parseInt(currentHeight +
          (finalHeight / 2) *
            (1 + Math.sin((i / roadParam.zoneSize) * Math.PI - Math.PI / 2))),
        curve:
          parseInt(currentCurve +
          (finalCurve / 2) *
            (1 + Math.sin((i / roadParam.zoneSize) * Math.PI - Math.PI / 2))),
        sprite: sprite,
      });
    }

    currentHeight += finalHeight;
    currentCurve += finalCurve;

    console.log('*** finalHeight',finalHeight)
    console.log('*** currentStateH',currentStateH)

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

  roadParam.length = roadParam.length * roadParam.zoneSize;
};