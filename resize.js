import {render} from './src/gameElements.js'

export const resize =  () => {
    if (window.innerWidth / window.innerHeight > render.width / render.height) {
      var scale = window.innerHeight / render.height;
    } else {
      var scale = window.innerWidth / render.width;
    }

    // var transform = "scale(" + scale + ")";
    // const element = document.getElementById('c');
    // console.log(element)
    // element 
    //   .css("MozTransform", transform)
    //   .css("transform", transform)
    //   .css("WebkitTransform", transform)
    //   .css({
    //     top: ((scale - 1) * render.height) / 2,
    //     left:
    //       ((scale - 1) * render.width) / 2 +
    //       (window.innerWidth - render.width * scale) / 2,
    //   });
  };