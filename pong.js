var windowHeight = window.innerHeight;
var height = windowHeight * 0.9;
var width = height * (5/6);
var paddleWidth = width/8;
var paddleHeight = paddleWidth/5;
var playerSpeed = 6;
var computerMaxSpeed = playerSpeed + 1;
var paddleCenter = width/2 - paddleWidth/2;
var computerStartPositionX = paddleCenter;
var computerStartPositionY = 0;
var playerStartPositionX = paddleCenter;
var playerStartPositionY = height - paddleHeight;
var ballRadius = paddleHeight/2;
var ballStartSpeed= 3;
var keysDown = {};

var playerScore = 0;
var computerScore = 0;

window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});

var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) { 
        window.setTimeout(callback, 1000 / 60); 
    };

var canvas = document.createElement('canvas');

canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

var score = function(){
    var playerScoreText = document.createTextNode(playerScore);
    var computerScoreText = document.createTextNode(computerScore);
    var playerScoreField = document.getElementById('player-score');
    var computerScoreField = document.getElementById('computer-score');
    playerScoreField.innerHTML = '';
    computerScoreField.innerHTML = '';
    playerScoreField.appendChild(playerScoreText);
    computerScoreField.appendChild(computerScoreText);
}

var resetPosition = function() {
    computer.paddle.x = computerStartPositionX;
    player.paddle.x = playerStartPositionX;
}

var update = function() {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};

var render = function() {
    context.fillStyle = "#e3e3e3";
    context.fillRect(0, 0, width, height);
    player.render();
    computer.render();
    ball.render();
};

var step = function() {
    update();
    render();
    animate(step);
};

window.onload = function () {
    document.getElementById('game-container').appendChild(canvas);
    animate(step);
};


function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
};

Paddle.prototype.render = function() {
  context.fillStyle = "#0000FF";
  context.fillRect(this.x, this.y, this.width, this.height);
};


function Player() {
   this.paddle = new Paddle(playerStartPositionX, playerStartPositionY, paddleWidth, paddleHeight);
};

Paddle.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if(this.x < 0) { // all the way to the left
    this.x = 0;
    this.x_speed = 0;
  } else if (this.x + this.width > width) { // all the way to the right
    this.x = width - this.width;
    this.x_speed = 0;
  };
};

Player.prototype.update = function() {
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 37) { // left arrow
      this.paddle.move(-playerSpeed, 0);
    } else if (value == 39) { // right arrow
      this.paddle.move(playerSpeed, 0);
    } else {
      this.paddle.move(0, 0);
    };
  };
};

Player.prototype.render = function() {
  this.paddle.render();
};

function Computer() {
  this.paddle = new Paddle(computerStartPositionX, computerStartPositionY, paddleWidth, paddleHeight);
};


Computer.prototype.update = function(ball) {
    var x_pos = ball.x;
    var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
    
    if(diff < 0 && diff < -(computerMaxSpeed - 1)) { // max speed left
        diff = -computerMaxSpeed;
    } else if(diff > 0 && diff > computerMaxSpeed - 1) { // max speed right
        diff = computerMaxSpeed;
    }
    
    if(ball.y < height/3 || ball.y_speed <= 0) {
        this.paddle.move(diff, 0);
    };
    
    if(this.paddle.x < 0) {
        this.paddle.x = 0;
    } else if (this.paddle.x + this.paddle.width > width) {
        this.paddle.x = width - this.paddle.width;
    }
};

Computer.prototype.render = function() {
  this.paddle.render();
};

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = ballStartSpeed;
    this.radius = ballRadius;
};

Ball.prototype.update = function(paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - this.radius;
    var top_y = this.y - this.radius;
    var bottom_x = this.x + this.radius;
    var bottom_y = this.y + this.radius;
    
    if(this.x - this.radius < 0) { // hitting the left wall
        this.x = this.radius;
        this.x_speed = -this.x_speed;
    } else if(this.x + this.radius > width) { // hitting the right wall
        this.x = width - this.radius;
        this.x_speed = -this.x_speed;
    };
    
    if(this.y < 0 || this.y > height) { // a point was scored
        if(this.y < 0) { // player scored
            playerScore ++;
        };

        if(this.y > height ) { // computer scored
            computerScore ++;
        };
        
        score();
        
        resetPosition();
        
        this.x_speed = 0;
        this.y_speed = ballStartSpeed;
        this.x = ballStartPositionX;
        this.y = ballStartPositionY;
        
    };
    
    if(top_y > 300) {
        if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
            // hit the player's paddle
            this.y_speed = -this.y_speed;
            this.x_speed += (paddle1.x_speed / 2);
            this.y += this.y_speed;
            }
        } else {
            if(top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
            // hit the computer's paddle
            this.y_speed = -this.y_speed;
            this.x_speed += (paddle2.x_speed / 2);
            this.y += this.y_speed;
        };
    };
};

Ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#000000";
  context.fill();
};


var player = new Player();
var computer = new Computer();
var ballStartPositionX = width/2;
var ballStartPositionY = height/2;
var ball = new Ball(ballStartPositionX,ballStartPositionY);


