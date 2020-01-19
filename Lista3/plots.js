let canvas = document.getElementById('canvasId');
let gl = canvas.getContext('webgl');
let result, min, step, index, vertices, indices, colors, verticesLength;
let vertexBuffer, colorBuffer, indexBuffer, normalBuffer;

let ambient = 0.64;
let backgroundColor = [0.219, 0.038, 0.182, 1];
let lightPosition = [0, 0, 50];
let lightColor = [0.122, 0.827, 0.94];
let vertexShader, fragmentShader, shaderProgram;
let vertexShaderSource, fragmentShaderSource
let projectionLocation, rotationLocation, identityLocation;

const f1 = (x, y) =>{
  return Math.sqrt(Math.pow((x), 2) - Math.pow((y), 2));
}//bow

const f2 = (x, y) => {
  return Math.pow(x, 4) - Math.pow(y, 5) / Math.log(1 / Math.pow(x, 2)) * 5 * x * Math.sin(1 / x)
}//batman

const f3 = (x, y) => {
  return Math.abs(Math.exp(Math.pow(1 / x, 2) * Math.sin(((1 / Math.cos(1 / x)) * y))))
}//oczy owada

const f4 = (x, y) => {
  return Math.pow(((Math.pow(x, 2) - Math.pow(y, 2)) / (Math.pow(x, 2) + Math.pow(y, 2))), 2);
}//flower

const webGlStart = (func = 'f1') => {
  result = [];
  min = -1;
  max = 1;
  step = 0.002;
  index = 0;
  verticesLength = 0;
  vertices = [];
  indices = [];
  colors = [];
  vertexShaderSource = document.getElementById('2d-vertex-shader').innerText
  fragmentShaderSource = document.getElementById('2d-fragment-shader').innerText

  generateVertices(func);
  makeTriangulation();
  createProgramFromSources();
  draw();
  canvas.onpointerdown = click;
  window.onkeydown = onKeyDown;
}

const createProgramFromSources = () => {

  vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    return null;
  }

  fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragmentShader));
    return null;
  }

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log("Could not initialise shaders");
    return null;
  }

  gl.useProgram(shaderProgram);

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  projectionLocation = gl.getUniformLocation(shaderProgram, "projectionMatrix");
  rotationLocation = gl.getUniformLocation(shaderProgram, "rotationMatrix");
  identityLocation = gl.getUniformLocation(shaderProgram, "identityMatrix");

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  let coordinates = gl.getAttribLocation(shaderProgram, "coordinates");
  gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordinates);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  let normalsLocalization = gl.getAttribLocation(shaderProgram, "normal");
  gl.vertexAttribPointer(normalsLocalization, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalsLocalization);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  let color = gl.getAttribLocation(shaderProgram, "color");
  let background = gl.getUniformLocation(shaderProgram, "background");
  let ambientLocation = gl.getUniformLocation(shaderProgram, "ambient");
  let lightPositionLocation = gl.getUniformLocation(shaderProgram, "lightPosition");
  let lightColorLocation = gl.getUniformLocation(shaderProgram, "lightColor");
  gl.uniform3fv(background, new Float32Array(backgroundColor.slice(0, 3)));
  gl.uniform1f(ambientLocation, ambient);
  gl.uniform3fv(lightPositionLocation, new Float32Array(lightPosition));
  gl.uniform3fv(lightColorLocation, new Float32Array(lightColor));

  gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(color);
}


const generateVertices = (fun) => {
  let color = 0.65;
  for (let i = min; i <= max; i += step) {
    verticesLength += 1;
    for (let j = min; j <= max; j += step) {
      vertices.push(i, j, ((fun === 'f1') ? f1(i, j) : ((fun === 'f2') ? f2(i, j) : ((fun === 'f3') ? f3(i, j) : f4(i, j)))));
      colors.push(color, color, color);
    }
  }
}

const makeTriangulation = () => {
  let index = 0;
  let iteration = 0;
  for (let i = min; i < max; i += step) {
    for (let j = min; j < max; j += step) {
      if (iteration !== 0 && iteration % verticesLength === 0) {
        index++
      }
      indices.push(index, index + 1, index + verticesLength)
      index++
      indices.push(index, index + verticesLength - 1, index + verticesLength)
      iteration++
    }
  }
}


