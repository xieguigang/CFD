namespace Model {

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

        barrier: boolean[];		// boolean array of barrier locations

        paintCanvas: Global.IrequestPaintCanvas;

        /**
         * will be true when running
        */
        public running: boolean = false;

        constructor(public xdim: number, public ydim: number,
            private pars: uiAdapter,
            private opts: options,
            private debug: Idebugger) {

            console.log({ xdim: xdim, ydim: ydim });

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
            this.barrier = new Array(xdim * ydim);		// boolean array of barrier locations

            this.init();
        }

        public setupGraphicsDevice(gr: Global.IrequestPaintCanvas) {
            this.paintCanvas = gr;
            this.paintCanvas();
        }

        private init(): void {
            // Initialize to a steady rightward flow with no barriers:
            for (var y = 0; y < this.ydim; y++) {
                for (var x = 0; x < this.xdim; x++) {
                    this.barrier[x + y * this.xdim] = false;
                }
            }

            // Create a simple linear "wall" barrier (intentionally a little offset from center):
            const barrierSize = Global.mobile ? 4 : 8;

            for (var y = (this.ydim / 2) - barrierSize; y <= (this.ydim / 2) + barrierSize; y++) {
                var x = Math.round(this.ydim / 3);
                this.barrier[x + y * this.xdim] = true;
            }

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
                    this.setEquil(x, y, u0, 0, 1);
                    // this.curl[x + y * xdim] = 0.0;
                }
            }
        }

        // "Drag" the fluid in a direction determined by the mouse (or touch) motion:
        // (The drag affects a "circle", 5 px in diameter, centered on the given coordinates.)
        push(pushX: number, pushY: number, pushUX: number, pushUY: number) {
            // First make sure we're not too close to edge:
            const margin = 3;
            const xdim = this.xdim;
            const ydim = this.ydim;

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
        }

        /**
         * Set the fluid variables at the boundaries, 
         * according to the current slider value 
        */
        setBoundaries() {
            const u0 = this.pars.speed;
            const xdim = this.xdim;
            const ydim = this.ydim;

            for (var x = 0; x < xdim; x++) {
                this.setEquil(x, 0, u0, 0, 1);
                this.setEquil(x, ydim - 1, u0, 0, 1);
            }
            for (var y = 1; y < ydim - 1; y++) {
                this.setEquil(0, y, u0, 0, 1);
                this.setEquil(xdim - 1, y, u0, 0, 1);
            }
        }

        // Set all densities in a cell to their equilibrium values for a given velocity and density:
        // (If density is omitted, it's left unchanged.)
        setEquil(x: number, y: number, newux: number, newuy: number, newrho?: number) {
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

            this.n0[i] = four9ths * newrho * (1 - u215);
            this.nE[i] = one9th * newrho * (1 + ux3 + 4.5 * ux2 - u215);
            this.nW[i] = one9th * newrho * (1 - ux3 + 4.5 * ux2 - u215);
            this.nN[i] = one9th * newrho * (1 + uy3 + 4.5 * uy2 - u215);
            this.nS[i] = one9th * newrho * (1 - uy3 + 4.5 * uy2 - u215);
            this.nNE[i] = one36th * newrho * (1 + ux3 + uy3 + 4.5 * (u2 + uxuy2) - u215);
            this.nSE[i] = one36th * newrho * (1 + ux3 - uy3 + 4.5 * (u2 - uxuy2) - u215);
            this.nNW[i] = one36th * newrho * (1 - ux3 + uy3 + 4.5 * (u2 - uxuy2) - u215);
            this.nSW[i] = one36th * newrho * (1 - ux3 - uy3 + 4.5 * (u2 + uxuy2) - u215);
            this.rho[i] = newrho;
            this.ux[i] = newux;
            this.uy[i] = newuy;
        }

        /**
         * Collide particles within each cell (here's the physics!) 
        */
        public collide() {
            var viscosity = this.pars.viscosity;	// kinematic viscosity coefficient in natural units
            var omega = 1 / (3 * viscosity + 0.5);		// reciprocal of relaxation time
            var xdim = this.xdim;
            var ydim = this.ydim;

            const n0 = this.n0;
            const nN = this.nN;
            const nS = this.nS
            const nE = this.nE;
            const nW = this.nW;
            const nNE = this.nNE;
            const nSE = this.nSE;
            const nNW = this.nNW;
            const nSW = this.nSW;
            const rho = this.rho;
            const ux = this.ux;
            const uy = this.uy;

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
            const opts = this.opts;
            const xdim = this.xdim;
            const ydim = this.ydim;

            const n0 = this.n0;
            const nN = this.nN;
            const nS = this.nS
            const nE = this.nE;
            const nW = this.nW;
            const nNE = this.nNE;
            const nSE = this.nSE;
            const nNW = this.nNW;
            const nSW = this.nSW;
            const rho = this.rho;
            const ux = this.ux;
            const uy = this.uy;

            opts.barrierCount = 0; opts.barrierxSum = 0; opts.barrierySum = 0;
            opts.barrierFx = 0.0; opts.barrierFy = 0.0;

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

            const barrier = this.barrier;

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
                        opts.barrierCount++;
                        opts.barrierxSum += x;
                        opts.barrierySum += y;
                        opts.barrierFx += nE[index] + nNE[index] + nSE[index] - nW[index] - nNW[index] - nSW[index];
                        opts.barrierFy += nN[index] + nNE[index] + nNW[index] - nS[index] - nSE[index] - nSW[index];
                    }
                }
            }
        }

        /**
         * Simulate function executes a bunch of steps and then schedules another call to itself
        */
        public simulate() {
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
                    pushUY = -(this.opts.mouseY - this.opts.oldMouseY) / pxPerSquare / stepsPerFrame;	// y axis is flipped
                    if (Math.abs(pushUX) > 0.1) pushUX = 0.1 * Math.abs(pushUX) / pushUX;
                    if (Math.abs(pushUY) > 0.1) pushUY = 0.1 * Math.abs(pushUY) / pushUY;
                    pushing = true;
                }
                this.opts.oldMouseX = this.opts.mouseX;
                this.opts.oldMouseY = this.opts.mouseY;
            } else {
                this.opts.oldMouseX = -1;
                this.opts.oldMouseY = -1;
            }
            // Execute a bunch of time steps:
            for (var step = 0; step < stepsPerFrame; step++) {
                this.collide();
                this.stream();
                if (this.pars.drawTracers) this.debug.moveTracers();
                if (pushing) this.push(pushX, pushY, pushUX, pushUY);
                this.opts.time++;
                if (this.opts.showingPeriod && (this.opts.barrierFy > 0) && (this.opts.lastBarrierFy <= 0)) {
                    var thisFyOscTime = this.opts.time - this.opts.barrierFy / (this.opts.barrierFy - this.opts.lastBarrierFy);	// interpolate when Fy changed sign
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
                if (this.opts.time >= 10000) this.debug.startOrStopData();
            }
            if (this.running) {
                this.opts.stepCount += stepsPerFrame;
                var elapsedTime = ((new Date()).getTime() - this.opts.startTime) / 1000;	// time in seconds
                this.debug.setSpeedReadout(Number(this.opts.stepCount / elapsedTime).toFixed(0));
            }

            let stable = true;
            let xdim = this.pars.xdim;
            let ydim = this.pars.ydim;
            let rho = this.rho;

            for (var x = 0; x < xdim; x++) {
                var index = x + (ydim / 2) * xdim;	// look at middle row only
                if (rho[index] <= 0) stable = false;
            }
            if (!stable) {
                window.alert("The simulation has become unstable due to excessive fluid speeds.");
                this.pars.startStop();
                this.initFluid();
            }
            if (this.running) {
                if (this.pars.requestFrame) {
                    requestAnimationFrame(() => this.simulate());	// let browser schedule next frame
                } else {
                    window.setTimeout(() => this.simulate(), 1);	// schedule next frame asap (nominally 1 ms but always more)
                }
            }
        }
    }
}