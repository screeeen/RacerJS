import { generateRoad } from './src/generateRoad.js'
import { car, car_4,car_8,background,tree,rock,bridge,house,logo,backgroundColor,render,roadParam,player } from './src/gameElements.js'
import { generateBumpyRoad } from './src/generateBumpyRoad.js'
import { resize } from './resize.js'
import { drawString } from './drawString.js'
import { drawSegment } from './drawSegment.js'
import { drawImage } from './drawImage.js'
import { drawSprite } from './drawSprite.js'
import { drawBackground } from './drawBackground.js'
import { renderSplashFrame } from './src/renderSplashFrame.js'


  var r = Math.random;

  // -----------------------------
  // ---  closure scoped vars  ---
  // -----------------------------
  export const canvas = document.getElementById('c');
  export const context = canvas.getContext("2d");
  export const startTime = new Date();
  
  let entrada;
  let salida;
  let printing;



  // estoy tratando de sacar la funcion que controla los printers fuera del gameinterval. 
// quiero usar un temporizador quie
  export const printa = ({currentTime, timer}) => {
    
    salida = currentTime.getTime() + timer;
    if (!entrada && !printing) {entrada = currentTime.getTime()}
    // console.log('salida < entrada', salida < entrada);

    
    // console.log('entrada', entrada)
    // console.log('salida', salida)

    // var min = Math.floor(diff / 60000);
    // var sec = Math.floor((diff - min * 60000) / 1000);
    // if (sec < 10) sec = "0" + sec;

    if (salida > entrada) {
      var t = currentTime.getTime();
      var min = Math.floor(t / 60000);
      var sec = Math.floor((t - min * 60000) / 1000);
      if (sec < 10) sec = "0" + sec;

        drawString(
          {string: "time: " + sec,
          pos:{ x: 2, y: 40 }}
          );
  }
}


  export const spritesheet = new Image(); 
  export const keys = []; // teclas
  export const road = [];

  const roadSegmentSize = 5;
  const numberOfSegmentPerColor = 4;

  let lastDelta = 0;
  let currentTimeString = "";

  let splashInterval;
  let gameInterval;

  //initialize the game
  const init = () => {
    
    // configure canvas
    canvas.height = render.height;
    canvas.width = render.width;

    resize(render);

    //register key handeling:
    document.addEventListener('keydown',function (e) {
      keys[e.keyCode] = true;
    });
    document.addEventListener('keyup',function (e) {
      keys[e.keyCode] = false;
    });

    generateRoad();

    // generateBumpyRoad()
  //   let data = JSON.stringify(road);
  //   navigator.clipboard
  // .writeText(data)
  // .then(
  //   // (clipText) => (document.querySelector(".editor").innerText += clipText)
  //   console.log('copied')
  // );

  console.log('road', road);

  };


  //renders one frame
  const renderGameFrame = () => {
    // Clean screen
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, render.width, render.height);

    // --------------------------
    // -- Update the car state --
    // --------------------------
    // console.log("lastDelta", lastDelta);
    if (Math.abs(lastDelta) > 130) {
      if (player.speed > 3) {
        player.speed -= 0.2;
      }
    } else {
      // read acceleration controls
      if (keys[38]) {
        // 38 up
        //player.position += 0.1;
        player.speed += player.acceleration;
      } else if (keys[40]) {
        // 40 down
        player.speed -= player.breaking;
      } else {
        player.speed -= player.deceleration;
      }
    }
    player.speed = Math.max(player.speed, 0); //cannot go in reverse
    player.speed = Math.min(player.speed, player.maxSpeed); //maximum speed
    player.position += player.speed;
    // console.log("player", player);

    // car turning
    if (keys[37]) {
      // 37 left
      if (player.speed > 0) {
        player.posx -= player.turning;
      }
      var carSprite = {
        a: car_4,
        x: 117,
        y: 190,
      };
    } else if (keys[39]) {
      // 39 right
      if (player.speed > 0) {
        player.posx += player.turning;
      }
      var carSprite = {
        a: car_8,
        x: 125,
        y: 190,
      };
    } else {
      var carSprite = {
        a: car,
        x: 125,
        y: 190,
      };
    }


    const spriteBuffer = [];
    drawBackground(-player.posx);

    
    // --------------------------
    // --   Render the road    --
    // --------------------------
    let absoluteIndex = Math.floor(player.position / roadSegmentSize);
    const CHECKPOINT_PHASE = absoluteIndex > 100  && absoluteIndex < 200;
    // if (absoluteIndex > 100) debugger;
    

    //CHECKPOINT
    if (CHECKPOINT_PHASE ) {
      drawString({string:"Checkpoint ",pos: { x: 100, y: 20 },time:10});
    }

    
    //FINISH GAME
    if (absoluteIndex >= roadParam.length - render.depthOfField - 1) {
      drawString(
        "gameInterval " + gameInterval + "\nabsoluteIndex " + absoluteIndex,
        { x: 100, y: 20 }
      );
      clearInterval(gameInterval);  

      // drawString("Press t to tweet your time.", { x: 30, y: 30 });
      // $(window).keydown(function (e) {
      //   if (e.keyCode == 84) {
      //     location.href =
      //       "http://twitter.com/home?status=" +
      //       escape(
      //         "I've just raced through #racer10k in " + currentTimeString + "!"
      //       );
      //   }
      // });
    }

    var currentSegmentIndex = (absoluteIndex - 2) % road.length;
    var currentSegmentPosition =
      (absoluteIndex - 2) * roadSegmentSize - player.position;
    var currentSegment = road[currentSegmentIndex];
    var lastProjectedHeight = Number.POSITIVE_INFINITY;
    var counter = absoluteIndex % (2 * numberOfSegmentPerColor); // for alternating color band

    // console.log("currentSegment", currentSegmentIndex);

    var playerPosSegmentHeight = road[absoluteIndex % road.length].height;
    var playerPosNextSegmentHeight =
      road[(absoluteIndex + 1) % road.length].height;
    var playerPosRelative =
      (player.position % roadSegmentSize) / roadSegmentSize;
    var playerHeight =
      render.camera_height +
      playerPosSegmentHeight +
      (playerPosNextSegmentHeight - playerPosSegmentHeight) * playerPosRelative;

    // console.log("playerPosSegmentHeight", playerPosSegmentHeight);
    // console.log("playerPosNextSegmentHeight", playerPosNextSegmentHeight);
    // console.log("playerPosRelative", playerPosRelative);
    // console.log("playerHeight", playerHeight);

    var baseOffset =
      currentSegment.curve +
      (road[(currentSegmentIndex + 1) % road.length].curve -
        currentSegment.curve) *
        playerPosRelative;

    lastDelta = player.posx - baseOffset * 2;

    var iter = render.depthOfField;

    while (iter--) {
      // Next Segment:
      var nextSegmentIndex = (currentSegmentIndex + 1) % road.length;
      var nextSegment = road[nextSegmentIndex];

      var startProjectedHeight = Math.floor(
        ((playerHeight - currentSegment.height) * render.camera_distance) /
          (render.camera_distance + currentSegmentPosition)
      );
      var startScaling = 30 / (render.camera_distance + currentSegmentPosition);

      var endProjectedHeight = Math.floor(
        ((playerHeight - nextSegment.height) * render.camera_distance) /
          (render.camera_distance + currentSegmentPosition + roadSegmentSize)
      );
      var endScaling =
        30 /
        (render.camera_distance + currentSegmentPosition + roadSegmentSize);

      var currentHeight = Math.min(lastProjectedHeight, startProjectedHeight);
      var currentScaling = startScaling;

      if (currentHeight > endProjectedHeight) {
        drawSegment(
          render.height / 2 + currentHeight, //pos
          currentScaling, //scale
          currentSegment.curve - baseOffset - lastDelta * currentScaling, //offset
          render.height / 2 + endProjectedHeight, //pos
          endScaling, //scale
          nextSegment.curve - baseOffset - lastDelta * endScaling, //offset
          counter < numberOfSegmentPerColor, //alternate
          currentSegmentIndex == 2 ||
            currentSegmentIndex == roadParam.length - render.depthOfField, //finishStart
          absoluteIndex
            );
      }

      if (currentSegment.sprite) {
        spriteBuffer.push({
          y: render.height / 2 + startProjectedHeight,
          x:
            render.width / 2 -
            currentSegment.sprite.pos * render.width * currentScaling +
            /* */ currentSegment.curve -
            baseOffset -
            (player.posx - baseOffset * 2) * currentScaling,
          ymax: render.height / 2 + lastProjectedHeight,
          s: 2.5 * currentScaling,
          i: currentSegment.sprite.type,
        });
      }

      lastProjectedHeight = currentHeight;

      const probedDepth = currentSegmentPosition;

      currentSegmentIndex = nextSegmentIndex;
      currentSegment = nextSegment;

      currentSegmentPosition += roadSegmentSize;

      counter = (counter + 1) % (2 * numberOfSegmentPerColor);
    }

    let sprite;
    while ((sprite = spriteBuffer.pop())) {
      drawSprite(sprite);
    }

    // --------------------------
    // --     Draw the car     --
    // --------------------------
    drawImage(carSprite.a, carSprite.x, carSprite.y, 1);

    // --------------------------
    // --     Draw the hud     --
    // --------------------------
    drawString(
      {string: "" +
        Math.round(
          (absoluteIndex / (roadParam.length - render.depthOfField)) * 100
        ) +
        "%",
      pos:{ x: 287, y: 1 }}
    );

    var speed = Math.round((player.speed / player.maxSpeed) * 200);
    drawString({string:"" + speed + "mph", pos:{ x: 280, y: 20 }});
    
    drawString(
    {string:  "" + "absoluteIndex " + absoluteIndex,
      pos:{ x: 2, y: 1 }}
    );

    drawString(
    {string: "" + "height " + road[absoluteIndex].height,
      pos:{ x: 2, y: 10 }}
    );

    drawString(
      {string: "" + "curve " + road[absoluteIndex].curve,
        pos:{ x: 2, y: 20 }}
      );

    ///////// TIMER /////////
    var now = new Date();
    
    var diff = now.getTime() - startTime.getTime();

    var min = Math.floor(diff / 60000);

    var sec = Math.floor((diff - min * 60000) / 1000);

    if (sec < 10) sec = "0" + sec;

    var mili = Math.floor(diff - min * 60000 - sec * 1000);
    if (mili < 100) mili = "0" + mili;
    if (mili < 10) mili = "0" + mili;

    currentTimeString = "" + min + ":" + sec;

      printa ({currentTime: now, timer: 1000})

  };

  ////////////////// SPLASH //////////////////

  // splash
  const splashScreen = () => {
    renderSplashFrame();
    if (keys[32]) {
    
      clearInterval(splashInterval);
      gameInterval = setInterval(renderGameFrame, 24);
    }
  }

  // main
  const start= () => {
    
    spritesheet.onload = function () {
        init();
        splashInterval = setInterval(splashScreen, 60);
        console.log('splashInterval', splashInterval)
      };
      spritesheet.src = "spritesheet.high.bw.png";
  }
  
(() => start(spritesheet)
)();

