let html = null;
let gl = null;


/* shaders */
let vertexShader = null;
let fragmentShader = null;
/* shader program */
let shaderProgram = null;

/* vertex attributes locations */
let position = null;

/* uniform variables locations */
let projection = null;
let view = null;
let skybox = null;

let texturesSOURCES = []


/* input vertices of cube triangles */
let xPlusFloat32Array = new Float32Array([
  +1, +1, +1,
  +1, -1, +1,
  +1, -1, -1,
  +1, +1, -1,
]);
let xMinusFloat32Array = new Float32Array([
  -1, +1, -1,
  -1, -1, -1,
  -1, -1, +1,
  -1, +1, +1,
]);

let yPlusFloat32Array = new Float32Array([
  -1, 1, -1,
  -1, 1, +1,
  +1, 1, +1,
  +1, 1, -1,
]);
let yMinusFloat32Array = new Float32Array([
  -1, -1, +1,
  -1, -1, -1,
  +1, -1, -1,
  +1, -1, +1,
]);

let zPlusFloat32Array = new Float32Array([
  -1, +1, 1,
  -1, -1, 1,
  +1, -1, 1,
  +1, +1, 1,
]);
let zMinusFloat32Array = new Float32Array([
  +1, +1, -1,
  +1, -1, -1,
  -1, -1, -1,
  -1, +1, -1,
]);

let texCoordsFloat32Array = new Float32Array([
  0, 0,
  0, 1,
  1, 1,
  1, 0,
]);


var arrayBuffer = null;

/* texture parameters */
// var textureId=null;
// var textureUnit=0; // default

const vertexShaderSource = "" +
  "attribute vec3 aPosition;\n" +
  "attribute vec2 aTexCoords;\n" +
  "varying vec2 TexCoords;\n" +
  "uniform mat4 projection;\n" +
  "uniform mat4 rotation;\n" +
  "uniform vec3 move;\n" +
  "void main()\n" +
  "{\n" +
  "    vec4 pos = rotation * vec4(aPosition, 1.0) + vec4(move, 0.0);\n" +
  "    gl_Position =  projection * pos;\n" +
  "    TexCoords = aTexCoords;\n" +
  "}\n";

const fragmentShaderSource = "" +
  "precision mediump float;\n" +
  "varying vec2 TexCoords;\n" +
  "uniform sampler2D tex2D;\n" +
  "void main()\n" +
  "{\n" +
  "    gl_FragColor = texture2D(tex2D, TexCoords);\n" +
  "}\n";

const makeShaderProgram = (gl) => {
  /* Parameters:
     gl - WebGL context
  */

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

  /* set vertex attributes locations */
  aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
  aTexCoordsLocation = gl.getAttribLocation(shaderProgram, "aTexCoords");

  /* set uniform variables locations */
  projectionLocation = gl.getUniformLocation(shaderProgram, "projection");
  rotationLocation = gl.getUniformLocation(shaderProgram, "rotation");
  moveLocation = gl.getUniformLocation(shaderProgram, "move");
  tex2DLocation = gl.getUniformLocation(shaderProgram, "tex2D");

  /* load  data buffers */
  zMinusArrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, zMinusArrayBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, zMinusFloat32Array, gl.STATIC_DRAW);

  zPlusArrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, zPlusArrayBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, zPlusFloat32Array, gl.STATIC_DRAW);

  xMinusArrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, xMinusArrayBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, xMinusFloat32Array, gl.STATIC_DRAW);

  xPlusArrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, xPlusArrayBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, xPlusFloat32Array, gl.STATIC_DRAW);

  yMinusArrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, yMinusArrayBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, yMinusFloat32Array, gl.STATIC_DRAW);

  yPlusArrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, yPlusArrayBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, yPlusFloat32Array, gl.STATIC_DRAW);

  texCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoordsFloat32Array, gl.STATIC_DRAW);

  // SUCCESS
  return shaderProgram;
};

const drawBufferFace = (gl, rotation, move, projection, buffer, textureId, textureUnit) => {
  /* Parameters:
     gl - WebGL context
     view, projection - gl matrices 4x4 (column major)
     textureUnit - integer from [0 ... gl.MAX_TEXTURE_IMAGE_UNITS]
  */
  gl.depthFunc(gl.LESS);

  gl.useProgram(shaderProgram);

  gl.uniformMatrix4fv(rotationLocation, false, rotation);
  gl.uniform3fv(moveLocation, move);
  gl.uniformMatrix4fv(projectionLocation, false, projection);

  gl.enableVertexAttribArray(aPositionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(aTexCoordsLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
  gl.vertexAttribPointer(aTexCoordsLocation, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.uniform1i(tex2DLocation, textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, textureId);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

const createTexture2D = (gl, type, textureURL) => {
  /* parameters:
     gl -  WebGL contex
     textureUnit - texture unit to which the texture should be bound
  */
  const textureId = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureId);

  const pixel = new Uint8Array([0, 0, 255, 255]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
    1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    pixel);

  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, textureId);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
      gl.RGBA, gl.UNSIGNED_BYTE, image);

    switch (type) {
      case "linear":
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        break;
      case "mipmap":
        gl.generateMipmap(gl.TEXTURE_2D);
        break;
      case "nearest":
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        break;
    }
    redraw();
  };
  image.crossOrigin = "";
  image.src = textureURL;

  return textureId;
}


