/*
Student Name: Anh Le
Student UCSC email: mle288@ucsc.edu

Notes to Grader:
N/A
*/

// HelloPint2.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size; 
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  //   gl = getWebGLContext(canvas);
  //   console.log(gl);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  //   console.log(gl);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  // Get the storage location of Size
  u_Size = gl.getUniformLocation(gl.program, "u_Size");
  if (!u_Size) {
    console.log("Failed to get the storage location of u_Size");
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals varibale realted to UI elements
let g_selectedColor = [0.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5.0;
let g_seletectedType = POINT;
let numSegments = 3;

function addActionForHTML() {
  // Get red color value
  document.getElementById("redSlider").addEventListener("input", (event) => {
    g_selectedColor[0] = event.target.value / 255;
  });
  // Get green color value
  document.getElementById("greenSlider").addEventListener("input", (event) => {
    g_selectedColor[1] = event.target.value / 255;
  });
  // Get blue color value
  document.getElementById("blueSlider").addEventListener("input", (event) => {
    g_selectedColor[2] = event.target.value / 255;
  });

  // Get Size;
  document.getElementById("sizeSlider").addEventListener("input", (event) => {
    g_selectedSize = event.target.value;
  });

  //clear Button event
  document.getElementById("clearButton").addEventListener("click", () => {
    shapeList = [];
    renderAllShapes();
  });

  // Get Shape
  // Get Point Shape
  document.getElementById("pointDrawButton").addEventListener("click", () => {
    g_seletectedType = POINT;
    console.log(g_seletectedType);
  });
  // Get Triangle Shape
  document
    .getElementById("TriangleDrawButton")
    .addEventListener("click", () => {
      g_seletectedType = TRIANGLE;
    });
  // Get Circle Shape
  document.getElementById("circleDrawButton").addEventListener("click", () => {
    g_seletectedType = CIRCLE;
    console.log(g_seletectedType);
  });
  document
    .getElementById("segmentSlider")
    .addEventListener("input", (event) => {
      numSegments = parseInt(event.target.value);
    });

  // Drawing picture
  document.getElementById("drawPicture").addEventListener("click", drawPicture);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // Add action for HTMl
  addActionForHTML();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = (event) => {
    if (event.buttons === 1) {
      click(event);
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //   // Draw
  //   gl.drawArrays(gl.POINTS, 0, 1);
  //   drawTriangle([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
}

// var g_points = []; // The array for the position of a mouse press
// var g_colors = []; // The array to store the color of a point
// var g_sizes = []; // The array to store the size of a point

var shapeList = [];

function click(ev) {
  [x, y] = convertCoordinateEventToGl(ev);
  // Store the coordinates to g_points array
  //   g_points.push([x, y]);
  //   g_colors.push();
  //   g_sizes.push(g_selectedSize.slice());
  if (g_seletectedType === POINT) {
    point = new Point();
  } else if (g_seletectedType === TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segment = numSegments;
  }
  point.color = g_selectedColor.slice();
  point.position = [x, y];
  point.size = g_selectedSize;
  shapeList.push(point);

  // Store the coordinates to g_points array
  //   if (x >= 0.0 && y >= 0.0) {
  //     // First quadrant
  //     g_colors.push([1.0, 0.0, 0.0, 1.0]); // Red
  //   } else if (x < 0.0 && y < 0.0) {
  //     // Third quadrant
  //     g_colors.push([0.0, 1.0, 0.0, 1.0]); // Green
  //   } else {
  //     // Others
  //     g_colors.push([1.0, 1.0, 1.0, 1.0]); // White
  //   }

  renderAllShapes();
}

function convertCoordinateEventToGl(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  return [x, y];
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  var len = shapeList.length;
  for (var i = 0; i < len; i++) {
    shapeList[i].render();
  }
}

function drawPicture() {
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  const i = Array.from({ length: 13 }, (_, i) => i * (0.9 / 12));

  // Brown Color
  let brown = new Triangle();
  brown.color = [0.5647, 0.3569, 0.1843, 1.0];
  brown.renderSpecific([i[3], i[5], i[5], i[7], i[6], i[3]]);
  brown.renderSpecific([i[3], i[5], i[5], i[2], i[6], i[3]]);
  brown.renderSpecific([i[5], i[2], i[6], i[3], i[6], i[1]]);
  brown.renderSpecific([i[5], i[2], i[6], i[1], i[2], -i[2]]);
  // Mirror
  brown.renderSpecific([-i[3], i[5], -i[5], i[7], -i[6], i[3]]);
  brown.renderSpecific([-i[3], i[5], -i[5], i[2], -i[6], i[3]]);
  brown.renderSpecific([-i[5], i[2], -i[6], i[3], -i[6], i[1]]);
  brown.renderSpecific([-i[5], i[2], -i[6], i[1], -i[2], -i[2]]);

  // Red Color
  let red = new Triangle();
  red.color = [0.5765, 0.2745, 0.3059, 1.0];
  red.renderSpecific([i[0], i[1], i[5], i[10], i[6], i[8]]);
  red.renderSpecific([i[5], i[10], i[6], i[8], i[7], i[7]]);
  red.renderSpecific([i[5], i[7], i[6], i[8], i[6], i[3]]);
  red.renderSpecific([i[6], i[8], i[7], i[7], i[6], i[3]]);
  red.renderSpecific([-i[0], i[1], -i[5], i[10], -i[6], i[8]]);
  red.renderSpecific([-i[5], i[10], -i[6], i[8], -i[7], i[7]]);
  red.renderSpecific([-i[5], i[7], -i[6], i[8], -i[6], i[3]]);
  red.renderSpecific([-i[6], i[8], -i[7], i[7], -i[6], i[3]]);

  // Gold color
  let gold = new Triangle();
  gold.color = [227 / 255, 188 / 255, 87 / 255, 255 / 255];
  gold.renderSpecific([i[0], i[1], i[2], i[12], i[5], i[10]]);
  gold.color = [0.9373, 0.8078, 0.4275, 1.0];
  gold.renderSpecific([i[0], i[1], i[2], i[12], i[0], i[12]]);
  gold.renderSpecific([i[0], -i[1], i[0], -i[3], i[2], -i[2]]);
  gold.renderSpecific([i[0], -i[1], i[1], i[0], i[2], -i[2]]);
  gold.renderSpecific([i[0], -i[1], i[1], i[0], i[2], -i[2]]);
  gold.renderSpecific([i[1], i[0], i[4], i[1], i[2], -i[2]]);
  gold.renderSpecific([i[1], i[0], i[3], i[2], i[4], i[1]]);
  gold.renderSpecific([i[1], i[0], i[0], i[1], i[3], i[2]]);
  //mirror

  gold.color = [227 / 255, 188 / 255, 87 / 255, 255 / 255];
  gold.renderSpecific([-i[0], i[1], -i[2], i[12], -i[5], i[10]]);
  gold.color = [0.9373, 0.8078, 0.4275, 1.0];
  gold.renderSpecific([-i[0], i[1], -i[2], i[12], -i[0], i[12]]);
  gold.renderSpecific([-i[0], -i[1], -i[0], -i[3], -i[2], -i[2]]);
  gold.renderSpecific([-i[0], -i[1], -i[1], i[0], -i[2], -i[2]]);
  gold.renderSpecific([-i[0], -i[1], -i[1], i[0], -i[2], -i[2]]);
  gold.renderSpecific([-i[1], i[0], -i[4], i[1], -i[2], -i[2]]);
  gold.renderSpecific([-i[1], i[0], -i[3], i[2], -i[4], i[1]]);
  gold.renderSpecific([-i[1], i[0], -i[0], i[1], -i[3], i[2]]);

  let skin = new Triangle();
  skin.color = [165 / 255, 129 / 255, 133 / 255, 1.0];
  skin.renderSpecific([i[0], i[1], i[0], -i[1], i[1], i[0]]);
  skin.renderSpecific([-i[0], i[1], -i[0], -i[1], -i[1], i[0]]);

  let white = new Triangle();
  white.color = [1.0, 1.0, 1.0, 1.0];
  white.renderSpecific([i[3], i[5], i[3], i[2], i[0], i[1]]);
  white.renderSpecific([-i[3], i[5], -i[3], i[2], -i[0], i[1]]);
}
