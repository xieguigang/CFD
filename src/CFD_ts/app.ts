///<reference path="barrier.ts" />

import { barrierList } from "./barrier";
import { CFD } from './CFD';
import { mobile, rgbToHex } from './global';
import { graphics } from "./graphics";
import { options } from "./options";
import { ui } from "./ui";

// Global variables:	
const opts = new options();
const html: ui = new ui();

var sensorX = html.xdim / 2;						// coordinates of "sensor" to measure local fluid properties	
var sensorY = html.ydim / 2;

var barrierSelect: HTMLSelectElement = <any>document.getElementById('barrierSelect');

for (var barrierIndex = 0; barrierIndex < barrierList.length; barrierIndex++) {
    var shape = document.createElement("option");
    shape.text = barrierList[barrierIndex].name;
    barrierSelect.add(shape, null);
}

var CFD_app = new CFD(html.xdim, html.ydim);
var gr = new graphics(html.canvas);













document.getElementById("debugButton").onclick = debug;
document.getElementById("barrierDataButton").onclick = showBarrierLocations;

startButton.onclick = startStop;