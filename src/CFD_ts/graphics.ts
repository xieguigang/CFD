export class graphics {

    /**
     * Draw the sensor and its associated data display
    */
    public drawSensor() {
        var canvasX = (sensorX + 0.5) * pxPerSquare;
        var canvasY = canvas.height - (sensorY + 0.5) * pxPerSquare;
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
        var coordinates = "  (" + sensorX + "," + sensorY + ")";
        context.fillText(coordinates, canvasX, canvasY);
        canvasY += 14;
        var rhoSymbol = String.fromCharCode(parseInt('03C1', 16));
        var index = sensorX + sensorY * xdim;
        context.fillText(" " + rhoSymbol + " =  " + Number(rho[index]).toFixed(3), canvasX, canvasY);
        canvasY += 14;
        var digitString = Number(ux[index]).toFixed(3);
        if (ux[index] >= 0) digitString = " " + digitString;
        context.fillText("ux = " + digitString, canvasX, canvasY);
        canvasY += 14;
        digitString = Number(uy[index]).toFixed(3);
        if (uy[index] >= 0) digitString = " " + digitString;
        context.fillText("uy = " + digitString, canvasX, canvasY);
    }

    /**
     * Draw an arrow to represent the total force on the barrier(s) 
    */
    public drawForceArrow(x, y, Fx, Fy) {
        context.fillStyle = "rgba(100,100,100,0.7)";
        context.translate((x + 0.5) * pxPerSquare, canvas.height - (y + 0.5) * pxPerSquare);
        var magF = Math.sqrt(Fx * Fx + Fy * Fy);
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
        if (pxPerSquare == 1) pxPerFlowline = 6;
        if (pxPerSquare == 2) pxPerFlowline = 8;
        if (pxPerSquare == 5) pxPerFlowline = 12;
        if ((pxPerSquare == 6) || (pxPerSquare == 8)) pxPerFlowline = 15;
        if (pxPerSquare == 10) pxPerFlowline = 20;
        var sitesPerFlowline = pxPerFlowline / pxPerSquare;
        var xLines = canvas.width / pxPerFlowline;
        var yLines = canvas.height / pxPerFlowline;
        for (var yCount = 0; yCount < yLines; yCount++) {
            for (var xCount = 0; xCount < xLines; xCount++) {
                var x = Math.round((xCount + 0.5) * sitesPerFlowline);
                var y = Math.round((yCount + 0.5) * sitesPerFlowline);
                var thisUx = ux[x + y * xdim];
                var thisUy = uy[x + y * xdim];
                var speed = Math.sqrt(thisUx * thisUx + thisUy * thisUy);
                if (speed > 0.0001) {
                    var px = (xCount + 0.5) * pxPerFlowline;
                    var py = canvas.height - ((yCount + 0.5) * pxPerFlowline);
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
        context.fillStyle = "rgb(150,150,150)";
        for (var t = 0; t < nTracers; t++) {
            var canvasX = (tracerX[t] + 0.5) * pxPerSquare;
            var canvasY = canvas.height - (tracerY[t] + 0.5) * pxPerSquare;
            context.fillRect(canvasX - 1, canvasY - 1, 2, 2);
        }
    }

    /**
     * Paint the canvas 
    */
    public paintCanvas() {
        var cIndex = 0;
        var contrast = Math.pow(1.2, Number(contrastSlider.value));
        var plotType = plotSelect.selectedIndex;
        //var pixelGraphics = pixelCheck.checked;
        if (plotType == 4) computeCurl();
        for (var y = 0; y < ydim; y++) {
            for (var x = 0; x < xdim; x++) {
                if (barrier[x + y * xdim]) {
                    cIndex = nColors + 1;	// kludge for barrier color which isn't really part of color map
                } else {
                    if (plotType == 0) {
                        cIndex = Math.round(nColors * ((rho[x + y * xdim] - 1) * 6 * contrast + 0.5));
                    } else if (plotType == 1) {
                        cIndex = Math.round(nColors * (ux[x + y * xdim] * 2 * contrast + 0.5));
                    } else if (plotType == 2) {
                        cIndex = Math.round(nColors * (uy[x + y * xdim] * 2 * contrast + 0.5));
                    } else if (plotType == 3) {
                        var speed = Math.sqrt(ux[x + y * xdim] * ux[x + y * xdim] + uy[x + y * xdim] * uy[x + y * xdim]);
                        cIndex = Math.round(nColors * (speed * 4 * contrast));
                    } else {
                        cIndex = Math.round(nColors * (curl[x + y * xdim] * 5 * contrast + 0.5));
                    }
                    if (cIndex < 0) cIndex = 0;
                    if (cIndex > nColors) cIndex = nColors;
                }
                //if (pixelGraphics) {
                //colorSquare(x, y, cIndex);
                colorSquare(x, y, redList[cIndex], greenList[cIndex], blueList[cIndex]);
                //} else {
                //	context.fillStyle = hexColorList[cIndex];
                //	context.fillRect(x*pxPerSquare, (ydim-y-1)*pxPerSquare, pxPerSquare, pxPerSquare);
                //}
            }
        }
        //if (pixelGraphics) 
        context.putImageData(image, 0, 0);		// blast image to the screen
        // Draw tracers, force vector, and/or sensor if appropriate:
        if (tracerCheck.checked) drawTracers();
        if (flowlineCheck.checked) drawFlowlines();
        if (forceCheck.checked) drawForceArrow(barrierxSum / barrierCount, barrierySum / barrierCount, barrierFx, barrierFy);
        if (sensorCheck.checked) drawSensor();
    }

    /**
     * Color a grid square in the image data array, one pixel at a time (rgb each in range 0 to 255) 
    */
    public colorSquare(x, y, r, g, b) {
        //function colorSquare(x, y, cIndex) {		// for some strange reason, this version is quite a bit slower on Chrome
        //var r = redList[cIndex];
        //var g = greenList[cIndex];
        //var b = blueList[cIndex];
        var flippedy = ydim - y - 1;			// put y=0 at the bottom
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
        for (var y = 1; y < ydim - 1; y++) {			// interior sites only; leave edges set to zero
            for (var x = 1; x < xdim - 1; x++) {
                curl[x + y * xdim] = uy[x + 1 + y * xdim] - uy[x - 1 + y * xdim] - ux[x + (y + 1) * xdim] + ux[x + (y - 1) * xdim];
            }
        }
    }
}