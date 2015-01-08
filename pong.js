var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) { 
        window.setTimeout(callback, 1000 / 60); 
    }
;
var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

var update = function() {
};

var render = function() {
  context.fillStyle = "#e3e3e3";
  context.fillRect(0, 0, width, height);
};

var step = function() {
    update();
    render();
    animate(step);
};

window.onload = function () {
    document.body.appendChild(canvas);
    animate(step);
};

