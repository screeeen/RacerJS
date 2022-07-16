var game = (function () {
  var r = Math.random;

  // -----------------------------
  // ---  closure scoped vars  ---
  // -----------------------------
  var canvas;
  var context;
  var keys = []; // teclas
  var startTime;
  var lastDelta = 0;
  var currentTimeString = "";

  var roadParam = {
    maxHeight: 900,
    maxCurve: 300,
    length: 22, // largo de toda la pista
    curvy: 0.8,
    mountainy: 0.8,
    zoneSize: 250,
  };

  var road = [];
  var roadSegmentSize = 5;
  var numberOfSegmentPerColor = 4;

  var render = {
    width: 320,
    height: 240,
    depthOfField: 150,
    camera_distance: 30,
    camera_height: 100,
  };

  var player = {
    position: 10,
    speed: 0,
    acceleration: 0.05,
    deceleration: 0.2,
    breaking: 0.6,
    turning: 6.0,
    posx: 0,
    maxSpeed: 20,
  };

  var splashInterval;
  var gameInterval;

  //sprites
  var car = {
    x: 0,
    y: 130,
    w: 69,
    h: 38,
  };
  var car_4 = {
    x: 70,
    y: 130,
    w: 77,
    h: 38,
  };
  var car_8 = {
    x: 148,
    y: 130,
    w: 77,
    h: 38,
  };

  var background = {
    x: 0,
    y: 9,
    w: 320,
    h: 120,
  };

  var tree = {
    x: 321,
    y: 9,
    w: 16,
    h: 32,
  };

  var rock = {
    x: 345,
    y: 9,
    w: 11,
    h: 14,
  };

  var bridge = {
    x: 336,
    y: 98,
    w: 336,
    h: 88,
  };

  var house = {
    x: 440,
    y: 41,
    w: 72,
    h: 42,
  };

  var logo = {
    x: 161,
    y: 39,
    w: 115,
    h: 20,
  };
  // -----------------------------
  // -- closure scoped function --
  // -----------------------------

  //initialize the game
  var init = function () {
    // configure canvas
    canvas = $("#c")[0];
    context = canvas.getContext("2d");

    canvas.height = render.height;
    canvas.width = render.width;

    resize();
    $(window).resize(resize);

    //register key handeling:
    $(document).keydown(function (e) {
      keys[e.keyCode] = true;
    });
    $(document).keyup(function (e) {
      keys[e.keyCode] = false;
    });
    generateRoad();
  };

  //renders Splash Frame
  var renderSplashFrame = function () {
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0, 0, render.width, render.height);
    // context.font = "bold 48px serif";

    // context.drawImage(spritesheet,  357, 9, 115, 20, 100, 20, 115, 40);

    drawString("A GAME", { x: 100, y: 30 });
    drawString("Instructions:", { x: 100, y: 90 });
    drawString("space to start, arrows to drive", { x: 30, y: 100 });
    drawString("Credits:", { x: 120, y: 120 });
    drawString("code, art: Selim Arsever", { x: 55, y: 130 });
    drawString("font: spicypixel.net", { x: 70, y: 140 });
    if (keys[32]) {
      clearInterval(splashInterval);
      gameInterval = setInterval(renderGameFrame, 30);
      startTime = new Date();
    }
  };

  //renders one frame
  var renderGameFrame = function () {
    // Clean screen
    context.fillStyle = "#666";
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

    drawBackground(-player.posx);

    var spriteBuffer = [];

    // --------------------------
    // --   Render the road    --
    // --------------------------
    var absoluteIndex = Math.floor(player.position / roadSegmentSize);

    // if (absoluteIndex % 100 == 0) {
    //   drawString("Checkpoint ", { x: 100, y: 20 });
    // }

    if (absoluteIndex >= roadParam.length - render.depthOfField - 1) {
      clearInterval(gameInterval);

      drawString(
        "gameInterval " + gameInterval + "\nabsoluteIndex " + absoluteIndex,
        { x: 100, y: 20 }
      );
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
            currentSegmentIndex == roadParam.length - render.depthOfField //finishStart
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

      probedDepth = currentSegmentPosition;

      currentSegmentIndex = nextSegmentIndex;
      currentSegment = nextSegment;

      currentSegmentPosition += roadSegmentSize;

      counter = (counter + 1) % (2 * numberOfSegmentPerColor);
    }

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
    // drawString(
    //   "" +
    //     Math.round(
    //       (absoluteIndex / (roadParam.length - render.depthOfField)) * 100
    //     ) +
    //     "%",
    //   { x: 287, y: 1 }
    // );
    var now = new Date();
    var diff = now.getTime() - startTime.getTime();

    var min = Math.floor(diff / 60000);

    var sec = Math.floor((diff - min * 60000) / 1000);
    if (sec < 10) sec = "0" + sec;

    var mili = Math.floor(diff - min * 60000 - sec * 1000);
    if (mili < 100) mili = "0" + mili;
    if (mili < 10) mili = "0" + mili;

    currentTimeString = "" + min + ":" + sec + ":" + mili;

    // drawString(currentTimeString, { x: 1, y: 1 });
    var speed = Math.round((player.speed / player.maxSpeed) * 200);
    // drawString("" + speed + "mph", { x: 1, y: 10 });
  };

  // Drawing primitive
  var drawImage = function (image, x, y, scale) {
    context.drawImage(
      spritesheet,
      image.x,
      image.y,
      image.w,
      image.h,
      x,
      y,
      scale * image.w,
      scale * image.h
    );
  };
  var drawSprite = function (sprite) {
    //if(sprite.y <= sprite.ymax){
    var destY = sprite.y - sprite.i.h * sprite.s;
    if (sprite.ymax < sprite.y) {
      var h = Math.min(
        (sprite.i.h * (sprite.ymax - destY)) / (sprite.i.h * sprite.s),
        sprite.i.h
      );
    } else {
      var h = sprite.i.h;
    }
    //sprite.y - sprite.i.h * sprite.s
    if (h > 0)
      context.drawImage(
        spritesheet,
        sprite.i.x,
        sprite.i.y,
        sprite.i.w,
        h,
        sprite.x,
        destY,
        sprite.s * sprite.i.w,
        sprite.s * h
      );
    //}
  };

  var drawSegment = function (
    position1,
    scale1,
    offset1,
    position2,
    scale2,
    offset2,
    alternate,
    finishStart
  ) {
    var grass = alternate ? "#888" : "#666";
    var border = alternate ? "#EEE" : "#CCC";
    var road = alternate ? "#222" : "#444";
    var lane = alternate ? "#AAA" : "#EEE";

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

  var drawTrapez = function (
    pos1,
    scale1,
    offset1,
    pos2,
    scale2,
    offset2,
    delta1,
    delta2,
    color
  ) {
    var demiWidth = render.width / 2;

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(demiWidth + delta1 * render.width * scale1 + offset1, pos1);
    context.lineTo(demiWidth + delta1 * render.width * scale2 + offset2, pos2);
    context.lineTo(demiWidth + delta2 * render.width * scale2 + offset2, pos2);
    context.lineTo(demiWidth + delta2 * render.width * scale1 + offset1, pos1);
    context.fill();
    // context.stroke();
  };

  var drawBackground = function (position) {
    var first = (position / 2) % background.w;
    drawImage(background, first - background.w + 1, 0, 1);
    drawImage(background, first + background.w - 1, 0, 1);
    drawImage(background, first, 0, 1);
  };

  var drawString = function (string, pos) {
    string = string.toUpperCase();
    var cur = pos.x;

    for (var i = 0; i < string.length; i++) {
      context.drawImage(
        spritesheet,
        (string.charCodeAt(i) - 32) * 8,
        0,
        8,
        8,
        cur,
        pos.y,
        8,
        8
      );
      cur += 8;
    }
  };

  var resize = function () {
    if ($(window).width() / $(window).height() > render.width / render.height) {
      var scale = $(window).height() / render.height;
    } else {
      var scale = $(window).width() / render.width;
    }

    var transform = "scale(" + scale + ")";
    $("#c")
      .css("MozTransform", transform)
      .css("transform", transform)
      .css("WebkitTransform", transform)
      .css({
        top: ((scale - 1) * render.height) / 2,
        left:
          ((scale - 1) * render.width) / 2 +
          ($(window).width() - render.width * scale) / 2,
      });
  };

  // -------------------------------------
  // ---  Generates the road randomly  ---
  // -------------------------------------
  var generateRoad = function () {
    var currentStateH = 0; //0=flat 1=up 2= down
    var transitionH = [
      [0, 1, 2],
      [0, 2, 2],
      [0, 1, 1],
    ];

    var currentStateC = 0; //0=straight 1=left 2= right
    var transitionC = [
      [0, 1, 2],
      [0, 2, 2],
      [0, 1, 1],
    ];

    var currentHeight = 0;
    var currentCurve = 0;

    var zones = roadParam.length;

    while (zones--) {
      // Generate current Zone
      console.warn("ZONE", zones);
      var finalHeight;
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
        console.log(i, zones, CASAS, PUENTES, DESIERTO);
        debugger;
        if (CASAS && i % 10 === 0) {
          var sprite = { type: house, pos: -0.55 };
        } else if (PUENTES && i % 2 === 0) {
          var sprite = { type: bridge, pos: 0.8 };
        } else if (DESIERTO && r() < 0.09) {
          var spriteType = [tree, rock][Math.floor(r() * 1.9)];
          var sprite = { type: spriteType, pos: 0.9 + 4 * r() };
          if (r() < 0.5) {
            sprite.pos = -sprite.pos;
          }
        } else {
          var sprite = false;
        }

        road.push({
          height:
            currentHeight +
            (finalHeight / 2) *
              (1 + Math.sin((i / roadParam.zoneSize) * Math.PI - Math.PI / 2)),
          curve:
            currentCurve +
            (finalCurve / 2) *
              (1 + Math.sin((i / roadParam.zoneSize) * Math.PI - Math.PI / 2)),
          sprite: sprite,
        });
      }

      currentHeight += finalHeight;
      currentCurve += finalCurve;

      // Find next zone
      if (r() < roadParam.mountainy) {
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

  return {
    start: function () {
      init();
      spritesheet = new Image();
      spritesheet.onload = function () {
        splashInterval = setInterval(renderSplashFrame, 60);
      };
      spritesheet.src = "spritesheet.high.bw.png";
    },
  };
})();

$(function () {
  game.start();
});
