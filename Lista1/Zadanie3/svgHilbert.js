var hilbertPolyline = document.getElementById("hilbertPolyline");
var levelInput = document.getElementById("level")
var lengthInput = document.getElementById("length")


let currentXTurtlePosition = 0;
let currentYTurtlePosition = 0;

let beginXTurtlePosition = 20;
let beginYTurtlePosition = 20;

let angle = 0

let coordinates = []

const minX = 0;
const maxX = 800;
const maxY = 600;
const minY = 0;




function initTurtle() {
    angle = 0;
    coordinates = []
    currentYTurtlePosition = beginYTurtlePosition
    currentXTurtlePosition = beginXTurtlePosition
    coordinates.push( currentXTurtlePosition + "," +currentYTurtlePosition + " " )
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
        currentYTurtlePosition = currentYTurtlePosition + dy
        currentXTurtlePosition = currentXTurtlePosition + dx
        coordinates.push( currentXTurtlePosition + "," +currentYTurtlePosition + " " )
    }

}


function clearSVG(){
    hilbertPolyline.setAttribute("points", "")
    initTurtle()
}


function rotateLeft(value){
    angle = (angle - value) % 360;
}

function rotateRight(value){
    angle = (angle + value) % 360;
}

function finishDrawing(){
    hilbertPolyline.getAttribute("points")
    hilbertPolyline.setAttribute("points", coordinates.join(""))
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
    hilbert(level, 90, length)
    finishDrawing()
}

initTurtle()
