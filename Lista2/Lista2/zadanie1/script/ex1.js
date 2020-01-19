
"use strict";

function main() {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // setup GLSL program
    const program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);

    // look up where the vertex data needs to go.
    const positionLocation = gl.getAttribLocation(program, "a_position");

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const colorLocation = gl.getUniformLocation(program, "u_color");
    const translationLocation = gl.getUniformLocation(program, "u_translation");
    const rotationLocation = gl.getUniformLocation(program, "u_rotation");
    const scaleLocation = gl.getUniformLocation(program, "u_scale");
    const uniformPointSize = gl.getUniformLocation(program, "u_pointsize");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const translation = [100, 150];
    const rotation = [0, 1];
    const scale = [1, 1];
    let color = [Math.random(), Math.random(), Math.random(), 1];
    const pointSize = 32;

    let figuresChoice = document.getElementById("figureChoice")
    let shape = 'POINTS'
    figuresChoice.onchange = function () {
        shape = figuresChoice.value
        draw(shape)
    }

    let showUniformsButton = document.getElementById('displayUniforms');
    showUniformsButton.onclick = function(){
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; ++i) {
            const info = gl.getActiveUniform(program, i);
            console.log('name:', info.name, 'type:', info.type, 'size:', info.size);
        }
    }

    let showAttributesButton = document.getElementById('displayAttributes');
    showAttributesButton.onclick = function(){
        const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttribs; ++i) {
            const info = gl.getActiveUniform(program, i);
            console.log('name:', info.name, 'type:', info.type, 'size:', info.size);
        }
    }

    let clearButton = document.getElementById('clearConsole');
    clearButton.onclick = function(){
        console.clear()
    }


    let colorSelect = document.getElementById("colorChoice")
    colorSelect.onchange = function () {
        let givenColor = colorSelect.value
        switch (givenColor) {
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
            case "RANDOM":
                color = [Math.random(), Math.random(), Math.random(), 1];
                break

        }
        draw(shape);
    }

    draw(gl, shape);

    webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), max: gl.canvas.width});
    webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
    webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max: 360});
    webglLessonsUI.setupSlider("#scaleX", {
        value: scale[0],
        slide: updateScale(0),
        min: -5,
        max: 5,
        step: 0.01,
        precision: 2
    });
    webglLessonsUI.setupSlider("#scaleY", {
        value: scale[1],
        slide: updateScale(1),
        min: -5,
        max: 5,
        step: 0.01,
        precision: 2
    });

    function updatePosition(index) {
        return function (event, ui) {
            translation[index] = ui.value;
            draw(shape);
        };
    }

    function updateAngle(event, ui) {
        var angleInDegrees = 360 - ui.value;
        var angleInRadians = angleInDegrees * Math.PI / 180;
        rotation[0] = Math.sin(angleInRadians);
        rotation[1] = Math.cos(angleInRadians);
        draw(shape);
    }

    function updateScale(index) {
        return function (event, ui) {
            scale[index] = ui.value;
            draw(shape);
        };
    }

    function draw(shape) {
        setGeometry(gl, shape);
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        var size = 2;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

        gl.uniform1f(uniformPointSize, pointSize);

        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

        gl.uniform4fv(colorLocation, color);

        gl.uniform2fv(translationLocation, translation);

        gl.uniform2fv(rotationLocation, rotation);

        gl.uniform2fv(scaleLocation, scale);

        drawSelectedShape(shape)
    }

    function drawSelectedShape(shape) {
        let primitiveType;
        let offset;
        var count;
        switch (shape) {
            case "POINTS":
                primitiveType = gl.POINTS;
                offset = 0;
                count = 2;
                gl.drawArrays(primitiveType, offset, count);
                break
            case "LINE_STRIP":
                primitiveType = gl.LINE_STRIP;
                offset = 0;
                count = 8;
                gl.drawArrays(primitiveType, offset, count);
                break
            case "LINE_LOOP":
                primitiveType = gl.LINE_LOOP;
                offset = 0;
                count = 5;
                gl.drawArrays(primitiveType, offset, count);
                break
            case "LINES":
                primitiveType = gl.LINES;
                offset = 0;
                count = 8;
                gl.drawArrays(primitiveType, offset, count);
                break
            case "TRIANGLE_STRIP":
                primitiveType = gl.TRIANGLE_STRIP;
                offset = 1;
                count = 5;
                gl.drawArrays(primitiveType, offset, count);
                break
            case "TRIANGLE_FAN":
                primitiveType = gl.TRIANGLE_FAN;
                offset = 1;
                count = 8;
                gl.drawArrays(primitiveType, offset, count);
                break
            case "TRIANGLES":
                primitiveType = gl.TRIANGLES;
                offset = 1;
                count = 5;
                gl.drawArrays(primitiveType, offset, count);
                break
            default:
                break;

        }
    }
}

function setGeometry(gl, shape) {
    let vertices
    switch (shape) {
        case "POINTS":
            vertices = [
                30, 0,
                190, 40,
                70, 230,
                100, 340,]
            break
        case "LINE_STRIP":
            vertices = [
                190, 40,
                70, 230,
                100, 340,
                100, 0,
                100, 30,
                180, 90,
                130, 30,
                400, 0,
                200, 30,
                30, 60,
                67, 60,
                30, 90,
            ]
            break
        case "LINE_LOOP":
            vertices = [
                100, 0,
                130, 40,
                180, 90,
                130, 30,
                400, 0,
                200, 30,
                67, 60,
                30, 60,
                67, 60,
                30, 90,
                30, 90,
                67, 90,]
            break
        case "LINES":
            vertices = [
                130, 40,
                180, 90,
                130, 30,
                400, 0,
                200, 30,
                30, 60,
                67, 60,
                30, 90,
                30, 90,
                67, 60,
                67, 90,]
            break
        case "TRIANGLE_STRIP":
            vertices = [
                30, 0,
                100, 0,
                30, 30,
                100, 0,
                100, 30,
                30, 60,
                67, 60,
                30, 90,
                30, 90,
                67, 60,
                67, 90,]
            break
        case "TRIANGLE_FAN":
            vertices = [
                30, 0,
                100, 0,
                30, 30,
                100, 0,
                100, 30,
                30, 60,
                67, 60,
                30, 90,
                30, 90,
                67, 60,
                67, 90,]
            break
        case "TRIANGLES":
            vertices = [
                130, 40,
                180, 90,
                130, 30,
                400, 0,
                200, 30,
                30, 60,
                67, 60,
                30, 90,
                30, 90,
                67, 60,
                67, 90,]
            break

    }
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW);
}

main();


