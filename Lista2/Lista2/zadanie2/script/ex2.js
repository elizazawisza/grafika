window.addEventListener('load', main);

function createProgramFromSources(gl, vertexSources, fragmentSources) {
    let src;
    const program = gl.createProgram();
    let shader = null;

    for (src of vertexSources) {
        shader = createShader(gl, gl.VERTEX_SHADER, src);
        gl.attachShader(program, shader);
    }

    for (src of fragmentSources) {
        shader = createShader(gl, gl.FRAGMENT_SHADER, src);
        gl.attachShader(program, shader);
    }

    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        const lastError = gl.getProgramInfoLog(program);
        console.error("Error in program linking:" + lastError);
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function main() {
    const hilbertCurves = [];

    const addCurveButton = document.getElementById('addCurve');
    const levelInput = document.getElementById('level');
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl');


    const vertexShader = document.getElementById('2d-vertex-shader').innerText;
    const fragmentShader = document.getElementById('2d-fragment-shader').innerText;

    const hilbertCurve = new HilbertCurve(gl, vertexShader, fragmentShader);
    addCurveButton.addEventListener('click', () => {
        hilbertCurves.push(generateHilbert(Number(levelInput.value), [0.0, 0.0, 0.0, 1.0], 0.5));
        updateControls(hilbertCurves, hilbertCurve);
        hilbertCurve.bufferLevels(hilbertCurves);
        hilbertCurve.draw();
    });

}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}


function generateHilbert(level, color, depth) {
    const res = {
        level: level,
        depth: depth,
        color: color,
        positions: []
    };
    let size = 2 ** level;
    let prev = {x: 0, y: 0};
    for (let i = 1; i < size * size; i++) {
        let result = generateHilbertCoordinates(i, size);
        res.positions.push(prev.x / (size - 1), prev.y / (size - 1), depth, result.x / (size - 1), result.y / (size - 1), depth);
        prev = result;
    }
    return res;
}

function updateHilbert(hilbert, newDepth, newColor) {
    if (newDepth !== undefined) {
        hilbert.depth = newDepth;
        for (let i = 2; i < hilbert.positions.length; i += 3) {
            hilbert.positions[i] = newDepth;
        }
    }
    if (newColor !== undefined) {
        hilbert.color = newColor;
    }
}

function setColorValue(colorArray){
    colorArray = colorArray.toString()
    let color = ''
    switch (colorArray) {
        case "1,0,0,1":
            color = 'RED'
            break
        case "1,1,0,1":
            color =  "YELLOW"
            break
        case "0,0,1,1":
            color =  "BLUE"
            break
        case "0,1,0,1":
            color =  "GREEN"
            break
        case "1,0.5,0,1":
            color = "ORANGE"
            break
        case "1,0,1,1":
            color = "PURPLE"
            break
        case "0,0,0,1":
            color = "BLACK"
            break

    }
    return color
}

function createSelectOptions(selectName){

    let valueArray = ["YELLOW", "GREEN", "BLUE", "BLACK", "RED", "ORANGE", "PURPLE" ]
    let textArray = ["YELLOW", "GREEN", "BLUE", "BLACK", "RED", "ORANGE", "PURPLE" ]
    let z;
    let t;

    for(let i=0; i< valueArray.length; i++){
        z = document.createElement("option");
        z.setAttribute("value", valueArray[i]);
        t = document.createTextNode(textArray[i]);
        z.appendChild(t);
        document.getElementById(selectName).appendChild(z);
    }
}


function getColor(colorName){
    let color =[]
    switch (colorName) {
        case "RED":
            color = [1.0, 0.0, 0.0, 1.0]
            break
        case "YELLOW":
            color = [1.0, 1.0, 0.0, 1.0]
            break
        case "BLUE":
            color = [0.0, 0.0, 1.0, 1.0]
            break
        case "GREEN":
            color = [0.0, 1.0, 0.0, 1.0]
            break
        case "ORANGE":
            color = [1.0, 0.5, 0.0, 1.0]
            break
        case "PURPLE":
            color = [1.0, 0.0 ,1.0, 1.0]
            break
        case "BLACK":
            color = [0.0, 0.0 ,0.0, 1.0]
            break

    }
    return color
}


function updateControls(hilbertCurves, d) {
    const container = document.getElementById('controls');
    while (container.firstChild) container.removeChild(container.firstChild);
    let i = 0;
    hilbertCurves.forEach(hilbert => {
        const controls = document.createElement('div');
        const text = document.createElement('p');
        controls.className = 'control';
        const upButton = document.createElement('button');
        upButton.className = "example_c"
        upButton.textContent = '▲';
        const downButton = document.createElement('button');
        downButton.className = "example_c"
        downButton.textContent = '▼';
        const colorSelect = document.createElement('select');
        colorSelect.setAttribute("id", "mySelect" + i);
        colorSelect.className = "example_c"
        document.body.appendChild(colorSelect);
        createSelectOptions("mySelect" + i)
        const curveInfo = document.createElement('p');
        curveInfo.innerText = "  Current curve level = " + hilbert.level + "\n Current curve depth = " + hilbert.depth



        colorSelect.value = setColorValue(hilbert.color)
        const upDownDiv = document.createElement('div');
        upDownDiv.className = 'up-down';

        downButton.addEventListener('click', () => {
            updateHilbert(hilbert, hilbert.depth + 0.5);
            updateControls(hilbertCurves, d);
            d.bufferLevels(hilbertCurves);
            d.draw();
        });

        upButton.addEventListener('click', () => {
            updateHilbert(hilbert, hilbert.depth - 0.5);
            updateControls(hilbertCurves, d);
            d.bufferLevels(hilbertCurves);
            d.draw();
        });

        colorSelect.addEventListener('change', () => {
            let rgb = getColor(colorSelect.value)
            updateHilbert(hilbert, undefined, rgb);
            d.bufferLevels(hilbertCurves);
            d.draw();
        });

        upDownDiv.append(upButton, downButton);
        controls.append(upDownDiv, colorSelect, curveInfo);
        container.append(text, controls);
        i++
    });
}



function hilbertModulo(x){
    return x%4
}

function hilbertDivide(x){
    return  Math.floor(x/4)
}

function generateHilbertCoordinates(index, level) {
    let positions = [[0, 0], [0, 1], [1, 1], [1, 0]];
    let [x, y] = positions[hilbertModulo(index)];
    index = hilbertDivide(index);

    for (let i = 4; i <= level; i *= 2) {
        switch (hilbertModulo(index)) {
            case 0:
                [x, y] = [y, x];
                break;
            case 1:
                y += i / 2;
                break;
            case 2:
                x += i / 2;
                y += i / 2;
                break;
            case 3:
                [y, x] = [i/2 - 1 - x, i - 1 - y];
                break;
        }
        index = hilbertDivide(index);
    }

    return {
        x: x,
        y: y
    };
}

