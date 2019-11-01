var canvas = document.getElementById("hilbertCanvas");
var context = canvas.getContext("2d");
var levelInput = document.getElementById("level")
var lengthInput = document.getElementById("length")


let currentXTurtlePosition = 0;
let currentYTurtlePosition = 0;

let beginXTurtlePosition = 20;
let beginYTurtlePosition = 20;

let angle = 0

const minX = 0;
const maxX = 800;
const maxY = 600;
const minY = 0;




function initTurtle() {
    context.clearRect(minX, minY, maxX, maxY)
    angle = 0;
    context.moveTo(beginXTurtlePosition, beginYTurtlePosition);
    currentYTurtlePosition = beginYTurtlePosition
    currentXTurtlePosition = beginXTurtlePosition
}

function checkX(delta){
    if(currentXTurtlePosition + delta > maxX || currentXTurtlePosition + delta < minX){
        console.error("Out of frame!!!!")
        return false
    }else{
        return true
    }
}

function checkY(delta){
    if(currentYTurtlePosition + delta > maxY || currentYTurtlePosition + delta < minY){
        console.error("Out of frame!!!!")
        return false
    }else {
        return true
    }
}


function move(value){
    var radians = angle *  Math.PI / 180.0;
    var dy = value * Math.cos(radians)
    var dx = value * Math.sin(radians)
    if(checkY(dy) && checkX(dx) ){
        context.moveTo(currentXTurtlePosition,currentYTurtlePosition);
        currentYTurtlePosition = currentYTurtlePosition + dy
        currentXTurtlePosition = currentXTurtlePosition + dx
        context.lineTo(currentXTurtlePosition, currentYTurtlePosition);
    }

}

function startDrawing(){
    context.beginPath()
}

function clearCanvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    initTurtle()
}


function rotateLeft(value){
    angle = (angle - value) % 360;
}

function rotateRight(value){
    angle = (angle + value) % 360;
}

function finishDrawing(){
    context.stroke();
}

function hilbert(level, degree, length){
    if(level === 0){
        return
    }
    rotateRight(degree)
    hilbert(level-1, -degree, length)
    move(length)
    rotateLeft(degree)
    hilbert(level-1, degree, length)
    move(length)
    hilbert(level-1, degree, length)
    rotateLeft(degree)
    move(length)
    hilbert(level-1, -degree, length)
    rotateRight(degree)
}

function runProgram(){
    let length = lengthInput.value
    let level = levelInput.value
    startDrawing()
    hilbert(level, 90, length)
    finishDrawing()
}

initTurtle()
