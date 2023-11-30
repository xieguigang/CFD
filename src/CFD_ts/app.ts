///<reference path="barrier.ts" />

import { barrierList } from "./barrier";
import { CFD } from './CFD';
import { mobile, rgbToHex } from './global';

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





// Set the fluid variables at the boundaries, according to the current slider value:
function setBoundaries() {
    var u0 = Number(speedSlider.value);
    for (var x = 0; x < xdim; x++) {
        setEquil(x, 0, u0, 0, 1);
        setEquil(x, ydim - 1, u0, 0, 1);
    }
    for (var y = 1; y < ydim - 1; y++) {
        setEquil(0, y, u0, 0, 1);
        setEquil(xdim - 1, y, u0, 0, 1);
    }
}





// Move the tracer particles:
function moveTracers() {
    for (var t = 0; t < nTracers; t++) {
        var roundedX = Math.round(tracerX[t]);
        var roundedY = Math.round(tracerY[t]);
        var index = roundedX + roundedY * xdim;
        tracerX[t] += ux[index];
        tracerY[t] += uy[index];
        if (tracerX[t] > xdim - 1) {
            tracerX[t] = 0;
            tracerY[t] = Math.random() * ydim;
        }
    }
}

// "Drag" the fluid in a direction determined by the mouse (or touch) motion:
// (The drag affects a "circle", 5 px in diameter, centered on the given coordinates.)
function push(pushX, pushY, pushUX, pushUY) {
    // First make sure we're not too close to edge:
    var margin = 3;
    if ((pushX > margin) && (pushX < xdim - 1 - margin) && (pushY > margin) && (pushY < ydim - 1 - margin)) {
        for (var dx = -1; dx <= 1; dx++) {
            setEquil(pushX + dx, pushY + 2, pushUX, pushUY);
            setEquil(pushX + dx, pushY - 2, pushUX, pushUY);
        }
        for (var dx = -2; dx <= 2; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                setEquil(pushX + dx, pushY + dy, pushUX, pushUY);
            }
        }
    }
}

// Set all densities in a cell to their equilibrium values for a given velocity and density:
// (If density is omitted, it's left unchanged.)
function setEquil(x: number, y: number, newux: number, newuy: number, newrho?: number) {
    var i = x + y * xdim;
    if (typeof newrho == 'undefined') {
        newrho = rho[i];
    }
    var ux3 = 3 * newux;
    var uy3 = 3 * newuy;
    var ux2 = newux * newux;
    var uy2 = newuy * newuy;
    var uxuy2 = 2 * newux * newuy;
    var u2 = ux2 + uy2;
    var u215 = 1.5 * u2;
    n0[i] = four9ths * newrho * (1 - u215);
    nE[i] = one9th * newrho * (1 + ux3 + 4.5 * ux2 - u215);
    nW[i] = one9th * newrho * (1 - ux3 + 4.5 * ux2 - u215);
    nN[i] = one9th * newrho * (1 + uy3 + 4.5 * uy2 - u215);
    nS[i] = one9th * newrho * (1 - uy3 + 4.5 * uy2 - u215);
    nNE[i] = one36th * newrho * (1 + ux3 + uy3 + 4.5 * (u2 + uxuy2) - u215);
    nSE[i] = one36th * newrho * (1 + ux3 - uy3 + 4.5 * (u2 - uxuy2) - u215);
    nNW[i] = one36th * newrho * (1 - ux3 + uy3 + 4.5 * (u2 - uxuy2) - u215);
    nSW[i] = one36th * newrho * (1 - ux3 - uy3 + 4.5 * (u2 + uxuy2) - u215);
    rho[i] = newrho;
    ux[i] = newux;
    uy[i] = newuy;
}










