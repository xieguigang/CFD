///<reference path="barrier.ts" />

import { barrierList } from "./barrier";
import { CFD } from './CFD';
import { mobile, rgbToHex } from './global';
import { graphics } from "./graphics";

// Global variables:	
const canvas: HTMLCanvasElement = <any>document.getElementById('theCanvas');
const context: CanvasRenderingContext2D = <any>canvas.getContext('2d');
const image = context.createImageData(canvas.width, canvas.height);		// for direct pixel manipulation (faster than fillRect)
for (var i = 3; i < image.data.length; i += 4) image.data[i] = 255;			// set all alpha values to opaque
var sizeSelect: HTMLSelectElement = <any>document.getElementById('sizeSelect');
sizeSelect.selectedIndex = 5;
if (mobile) sizeSelect.selectedIndex = 1;		// smaller works better on mobile platforms
var pxPerSquare = Number(sizeSelect.options[sizeSelect.selectedIndex].value);
// width of plotted grid site in pixels
var xdim = canvas.width / pxPerSquare;			// grid dimensions for simulation
var ydim = canvas.height / pxPerSquare;
var stepsSlider: HTMLInputElement = <any>document.getElementById('stepsSlider');
var startButton: HTMLInputElement = <any>document.getElementById('startButton');
var speedSlider: HTMLInputElement = <any>document.getElementById('speedSlider');
var speedValue: HTMLInputElement = <any>document.getElementById('speedValue');
var viscSlider: HTMLInputElement = <any>document.getElementById('viscSlider');
var viscValue: HTMLInputElement = <any>document.getElementById('viscValue');
var mouseSelect: HTMLSelectElement = <any>document.getElementById('mouseSelect');
var barrierSelect: HTMLSelectElement = <any>document.getElementById('barrierSelect');

for (var barrierIndex = 0; barrierIndex < barrierList.length; barrierIndex++) {
    var shape = document.createElement("option");
    shape.text = barrierList[barrierIndex].name;
    barrierSelect.add(shape, null);
}
var plotSelect: HTMLSelectElement = <any>document.getElementById('plotSelect');
var contrastSlider: HTMLInputElement = <any>document.getElementById('contrastSlider');
//var pixelCheck = document.getElementById('pixelCheck');
var tracerCheck: HTMLInputElement = <any>document.getElementById('tracerCheck');
var flowlineCheck: HTMLInputElement = <any>document.getElementById('flowlineCheck');
var forceCheck: HTMLInputElement = <any>document.getElementById('forceCheck');
var sensorCheck: HTMLInputElement = <any>document.getElementById('sensorCheck');
var dataCheck: HTMLInputElement = <any>document.getElementById('dataCheck');
var rafCheck: HTMLInputElement = <any>document.getElementById('rafCheck');
var speedReadout: HTMLElement = <any>document.getElementById('speedReadout');
var dataSection: HTMLElement = <any>document.getElementById('dataSection');
var dataArea: HTMLElement = <any>document.getElementById('dataArea');
var dataButton: HTMLInputElement = <any>document.getElementById('dataButton');
var running = false;						// will be true when running
var stepCount = 0;
var startTime = 0;
var four9ths = 4.0 / 9.0;					// abbreviations
var one9th = 1.0 / 9.0;
var one36th = 1.0 / 36.0;
var barrierCount = 0;
var barrierxSum = 0;
var barrierySum = 0;
var barrierFx = 0.0;						// total force on all barrier sites
var barrierFy = 0.0;
var sensorX = xdim / 2;						// coordinates of "sensor" to measure local fluid properties	
var sensorY = ydim / 2;
var draggingSensor = false;
var mouseIsDown = false;
var mouseX, mouseY;							// mouse location in canvas coordinates
var oldMouseX = -1, oldMouseY = -1;			// mouse coordinates from previous simulation frame
var collectingData = false;
var time = 0;								// time (in simulation step units) since data collection started
var showingPeriod = false;
var lastBarrierFy = 1;						// for determining when F_y oscillation begins
var lastFyOscTime = 0;						// for calculating F_y oscillation period

canvas.addEventListener('mousedown', mouseDown, false);
canvas.addEventListener('mousemove', mouseMove, false);
document.body.addEventListener('mouseup', mouseUp, false);	// button release could occur outside canvas
canvas.addEventListener('touchstart', mouseDown, false);
canvas.addEventListener('touchmove', mouseMove, false);
document.body.addEventListener('touchend', mouseUp, false);

var CFD_app = new CFD(xdim, ydim);
var gr = new graphics(canvas);













document.getElementById("debugButton").onclick = debug;
document.getElementById("barrierDataButton").onclick = showBarrierLocations;

startButton.onclick = startStop;