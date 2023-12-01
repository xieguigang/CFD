define("global", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.requestAnimFrame = exports.rgbToHex = exports.componentToHex = exports.mobile = exports.UA = void 0;
    exports.UA = /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i;
    exports.mobile = (function () {
        var ua = navigator.userAgent.match(exports.UA);
        if (!ua) {
            return false;
        }
        else {
            return true;
        }
    })();
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    exports.componentToHex = componentToHex;
    /**
     * Functions to convert rgb to hex color string
     * (from stackoverflow)
    */
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    exports.rgbToHex = rgbToHex;
    /**
     * Mysterious gymnastics that are apparently useful
     * for better cross-browser animation timing:
    */
    exports.requestAnimFrame = (function (callback) {
        var win = window;
        return window.requestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            win.mozRequestAnimationFrame ||
            win.oRequestAnimationFrame ||
            win.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1); // second parameter is time in ms
            };
    })();
});
define("options", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init_options = exports.options = exports.one36th = exports.one9th = exports.four9ths = void 0;
    // abbreviations
    exports.four9ths = 4.0 / 9.0;
    exports.one9th = 1.0 / 9.0;
    exports.one36th = 1.0 / 36.0;
    /**
     * the simulation options
    */
    var options = /** @class */ (function () {
        /**
         * create new simulation parameter set with default values
        */
        function options(stepCount, startTime, barrierCount, barrierxSum, barrierySum, barrierFx, // total force on all barrier sites
        barrierFy, mouseX, mouseY, // mouse location in canvas coordinates
        oldMouseX, oldMouseY, // mouse coordinates from previous simulation frame
        collectingData, time, // time (in simulation step units) since data collection started
        showingPeriod, lastBarrierFy, // for determining when F_y oscillation begins
        lastFyOscTime, // for calculating F_y oscillation period
        nTracers, nColors, sensorX, // coordinates of "sensor" to measure local fluid properties	
        sensorY, tracerX, tracerY, transBlackArraySize, transBlackArray) {
            if (stepCount === void 0) { stepCount = 0; }
            if (startTime === void 0) { startTime = 0; }
            if (barrierCount === void 0) { barrierCount = 0; }
            if (barrierxSum === void 0) { barrierxSum = 0; }
            if (barrierySum === void 0) { barrierySum = 0; }
            if (barrierFx === void 0) { barrierFx = 0.0; }
            if (barrierFy === void 0) { barrierFy = 0.0; }
            if (mouseX === void 0) { mouseX = -1; }
            if (mouseY === void 0) { mouseY = -1; }
            if (oldMouseX === void 0) { oldMouseX = -1; }
            if (oldMouseY === void 0) { oldMouseY = -1; }
            if (collectingData === void 0) { collectingData = false; }
            if (time === void 0) { time = 0; }
            if (showingPeriod === void 0) { showingPeriod = false; }
            if (lastBarrierFy === void 0) { lastBarrierFy = 1; }
            if (lastFyOscTime === void 0) { lastFyOscTime = 0; }
            if (nTracers === void 0) { nTracers = 144; }
            if (nColors === void 0) { nColors = 400; }
            if (sensorX === void 0) { sensorX = -1; }
            if (sensorY === void 0) { sensorY = -1; }
            if (tracerX === void 0) { tracerX = null; }
            if (tracerY === void 0) { tracerY = null; }
            if (transBlackArraySize === void 0) { transBlackArraySize = 50; }
            if (transBlackArray === void 0) { transBlackArray = null; }
            this.stepCount = stepCount;
            this.startTime = startTime;
            this.barrierCount = barrierCount;
            this.barrierxSum = barrierxSum;
            this.barrierySum = barrierySum;
            this.barrierFx = barrierFx;
            this.barrierFy = barrierFy;
            this.mouseX = mouseX;
            this.mouseY = mouseY;
            this.oldMouseX = oldMouseX;
            this.oldMouseY = oldMouseY;
            this.collectingData = collectingData;
            this.time = time;
            this.showingPeriod = showingPeriod;
            this.lastBarrierFy = lastBarrierFy;
            this.lastFyOscTime = lastFyOscTime;
            this.nTracers = nTracers;
            this.nColors = nColors;
            this.sensorX = sensorX;
            this.sensorY = sensorY;
            this.tracerX = tracerX;
            this.tracerY = tracerY;
            this.transBlackArraySize = transBlackArraySize;
            this.transBlackArray = transBlackArray;
        }
        return options;
    }());
    exports.options = options;
    function init_options(opts) {
        // Initialize tracers (but don't place them yet):
        var nTracers = this.opts.nTracers;
        var tracerX = new Array(nTracers);
        var tracerY = new Array(nTracers);
        for (var t = 0; t < nTracers; t++) {
            tracerX[t] = 0.0;
            tracerY[t] = 0.0;
        }
        opts.tracerX = tracerX;
        opts.tracerY = tracerY;
        // Initialize array of partially transparant blacks, for drawing flow lines:
        var transBlackArray = new Array(opts.transBlackArraySize);
        for (var i = 0; i < opts.transBlackArraySize; i++) {
            transBlackArray[i] = "rgba(0,0,0," + Number(i / opts.transBlackArraySize).toFixed(2) + ")";
        }
        opts.transBlackArray = transBlackArray;
    }
    exports.init_options = init_options;
});
define("CFD", ["require", "exports", "global", "options"], function (require, exports, global_1, options_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CFD = void 0;
    var CFD = /** @class */ (function () {
        function CFD(xdim, ydim, pars, opts, debug) {
            this.xdim = xdim;
            this.ydim = ydim;
            this.pars = pars;
            this.opts = opts;
            this.debug = debug;
            /**
             * will be true when running
            */
            this.running = false;
            this.n0 = new Array(xdim * ydim); // microscopic densities along each lattice direction
            this.nN = new Array(xdim * ydim);
            this.nS = new Array(xdim * ydim);
            this.nE = new Array(xdim * ydim);
            this.nW = new Array(xdim * ydim);
            this.nNE = new Array(xdim * ydim);
            this.nSE = new Array(xdim * ydim);
            this.nNW = new Array(xdim * ydim);
            this.nSW = new Array(xdim * ydim);
            this.rho = new Array(xdim * ydim); // macroscopic density
            this.ux = new Array(xdim * ydim); // macroscopic velocity
            this.uy = new Array(xdim * ydim);
            this.barrier = new Array(xdim * ydim); // boolean array of barrier locations
            this.init();
        }
        CFD.prototype.setupGraphicsDevice = function (gr) {
            this.paintCanvas = gr;
        };
        CFD.prototype.init = function () {
            // Initialize to a steady rightward flow with no barriers:
            for (var y = 0; y < this.ydim; y++) {
                for (var x = 0; x < this.xdim; x++) {
                    this.barrier[x + y * this.xdim] = false;
                }
            }
            // Create a simple linear "wall" barrier (intentionally a little offset from center):
            var barrierSize = global_1.mobile ? 4 : 8;
            for (var y = (this.ydim / 2) - barrierSize; y <= (this.ydim / 2) + barrierSize; y++) {
                var x = Math.round(this.ydim / 3);
                this.barrier[x + y * this.xdim] = true;
            }
            // initialize to steady rightward flow
            this.initFluid();
        };
        // Function to initialize or re-initialize the fluid, based on speed slider setting:
        CFD.prototype.initFluid = function () {
            // Amazingly, if I nest the y loop inside the x loop, Firefox slows down by a factor of 20
            var u0 = this.pars.speed;
            var ydim = this.pars.ydim;
            var xdim = this.pars.xdim;
            for (var y = 0; y < ydim; y++) {
                for (var x = 0; x < xdim; x++) {
                    this.setEquil(x, y, u0, 0, 1);
                    // this.curl[x + y * xdim] = 0.0;
                }
            }
            this.paintCanvas();
        };
        // "Drag" the fluid in a direction determined by the mouse (or touch) motion:
        // (The drag affects a "circle", 5 px in diameter, centered on the given coordinates.)
        CFD.prototype.push = function (pushX, pushY, pushUX, pushUY) {
            // First make sure we're not too close to edge:
            var margin = 3;
            var xdim = this.xdim;
            var ydim = this.ydim;
            if ((pushX > margin) && (pushX < xdim - 1 - margin) && (pushY > margin) && (pushY < ydim - 1 - margin)) {
                for (var dx = -1; dx <= 1; dx++) {
                    this.setEquil(pushX + dx, pushY + 2, pushUX, pushUY);
                    this.setEquil(pushX + dx, pushY - 2, pushUX, pushUY);
                }
                for (var dx = -2; dx <= 2; dx++) {
                    for (var dy = -1; dy <= 1; dy++) {
                        this.setEquil(pushX + dx, pushY + dy, pushUX, pushUY);
                    }
                }
            }
        };
        /**
         * Set the fluid variables at the boundaries,
         * according to the current slider value
        */
        CFD.prototype.setBoundaries = function () {
            var u0 = this.pars.speed;
            var xdim = this.xdim;
            var ydim = this.ydim;
            for (var x = 0; x < xdim; x++) {
                this.setEquil(x, 0, u0, 0, 1);
                this.setEquil(x, ydim - 1, u0, 0, 1);
            }
            for (var y = 1; y < ydim - 1; y++) {
                this.setEquil(0, y, u0, 0, 1);
                this.setEquil(xdim - 1, y, u0, 0, 1);
            }
        };
        // Set all densities in a cell to their equilibrium values for a given velocity and density:
        // (If density is omitted, it's left unchanged.)
        CFD.prototype.setEquil = function (x, y, newux, newuy, newrho) {
            var i = x + y * this.xdim;
            var ux3 = 3 * newux;
            var uy3 = 3 * newuy;
            var ux2 = newux * newux;
            var uy2 = newuy * newuy;
            var uxuy2 = 2 * newux * newuy;
            var u2 = ux2 + uy2;
            var u215 = 1.5 * u2;
            if (typeof newrho == 'undefined') {
                newrho = this.rho[i];
            }
            this.n0[i] = options_1.four9ths * newrho * (1 - u215);
            this.nE[i] = options_1.one9th * newrho * (1 + ux3 + 4.5 * ux2 - u215);
            this.nW[i] = options_1.one9th * newrho * (1 - ux3 + 4.5 * ux2 - u215);
            this.nN[i] = options_1.one9th * newrho * (1 + uy3 + 4.5 * uy2 - u215);
            this.nS[i] = options_1.one9th * newrho * (1 - uy3 + 4.5 * uy2 - u215);
            this.nNE[i] = options_1.one36th * newrho * (1 + ux3 + uy3 + 4.5 * (u2 + uxuy2) - u215);
            this.nSE[i] = options_1.one36th * newrho * (1 + ux3 - uy3 + 4.5 * (u2 - uxuy2) - u215);
            this.nNW[i] = options_1.one36th * newrho * (1 - ux3 + uy3 + 4.5 * (u2 - uxuy2) - u215);
            this.nSW[i] = options_1.one36th * newrho * (1 - ux3 - uy3 + 4.5 * (u2 + uxuy2) - u215);
            this.rho[i] = newrho;
            this.ux[i] = newux;
            this.uy[i] = newuy;
        };
        /**
         * Collide particles within each cell (here's the physics!)
        */
        CFD.prototype.collide = function () {
            var viscosity = this.pars.viscosity; // kinematic viscosity coefficient in natural units
            var omega = 1 / (3 * viscosity + 0.5); // reciprocal of relaxation time
            var xdim = this.xdim;
            var ydim = this.ydim;
            var n0 = this.n0;
            var nN = this.nN;
            var nS = this.nS;
            var nE = this.nE;
            var nW = this.nW;
            var nNE = this.nNE;
            var nSE = this.nSE;
            var nNW = this.nNW;
            var nSW = this.nSW;
            var rho = this.rho;
            var ux = this.ux;
            var uy = this.uy;
            for (var y = 1; y < ydim - 1; y++) {
                for (var x = 1; x < xdim - 1; x++) {
                    var i = x + y * xdim; // array index for this lattice site
                    var thisrho = n0[i] + nN[i] + nS[i] + nE[i] + nW[i] + nNW[i] + nNE[i] + nSW[i] + nSE[i];
                    rho[i] = thisrho;
                    var thisux = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) / thisrho;
                    ux[i] = thisux;
                    var thisuy = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) / thisrho;
                    uy[i] = thisuy;
                    var one9thrho = options_1.one9th * thisrho; // pre-compute a bunch of stuff for optimization
                    var one36thrho = options_1.one36th * thisrho;
                    var ux3 = 3 * thisux;
                    var uy3 = 3 * thisuy;
                    var ux2 = thisux * thisux;
                    var uy2 = thisuy * thisuy;
                    var uxuy2 = 2 * thisux * thisuy;
                    var u2 = ux2 + uy2;
                    var u215 = 1.5 * u2;
                    n0[i] += omega * (options_1.four9ths * thisrho * (1 - u215) - n0[i]);
                    nE[i] += omega * (one9thrho * (1 + ux3 + 4.5 * ux2 - u215) - nE[i]);
                    nW[i] += omega * (one9thrho * (1 - ux3 + 4.5 * ux2 - u215) - nW[i]);
                    nN[i] += omega * (one9thrho * (1 + uy3 + 4.5 * uy2 - u215) - nN[i]);
                    nS[i] += omega * (one9thrho * (1 - uy3 + 4.5 * uy2 - u215) - nS[i]);
                    nNE[i] += omega * (one36thrho * (1 + ux3 + uy3 + 4.5 * (u2 + uxuy2) - u215) - nNE[i]);
                    nSE[i] += omega * (one36thrho * (1 + ux3 - uy3 + 4.5 * (u2 - uxuy2) - u215) - nSE[i]);
                    nNW[i] += omega * (one36thrho * (1 - ux3 + uy3 + 4.5 * (u2 - uxuy2) - u215) - nNW[i]);
                    nSW[i] += omega * (one36thrho * (1 - ux3 - uy3 + 4.5 * (u2 + uxuy2) - u215) - nSW[i]);
                }
            }
            for (var y = 1; y < ydim - 2; y++) {
                nW[xdim - 1 + y * xdim] = nW[xdim - 2 + y * xdim]; // at right end, copy left-flowing densities from next row to the left
                nNW[xdim - 1 + y * xdim] = nNW[xdim - 2 + y * xdim];
                nSW[xdim - 1 + y * xdim] = nSW[xdim - 2 + y * xdim];
            }
        };
        /**
         * Move particles along their directions of motion
        */
        CFD.prototype.stream = function () {
            var opts = this.opts;
            var xdim = this.xdim;
            var ydim = this.ydim;
            var n0 = this.n0;
            var nN = this.nN;
            var nS = this.nS;
            var nE = this.nE;
            var nW = this.nW;
            var nNE = this.nNE;
            var nSE = this.nSE;
            var nNW = this.nNW;
            var nSW = this.nSW;
            var rho = this.rho;
            var ux = this.ux;
            var uy = this.uy;
            opts.barrierCount = 0;
            opts.barrierxSum = 0;
            opts.barrierySum = 0;
            opts.barrierFx = 0.0;
            opts.barrierFy = 0.0;
            for (var y = ydim - 2; y > 0; y--) { // first start in NW corner...
                for (var x = 1; x < xdim - 1; x++) {
                    nN[x + y * xdim] = nN[x + (y - 1) * xdim]; // move the north-moving particles
                    nNW[x + y * xdim] = nNW[x + 1 + (y - 1) * xdim]; // and the northwest-moving particles
                }
            }
            for (var y = ydim - 2; y > 0; y--) { // now start in NE corner...
                for (var x = xdim - 2; x > 0; x--) {
                    nE[x + y * xdim] = nE[x - 1 + y * xdim]; // move the east-moving particles
                    nNE[x + y * xdim] = nNE[x - 1 + (y - 1) * xdim]; // and the northeast-moving particles
                }
            }
            for (var y = 1; y < ydim - 1; y++) { // now start in SE corner...
                for (var x = xdim - 2; x > 0; x--) {
                    nS[x + y * xdim] = nS[x + (y + 1) * xdim]; // move the south-moving particles
                    nSE[x + y * xdim] = nSE[x - 1 + (y + 1) * xdim]; // and the southeast-moving particles
                }
            }
            for (var y = 1; y < ydim - 1; y++) { // now start in the SW corner...
                for (var x = 1; x < xdim - 1; x++) {
                    nW[x + y * xdim] = nW[x + 1 + y * xdim]; // move the west-moving particles
                    nSW[x + y * xdim] = nSW[x + 1 + (y + 1) * xdim]; // and the southwest-moving particles
                }
            }
            var barrier = this.barrier;
            for (var y = 1; y < ydim - 1; y++) { // Now handle bounce-back from barriers
                for (var x = 1; x < xdim - 1; x++) {
                    if (barrier[x + y * xdim]) {
                        var index = x + y * xdim;
                        nE[x + 1 + y * xdim] = nW[index];
                        nW[x - 1 + y * xdim] = nE[index];
                        nN[x + (y + 1) * xdim] = nS[index];
                        nS[x + (y - 1) * xdim] = nN[index];
                        nNE[x + 1 + (y + 1) * xdim] = nSW[index];
                        nNW[x - 1 + (y + 1) * xdim] = nSE[index];
                        nSE[x + 1 + (y - 1) * xdim] = nNW[index];
                        nSW[x - 1 + (y - 1) * xdim] = nNE[index];
                        // Keep track of stuff needed to plot force vector:
                        opts.barrierCount++;
                        opts.barrierxSum += x;
                        opts.barrierySum += y;
                        opts.barrierFx += nE[index] + nNE[index] + nSE[index] - nW[index] - nNW[index] - nSW[index];
                        opts.barrierFy += nN[index] + nNE[index] + nNW[index] - nS[index] - nSE[index] - nSW[index];
                    }
                }
            }
        };
        /**
         * Simulate function executes a bunch of steps and then schedules another call to itself
        */
        CFD.prototype.simulate = function () {
            var _this = this;
            // number of simulation steps per animation frame
            var stepsPerFrame = this.pars.steps;
            // Test to see if we're dragging the fluid:
            var pushing = false;
            var pushX, pushY, pushUX, pushUY;
            this.setBoundaries();
            if (this.pars.dragFluid) {
                if (this.opts.oldMouseX >= 0) {
                    var gridLoc = this.pars.canvasToGrid(this.opts.mouseX, this.opts.mouseY);
                    var pxPerSquare = this.pars.pxPerSquare;
                    pushX = gridLoc.x;
                    pushY = gridLoc.y;
                    pushUX = (this.opts.mouseX - this.opts.oldMouseX) / pxPerSquare / stepsPerFrame;
                    pushUY = -(this.opts.mouseY - this.opts.oldMouseY) / pxPerSquare / stepsPerFrame; // y axis is flipped
                    if (Math.abs(pushUX) > 0.1)
                        pushUX = 0.1 * Math.abs(pushUX) / pushUX;
                    if (Math.abs(pushUY) > 0.1)
                        pushUY = 0.1 * Math.abs(pushUY) / pushUY;
                    pushing = true;
                }
                this.opts.oldMouseX = this.opts.mouseX;
                this.opts.oldMouseY = this.opts.mouseY;
            }
            else {
                this.opts.oldMouseX = -1;
                this.opts.oldMouseY = -1;
            }
            // Execute a bunch of time steps:
            for (var step = 0; step < stepsPerFrame; step++) {
                this.collide();
                this.stream();
                if (this.pars.drawTracers)
                    this.debug.moveTracers();
                if (pushing)
                    this.push(pushX, pushY, pushUX, pushUY);
                this.opts.time++;
                if (this.opts.showingPeriod && (this.opts.barrierFy > 0) && (this.opts.lastBarrierFy <= 0)) {
                    var thisFyOscTime = this.opts.time - this.opts.barrierFy / (this.opts.barrierFy - this.opts.lastBarrierFy); // interpolate when Fy changed sign
                    if (this.opts.lastFyOscTime > 0) {
                        this.debug.dataAreaWriteLine(Number(thisFyOscTime - this.opts.lastFyOscTime).toFixed(2));
                    }
                    this.opts.lastFyOscTime = thisFyOscTime;
                }
                this.opts.lastBarrierFy = this.opts.barrierFy;
            }
            this.paintCanvas();
            if (this.opts.collectingData) {
                this.debug.writeData();
                if (this.opts.time >= 10000)
                    this.debug.startOrStopData();
            }
            if (this.running) {
                this.opts.stepCount += stepsPerFrame;
                var elapsedTime = ((new Date()).getTime() - this.opts.startTime) / 1000; // time in seconds
                this.debug.setSpeedReadout(Number(this.opts.stepCount / elapsedTime).toFixed(0));
            }
            var stable = true;
            var xdim = this.pars.xdim;
            var ydim = this.pars.ydim;
            var rho = this.rho;
            for (var x = 0; x < xdim; x++) {
                var index = x + (ydim / 2) * xdim; // look at middle row only
                if (rho[index] <= 0)
                    stable = false;
            }
            if (!stable) {
                window.alert("The simulation has become unstable due to excessive fluid speeds.");
                this.pars.startStop();
                this.initFluid();
            }
            if (this.running) {
                if (this.pars.requestFrame) {
                    (0, global_1.requestAnimFrame)(function () { return _this.simulate(); }); // let browser schedule next frame
                }
                else {
                    window.setTimeout(function () { return _this.simulate(); }, 1); // schedule next frame asap (nominally 1 ms but always more)
                }
            }
        };
        return CFD;
    }());
    exports.CFD = CFD;
});
define("barrier", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.barrierList = void 0;
    var short_line = {
        name: "Short line",
        locations: [
            12, 15,
            12, 16,
            12, 17,
            12, 18,
            12, 19,
            12, 20,
            12, 21,
            12, 22,
            12, 23
        ]
    };
    var long_line = {
        name: "Long line",
        locations: [
            13, 11,
            13, 12,
            13, 13,
            13, 14,
            13, 15,
            13, 16,
            13, 17,
            13, 18,
            13, 19,
            13, 20,
            13, 21,
            13, 22,
            13, 23,
            13, 24,
            13, 25,
            13, 26,
            13, 27,
            13, 28
        ]
    };
    exports.barrierList = [
        short_line, long_line,
        {
            name: "Diagonal",
            locations: [
                30, 14,
                29, 15,
                30, 15,
                28, 16,
                29, 16,
                27, 17,
                28, 17,
                26, 18,
                27, 18,
                25, 19,
                26, 19,
                24, 20,
                25, 20,
                23, 21,
                24, 21,
                22, 22,
                23, 22,
                21, 23,
                22, 23,
                20, 24,
                21, 24,
                19, 25,
                20, 25,
                18, 26,
                19, 26,
                17, 27,
                18, 27,
                16, 28,
                17, 28,
                15, 29,
                16, 29,
                14, 30,
                15, 30,
                13, 31,
                14, 31
            ]
        },
        {
            name: "Shallow diagonal",
            locations: [
                47, 18,
                48, 18,
                49, 18,
                50, 18,
                44, 19,
                45, 19,
                46, 19,
                47, 19,
                41, 20,
                42, 20,
                43, 20,
                44, 20,
                38, 21,
                39, 21,
                40, 21,
                41, 21,
                35, 22,
                36, 22,
                37, 22,
                38, 22,
                32, 23,
                33, 23,
                34, 23,
                35, 23,
                29, 24,
                30, 24,
                31, 24,
                32, 24,
                26, 25,
                27, 25,
                28, 25,
                29, 25,
                23, 26,
                24, 26,
                25, 26,
                26, 26,
                20, 27,
                21, 27,
                22, 27,
                23, 27,
                17, 28,
                18, 28,
                19, 28,
                20, 28
            ]
        },
        {
            name: "Small circle",
            locations: [
                14, 11,
                15, 11,
                16, 11,
                17, 11,
                18, 11,
                13, 12,
                14, 12,
                18, 12,
                19, 12,
                12, 13,
                13, 13,
                19, 13,
                20, 13,
                12, 14,
                20, 14,
                12, 15,
                20, 15,
                12, 16,
                20, 16,
                12, 17,
                13, 17,
                19, 17,
                20, 17,
                13, 18,
                14, 18,
                18, 18,
                19, 18,
                14, 19,
                15, 19,
                16, 19,
                17, 19,
                18, 19
            ]
        },
        {
            name: "Large circle",
            locations: [
                19, 11,
                20, 11,
                21, 11,
                22, 11,
                23, 11,
                24, 11,
                17, 12,
                18, 12,
                19, 12,
                24, 12,
                25, 12,
                26, 12,
                16, 13,
                17, 13,
                26, 13,
                27, 13,
                15, 14,
                16, 14,
                27, 14,
                28, 14,
                14, 15,
                15, 15,
                28, 15,
                29, 15,
                14, 16,
                29, 16,
                13, 17,
                14, 17,
                29, 17,
                30, 17,
                13, 18,
                30, 18,
                13, 19,
                30, 19,
                13, 20,
                30, 20,
                13, 21,
                30, 21,
                13, 22,
                14, 22,
                29, 22,
                30, 22,
                14, 23,
                29, 23,
                14, 24,
                15, 24,
                28, 24,
                29, 24,
                15, 25,
                16, 25,
                27, 25,
                28, 25,
                16, 26,
                17, 26,
                26, 26,
                27, 26,
                17, 27,
                18, 27,
                19, 27,
                24, 27,
                25, 27,
                26, 27,
                19, 28,
                20, 28,
                21, 28,
                22, 28,
                23, 28,
                24, 28
            ]
        },
        {
            name: "Line with spoiler",
            locations: [
                16, 20,
                16, 21,
                16, 22,
                16, 23,
                16, 24,
                17, 24,
                18, 24,
                19, 24,
                20, 24,
                21, 24,
                22, 24,
                23, 24,
                24, 24,
                25, 24,
                26, 24,
                27, 24,
                28, 24,
                29, 24,
                30, 24,
                31, 24,
                32, 24,
                33, 24,
                34, 24,
                35, 24,
                36, 24,
                37, 24,
                38, 24,
                39, 24,
                40, 24,
                41, 24,
                42, 24,
                43, 24,
                44, 24,
                45, 24,
                46, 24,
                47, 24,
                48, 24,
                49, 24,
                50, 24,
                16, 25,
                16, 26,
                16, 27,
                16, 28
            ]
        },
        {
            name: "Circle with spoiler",
            locations: [
                29, 36,
                30, 36,
                31, 36,
                32, 36,
                33, 36,
                28, 37,
                29, 37,
                33, 37,
                34, 37,
                27, 38,
                28, 38,
                34, 38,
                35, 38,
                27, 39,
                35, 39,
                27, 40,
                35, 40,
                36, 40,
                37, 40,
                38, 40,
                39, 40,
                40, 40,
                41, 40,
                42, 40,
                43, 40,
                44, 40,
                45, 40,
                46, 40,
                47, 40,
                48, 40,
                49, 40,
                50, 40,
                51, 40,
                52, 40,
                53, 40,
                54, 40,
                55, 40,
                56, 40,
                57, 40,
                58, 40,
                59, 40,
                60, 40,
                61, 40,
                62, 40,
                63, 40,
                64, 40,
                65, 40,
                66, 40,
                67, 40,
                68, 40,
                69, 40,
                27, 41,
                35, 41,
                27, 42,
                28, 42,
                34, 42,
                35, 42,
                28, 43,
                29, 43,
                33, 43,
                34, 43,
                29, 44,
                30, 44,
                31, 44,
                32, 44,
                33, 44
            ]
        },
        {
            name: "Right angle",
            locations: [
                27, 36,
                28, 36,
                29, 36,
                30, 36,
                31, 36,
                32, 36,
                33, 36,
                34, 36,
                35, 36,
                36, 36,
                37, 36,
                38, 36,
                39, 36,
                40, 36,
                41, 36,
                42, 36,
                43, 36,
                44, 36,
                45, 36,
                46, 36,
                47, 36,
                48, 36,
                49, 36,
                50, 36,
                51, 36,
                52, 36,
                53, 36,
                54, 36,
                55, 36,
                56, 36,
                57, 36,
                58, 36,
                59, 36,
                60, 36,
                61, 36,
                62, 36,
                63, 36,
                64, 36,
                65, 36,
                66, 36,
                67, 36,
                68, 36,
                69, 36,
                70, 36,
                71, 36,
                72, 36,
                73, 36,
                74, 36,
                75, 36,
                76, 36,
                77, 36,
                78, 36,
                79, 36,
                27, 37,
                27, 38,
                27, 39,
                27, 40,
                27, 41,
                27, 42,
                27, 43,
                27, 44
            ]
        },
        {
            name: "Wedge",
            locations: [
                27, 36,
                28, 36,
                29, 36,
                30, 36,
                31, 36,
                32, 36,
                33, 36,
                34, 36,
                35, 36,
                36, 36,
                37, 36,
                38, 36,
                39, 36,
                40, 36,
                41, 36,
                42, 36,
                43, 36,
                44, 36,
                45, 36,
                46, 36,
                47, 36,
                48, 36,
                49, 36,
                50, 36,
                51, 36,
                52, 36,
                53, 36,
                54, 36,
                55, 36,
                56, 36,
                57, 36,
                58, 36,
                59, 36,
                60, 36,
                61, 36,
                62, 36,
                63, 36,
                64, 36,
                65, 36,
                66, 36,
                67, 36,
                68, 36,
                69, 36,
                70, 36,
                71, 36,
                72, 36,
                73, 36,
                74, 36,
                75, 36,
                76, 36,
                77, 36,
                78, 36,
                79, 36,
                27, 37,
                67, 37,
                68, 37,
                69, 37,
                70, 37,
                71, 37,
                72, 37,
                73, 37,
                27, 38,
                61, 38,
                62, 38,
                63, 38,
                64, 38,
                65, 38,
                66, 38,
                67, 38,
                27, 39,
                55, 39,
                56, 39,
                57, 39,
                58, 39,
                59, 39,
                60, 39,
                61, 39,
                27, 40,
                49, 40,
                50, 40,
                51, 40,
                52, 40,
                53, 40,
                54, 40,
                55, 40,
                27, 41,
                43, 41,
                44, 41,
                45, 41,
                46, 41,
                47, 41,
                48, 41,
                49, 41,
                27, 42,
                37, 42,
                38, 42,
                39, 42,
                40, 42,
                41, 42,
                42, 42,
                43, 42,
                27, 43,
                31, 43,
                32, 43,
                33, 43,
                34, 43,
                35, 43,
                36, 43,
                37, 43,
                27, 44,
                28, 44,
                29, 44,
                30, 44,
                31, 44
            ]
        },
        {
            name: "Airfoil",
            locations: [
                17, 16,
                18, 16,
                19, 16,
                20, 16,
                21, 16,
                22, 16,
                23, 16,
                24, 16,
                25, 16,
                26, 16,
                27, 16,
                28, 16,
                29, 16,
                30, 16,
                31, 16,
                32, 16,
                33, 16,
                34, 16,
                35, 16,
                36, 16,
                37, 16,
                38, 16,
                39, 16,
                40, 16,
                41, 16,
                42, 16,
                43, 16,
                44, 16,
                45, 16,
                46, 16,
                47, 16,
                48, 16,
                49, 16,
                50, 16,
                51, 16,
                52, 16,
                53, 16,
                54, 16,
                55, 16,
                56, 16,
                57, 16,
                58, 16,
                59, 16,
                60, 16,
                61, 16,
                62, 16,
                63, 16,
                64, 16,
                65, 16,
                66, 16,
                67, 16,
                68, 16,
                14, 17,
                15, 17,
                16, 17,
                17, 17,
                56, 17,
                57, 17,
                58, 17,
                59, 17,
                60, 17,
                61, 17,
                62, 17,
                13, 18,
                14, 18,
                50, 18,
                51, 18,
                52, 18,
                53, 18,
                54, 18,
                55, 18,
                56, 18,
                13, 19,
                44, 19,
                45, 19,
                46, 19,
                47, 19,
                48, 19,
                49, 19,
                50, 19,
                13, 20,
                38, 20,
                39, 20,
                40, 20,
                41, 20,
                42, 20,
                43, 20,
                44, 20,
                13, 21,
                14, 21,
                32, 21,
                33, 21,
                34, 21,
                35, 21,
                36, 21,
                37, 21,
                38, 21,
                14, 22,
                15, 22,
                26, 22,
                27, 22,
                28, 22,
                29, 22,
                30, 22,
                31, 22,
                32, 22,
                15, 23,
                16, 23,
                17, 23,
                18, 23,
                21, 23,
                22, 23,
                23, 23,
                24, 23,
                25, 23,
                26, 23,
                18, 24,
                19, 24,
                20, 24,
                21, 24
            ]
        }
    ];
});
define("ui", ["require", "exports", "barrier", "global"], function (require, exports, barrier_1, global_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ui = void 0;
    /**
     * this html user interface handler
    */
    var ui = /** @class */ (function () {
        function ui(opts, canvas_id, speedSlider, stepsSlider, startButton, speedValue, viscSlider, viscValue, mouseSelect, plotSelect, contrastSlider, pixelCheck, tracerCheck, flowlineCheck, forceCheck, sensorCheck, dataCheck, rafCheck, speedReadout, dataSection, dataArea, dataButton, sizeSelect, barrierSelect, periodButton) {
            if (canvas_id === void 0) { canvas_id = "theCanvas"; }
            if (speedSlider === void 0) { speedSlider = "speedSlider"; }
            if (stepsSlider === void 0) { stepsSlider = "stepsSlider"; }
            if (startButton === void 0) { startButton = "startButton"; }
            if (speedValue === void 0) { speedValue = "speedValue"; }
            if (viscSlider === void 0) { viscSlider = "viscSlider"; }
            if (viscValue === void 0) { viscValue = "viscValue"; }
            if (mouseSelect === void 0) { mouseSelect = "mouseSelect"; }
            if (plotSelect === void 0) { plotSelect = "plotSelect"; }
            if (contrastSlider === void 0) { contrastSlider = "contrastSlider"; }
            if (pixelCheck === void 0) { pixelCheck = "pixelCheck"; }
            if (tracerCheck === void 0) { tracerCheck = "tracerCheck"; }
            if (flowlineCheck === void 0) { flowlineCheck = "flowlineCheck"; }
            if (forceCheck === void 0) { forceCheck = "forceCheck"; }
            if (sensorCheck === void 0) { sensorCheck = "sensorCheck"; }
            if (dataCheck === void 0) { dataCheck = "dataCheck"; }
            if (rafCheck === void 0) { rafCheck = "rafCheck"; }
            if (speedReadout === void 0) { speedReadout = "speedReadout"; }
            if (dataSection === void 0) { dataSection = "dataSection"; }
            if (dataArea === void 0) { dataArea = "dataArea"; }
            if (dataButton === void 0) { dataButton = "dataButton"; }
            if (sizeSelect === void 0) { sizeSelect = "sizeSelect"; }
            if (barrierSelect === void 0) { barrierSelect = 'barrierSelect'; }
            if (periodButton === void 0) { periodButton = 'periodButton'; }
            this.opts = opts;
            this.draggingSensor = false;
            this.mouseIsDown = false;
            var canvas = document.getElementById(canvas_id);
            var context = canvas.getContext('2d');
            // for direct pixel manipulation (faster than fillRect)
            var image = context.createImageData(canvas.width, canvas.height);
            // set all alpha values to opaque
            for (var i = 3; i < image.data.length; i += 4) {
                image.data[i] = 255;
            }
            this.canvas = canvas;
            this.context = context;
            this.image = image;
            this.speedSlider = document.getElementById(speedSlider);
            this.stepsSlider = document.getElementById(stepsSlider);
            this.startButton = document.getElementById(startButton);
            this.speedValue = document.getElementById(speedValue);
            this.viscSlider = document.getElementById(viscSlider);
            this.viscValue = document.getElementById(viscValue);
            this.mouseSelect = document.getElementById(mouseSelect);
            this.plotSelect = document.getElementById(plotSelect);
            this.contrastSlider = document.getElementById(contrastSlider);
            this.pixelCheck = document.getElementById(pixelCheck);
            this.tracerCheck = document.getElementById(tracerCheck);
            this.flowlineCheck = document.getElementById(flowlineCheck);
            this.forceCheck = document.getElementById(forceCheck);
            this.sensorCheck = document.getElementById(sensorCheck);
            this.dataCheck = document.getElementById(dataCheck);
            this.rafCheck = document.getElementById(rafCheck);
            this.speedReadout = document.getElementById(speedReadout);
            this.dataSection = document.getElementById(dataSection);
            this.dataArea = document.getElementById(dataArea);
            this.dataButton = document.getElementById(dataButton);
            this.periodButton = document.getElementById(periodButton);
            this.sizeSelect = document.getElementById(sizeSelect);
            this.sizeSelect.selectedIndex = 5;
            // smaller works better on mobile platforms
            if (global_2.mobile) {
                this.sizeSelect.selectedIndex = 1;
            }
            this.barrierSelect = document.getElementById(barrierSelect);
            for (var _i = 0, barrierList_1 = barrier_1.barrierList; _i < barrierList_1.length; _i++) {
                var barrier = barrierList_1[_i];
                var shape = document.createElement("option");
                shape.text = barrier.name;
                this.barrierSelect.add(shape, null);
            }
            this.setEvents();
        }
        Object.defineProperty(ui.prototype, "pxPerSquare", {
            get: function () {
                var i = this.sizeSelect.selectedIndex;
                var size = this.sizeSelect.options[i].value;
                return Number(size);
            },
            enumerable: false,
            configurable: true
        });
        ;
        Object.defineProperty(ui.prototype, "xdim", {
            // width of plotted grid site in pixels
            // grid dimensions for simulation
            get: function () {
                return this.canvas.width / this.pxPerSquare;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "ydim", {
            get: function () {
                return this.canvas.height / this.pxPerSquare;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "dragFluid", {
            get: function () {
                return this.mouseIsDown && this.mouseSelect.selectedIndex == 2;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "requestFrame", {
            get: function () {
                return this.rafCheck.checked;
            },
            enumerable: false,
            configurable: true
        });
        ui.prototype.setSpeedReadout = function (s) {
            this.speedReadout.innerHTML = s;
        };
        ui.prototype.dataAreaWriteLine = function (s) {
            this.dataArea.innerHTML += s + "\n";
            this.dataArea.scrollTop = this.dataArea.scrollHeight;
        };
        ui.prototype.connectEngine = function (CFD) {
            this.CFD = CFD;
        };
        ui.prototype.connectGraphicsDevice = function (g) {
            this.paintCanvas = g.requestPaintCanvas;
        };
        Object.defineProperty(ui.prototype, "steps", {
            get: function () {
                return Number(this.stepsSlider.value);
            },
            enumerable: false,
            configurable: true
        });
        ;
        Object.defineProperty(ui.prototype, "speed", {
            get: function () {
                return Number(this.speedSlider.value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "drawTracers", {
            get: function () {
                return (this.tracerCheck.checked);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "drawFlowlines", {
            get: function () {
                return (this.flowlineCheck.checked);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "drawForceArrow", {
            get: function () {
                return (this.forceCheck.checked);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "drawSensor", {
            get: function () {
                return (this.sensorCheck.checked);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "plotType", {
            get: function () {
                return this.plotSelect.selectedIndex;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "viscosity", {
            get: function () {
                return Number(this.viscSlider.value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ui.prototype, "contrast", {
            get: function () {
                return Number(this.contrastSlider.value);
            },
            enumerable: false,
            configurable: true
        });
        ui.prototype.setEvents = function () {
            var _this = this;
            this.canvas.addEventListener('mousedown', function (e) { return _this.mouseDown(e); }, false);
            this.canvas.addEventListener('mousemove', function (e) { return _this.mouseMove(e); }, false);
            this.canvas.addEventListener('touchstart', function (e) { return _this.mouseDown(e); }, false);
            this.canvas.addEventListener('touchmove', function (e) { return _this.mouseMove(e); }, false);
            document.body.addEventListener('mouseup', function (e) { return _this.mouseUp(e); }, false); // button release could occur outside canvas
            document.body.addEventListener('touchend', function (e) { return _this.mouseUp(e); }, false);
        };
        // Move the tracer particles:
        ui.prototype.moveTracers = function () {
            var xdim = this.xdim;
            var ydim = this.ydim;
            var tracerX = this.opts.tracerX;
            var tracerY = this.opts.tracerY;
            var ux = this.CFD.ux;
            var uy = this.CFD.uy;
            for (var t = 0; t < this.opts.nTracers; t++) {
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
        };
        /**
         * Functions to handle mouse/touch interaction
        */
        ui.prototype.mouseDown = function (e) {
            if (this.sensorCheck.checked) {
                var pxPerSquare = this.pxPerSquare;
                var canvasLoc = this.pageToCanvas(e.pageX, e.pageY);
                var gridLoc = this.canvasToGrid(canvasLoc.x, canvasLoc.y);
                var dx = (gridLoc.x - this.opts.sensorX) * pxPerSquare;
                var dy = (gridLoc.y - this.opts.sensorY) * pxPerSquare;
                if (Math.sqrt(dx * dx + dy * dy) <= 8) {
                    this.draggingSensor = true;
                }
            }
            this.mousePressDrag(e);
        };
        ;
        ui.prototype.mouseMove = function (e) {
            if (this.mouseIsDown) {
                this.mousePressDrag(e);
            }
        };
        ;
        ui.prototype.mouseUp = function (e) {
            this.mouseIsDown = false;
            this.draggingSensor = false;
        };
        ;
        // Handle mouse press or drag:
        ui.prototype.mousePressDrag = function (e) {
            e.preventDefault();
            this.mouseIsDown = true;
            var canvasLoc = this.pageToCanvas(e.pageX, e.pageY);
            if (this.draggingSensor) {
                var gridLoc = this.canvasToGrid(canvasLoc.x, canvasLoc.y);
                this.opts.sensorX = gridLoc.x;
                this.opts.sensorY = gridLoc.y;
                this.paintCanvas();
                return;
            }
            if (this.mouseSelect.selectedIndex == 2) {
                this.opts.mouseX = canvasLoc.x;
                this.opts.mouseY = canvasLoc.y;
                return;
            }
            var gridLoc = this.canvasToGrid(canvasLoc.x, canvasLoc.y);
            if (this.mouseSelect.selectedIndex == 0) {
                this.addBarrier(gridLoc.x, gridLoc.y);
                this.paintCanvas();
            }
            else {
                this.removeBarrier(gridLoc.x, gridLoc.y);
            }
        };
        // Convert page coordinates to canvas coordinates:
        ui.prototype.pageToCanvas = function (pageX, pageY) {
            var canvasX = pageX - this.canvas.offsetLeft;
            var canvasY = pageY - this.canvas.offsetTop;
            // this simple subtraction may not work when the canvas is nested in other elements
            return { x: canvasX, y: canvasY };
        };
        // Convert canvas coordinates to grid coordinates:
        ui.prototype.canvasToGrid = function (canvasX, canvasY) {
            var gridX = Math.floor(canvasX / this.pxPerSquare);
            var gridY = Math.floor((this.canvas.height - 1 - canvasY) / this.pxPerSquare); // off by 1?
            return { x: gridX, y: gridY };
        };
        // Add a barrier at a given grid coordinate location:
        ui.prototype.addBarrier = function (x, y) {
            var xdim = this.xdim;
            var ydim = this.ydim;
            if ((x > 1) && (x < xdim - 2) && (y > 1) && (y < ydim - 2)) {
                this.CFD.barrier[x + y * xdim] = true;
            }
        };
        // Remove a barrier at a given grid coordinate location:
        ui.prototype.removeBarrier = function (x, y) {
            var xdim = this.xdim;
            var barrier = this.CFD.barrier;
            if (barrier[x + y * xdim]) {
                barrier[x + y * xdim] = false;
                this.paintCanvas();
            }
        };
        // Clear all barriers:
        ui.prototype.clearBarriers = function () {
            var xdim = this.xdim;
            var ydim = this.ydim;
            var barrier = this.CFD.barrier;
            for (var x = 0; x < xdim; x++) {
                for (var y = 0; y < ydim; y++) {
                    barrier[x + y * xdim] = false;
                }
            }
            this.paintCanvas();
        };
        // Function to start or pause the simulation:
        ui.prototype.startStop = function () {
            this.CFD.running = !this.CFD.running;
            if (this.CFD.running) {
                this.startButton.value = "Pause";
                this.resetTimer();
                this.CFD.simulate();
            }
            else {
                this.startButton.value = " Run ";
            }
        };
        /**
         * Reset the timer that handles performance evaluation
        */
        ui.prototype.resetTimer = function () {
            this.opts.stepCount = 0;
            this.opts.startTime = (new Date()).getTime();
        };
        // Show value of flow speed setting:
        ui.prototype.adjustSpeed = function () {
            this.speedValue.innerHTML = Number(this.speedSlider.value).toFixed(3);
        };
        // Show value of viscosity:
        ui.prototype.adjustViscosity = function () {
            this.viscValue.innerHTML = Number(this.viscSlider.value).toFixed(3);
        };
        // Show or hide the data area:
        ui.prototype.showData = function () {
            if (this.dataCheck.checked) {
                this.dataSection.style.display = "block";
            }
            else {
                this.dataSection.style.display = "none";
            }
        };
        // Start or stop collecting data:
        ui.prototype.startOrStopData = function () {
            this.opts.collectingData = !this.opts.collectingData;
            if (this.opts.collectingData) {
                this.opts.time = 0;
                this.dataArea.innerHTML = "Time \tDensity\tVel_x \tVel_y \tForce_x\tForce_y\n";
                this.writeData();
                this.dataButton.value = "Stop data collection";
                this.opts.showingPeriod = false;
                this.periodButton.value = "Show F_y period";
            }
            else {
                this.dataButton.value = "Start data collection";
            }
        };
        // Write one line of data to the data area:
        ui.prototype.writeData = function () {
            var timeString = String(this.opts.time);
            var xdim = this.xdim;
            while (timeString.length < 5)
                timeString = "0" + timeString;
            var sIndex = this.opts.sensorX + this.opts.sensorY * xdim;
            var ux = this.CFD.ux;
            var uy = this.CFD.uy;
            var rho = this.CFD.rho;
            this.dataArea.innerHTML += timeString + "\t" + Number(rho[sIndex]).toFixed(4) + "\t"
                + Number(ux[sIndex]).toFixed(4) + "\t" + Number(uy[sIndex]).toFixed(4) + "\t"
                + Number(this.opts.barrierFx).toFixed(4) + "\t" + Number(this.opts.barrierFy).toFixed(4) + "\n";
            this.dataArea.scrollTop = this.dataArea.scrollHeight;
        };
        // Handle click to "show period" button
        ui.prototype.showPeriod = function () {
            this.opts.showingPeriod = !this.opts.showingPeriod;
            if (this.opts.showingPeriod) {
                this.opts.time = 0;
                this.opts.lastBarrierFy = 1.0; // arbitrary positive value
                this.opts.lastFyOscTime = -1.0; // arbitrary negative value
                this.dataArea.innerHTML = "Period of F_y oscillation\n";
                this.periodButton.value = "Stop data";
                this.opts.collectingData = false;
                this.dataButton.value = "Start data collection";
            }
            else {
                this.periodButton.value = "Show F_y period";
            }
        };
        // Write all the barrier locations to the data area:
        ui.prototype.showBarrierLocations = function () {
            var dataArea = this.dataArea;
            var xdim = this.xdim;
            var ydim = this.ydim;
            var barrier = this.CFD.barrier;
            dataArea.innerHTML = '{name:"Barrier locations",\n';
            dataArea.innerHTML += 'locations:[\n';
            for (var y = 1; y < ydim - 1; y++) {
                for (var x = 1; x < xdim - 1; x++) {
                    if (barrier[x + y * xdim])
                        dataArea.innerHTML += x + ',' + y + ',\n';
                }
            }
            dataArea.innerHTML = dataArea.innerHTML.substr(0, dataArea.innerHTML.length - 2); // remove final comma
            dataArea.innerHTML += '\n]},\n';
        };
        // Place a preset barrier:
        ui.prototype.placePresetBarrier = function () {
            var index = this.barrierSelect.selectedIndex;
            if (index == 0)
                return;
            this.clearBarriers();
            var bCount = barrier_1.barrierList[index - 1].locations.length / 2; // number of barrier sites
            // To decide where to place it, find minimum x and min/max y:
            var xMin = barrier_1.barrierList[index - 1].locations[0];
            var yMin = barrier_1.barrierList[index - 1].locations[1];
            var yMax = yMin;
            for (var siteIndex = 2; siteIndex < 2 * bCount; siteIndex += 2) {
                if (barrier_1.barrierList[index - 1].locations[siteIndex] < xMin) {
                    xMin = barrier_1.barrierList[index - 1].locations[siteIndex];
                }
                if (barrier_1.barrierList[index - 1].locations[siteIndex + 1] < yMin) {
                    yMin = barrier_1.barrierList[index - 1].locations[siteIndex + 1];
                }
                if (barrier_1.barrierList[index - 1].locations[siteIndex + 1] > yMax) {
                    yMax = barrier_1.barrierList[index - 1].locations[siteIndex + 1];
                }
            }
            var yAverage = Math.round((yMin + yMax) / 2);
            var xdim = this.xdim;
            var ydim = this.ydim;
            // Now place the barriers:
            for (var siteIndex = 0; siteIndex < 2 * bCount; siteIndex += 2) {
                var x = barrier_1.barrierList[index - 1].locations[siteIndex] - xMin + Math.round(ydim / 3);
                var y = barrier_1.barrierList[index - 1].locations[siteIndex + 1] - yAverage + Math.round(ydim / 2);
                this.addBarrier(x, y);
            }
            this.paintCanvas();
            this.barrierSelect.selectedIndex = 0; // A choice on this menu is a one-time action, not an ongoing setting
        };
        // Print debugging data:
        ui.prototype.debug = function () {
            var tracerX = this.opts.tracerX;
            var tracerY = this.opts.tracerY;
            this.dataArea.innerHTML = "Tracer locations:\n";
            for (var t = 0; t < this.opts.nTracers; t++) {
                this.dataArea.innerHTML += tracerX[t] + ", " + tracerY[t] + "\n";
            }
        };
        return ui;
    }());
    exports.ui = ui;
});
define("graphics", ["require", "exports", "global"], function (require, exports, global_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.graphics = void 0;
    var graphics = /** @class */ (function () {
        function graphics(html, cfd, opts) {
            this.html = html;
            this.cfd = cfd;
            this.opts = opts;
            var ydim = html.ydim;
            var xdim = html.xdim;
            this.canvas = html.canvas;
            this.pars = html;
            this.image = html.image;
            this.curl = new Array(xdim * ydim);
            // initFluid() 
            for (var y = 0; y < ydim; y++) {
                for (var x = 0; x < xdim; x++) {
                    this.curl[x + y * xdim] = 0.0;
                }
            }
            this.initGraphicsColors();
        }
        Object.defineProperty(graphics.prototype, "requestPaintCanvas", {
            get: function () {
                var _this = this;
                return function () { return _this.paintCanvas(); };
            },
            enumerable: false,
            configurable: true
        });
        graphics.prototype.initGraphicsColors = function () {
            // Set up the array of colors for plotting (mimicks matplotlib "jet" colormap):
            // (Kludge: Index nColors+1 labels the color used for drawing barriers.)
            var nColors = this.opts.nColors; // there are actually nColors+2 colors
            var hexColorList = new Array(nColors + 2);
            var redList = new Array(nColors + 2);
            var greenList = new Array(nColors + 2);
            var blueList = new Array(nColors + 2);
            for (var c = 0; c <= nColors; c++) {
                var r, g, b;
                if (c < nColors / 8) {
                    r = 0;
                    g = 0;
                    b = Math.round(255 * (c + nColors / 8) / (nColors / 4));
                }
                else if (c < 3 * nColors / 8) {
                    r = 0;
                    g = Math.round(255 * (c - nColors / 8) / (nColors / 4));
                    b = 255;
                }
                else if (c < 5 * nColors / 8) {
                    r = Math.round(255 * (c - 3 * nColors / 8) / (nColors / 4));
                    g = 255;
                    b = 255 - r;
                }
                else if (c < 7 * nColors / 8) {
                    r = 255;
                    g = Math.round(255 * (7 * nColors / 8 - c) / (nColors / 4));
                    b = 0;
                }
                else {
                    r = Math.round(255 * (9 * nColors / 8 - c) / (nColors / 4));
                    g = 0;
                    b = 0;
                }
                redList[c] = r;
                greenList[c] = g;
                blueList[c] = b;
                hexColorList[c] = (0, global_3.rgbToHex)(r, g, b);
            }
            redList[nColors + 1] = 0;
            greenList[nColors + 1] = 0;
            blueList[nColors + 1] = 0; // barriers are black
            hexColorList[nColors + 1] = (0, global_3.rgbToHex)(0, 0, 0);
            this.redList = redList;
            this.greenList = greenList;
            this.blueList = blueList;
            this.hexColorList = hexColorList;
        };
        /**
         * Initialize the tracer particles
        */
        graphics.prototype.initTracers = function () {
            if (this.pars.drawTracers) {
                var nRows = Math.ceil(Math.sqrt(this.opts.nTracers));
                var xdim = this.pars.xdim;
                var ydim = this.pars.ydim;
                var dx = xdim / nRows;
                var dy = ydim / nRows;
                var nextX = dx / 2;
                var nextY = dy / 2;
                var tracerX = this.opts.tracerX;
                var tracerY = this.opts.tracerY;
                for (var t = 0; t < this.opts.nTracers; t++) {
                    tracerX[t] = nextX;
                    tracerY[t] = nextY;
                    nextX += dx;
                    if (nextX > xdim) {
                        nextX = dx / 2;
                        nextY += dy;
                    }
                }
            }
            this.paintCanvas();
        };
        /**
         * Draw the sensor and its associated data display
        */
        graphics.prototype.drawSensor = function () {
            var canvas = this.canvas;
            var context = this.html.context;
            var pxPerSquare = this.pars.pxPerSquare;
            var CFD = this.cfd;
            var canvasX = (this.opts.sensorX + 0.5) * pxPerSquare;
            var canvasY = canvas.height - (this.opts.sensorY + 0.5) * pxPerSquare;
            context.fillStyle = "rgba(180,180,180,0.7)"; // first draw gray filled circle
            context.beginPath();
            context.arc(canvasX, canvasY, 7, 0, 2 * Math.PI);
            context.fill();
            context.strokeStyle = "#404040"; // next draw cross-hairs
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(canvasX, canvasY - 10);
            context.lineTo(canvasX, canvasY + 10);
            context.moveTo(canvasX - 10, canvasY);
            context.lineTo(canvasX + 10, canvasY);
            context.stroke();
            context.fillStyle = "rgba(255,255,255,0.5)"; // draw rectangle behind text
            canvasX += 10;
            context.font = "12px Monospace";
            var rectWidth = context.measureText("00000000000").width + 6;
            var rectHeight = 58;
            if (canvasX + rectWidth > canvas.width)
                canvasX -= (rectWidth + 20);
            if (canvasY + rectHeight > canvas.height)
                canvasY = canvas.height - rectHeight;
            context.fillRect(canvasX, canvasY, rectWidth, rectHeight);
            context.fillStyle = "#000000"; // finally draw the text
            canvasX += 3;
            canvasY += 12;
            var coordinates = "  (" + this.opts.sensorX + "," + this.opts.sensorY + ")";
            context.fillText(coordinates, canvasX, canvasY);
            canvasY += 14;
            var rhoSymbol = String.fromCharCode(parseInt('03C1', 16));
            var index = this.opts.sensorX + this.opts.sensorY * this.html.xdim;
            context.fillText(" " + rhoSymbol + " =  " + Number(CFD.rho[index]).toFixed(3), canvasX, canvasY);
            canvasY += 14;
            var digitString = Number(CFD.ux[index]).toFixed(3);
            if (CFD.ux[index] >= 0)
                digitString = " " + digitString;
            context.fillText("ux = " + digitString, canvasX, canvasY);
            canvasY += 14;
            digitString = Number(CFD.uy[index]).toFixed(3);
            if (CFD.uy[index] >= 0)
                digitString = " " + digitString;
            context.fillText("uy = " + digitString, canvasX, canvasY);
        };
        /**
         * Draw an arrow to represent the total force on the barrier(s)
        */
        graphics.prototype.drawForceArrow = function (x, y, Fx, Fy) {
            var pxPerSquare = this.html.pxPerSquare;
            var context = this.html.context;
            var magF = Math.sqrt(Fx * Fx + Fy * Fy);
            context.fillStyle = "rgba(100,100,100,0.7)";
            context.translate((x + 0.5) * pxPerSquare, this.canvas.height - (y + 0.5) * pxPerSquare);
            context.scale(4 * magF, 4 * magF);
            context.rotate(Math.atan2(-Fy, Fx));
            context.beginPath();
            context.moveTo(0, 3);
            context.lineTo(100, 3);
            context.lineTo(100, 12);
            context.lineTo(130, 0);
            context.lineTo(100, -12);
            context.lineTo(100, -3);
            context.lineTo(0, -3);
            context.lineTo(0, 3);
            context.fill();
            context.setTransform(1, 0, 0, 1, 0, 0);
        };
        /**
         * Draw a grid of short line segments along flow directions
        */
        graphics.prototype.drawFlowlines = function () {
            var pxPerFlowline = 10;
            var pxPerSquare = this.html.pxPerSquare;
            var xdim = this.html.xdim;
            if (pxPerSquare == 1)
                pxPerFlowline = 6;
            if (pxPerSquare == 2)
                pxPerFlowline = 8;
            if (pxPerSquare == 5)
                pxPerFlowline = 12;
            if ((pxPerSquare == 6) || (pxPerSquare == 8))
                pxPerFlowline = 15;
            if (pxPerSquare == 10)
                pxPerFlowline = 20;
            var sitesPerFlowline = pxPerFlowline / pxPerSquare;
            var xLines = this.canvas.width / pxPerFlowline;
            var yLines = this.canvas.height / pxPerFlowline;
            var context = this.html.context;
            var transBlackArraySize = this.opts.transBlackArraySize;
            var transBlackArray = this.opts.transBlackArray;
            var ux = this.cfd.ux;
            var uy = this.cfd.uy;
            for (var yCount = 0; yCount < yLines; yCount++) {
                for (var xCount = 0; xCount < xLines; xCount++) {
                    var x = Math.round((xCount + 0.5) * sitesPerFlowline);
                    var y = Math.round((yCount + 0.5) * sitesPerFlowline);
                    var thisUx = ux[x + y * xdim];
                    var thisUy = uy[x + y * xdim];
                    var speed = Math.sqrt(thisUx * thisUx + thisUy * thisUy);
                    if (speed > 0.0001) {
                        var px = (xCount + 0.5) * pxPerFlowline;
                        var py = this.canvas.height - ((yCount + 0.5) * pxPerFlowline);
                        var scale = 0.5 * pxPerFlowline / speed;
                        context.beginPath();
                        context.moveTo(px - thisUx * scale, py + thisUy * scale);
                        context.lineTo(px + thisUx * scale, py - thisUy * scale);
                        //context.lineWidth = speed * 5;
                        var cIndex = Math.round(speed * transBlackArraySize / 0.3);
                        if (cIndex >= transBlackArraySize)
                            cIndex = transBlackArraySize - 1;
                        context.strokeStyle = transBlackArray[cIndex];
                        //context.strokeStyle = "rgba(0,0,0,0.1)";
                        context.stroke();
                    }
                }
            }
        };
        /**
         * Draw the tracer particles
        */
        graphics.prototype.drawTracers = function () {
            var context = this.html.context;
            var pxPerSquare = this.html.pxPerSquare;
            var tracerX = this.opts.tracerX;
            var tracerY = this.opts.tracerY;
            context.fillStyle = "rgb(150,150,150)";
            for (var t = 0; t < this.opts.nTracers; t++) {
                var canvasX = (tracerX[t] + 0.5) * pxPerSquare;
                var canvasY = this.canvas.height - (tracerY[t] + 0.5) * pxPerSquare;
                context.fillRect(canvasX - 1, canvasY - 1, 2, 2);
            }
        };
        /**
         * Paint the canvas
        */
        graphics.prototype.paintCanvas = function () {
            var cIndex = 0;
            var contrast = Math.pow(1.2, this.pars.contrast);
            var plotType = this.pars.plotType;
            var ydim = this.html.ydim;
            var xdim = this.html.xdim;
            var pars = this.pars;
            var opts = this.opts;
            var nColors = opts.nColors;
            //var pixelGraphics = pixelCheck.checked;
            if (plotType == 4) {
                this.computeCurl();
            }
            var redList = this.redList;
            var greenList = this.greenList;
            var blueList = this.blueList;
            var curl = this.curl;
            var CFD = this.cfd;
            for (var y = 0; y < ydim; y++) {
                for (var x = 0; x < xdim; x++) {
                    if (CFD.barrier[x + y * xdim]) {
                        cIndex = nColors + 1; // kludge for barrier color which isn't really part of color map
                    }
                    else {
                        if (plotType == 0) {
                            cIndex = Math.round(nColors * ((CFD.rho[x + y * xdim] - 1) * 6 * contrast + 0.5));
                        }
                        else if (plotType == 1) {
                            cIndex = Math.round(nColors * (CFD.ux[x + y * xdim] * 2 * contrast + 0.5));
                        }
                        else if (plotType == 2) {
                            cIndex = Math.round(nColors * (CFD.uy[x + y * xdim] * 2 * contrast + 0.5));
                        }
                        else if (plotType == 3) {
                            var speed = Math.sqrt(CFD.ux[x + y * xdim] * CFD.ux[x + y * xdim] + CFD.uy[x + y * xdim] * CFD.uy[x + y * xdim]);
                            cIndex = Math.round(nColors * (speed * 4 * contrast));
                        }
                        else {
                            cIndex = Math.round(nColors * (curl[x + y * xdim] * 5 * contrast + 0.5));
                        }
                        if (cIndex < 0)
                            cIndex = 0;
                        if (cIndex > nColors)
                            cIndex = nColors;
                    }
                    //if (pixelGraphics) {
                    //colorSquare(x, y, cIndex);
                    this.colorSquare(x, y, redList[cIndex], greenList[cIndex], blueList[cIndex]);
                    //} else {
                    //	context.fillStyle = hexColorList[cIndex];
                    //	context.fillRect(x*pxPerSquare, (ydim-y-1)*pxPerSquare, pxPerSquare, pxPerSquare);
                    //}
                }
            }
            //if (pixelGraphics) 
            this.html.context.putImageData(this.image, 0, 0); // blast image to the screen
            // Draw tracers, force vector, and/or sensor if appropriate:
            if (pars.drawTracers)
                this.drawTracers();
            if (pars.drawFlowlines)
                this.drawFlowlines();
            if (pars.drawSensor)
                this.drawSensor();
            if (pars.drawForceArrow)
                this.drawForceArrow(opts.barrierxSum / opts.barrierCount, opts.barrierySum / opts.barrierCount, opts.barrierFx, opts.barrierFy);
        };
        /**
         * Color a grid square in the image data array, one pixel at a time (rgb each in range 0 to 255)
        */
        graphics.prototype.colorSquare = function (x, y, r, g, b) {
            //function colorSquare(x, y, cIndex) {		// for some strange reason, this version is quite a bit slower on Chrome
            //var r = redList[cIndex];
            //var g = greenList[cIndex];
            //var b = blueList[cIndex];
            var ydim = this.html.ydim;
            var pxPerSquare = this.pars.pxPerSquare;
            var flippedy = ydim - y - 1; // put y=0 at the bottom
            var image = this.image;
            for (var py = flippedy * pxPerSquare; py < (flippedy + 1) * pxPerSquare; py++) {
                for (var px = x * pxPerSquare; px < (x + 1) * pxPerSquare; px++) {
                    var index = (px + py * image.width) * 4;
                    image.data[index + 0] = r;
                    image.data[index + 1] = g;
                    image.data[index + 2] = b;
                }
            }
        };
        /**
         * Compute the curl (actually times 2) of the macroscopic velocity field, for plotting
        */
        graphics.prototype.computeCurl = function () {
            var ydim = this.html.ydim;
            var xdim = this.html.xdim;
            var curl = this.curl;
            var ux = this.cfd.ux;
            var uy = this.cfd.uy;
            for (var y = 1; y < ydim - 1; y++) { // interior sites only; leave edges set to zero
                for (var x = 1; x < xdim - 1; x++) {
                    curl[x + y * xdim] = uy[x + 1 + y * xdim] - uy[x - 1 + y * xdim] - ux[x + (y + 1) * xdim] + ux[x + (y - 1) * xdim];
                }
            }
        };
        return graphics;
    }());
    exports.graphics = graphics;
});
///<reference path="barrier.ts" />
define("app", ["require", "exports", "CFD", "graphics", "options", "ui"], function (require, exports, CFD_1, graphics_1, options_2, ui_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.app = void 0;
    var app = /** @class */ (function () {
        function app(opts, html) {
            if (opts === void 0) { opts = new options_2.options(); }
            if (html === void 0) { html = new ui_1.ui(opts); }
            this.opts = opts;
            this.html = html;
            // coordinates of "sensor" to measure local fluid properties	
            opts.sensorX = html.xdim / 2;
            opts.sensorY = html.ydim / 2;
            (0, options_2.init_options)(opts);
            this.engine = new CFD_1.CFD(html.xdim, html.ydim, html, opts, html);
            this.graphics = new graphics_1.graphics(html, this.engine, opts);
            html.connectEngine(this.engine);
            html.connectGraphicsDevice(this.graphics);
            this.engine.setupGraphicsDevice(this.graphics.requestPaintCanvas);
            // document.getElementById("debugButton").onclick = debug;
            // document.getElementById("barrierDataButton").onclick = showBarrierLocations;
            // startButton.onclick = startStop;){
        }
        /**
         * Resize the grid
        */
        app.prototype.resize = function () {
            var canvas = this.html.canvas;
            var CFD = this.engine;
            // First up-sample the macroscopic variables into temporary arrays at max resolution:
            var tempRho = new Array(canvas.width * canvas.height);
            var tempUx = new Array(canvas.width * canvas.height);
            var tempUy = new Array(canvas.width * canvas.height);
            var tempBarrier = new Array(canvas.width * canvas.height);
            var old_xdim = this.html.xdim;
            for (var y = 0; y < canvas.height; y++) {
                for (var x = 0; x < canvas.width; x++) {
                    var tempIndex = x + y * canvas.width;
                    var xOld = Math.floor(x / pxPerSquare);
                    var yOld = Math.floor(y / pxPerSquare);
                    var oldIndex = xOld + yOld * old_xdim;
                    tempRho[tempIndex] = CFD.rho[oldIndex];
                    tempUx[tempIndex] = CFD.ux[oldIndex];
                    tempUy[tempIndex] = CFD.uy[oldIndex];
                    tempBarrier[tempIndex] = CFD.barrier[oldIndex];
                }
            }
            // Get new size from GUI selector:
            var pxPerSquare = this.html.pxPerSquare;
            var oldPxPerSquare = pxPerSquare;
            pxPerSquare = Number(this.html.sizeSelect.options[this.html.sizeSelect.selectedIndex].value);
            var growRatio = oldPxPerSquare / pxPerSquare;
            var xdim = canvas.width / pxPerSquare;
            var ydim = canvas.height / pxPerSquare;
            // Create new arrays at the desired resolution:
            CFD.n0 = new Array(xdim * ydim);
            CFD.nN = new Array(xdim * ydim);
            CFD.nS = new Array(xdim * ydim);
            CFD.nE = new Array(xdim * ydim);
            CFD.nW = new Array(xdim * ydim);
            CFD.nNE = new Array(xdim * ydim);
            CFD.nSE = new Array(xdim * ydim);
            CFD.nNW = new Array(xdim * ydim);
            CFD.nSW = new Array(xdim * ydim);
            CFD.rho = new Array(xdim * ydim);
            CFD.ux = new Array(xdim * ydim);
            CFD.uy = new Array(xdim * ydim);
            CFD.barrier = new Array(xdim * ydim);
            this.graphics.curl = new Array(xdim * ydim);
            // Down-sample the temporary arrays into the new arrays:
            for (var yNew = 0; yNew < ydim; yNew++) {
                for (var xNew = 0; xNew < xdim; xNew++) {
                    var rhoTotal = 0;
                    var uxTotal = 0;
                    var uyTotal = 0;
                    var barrierTotal = 0;
                    for (var y = yNew * pxPerSquare; y < (yNew + 1) * pxPerSquare; y++) {
                        for (var x = xNew * pxPerSquare; x < (xNew + 1) * pxPerSquare; x++) {
                            var index = x + y * canvas.width;
                            rhoTotal += tempRho[index];
                            uxTotal += tempUx[index];
                            uyTotal += tempUy[index];
                            if (tempBarrier[index])
                                barrierTotal++;
                        }
                    }
                    CFD.setEquil(xNew, yNew, uxTotal / (pxPerSquare * pxPerSquare), uyTotal / (pxPerSquare * pxPerSquare), rhoTotal / (pxPerSquare * pxPerSquare));
                    CFD.barrier[xNew + yNew * xdim] = (barrierTotal >= pxPerSquare * pxPerSquare / 2);
                    this.graphics.curl[xNew + yNew * xdim] = 0.0;
                }
            }
            CFD.setBoundaries();
            var tracerX = this.opts.tracerX;
            var tracerY = this.opts.tracerY;
            if (this.html.tracerCheck.checked) {
                for (var t = 0; t < this.opts.nTracers; t++) {
                    tracerX[t] *= growRatio;
                    tracerY[t] *= growRatio;
                }
            }
            this.opts.sensorX = Math.round(this.opts.sensorX * growRatio);
            this.opts.sensorY = Math.round(this.opts.sensorY * growRatio);
            //computeCurl();
            this.graphics.paintCanvas();
            this.html.resetTimer();
        };
        return app;
    }());
    exports.app = app;
});
//# sourceMappingURL=CFD.js.map