// Functions to handle mouse/touch interaction:
function mouseDown(e) {
    if (sensorCheck.checked) {
        var canvasLoc = pageToCanvas(e.pageX, e.pageY);
        var gridLoc = canvasToGrid(canvasLoc.x, canvasLoc.y);
        var dx = (gridLoc.x - sensorX) * pxPerSquare;
        var dy = (gridLoc.y - sensorY) * pxPerSquare;
        if (Math.sqrt(dx * dx + dy * dy) <= 8) {
            draggingSensor = true;
        }
    }
    mousePressDrag(e);
};
function mouseMove(e) {
    if (mouseIsDown) {
        mousePressDrag(e);
    }
};
function mouseUp(e) {
    mouseIsDown = false;
    draggingSensor = false;
};

// Handle mouse press or drag:
function mousePressDrag(e) {
    e.preventDefault();
    mouseIsDown = true;
    var canvasLoc = pageToCanvas(e.pageX, e.pageY);
    if (draggingSensor) {
        var gridLoc = canvasToGrid(canvasLoc.x, canvasLoc.y);
        sensorX = gridLoc.x;
        sensorY = gridLoc.y;
        paintCanvas();
        return;
    }
    if (mouseSelect.selectedIndex == 2) {
        mouseX = canvasLoc.x;
        mouseY = canvasLoc.y;
        return;
    }
    var gridLoc = canvasToGrid(canvasLoc.x, canvasLoc.y);
    if (mouseSelect.selectedIndex == 0) {
        addBarrier(gridLoc.x, gridLoc.y);
        paintCanvas();
    } else {
        removeBarrier(gridLoc.x, gridLoc.y);
    }
}

// Convert page coordinates to canvas coordinates:
function pageToCanvas(pageX, pageY) {
    var canvasX = pageX - canvas.offsetLeft;
    var canvasY = pageY - canvas.offsetTop;
    // this simple subtraction may not work when the canvas is nested in other elements
    return { x: canvasX, y: canvasY };
}

// Convert canvas coordinates to grid coordinates:
function canvasToGrid(canvasX, canvasY) {
    var gridX = Math.floor(canvasX / pxPerSquare);
    var gridY = Math.floor((canvas.height - 1 - canvasY) / pxPerSquare); 	// off by 1?
    return { x: gridX, y: gridY };
}

// Add a barrier at a given grid coordinate location:
function addBarrier(x, y) {
    if ((x > 1) && (x < xdim - 2) && (y > 1) && (y < ydim - 2)) {
        barrier[x + y * xdim] = true;
    }
}

// Remove a barrier at a given grid coordinate location:
function removeBarrier(x, y) {
    if (barrier[x + y * xdim]) {
        barrier[x + y * xdim] = false;
        paintCanvas();
    }
}

// Clear all barriers:
function clearBarriers() {
    for (var x = 0; x < xdim; x++) {
        for (var y = 0; y < ydim; y++) {
            barrier[x + y * xdim] = false;
        }
    }
    paintCanvas();
}




// Function to start or pause the simulation:
function startStop() {
    running = !running;
    if (running) {
        startButton.value = "Pause";
        resetTimer();
        CFD_app.simulate();
    } else {
        startButton.value = " Run ";
    }
}

// Reset the timer that handles performance evaluation:
function resetTimer() {
    stepCount = 0;
    startTime = (new Date()).getTime();
}

// Show value of flow speed setting:
function adjustSpeed() {
    speedValue.innerHTML = Number(speedSlider.value).toFixed(3);
}

// Show value of viscosity:
function adjustViscosity() {
    viscValue.innerHTML = Number(viscSlider.value).toFixed(3);
}

// Show or hide the data area:
function showData() {
    if (dataCheck.checked) {
        dataSection.style.display = "block";
    } else {
        dataSection.style.display = "none";
    }
}

// Start or stop collecting data:
function startOrStopData() {
    collectingData = !collectingData;
    if (collectingData) {
        time = 0;
        dataArea.innerHTML = "Time \tDensity\tVel_x \tVel_y \tForce_x\tForce_y\n";
        writeData();
        dataButton.value = "Stop data collection";
        showingPeriod = false;
        periodButton.value = "Show F_y period";
    } else {
        dataButton.value = "Start data collection";
    }
}

