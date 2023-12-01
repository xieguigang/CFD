///<reference path="barrier.ts" />

import { barrierList } from "./barrier";
import { CFD } from './CFD';
import { mobile, rgbToHex } from './global';
import { graphics } from "./graphics";
import { init_options, options } from "./options";
import { ui } from "./ui";

// Global variables:	
const opts = new options();
const html: ui = new ui(opts);

// coordinates of "sensor" to measure local fluid properties	
opts.sensorX = html.xdim / 2;
opts.sensorY = html.ydim / 2;

init_options(opts);

var CFD_app = new CFD(html.xdim, html.ydim, html, opts);
var gr = new graphics(html, CFD_app, opts);

html.connectEngine(CFD_app);











document.getElementById("debugButton").onclick = debug;
document.getElementById("barrierDataButton").onclick = showBarrierLocations;

startButton.onclick = startStop;