let cubeFace; // array of cube face direction constants
let skyboxXYZ; // array of argument mappings for skybox functions


/**  Model-view and projection  matrices **/

const PROJECTION_Z_NEAR = 0.25;
const PROJECTION_Z_FAR = 300;
const PROJECTION_ZOOM_Y = 4.0;


const identityMatrix4 = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];


let rotationMatrix4 = identityMatrix4;

let moveVector = [0, 0, 10];


const createProjectionMatrix4 = (gl, zNear, zFar, zoomY) => {
  /* arguments:
     gl - GL context
     zNear, zFar, zoomY - Y-frustum parameters

     returns: 4x4 row-major order perspective matrix
  */
  let xx = zoomY * gl.viewportHeight / gl.viewportWidth;
  let yy = zoomY;
  let zz = (zFar + zNear) / (zFar - zNear);
  let zw = 1;
  let wz = -2 * zFar * zNear / (zFar - zNear);
  return [
    [xx, 0, 0, 0],
    [0, yy, 0, 0],
    [0, 0, zz, wz],
    [0, 0, zw, 0]
  ];
}


const glVector3 = (x, y, z) => {
  return new Float32Array(x, y, z);
};


const glMatrix4 = (xx, yx, zx, wx,
                   xy, yy, zy, wy,
                   xz, yz, zz, wz,
                   xw, yw, zw, ww) => {
  // sequence of concatenated columns
  return new Float32Array([xx, xy, xz, xw,
    yx, yy, yz, yw,
    zx, zy, zz, zw,
    wx, wy, wz, ww]);
};

const glMatrix4FromMatrix = (m) =>{
  /* arguments:
     m - the 4x4 array with the matrix in row-major order

     returns: sequence of elements in column-major order in Float32Array for GL
  */
  return glMatrix4(
    m[0][0], m[0][1], m[0][2], m[0][3],
    m[1][0], m[1][1], m[1][2], m[1][3],
    m[2][0], m[2][1], m[2][2], m[2][3],
    m[3][0], m[3][1], m[3][2], m[3][3]
  );
};


const scalarProduct4 =  (v, w) => {
  return v[0] * w[0] + v[1] * w[1] + v[2] * w[2] + v[3] * w[3];
};

const matrix4Column =  (m, c) => {
  return [m[0][c], m[1][c], m[2][c], m[3][c]];
};

const matrix4Product = (m1, m2) => {
  let sp = scalarProduct4;
  let col = matrix4Column;
  return [
    [sp(m1[0], col(m2, 0)), sp(m1[0], col(m2, 1)), sp(m1[0], col(m2, 2)), sp(m1[0], col(m2, 3))],
    [sp(m1[1], col(m2, 0)), sp(m1[1], col(m2, 1)), sp(m1[1], col(m2, 2)), sp(m1[1], col(m2, 3))],
    [sp(m1[2], col(m2, 0)), sp(m1[2], col(m2, 1)), sp(m1[2], col(m2, 2)), sp(m1[1], col(m2, 3))],
    [sp(m1[3], col(m2, 0)), sp(m1[3], col(m2, 1)), sp(m1[3], col(m2, 2)), sp(m1[3], col(m2, 3))]
  ];
};

const matrix4RotatedXZ = (matrix, alpha) => {
  let c = Math.cos(alpha);
  let s = Math.sin(alpha);
  let rot = [[c, 0, -s, 0],
    [0, 1, 0, 0],
    [s, 0, c, 0],
    [0, 0, 0, 1]
  ];

  return matrix4Product(rot, matrix);
};

const matrix4RotatedYZ = (matrix, alpha)  => {
  let c = Math.cos(alpha);
  let s = Math.sin(alpha);
  let rot = [[1, 0, 0, 0],
    [0, c, -s, 0],
    [0, s, c, 0],
    [0, 0, 0, 1]
  ];

  return matrix4Product(rot, matrix);
};


/* redraw variables */

let boxFaceTextures = [];

