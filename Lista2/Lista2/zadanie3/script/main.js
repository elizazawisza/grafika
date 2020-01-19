"use strict";
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");
if (!gl) {
    throw "Your browser does not support WebGl";
}

const POINT_SIZE = canvas.clientHeight * 0.04;
const LINE_WIDTH = canvas.clientWidth * 0.0025;
const PIXELS_PER_SEC = canvas.clientWidth * 0.233;
const ACCELERATION = 1.01;

const vertexShader = document.getElementById('2d-vertex-shader').innerText;
const fragmentShader = document.getElementById('2d-fragment-shader').innerText;

function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width = canvas.clientWidth * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
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

const elements = [];

const paddleWidth = canvas.clientWidth * 0.025;
const paddleHeight = canvas.clientHeight * 0.25;

const SHAPES = {
    paddle: {
        geometry: [
            0, 0,
            paddleWidth, 0,
            0, paddleHeight,
            paddleWidth, paddleHeight,
        ],
        type: gl.TRIANGLE_STRIP,
        vertices: 4,
    },

    ball: {
        geometry: [0, 0],
        type: gl.POINTS,
        vertices: 1,
    },

    fieldLine: {
        geometry: [
            0, 0,
            0, canvas.clientHeight,
        ],
        type: gl.LINES,
        vertices: 2,
    },

    fieldCenter: {
        geometry: [
            -canvas.clientWidth * 0.45, -canvas.clientHeight * 0.5,
            canvas.clientWidth * 0.45, -canvas.clientHeight * 0.5,
            canvas.clientWidth * 0.45, canvas.clientHeight * 0.5,
            -canvas.clientWidth * 0.45, canvas.clientHeight * 0.5,
        ],
        type: gl.TRIANGLE_FAN,
        vertices: 4,
    },

    fieldCenterRhombus: {
        geometry: [
            0, -canvas.clientHeight * 0.05,
            canvas.clientWidth * 0.05, 0,
            0, canvas.clientHeight * 0.05,
            -canvas.clientWidth * 0.05, 0,
        ],
        type: gl.TRIANGLE_FAN,
        vertices: 4,
    }
};


const program = createProgramFromSources(gl, [vertexShader], [fragmentShader]);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");


const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
const colorLocation = gl.getUniformLocation(program, "u_color");
const translationLocation = gl.getUniformLocation(program, "u_translation");
const textureUniformLocation = gl.getUniformLocation(program, "u_texture");
const uniformPointSize = gl.getUniformLocation(program, "u_pointsize");


elements.push(
    new Paddle(SHAPES.paddle.geometry,
        SHAPES.paddle.vertices,
        SHAPES.paddle.type,
        null,
        null,
        [0, 0, 0, 0],
        'textures/barcelona_logo.jpeg')
);
elements.push(
    new Paddle(
        SHAPES.paddle.geometry,
        SHAPES.paddle.vertices,
        SHAPES.paddle.type,
        {up: 'ArrowUp', down: 'ArrowDown'},
        [canvas.clientWidth - paddleWidth, canvas.clientHeight - paddleHeight],
        [0, 0, 0, 0],
        'textures/real_logo.jpeg'
    )
);
elements.push(
    new DrawableTexture(
        SHAPES.fieldCenter.geometry,
        SHAPES.fieldCenter.vertices,
        SHAPES.fieldCenter.type,
        [canvas.clientWidth / 2, canvas.clientHeight / 2],
        [0, 0, 0, 1],
        'textures/football_pitch.png'
    )
);
elements.push(
    new Drawable(
        SHAPES.fieldLine.geometry,
        SHAPES.fieldLine.vertices,
        SHAPES.fieldLine.type,
        [canvas.clientWidth / 2, 0],
        [0, 0, 0, 1],
    )
);

function addNewBall(drawables, color) {
    const ball = new Ball(
        SHAPES.ball.geometry,
        SHAPES.ball.vertices,
        SHAPES.ball.type,
        [canvas.clientWidth / 2, canvas.clientHeight / 2],
        null,
        color,
        'textures/ball.png'
    );
    ball.registerCollisionObject(drawables[0]);
    ball.registerCollisionObject(drawables[1]);
    drawables.push(ball);
}

for (let i = 0; i < 1; i += 1) {
    addNewBall(elements, [1, 0, 0, 1]);
}

let then = 0;

function drawScene(now) {
    let element;
    now *= 0.001;
    const deltaTime = now - then;
    then = now;

    resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);


    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    for (element of elements) {
        element.moveAfterUpdate(deltaTime);
    }

    for (element of elements) {
        element.draw();
    }

    requestAnimationFrame(drawScene);
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

requestAnimationFrame(drawScene);