// Write one line of data to the data area:
function writeData() {
    var timeString = String(time);
    while (timeString.length < 5) timeString = "0" + timeString;
    var sIndex = sensorX + sensorY * xdim;
    dataArea.innerHTML += timeString + "\t" + Number(rho[sIndex]).toFixed(4) + "\t"
        + Number(ux[sIndex]).toFixed(4) + "\t" + Number(uy[sIndex]).toFixed(4) + "\t"
        + Number(barrierFx).toFixed(4) + "\t" + Number(barrierFy).toFixed(4) + "\n";
    dataArea.scrollTop = dataArea.scrollHeight;
}

// Handle click to "show period" button
function showPeriod() {
    showingPeriod = !showingPeriod;
    if (showingPeriod) {
        time = 0;
        lastBarrierFy = 1.0;	// arbitrary positive value
        lastFyOscTime = -1.0;	// arbitrary negative value
        dataArea.innerHTML = "Period of F_y oscillation\n";
        periodButton.value = "Stop data";
        collectingData = false;
        dataButton.value = "Start data collection";
    } else {
        periodButton.value = "Show F_y period";
    }
}

// Write all the barrier locations to the data area:
function showBarrierLocations() {
    dataArea.innerHTML = '{name:"Barrier locations",\n';
    dataArea.innerHTML += 'locations:[\n';
    for (var y = 1; y < ydim - 1; y++) {
        for (var x = 1; x < xdim - 1; x++) {
            if (barrier[x + y * xdim]) dataArea.innerHTML += x + ',' + y + ',\n';
        }
    }
    dataArea.innerHTML = dataArea.innerHTML.substr(0, dataArea.innerHTML.length - 2); // remove final comma
    dataArea.innerHTML += '\n]},\n';
}

// Place a preset barrier:
function placePresetBarrier() {
    var index = barrierSelect.selectedIndex;
    if (index == 0) return;
    clearBarriers();
    var bCount = barrierList[index - 1].locations.length / 2;	// number of barrier sites
    // To decide where to place it, find minimum x and min/max y:
    var xMin = barrierList[index - 1].locations[0];
    var yMin = barrierList[index - 1].locations[1];
    var yMax = yMin;
    for (var siteIndex = 2; siteIndex < 2 * bCount; siteIndex += 2) {
        if (barrierList[index - 1].locations[siteIndex] < xMin) {
            xMin = barrierList[index - 1].locations[siteIndex];
        }
        if (barrierList[index - 1].locations[siteIndex + 1] < yMin) {
            yMin = barrierList[index - 1].locations[siteIndex + 1];
        }
        if (barrierList[index - 1].locations[siteIndex + 1] > yMax) {
            yMax = barrierList[index - 1].locations[siteIndex + 1];
        }
    }
    var yAverage = Math.round((yMin + yMax) / 2);
    // Now place the barriers:
    for (var siteIndex = 0; siteIndex < 2 * bCount; siteIndex += 2) {
        var x = barrierList[index - 1].locations[siteIndex] - xMin + Math.round(ydim / 3);
        var y = barrierList[index - 1].locations[siteIndex + 1] - yAverage + Math.round(ydim / 2);
        addBarrier(x, y);
    }
    paintCanvas();
    barrierSelect.selectedIndex = 0;	// A choice on this menu is a one-time action, not an ongoing setting
}

// Print debugging data:
function debug() {
    dataArea.innerHTML = "Tracer locations:\n";
    for (var t = 0; t < nTracers; t++) {
        dataArea.innerHTML += tracerX[t] + ", " + tracerY[t] + "\n";
    }
}

document.getElementById("debugButton").onclick = debug;
document.getElementById("barrierDataButton").onclick = showBarrierLocations;

startButton.onclick = startStop;