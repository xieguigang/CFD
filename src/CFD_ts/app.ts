///<reference path="barrier.ts" />

import { barrierList } from "./barrier";
import { CFD } from './CFD';
import { mobile, rgbToHex } from './global';
import { graphics } from "./graphics";
import { ui } from "./ui";

// Global variables:	
const html: ui = new ui();

var sizeSelect: HTMLSelectElement = <any>document.getElementById('sizeSelect');
sizeSelect.selectedIndex = 5;
if (mobile) sizeSelect.selectedIndex = 1;		// smaller works better on mobile platforms
var pxPerSquare = Number(sizeSelect.options[sizeSelect.selectedIndex].value);
// width of plotted grid site in pixels
var xdim = html.canvas.width / pxPerSquare;			// grid dimensions for simulation
var ydim = html.canvas.height / pxPerSquare;

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

var CFD_app = new CFD(xdim, ydim);
var gr = new graphics(html.canvas);













document.getElementById("debugButton").onclick = debug;
document.getElementById("barrierDataButton").onclick = showBarrierLocations;

startButton.onclick = startStop;