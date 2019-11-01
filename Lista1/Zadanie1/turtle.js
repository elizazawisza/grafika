var canvas = document.getElementById("turtleGraphic");
var context = canvas.getContext("2d");
var instructions = document.getElementById("instructionsList")


let currentXTurtlePosition = 0;
let currentYTurtlePosition = 0;

let beginXTurtlePosition = 400;
let beginYTurtlePosition = 250;

let angle = 0

const minX = 0;
const maxX = 800;
const maxY = 500;
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

function setColor(color) {
    switch (color) {
        case "RED":
            context.strokeStyle = "#d32f2f"
            break;
        case "GREEN":
            context.strokeStyle = "#4CAF50"
            break;
        case "BLUE":
            context.strokeStyle = "#2196F3"
            break;
        case "YELLOW":
            context.strokeStyle = "#FFEB3B"
            break;
        case "ORANGE":
            context.strokeStyle = "#FF9800"
            break;
    }

}

function rotateLeft(value){
    angle = (angle - value) % 360;
}

function rotateRight(value){
    angle = (angle + value) % 360;
}

function drawCircle(radius){
    context.arc(currentXTurtlePosition,currentYTurtlePosition,radius,0,2*Math.PI);
}

function finishDrawing(){
    context.stroke();
}

function clearCanvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    initTurtle()
}

function executeCommand(command){
    command = command.split(" ")
    switch (command[0]) {
        case "FORWARD":
            move(parseInt(command[1]))
            break;
        case "COLOR":
            setColor(command[1])
            break;
        case "BACK":
            move(-parseInt(command[1]))
            break;
        case "RIGHT":
            rotateRight(parseInt(command[1]))
            break;
        case "LEFT":
            rotateLeft(parseInt(command[1]))
            break;
        case "START":
            startDrawing()
            break;
        case "END":
            finishDrawing()
            break;
        default:
            break;
    }
}

function runProgram() {
    let tmp = instructions.value.split("\n");
    tmp.forEach(executeCommand)
    instructions.value = "";
}

function runExampleProgram(command){
    command.forEach(executeCommand)
}

initTurtle()
