import { mobile, rgbToHex } from './global';
import { four9ths, one36th, one9th, options, uiAdapter } from './options';

export class CFD {

    // Create the arrays of fluid particle densities, etc. (using 1D arrays for speed):
    // To index into these arrays, use x + y*xdim, traversing rows first and then columns.
    n0: number[];			// microscopic densities along each lattice direction
    nN: number[];
    nS: number[];
    nE: number[];
    nW: number[];
    nNE: number[];
    nSE: number[];
    nNW: number[];
    nSW: number[];
    rho: number[];			// macroscopic density
    ux: number[];			// macroscopic velocity
    uy: number[];
    curl: number[];
    barrier: boolean[];		// boolean array of barrier locations

    /**
     * will be true when running
    */
    public running: boolean = false;

    constructor(public xdim: number, public ydim: number,
        private pars: uiAdapter,
        private opts: options) {

        this.n0 = new Array(xdim * ydim);			// microscopic densities along each lattice direction
        this.nN = new Array(xdim * ydim);
        this.nS = new Array(xdim * ydim);
        this.nE = new Array(xdim * ydim);
        this.nW = new Array(xdim * ydim);
        this.nNE = new Array(xdim * ydim);
        this.nSE = new Array(xdim * ydim);
        this.nNW = new Array(xdim * ydim);
        this.nSW = new Array(xdim * ydim);
        this.rho = new Array(xdim * ydim);			// macroscopic density
        this.ux = new Array(xdim * ydim);			// macroscopic velocity
        this.uy = new Array(xdim * ydim);
        this.curl = new Array(xdim * ydim);
        this.barrier = new Array(xdim * ydim);		// boolean array of barrier locations

        this.init();
    }

    private init(): void {
        // Initialize to a steady rightward flow with no barriers:
        for (var y = 0; y < this.ydim; y++) {
            for (var x = 0; x < this.xdim; x++) {
                this.barrier[x + y * this.xdim] = false;
            }
        }

        // Create a simple linear "wall" barrier (intentionally a little offset from center):
        const barrierSize = mobile ? 4 : 8;

        for (var y = (this.ydim / 2) - barrierSize; y <= (this.ydim / 2) + barrierSize; y++) {
            var x = Math.round(this.ydim / 3);
            this.barrier[x + y * this.xdim] = true;
        }

        // Set up the array of colors for plotting (mimicks matplotlib "jet" colormap):
        // (Kludge: Index nColors+1 labels the color used for drawing barriers.)
        var nColors = 400;							// there are actually nColors+2 colors
        var hexColorList = new Array(nColors + 2);
        var redList = new Array(nColors + 2);
        var greenList = new Array(nColors + 2);
        var blueList = new Array(nColors + 2);
        for (var c = 0; c <= nColors; c++) {
            var r, g, b;
            if (c < nColors / 8) {
                r = 0; g = 0; b = Math.round(255 * (c + nColors / 8) / (nColors / 4));
            } else if (c < 3 * nColors / 8) {
                r = 0; g = Math.round(255 * (c - nColors / 8) / (nColors / 4)); b = 255;
            } else if (c < 5 * nColors / 8) {
                r = Math.round(255 * (c - 3 * nColors / 8) / (nColors / 4)); g = 255; b = 255 - r;
            } else if (c < 7 * nColors / 8) {
                r = 255; g = Math.round(255 * (7 * nColors / 8 - c) / (nColors / 4)); b = 0;
            } else {
                r = Math.round(255 * (9 * nColors / 8 - c) / (nColors / 4)); g = 0; b = 0;
            }
            redList[c] = r; greenList[c] = g; blueList[c] = b;
            hexColorList[c] = rgbToHex(r, g, b);
        }
        redList[nColors + 1] = 0; greenList[nColors + 1] = 0; blueList[nColors + 1] = 0;	// barriers are black
        hexColorList[nColors + 1] = rgbToHex(0, 0, 0);

        // initialize to steady rightward flow
        this.initFluid();
    }

    // Function to initialize or re-initialize the fluid, based on speed slider setting:
    public initFluid() {
        // Amazingly, if I nest the y loop inside the x loop, Firefox slows down by a factor of 20
        var u0 = this.pars.speed;
        var ydim = this.pars.ydim;
        var xdim = this.pars.xdim;

        for (var y = 0; y < ydim; y++) {
            for (var x = 0; x < xdim; x++) {
                setEquil(x, y, u0, 0, 1);
                curl[x + y * xdim] = 0.0;
            }
        }

        paintCanvas();
    }