const redraw = () => {
  let projectionMatrix = glMatrix4FromMatrix(createProjectionMatrix4(gl,
    PROJECTION_Z_NEAR,
    PROJECTION_Z_FAR,
    PROJECTION_ZOOM_Y)
  );
  let rotationMatrix = glMatrix4FromMatrix(rotationMatrix4); //tmp

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
    xPlusArrayBuffer, boxFaceTextures[0], 1)
  drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
    xMinusArrayBuffer, boxFaceTextures[1], 2)

  drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
    yPlusArrayBuffer, boxFaceTextures[2], 3)
  drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
    yMinusArrayBuffer, boxFaceTextures[3], 4)

  drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
    zPlusArrayBuffer, boxFaceTextures[4], 5)
  drawBufferFace(gl, rotationMatrix, moveVector, projectionMatrix,
    zMinusArrayBuffer, boxFaceTextures[5], 6)

  sbx_drawSkybox(gl,
    rotationMatrix,
    projectionMatrix
  );
}

onWindowResize = () => {
  let wth = parseInt(window.innerWidth) - 10;
  let hth = parseInt(window.innerHeight) - 10;
  canvasGL.setAttribute("width", '' + wth);
  canvasGL.setAttribute("height", '' + hth);
  gl.viewportWidth = wth;
  gl.viewportHeight = hth;
  gl.viewport(0, 0, wth, hth);
  redraw();
};


const setTextureOption = (type) => {
  boxFaceTextures = [];
  for (let i = 0; i < 6; i++) {
    boxFaceTextures.push(createTexture2D(gl, type, texturesSOURCES[i]));
  }
  redraw();
}

const onKeyDown = (e) =>{
  // var code=e.keyCode? e.keyCode : e.charCode;
  let code = e.which || e.keyCode;
  let alpha = Math.PI / 32;
  switch (code) {
    case 38: // up
      // case 73: // I
      rotationMatrix4 = matrix4RotatedYZ(rotationMatrix4, alpha);
      break;
    case 40: // down
      // case 75: // K
      rotationMatrix4 = matrix4RotatedYZ(rotationMatrix4, -alpha);
      break;
    case 37: // left
      // case 74:// J
      rotationMatrix4 = matrix4RotatedXZ(rotationMatrix4, -alpha);
      break;
    case 39:// right
      // case 76: // L
      rotationMatrix4 = matrix4RotatedXZ(rotationMatrix4, alpha);
      break;
    case 70: // F
      moveVector[2]++;
      break;
    // case 66: // B
    case 86: // V
      moveVector[2]--;
      break;
    case 32: // space
      rotationMatrix4 = identityMatrix4;
      break;

    case 77: // M
      setTextureOption("mipmap");
      console.log("MipMap Option");
      break;
    /*
    case 82: // R
    case 81: // Q
    case 69: // E
    case 191: //
     #*/
    case 68: // D
      setTextureOption("nearest");
      console.log("Nearest Option");
      break;
    /*
    case 13: // enter
    case 187: // +
    case 27: // escape
    case 189: // -
    case 86: // V
    case 46: // Delete
    case 51: //
    case 83: // S
   #*/
    case 65: // A
      setTextureOption("linear");
      console.log("Linear Option");
      break;
    /*case 56: // *
    case 88: // X
    case 74: // J
    break;
  */
  }
  redraw();
}


window.onload = () =>{
  html = {};
  html.canvasGL = document.querySelector('#canvasGL');
  html.canvasTex = document.querySelector('#canvasTex');
  gl = canvasGL.getContext("webgl");


  cubeFace = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ];

  skyboxXYZ = [
    sbx_xyzXPlus, sbx_xyzXMinus,
    sbx_xyzYPlus, sbx_xyzYMinus,
    sbx_xyzZPlus, sbx_xyzZMinus
  ];


  boxFaceTextures = [];
  texturesSOURCES = ["texture1a.png", "texture1b.png", "texture1c.png", "texture1d.png", "texture1e.png", "texture1f.png"]

  makeShaderProgram(gl);
  sbx_makeShaderProgram(gl);

  let fun = sbx_fun;
  let r = Math.floor(Math.random() * fun.length);
  let g = Math.floor(Math.random() * fun.length);
  let b = Math.floor(Math.random() * fun.length);
  for (let skyboxStep = 0; skyboxStep < 6; skyboxStep++) {
    sbx_fillCanvasUpsideDown(canvasTex, sbx_createFunctionRGB(fun[r], fun[g], fun[b], skyboxXYZ[skyboxStep]));
    sbx_loadCubeFaceFromCanvas(gl, canvasTex, cubeFace[skyboxStep]);
    boxFaceTextures.push(createTexture2D(gl, "linear", texturesSOURCES[skyboxStep]));
    //loadTexture2DFromCanvas(gl, canvasTex, boxFaceTextures[boxFaceTextures.length-1]);
  }

  console.log("Simple  instruction: ")
  console.log("M - mipmap Option\nA - Linear Option\nD - Nearest Option\narrow right - move right\n" +
    "arrow down - move down\narrow left - move left\narrow up - move up\nV - zoom+\nF - zoom-\nspace - start position")

  onWindowResize();
  window.onresize = onWindowResize;
  window.onkeydown = onKeyDown;
}

