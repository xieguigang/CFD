import { CFD } from "./CFD";
import { IrequestPaintCanvas, rgbToHex } from "./global";
import { options, uiAdapter } from "./options";
import { ui } from "./ui";

export class graphics {

    private canvas: HTMLCanvasElement;
    private pars: uiAdapter;
    private image: ImageData;

    public redList: number[];
    public greenList: number[];
    public blueList: number[];
    public hexColorList: string[];

    public curl: number[];

    public get requestPaintCanvas(): IrequestPaintCanvas {
        return () => this.paintCanvas();
    }

    constructor(private html: ui, private cfd: CFD, private opts: options) {
        const ydim = html.ydim;
        const xdim = html.xdim;

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

    private initGraphicsColors() {
        // Set up the array of colors for plotting (mimicks matplotlib "jet" colormap):
        // (Kludge: Index nColors+1 labels the color used for drawing barriers.)
        var nColors = this.opts.nColors;							// there are actually nColors+2 colors
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

        this.redList = redList;
        this.greenList = greenList;
        this.blueList = blueList;
        this.hexColorList = hexColorList;
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
    }

    /**
     * Draw the sensor and its associated data display
    */
    public drawSensor() {
        const canvas = this.canvas;
        const context = this.html.context;
        const pxPerSquare = this.pars.pxPerSquare;
        const CFD = this.cfd;

        var canvasX = (this.opts.sensorX + 0.5) * pxPerSquare;
        var canvasY = canvas.height - (this.opts.sensorY + 0.5) * pxPerSquare;

        context.fillStyle = "rgba(180,180,180,0.7)";	// first draw gray filled circle
        context.beginPath();
        context.arc(canvasX, canvasY, 7, 0, 2 * Math.PI);
        context.fill();
        context.strokeStyle = "#404040";				// next draw cross-hairs
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(canvasX, canvasY - 10);
        context.lineTo(canvasX, canvasY + 10);
        context.moveTo(canvasX - 10, canvasY);
        context.lineTo(canvasX + 10, canvasY);
        context.stroke();
        context.fillStyle = "rgba(255,255,255,0.5)";	// draw rectangle behind text
        canvasX += 10;
        context.font = "12px Monospace";
        var rectWidth = context.measureText("00000000000").width + 6;
        var rectHeight = 58;
        if (canvasX + rectWidth > canvas.width) canvasX -= (rectWidth + 20);
        if (canvasY + rectHeight > canvas.height) canvasY = canvas.height - rectHeight;
        context.fillRect(canvasX, canvasY, rectWidth, rectHeight);
        context.fillStyle = "#000000";					// finally draw the text
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
        if (CFD.ux[index] >= 0) digitString = " " + digitString;
        context.fillText("ux = " + digitString, canvasX, canvasY);
        canvasY += 14;
        digitString = Number(CFD.uy[index]).toFixed(3);
        if (CFD.uy[index] >= 0) digitString = " " + digitString;
        context.fillText("uy = " + digitString, canvasX, canvasY);
    }

    /**
     * Draw an arrow to represent the total force on the barrier(s) 
    */
    public drawForceArrow(x: number, y: number, Fx: number, Fy: number) {
        const pxPerSquare = this.html.pxPerSquare;
        const context = this.html.context;
        const magF = Math.sqrt(Fx * Fx + Fy * Fy);

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
    }

    /**
     * Draw a grid of short line segments along flow directions 
    */
    public drawFlowlines() {
        var pxPerFlowline = 10;
        var pxPerSquare = this.html.pxPerSquare;
        var xdim = this.html.xdim;

        if (pxPerSquare == 1) pxPerFlowline = 6;
        if (pxPerSquare == 2) pxPerFlowline = 8;
        if (pxPerSquare == 5) pxPerFlowline = 12;
        if ((pxPerSquare == 6) || (pxPerSquare == 8)) pxPerFlowline = 15;
        if (pxPerSquare == 10) pxPerFlowline = 20;

        var sitesPerFlowline = pxPerFlowline / pxPerSquare;
        var xLines = this.canvas.width / pxPerFlowline;
        var yLines = this.canvas.height / pxPerFlowline;
        var context = this.html.context;
        var transBlackArraySize = this.opts.transBlackArraySize;
        var transBlackArray = this.opts.transBlackArray;

        const ux = this.cfd.ux;
        const uy = this.cfd.uy;

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
                    if (cIndex >= transBlackArraySize) cIndex = transBlackArraySize - 1;
                    context.strokeStyle = transBlackArray[cIndex];
                    //context.strokeStyle = "rgba(0,0,0,0.1)";
                    context.stroke();
                }
            }
        }
    }

    /**
     * Draw the tracer particles 
    */
    public drawTracers() {
        const context = this.html.context;
        const pxPerSquare = this.html.pxPerSquare;
        const tracerX = this.opts.tracerX;
        const tracerY = this.opts.tracerY;

        context.fillStyle = "rgb(150,150,150)";

        for (var t = 0; t < this.opts.nTracers; t++) {
            var canvasX = (tracerX[t] + 0.5) * pxPerSquare;
            var canvasY = this.canvas.height - (tracerY[t] + 0.5) * pxPerSquare;

            context.fillRect(canvasX - 1, canvasY - 1, 2, 2);
        }
    }

    /**
     * Paint the canvas 
    */
    public paintCanvas() {
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

        const redList = this.redList;
        const greenList = this.greenList;
        const blueList = this.blueList;
        const curl = this.curl;
        const CFD = this.cfd;

        for (var y = 0; y < ydim; y++) {
            for (var x = 0; x < xdim; x++) {
                if (CFD.barrier[x + y * xdim]) {
                    cIndex = nColors + 1;	// kludge for barrier color which isn't really part of color map
                } else {
                    if (plotType == 0) {
                        cIndex = Math.round(nColors * ((CFD.rho[x + y * xdim] - 1) * 6 * contrast + 0.5));
                    } else if (plotType == 1) {
                        cIndex = Math.round(nColors * (CFD.ux[x + y * xdim] * 2 * contrast + 0.5));
                    } else if (plotType == 2) {
                        cIndex = Math.round(nColors * (CFD.uy[x + y * xdim] * 2 * contrast + 0.5));
                    } else if (plotType == 3) {
                        var speed = Math.sqrt(CFD.ux[x + y * xdim] * CFD.ux[x + y * xdim] + CFD.uy[x + y * xdim] * CFD.uy[x + y * xdim]);
                        cIndex = Math.round(nColors * (speed * 4 * contrast));
                    } else {
                        cIndex = Math.round(nColors * (curl[x + y * xdim] * 5 * contrast + 0.5));
                    }
                    if (cIndex < 0) cIndex = 0;
                    if (cIndex > nColors) cIndex = nColors;
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
        this.html.context.putImageData(this.image, 0, 0);		// blast image to the screen
        // Draw tracers, force vector, and/or sensor if appropriate:
        if (pars.drawTracers) this.drawTracers();
        if (pars.drawFlowlines) this.drawFlowlines();
        if (pars.drawSensor) this.drawSensor();
        if (pars.drawForceArrow) this.drawForceArrow(
            opts.barrierxSum / opts.barrierCount,
            opts.barrierySum / opts.barrierCount,
            opts.barrierFx,
            opts.barrierFy
        );
    }

    /**
     * Color a grid square in the image data array, one pixel at a time (rgb each in range 0 to 255) 
    */
    public colorSquare(x, y, r, g, b) {
        //function colorSquare(x, y, cIndex) {		// for some strange reason, this version is quite a bit slower on Chrome
        //var r = redList[cIndex];
        //var g = greenList[cIndex];
        //var b = blueList[cIndex];
        var ydim = this.html.ydim;
        var pxPerSquare = this.pars.pxPerSquare;
        var flippedy = ydim - y - 1;			// put y=0 at the bottom
        var image = this.image;

        for (var py = flippedy * pxPerSquare; py < (flippedy + 1) * pxPerSquare; py++) {
            for (var px = x * pxPerSquare; px < (x + 1) * pxPerSquare; px++) {
                var index = (px + py * image.width) * 4;
                image.data[index + 0] = r;
                image.data[index + 1] = g;
                image.data[index + 2] = b;
            }
        }
    }

    /**
     * Compute the curl (actually times 2) of the macroscopic velocity field, for plotting 
    */
    public computeCurl() {
        const ydim = this.html.ydim;
        const xdim = this.html.xdim;
        const curl = this.curl;

        const ux = this.cfd.ux;
        const uy = this.cfd.uy;

        for (var y = 1; y < ydim - 1; y++) {			// interior sites only; leave edges set to zero
            for (var x = 1; x < xdim - 1; x++) {
                curl[x + y * xdim] = uy[x + 1 + y * xdim] - uy[x - 1 + y * xdim] - ux[x + (y + 1) * xdim] + ux[x + (y - 1) * xdim];
            }
        }
    }
}