    /**
     * Initialize the tracer particles 
    */
    public initTracers() {
        if (this.pars.drawTracers) {
            var nRows = Math.ceil(Math.sqrt(this.opts.nTracers));
            var xdim = this.pars.xdim;
            var ydim = this.pars.ydim;
            var dx = xdim / nRows;
            var dy = ydim / nRows;
            var nextX = dx / 2;
            var nextY = dy / 2;
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
        paintCanvas();
    }

    /**
     * Resize the grid
    */
    public resize() {
        // First up-sample the macroscopic variables into temporary arrays at max resolution:
        var tempRho = new Array(canvas.width * canvas.height);
        var tempUx = new Array(canvas.width * canvas.height);
        var tempUy = new Array(canvas.width * canvas.height);
        var tempBarrier = new Array(canvas.width * canvas.height);
        for (var y = 0; y < canvas.height; y++) {
            for (var x = 0; x < canvas.width; x++) {
                var tempIndex = x + y * canvas.width;
                var xOld = Math.floor(x / pxPerSquare);
                var yOld = Math.floor(y / pxPerSquare);
                var oldIndex = xOld + yOld * xdim;
                tempRho[tempIndex] = rho[oldIndex];
                tempUx[tempIndex] = ux[oldIndex];
                tempUy[tempIndex] = uy[oldIndex];
                tempBarrier[tempIndex] = barrier[oldIndex];
            }
        }
        // Get new size from GUI selector:
        var pxPerSquare = this.pars.pxPerSquare;
        var oldPxPerSquare = pxPerSquare;
        pxPerSquare = Number(sizeSelect.options[sizeSelect.selectedIndex].value);
        var growRatio = oldPxPerSquare / pxPerSquare;
        xdim = canvas.width / pxPerSquare;
        ydim = canvas.height / pxPerSquare;
        // Create new arrays at the desired resolution:
        n0 = new Array(xdim * ydim);
        nN = new Array(xdim * ydim);
        nS = new Array(xdim * ydim);
        nE = new Array(xdim * ydim);
        nW = new Array(xdim * ydim);
        nNE = new Array(xdim * ydim);
        nSE = new Array(xdim * ydim);
        nNW = new Array(xdim * ydim);
        nSW = new Array(xdim * ydim);
        rho = new Array(xdim * ydim);
        ux = new Array(xdim * ydim);
        uy = new Array(xdim * ydim);
        curl = new Array(xdim * ydim);
        barrier = new Array(xdim * ydim);
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
                        if (tempBarrier[index]) barrierTotal++;
                    }
                }
                setEquil(xNew, yNew, uxTotal / (pxPerSquare * pxPerSquare), uyTotal / (pxPerSquare * pxPerSquare), rhoTotal / (pxPerSquare * pxPerSquare))
                curl[xNew + yNew * xdim] = 0.0;
                barrier[xNew + yNew * xdim] = (barrierTotal >= pxPerSquare * pxPerSquare / 2);
            }
        }
        setBoundaries();
        if (tracerCheck.checked) {
            for (var t = 0; t < nTracers; t++) {
                tracerX[t] *= growRatio;
                tracerY[t] *= growRatio;
            }
        }
        this.opts.sensorX = Math.round(this.opts.sensorX * growRatio);
        this.opts.sensorY = Math.round(this.opts.sensorY * growRatio);
        //computeCurl();
        paintCanvas();
        resetTimer();
    }

    /**
     * Collide particles within each cell (here's the physics!) 
    */
    public collide() {
        var viscosity = this.pars.viscosity;	// kinematic viscosity coefficient in natural units
        var omega = 1 / (3 * viscosity + 0.5);		// reciprocal of relaxation time
        var xdim = this.xdim;
        var ydim = this.ydim;

        for (var y = 1; y < ydim - 1; y++) {
            for (var x = 1; x < xdim - 1; x++) {
                var i = x + y * xdim;		// array index for this lattice site
                var thisrho = n0[i] + nN[i] + nS[i] + nE[i] + nW[i] + nNW[i] + nNE[i] + nSW[i] + nSE[i];
                rho[i] = thisrho;
                var thisux = (nE[i] + nNE[i] + nSE[i] - nW[i] - nNW[i] - nSW[i]) / thisrho;
                ux[i] = thisux;
                var thisuy = (nN[i] + nNE[i] + nNW[i] - nS[i] - nSE[i] - nSW[i]) / thisrho;
                uy[i] = thisuy
                var one9thrho = one9th * thisrho;		// pre-compute a bunch of stuff for optimization
                var one36thrho = one36th * thisrho;
                var ux3 = 3 * thisux;
                var uy3 = 3 * thisuy;
                var ux2 = thisux * thisux;
                var uy2 = thisuy * thisuy;
                var uxuy2 = 2 * thisux * thisuy;
                var u2 = ux2 + uy2;
                var u215 = 1.5 * u2;
                n0[i] += omega * (four9ths * thisrho * (1 - u215) - n0[i]);
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
            nW[xdim - 1 + y * xdim] = nW[xdim - 2 + y * xdim];		// at right end, copy left-flowing densities from next row to the left
            nNW[xdim - 1 + y * xdim] = nNW[xdim - 2 + y * xdim];
            nSW[xdim - 1 + y * xdim] = nSW[xdim - 2 + y * xdim];
        }
    }

    /**
     * Move particles along their directions of motion 
    */
    public stream() {
        barrierCount = 0; barrierxSum = 0; barrierySum = 0;
        barrierFx = 0.0; barrierFy = 0.0;
        for (var y = ydim - 2; y > 0; y--) {			// first start in NW corner...
            for (var x = 1; x < xdim - 1; x++) {
                nN[x + y * xdim] = nN[x + (y - 1) * xdim];			// move the north-moving particles
                nNW[x + y * xdim] = nNW[x + 1 + (y - 1) * xdim];		// and the northwest-moving particles
            }
        }
        for (var y = ydim - 2; y > 0; y--) {			// now start in NE corner...
            for (var x = xdim - 2; x > 0; x--) {
                nE[x + y * xdim] = nE[x - 1 + y * xdim];			// move the east-moving particles
                nNE[x + y * xdim] = nNE[x - 1 + (y - 1) * xdim];		// and the northeast-moving particles
            }
        }
        for (var y = 1; y < ydim - 1; y++) {			// now start in SE corner...
            for (var x = xdim - 2; x > 0; x--) {
                nS[x + y * xdim] = nS[x + (y + 1) * xdim];			// move the south-moving particles
                nSE[x + y * xdim] = nSE[x - 1 + (y + 1) * xdim];		// and the southeast-moving particles
            }
        }
        for (var y = 1; y < ydim - 1; y++) {				// now start in the SW corner...
            for (var x = 1; x < xdim - 1; x++) {
                nW[x + y * xdim] = nW[x + 1 + y * xdim];			// move the west-moving particles
                nSW[x + y * xdim] = nSW[x + 1 + (y + 1) * xdim];		// and the southwest-moving particles
            }
        }
        for (var y = 1; y < ydim - 1; y++) {				// Now handle bounce-back from barriers
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
                    barrierCount++;
                    barrierxSum += x;
                    barrierySum += y;
                    barrierFx += nE[index] + nNE[index] + nSE[index] - nW[index] - nNW[index] - nSW[index];
                    barrierFy += nN[index] + nNE[index] + nNW[index] - nS[index] - nSE[index] - nSW[index];
                }
            }
        }
    }

    /**
     * Simulate function executes a bunch of steps and then schedules another call to itself
    */
    public simulate() {
        var stepsPerFrame = Number(stepsSlider.value);			// number of simulation steps per animation frame
        setBoundaries();
        // Test to see if we're dragging the fluid:
        var pushing = false;
        var pushX, pushY, pushUX, pushUY;
        if (mouseIsDown && mouseSelect.selectedIndex == 2) {
            if (oldMouseX >= 0) {
                var gridLoc = canvasToGrid(mouseX, mouseY);
                pushX = gridLoc.x;
                pushY = gridLoc.y;
                pushUX = (mouseX - oldMouseX) / pxPerSquare / stepsPerFrame;
                pushUY = -(mouseY - oldMouseY) / pxPerSquare / stepsPerFrame;	// y axis is flipped
                if (Math.abs(pushUX) > 0.1) pushUX = 0.1 * Math.abs(pushUX) / pushUX;
                if (Math.abs(pushUY) > 0.1) pushUY = 0.1 * Math.abs(pushUY) / pushUY;
                pushing = true;
            }
            oldMouseX = mouseX; oldMouseY = mouseY;
        } else {
            oldMouseX = -1; oldMouseY = -1;
        }
        // Execute a bunch of time steps:
        for (var step = 0; step < stepsPerFrame; step++) {
            collide();
            stream();
            if (tracerCheck.checked) moveTracers();
            if (pushing) push(pushX, pushY, pushUX, pushUY);
            time++;
            if (showingPeriod && (barrierFy > 0) && (lastBarrierFy <= 0)) {
                var thisFyOscTime = time - barrierFy / (barrierFy - lastBarrierFy);	// interpolate when Fy changed sign
                if (lastFyOscTime > 0) {
                    var period = thisFyOscTime - lastFyOscTime;
                    dataArea.innerHTML += Number(period).toFixed(2) + "\n";
                    dataArea.scrollTop = dataArea.scrollHeight;
                }
                lastFyOscTime = thisFyOscTime;
            }
            lastBarrierFy = barrierFy;
        }
        paintCanvas();
        if (collectingData) {
            writeData();
            if (time >= 10000) startOrStopData();
        }
        if (this.running) {
            stepCount += stepsPerFrame;
            var elapsedTime = ((new Date()).getTime() - startTime) / 1000;	// time in seconds
            speedReadout.innerHTML = Number(stepCount / elapsedTime).toFixed(0);
        }
        var stable = true;
        for (var x = 0; x < xdim; x++) {
            var index = x + (ydim / 2) * xdim;	// look at middle row only
            if (rho[index] <= 0) stable = false;
        }
        if (!stable) {
            window.alert("The simulation has become unstable due to excessive fluid speeds.");
            startStop();
            initFluid();
        }
        if (this.running) {
            if (rafCheck.checked) {
                requestAnimFrame(function () { simulate(); });	// let browser schedule next frame
            } else {
                window.setTimeout(simulate, 1);	// schedule next frame asap (nominally 1 ms but always more)
            }
        }
    }
}