//Global Variables

var windowHeight = window.innerHeight;
var gameContainerWidth = document.getElementById('game-col').clientWidth;
var height = windowHeight * 0.8;
var width = gameContainerWidth;
var scoreboard = document.getElementById('scoreboard');
var scoreboardHeight = scoreboard.clientHeight;
var buttonHeight = windowHeight - scoreboardHeight - height;
var leftButton = document.getElementById('left-button'); 
var rightButton = document.getElementById('right-button');
leftButton.setAttribute('style', 'height:' + buttonHeight +'px');
rightButton.setAttribute('style','height:' + buttonHeight +'px');
var paddleWidth = width/8;
var paddleHeight = paddleWidth/7;
var playerSpeed = 6;
var paddleCenter = width/2 - paddleWidth/2;
var computerStartPositionX = paddleCenter;
var computerStartPositionY = 0;
var playerStartPositionX = paddleCenter;
var playerStartPositionY = height - paddleHeight;
var ballRadius = paddleHeight/1.5;
var ballStartPositionX = width/2;
var ballStartPositionY = height/2;
var ballStartSpeed= 0;
var dpi = window.devicePixelRatio;
if(dpi <= 1){
    ballStartSpeed = 7;
}else if(dpi > 1 && dpi < 2){
    ballStartSpeed = 8;
    playerSpeed = 8;
}else{
    ballStartSpeed = 9;
    playerSpeed = 9;
};
var computerMaxSpeed = playerSpeed + 1;
var winningScore = 7;
var playerScoreField = document.getElementById('player-score');
var computerScoreField = document.getElementById('computer-score');

//Print dpi to screen

var dpiText = document.createTextNode(dpi);
var dpiElement = document.getElementById('dpi');
dpiElement.appendChild(dpiText);

//Creating Canvas

var canvas = document.createElement('canvas');

canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

//Add canvas to page

window.onload = function () {
    var gameCol = document.getElementById('game-col');
    gameCol.insertBefore(canvas, gameCol.firstChild);
    animate(step);
};

//Storing Key Presses

var keysDown = {};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

//Storing control button presses

var leftButtonPressed = false; 
var rightButtonPressed = false;
var leftMouseDown = function(){ //function to update leftButtonPressed
    leftButtonPressed = true;
};
var leftMouseUp = function(){ //funciton to update leftButtonPressed
    leftButtonPressed = false;
};
var rightMouseDown = function(){ //function to update leftButtonPressed
    rightButtonPressed = true;
};
var rightMouseUp = function(){ //funciton to update leftButtonPressed
    rightButtonPressed = false;
};
//Event listeners to see if left button is pressed
leftButton.addEventListener('mousedown',leftMouseDown,false);
leftButton.addEventListener('mouseup',leftMouseUp, false);
leftButton.addEventListener('touchstart',leftMouseDown,false);
leftButton.addEventListener('touchend',leftMouseUp, false);
rightButton.addEventListener('mousedown',rightMouseDown,false);
rightButton.addEventListener('mouseup',rightMouseUp, false);
rightButton.addEventListener('touchstart',rightMouseDown,false);
rightButton.addEventListener('touchend',rightMouseUp, false);

//Keeping Score

var resetScores = function(){
    computer.score = 0;
    player.score = 0;
    computerScoreField.innerHTML = '0';
    playerScoreField.innerHTML = '0';
};

var score = function(){
    if(computer.score >= winningScore || player.score >= winningScore){
        if(computer.score >= winningScore){
            alert("Computer Won!");
        }else if(player.score >= winningScore){
            alert("You Won!");
        };
        resetScores();
    };
};

//Reset position after someone scores

var resetPosition = function() {
    ball.x = ballStartPositionX;
    ball.y = ballStartPositionY;
    ball.x_speed = 0;
    ball.y_speed = ballStartSpeed;
    computer.paddle.x = computerStartPositionX;
    player.paddle.x = playerStartPositionX;
};

//Paddle Constructor

function Paddle(x, y) {
    this.x = x;
    this.y = y;
    this.width = paddleWidth;
    this.height = paddleHeight;
    this.x_speed = 0;
    this.y_speed = 0;
};

//Render Method for paddles

Paddle.prototype.render = function() {
    context.fillStyle = "#000";
    context.fillRect(this.x, this.y, this.width, this.height);
};

//Move method for paddles

Paddle.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if(this.x < 0) { // paddle hitting left wall
        this.x = 0;
        this.x_speed = 0;
    } else if (this.x + this.width > width) { // paddle hitting right wall
        this.x = width - this.width;
        this.x_speed = 0;
    };
};

//Player constructor

function Player() {
    
    this.paddle = new Paddle(playerStartPositionX, playerStartPositionY);
    this.score = 0;
};

//update score for player

Player.prototype.iScored = function() {
    this.score ++;
    var playerScoreText = document.createTextNode(this.score);
    
    playerScoreField.innerHTML = '';
    playerScoreField.appendChild(playerScoreText);  
};

//Update method for players

Player.prototype.update = function() {
    for(var key in keysDown) {
        var value = Number(key);
        if(value == 37) { // left arrow pressed
            this.paddle.move(-playerSpeed, 0);
        } else if (value == 39) { // right arrow pressed
            this.paddle.move(playerSpeed, 0);
        } else {
            this.paddle.move(0, 0);
        };
    };
    
    if(leftButtonPressed){
        this.paddle.move(-playerSpeed, 0);
    }else if(rightButtonPressed){
        this.paddle.move(playerSpeed, 0);
    }else{
        
    };
};

//Render method for players

Player.prototype.render = function() {
  this.paddle.render();
};

//computer constructor

function Computer() {
    this.paddle = new Paddle(computerStartPositionX, computerStartPositionY);
    this.score = 0;
};

//update score for computer

Computer.prototype.iScored = function() {
    this.score ++;
    var computerScoreText = document.createTextNode(this.score);
    
    computerScoreField.innerHTML = '';
    computerScoreField.appendChild(computerScoreText);
};

//update method for computers

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

//Render method for computers

Computer.prototype.render = function() {
    this.paddle.render();
};

//Ball constructor

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = ballStartSpeed;
    this.radius = ballRadius;
};

//Update method for balls

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
            player.iScored();
        };

        if(this.y > height ) { // computer scored
            computer.iScored();
        };
        
        resetPosition();
    };
    
    if(top_y > height/2) {
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

//Render method for balls

Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#000000";
    context.fill();
};

//Update all objects for render

var update = function() {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};

//Render objects to canvas

var render = function() {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    player.render();
    computer.render();
    ball.render();
};

//Call step 60 times per second

var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) { 
        window.setTimeout(callback, 1000 / 60); 
    };
;

//Loop through update, render, animate

var step = function() {
    score();
    update();
    render();
    animate(step);
};

//Create the instances of each object and play the game

var player = new Player();
var computer = new Computer();
var ball = new Ball(ballStartPositionX,ballStartPositionY);





