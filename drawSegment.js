import {context} from './racer.js'
import {render} from './src/gameElements.js'
import {drawTrapez} from './drawTrapez.js'

export const drawSegment = (
    position1,
    scale1,
    offset1,
    position2,
    scale2,
    offset2,
    alternate,
    finishStart
  ) => {
    let grass = alternate ? "#888" : "#666";
    let border = alternate ? "#EEE" : "#CCC";
    let road = alternate ? "#222" : "#444";
    let lane = alternate ? "#AAA" : "#EEE";

    // var grass = alternate ? "#eda" : "#dc9";
    // var border = "#777";
    // var road = "#7AA";
    // var lane = "#777";

    if (finishStart) {
      road = "#fff";
      lane = "#fff";
      border = "#fff";
    }

    //draw grass:
    context.fillStyle = grass;
    context.fillRect(0, position2, render.width, position1 - position2);

    // draw the road
    drawTrapez(
      position1,
      scale1,
      offset1,
      position2,
      scale2,
      offset2,
      -0.5, // ancho carriles
      0.5, // ancho carriles
      road
    );

    // draw the road border
    drawTrapez(
      position1,
      scale1,
      offset1,
      position2,
      scale2,
      offset2,
      -0.5,
      -0.47,
      border
    );
    drawTrapez(
      position1,
      scale1,
      offset1,
      position2,
      scale2,
      offset2,
      0.47,
      0.5,
      border
    );

    // draw the lane line
    drawTrapez(
      position1,
      scale1,
      offset1,
      position2,
      scale2,
      offset2,
      -0.18,
      -0.15,
      lane
    );
    drawTrapez(
      position1,
      scale1,
      offset1,
      position2,
      scale2,
      offset2,
      0.15,
      0.18,
      lane
    );
  };