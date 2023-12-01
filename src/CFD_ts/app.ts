///<reference path="barrier.ts" />

class app {

    private engine: Model.CFD;
    private graphics: Model.graphics;

    public constructor(
        public opts = new Model.options(),
        public html: Model.ui = new Model.ui(opts)
    ) {

        // coordinates of "sensor" to measure local fluid properties	
        opts.sensorX = html.xdim / 2;
        opts.sensorY = html.ydim / 2;

        Model.init_options(opts);

        this.engine = new Model.CFD(html.xdim, html.ydim, html, opts, html);
        this.graphics = new Model.graphics(html, this.engine, opts);

        html.connectEngine(this.engine);
        html.connectGraphicsDevice(this.graphics);

        this.engine.setupGraphicsDevice(this.graphics.requestPaintCanvas);



        // document.getElementById("debugButton").onclick = debug;
        // document.getElementById("barrierDataButton").onclick = showBarrierLocations;

        // startButton.onclick = startStop;){
    }

    public startStop() {
        this.html.startStop();
    }

    /**
     * Resize the grid
    */
    public resize() {
        const canvas = this.html.canvas;
        const CFD = this.engine;

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

        const xdim = canvas.width / pxPerSquare;
        const ydim = canvas.height / pxPerSquare;

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
                        if (tempBarrier[index]) barrierTotal++;
                    }
                }
                CFD.setEquil(xNew, yNew, uxTotal / (pxPerSquare * pxPerSquare), uyTotal / (pxPerSquare * pxPerSquare), rhoTotal / (pxPerSquare * pxPerSquare))
                CFD.barrier[xNew + yNew * xdim] = (barrierTotal >= pxPerSquare * pxPerSquare / 2);

                this.graphics.curl[xNew + yNew * xdim] = 0.0;
            }
        }

        CFD.setBoundaries();

        const tracerX = this.opts.tracerX;
        const tracerY = this.opts.tracerY;

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
    }
}

var App = new app();