const createProjectionMatrix4 = (angle, a, zNear, zFar) => {
  let xx = angle * a * 2;
  let yy = 0.5 * a / angle;
  let zz = -(zFar + zNear) / (zFar - zNear);
  let wz = -2 * zFar * zNear / (zFar - zNear);
  return [xx, 0, 0, 0
    , 0, yy, 0, 0,
    0, 0, zz, -1,
    0, 0, wz, 0];
}

let projectionMatrix = createProjectionMatrix4(0.4, canvas.width / canvas.height, 1, 100);

let identityMatrix4 = [1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1];
let rotationMatrix4 = [1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1];

rotationMatrix4[14] = rotationMatrix4[14] - 3;//zoom


const scalarProduct4 = (v, w) => {
  return v[0] * w[0] + v[1] * w[1] + v[2] * w[2] + v[3] * w[3];
};

const matrix4Column = (m, c) => {
  return [m[0][c], m[1][c], m[2][c], m[3][c]];
};

const matrix4Product = (m1, m2) => {
  let sp = scalarProduct4;
  let col = matrix4Column;
  return [
    sp(m1[0], col(m2, 0)), sp(m1[0], col(m2, 1)), sp(m1[0], col(m2, 2)), sp(m1[0], col(m2, 3)),
    sp(m1[1], col(m2, 0)), sp(m1[1], col(m2, 1)), sp(m1[1], col(m2, 2)), sp(m1[1], col(m2, 3)),
    sp(m1[2], col(m2, 0)), sp(m1[2], col(m2, 1)), sp(m1[2], col(m2, 2)), sp(m1[1], col(m2, 3)),
    sp(m1[3], col(m2, 0)), sp(m1[3], col(m2, 1)), sp(m1[3], col(m2, 2)), sp(m1[3], col(m2, 3))
  ];
};

const matrix4RotatedX = (m, alpha) => {
  let c = Math.cos(alpha);
  let s = Math.sin(alpha);
  let rot = [[c, 0, -s, 0],
    [0, 1, 0, 0],
    [s, 0, c, 0],
    [0, 0, 0, 1]
  ];
  let matrix = makeMatrix(m)

  return matrix4Product(rot, matrix);
};

const makeMatrix = (m) => {
  return [[m[0], m[1], m[2], m[3]], [m[4], m[5], m[6], m[7]], [m[8], m[9], m[10], m[11]], [m[12], m[13], m[14], m[15]]]
}


const matrix4RotatedY = (m, alpha) => {
  let c = Math.cos(alpha);
  let s = Math.sin(alpha);
  let rot = [[1, 0, 0, 0],
    [0, c, -s, 0],
    [0, s, c, 0],
    [0, 0, 0, 1]
  ];
  let matrix = makeMatrix(m)
  return matrix4Product(rot, matrix);
};


let type = 'points';

const draw = () => {
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
  gl.clearDepth(1.0);

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
  gl.uniformMatrix4fv(rotationLocation, false, rotationMatrix4);
  gl.uniformMatrix4fv(identityLocation, false, identityMatrix4);
  switch (type) {
    case 'triangles':
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    case 'points':
      gl.drawArrays(gl.POINTS, 0, vertices.length / 3);
  }
}

const onKeyDown = (e) => {
  let code = e.which || e.keyCode;
  let alpha = Math.PI / 60;
  switch (code) {
    case 38: // up
      rotationMatrix4 = matrix4RotatedY(rotationMatrix4, alpha);
      draw()
      break;
    case 40: // down
      rotationMatrix4 = matrix4RotatedY(rotationMatrix4, -alpha);
      draw()
      break;
    case 37: // left
      rotationMatrix4 = matrix4RotatedX(rotationMatrix4, -alpha);
      draw()
      break;
    case 39:// right
      rotationMatrix4 = matrix4RotatedX(rotationMatrix4, alpha);
      draw()
      break;
    case 80: // P
      type = 'points';
      draw();
      break;
    case 84: // T
      type = 'triangles';
      draw();
      break;
    case 49: // 1
      webGlStart('f1');
      break;
    case 50: // 2
      webGlStart('f2');
      break;
    case 51: // 3
      webGlStart('f3');
      break;
    case 52: // 4
      webGlStart('f4');
      break;
    case 82: // R
      identityMatrix4 = [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
      rotationMatrix4 = [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];

      rotationMatrix4[14] = -3;//zoom
      draw();
      break;
  }
}

const onWheel = (e) => {
  rotationMatrix4[14] += e.wheelDeltaY / 300;
  draw();
}

const click = () => {

  window.onwheel = onWheel;
}

