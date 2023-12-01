
// abbreviations
export const four9ths = 4.0 / 9.0;
export const one9th = 1.0 / 9.0;
export const one36th = 1.0 / 36.0;

/**
 * the simulation options
*/
export class options {

    /**
     * create new simulation parameter set with default values
    */
    constructor(
        public stepCount = 0,
        public startTime = 0,
        public barrierCount = 0,
        public barrierxSum = 0,
        public barrierySum = 0,
        public barrierFx = 0.0,				// total force on all barrier sites
        public barrierFy = 0.0,

        public mouseX: number = -1,
        public mouseY: number = -1,			// mouse location in canvas coordinates
        public oldMouseX = -1,
        public oldMouseY = -1,			    // mouse coordinates from previous simulation frame
        public collectingData = false,
        public time = 0,					// time (in simulation step units) since data collection started
        public showingPeriod = false,
        public lastBarrierFy = 1,			// for determining when F_y oscillation begins
        public lastFyOscTime = 0,			// for calculating F_y oscillation period
        public nTracers = 144,
        public nColors = 400,

        public sensorX: number = -1,		// coordinates of "sensor" to measure local fluid properties	
        public sensorY: number = -1,

        public tracerX: number[] = null,
        public tracerY: number[] = null,

        public transBlackArraySize: number = 50,
        public transBlackArray: string[] = null
    ) { }
}

export interface uiAdapter {
    get xdim(): number;
    get ydim(): number;

    get contrast(): number;
    get pxPerSquare(): number;
    get viscosity(): number;
    get speed(): number;
    get plotType(): number;
    get steps(): number;

    /**
     * tracerCheck.checked
    */
    get drawTracers(): boolean;
    get drawFlowlines(): boolean;
    get drawForceArrow(): boolean;
    get drawSensor(): boolean;

    canvasToGrid(x: number, y: number): {
        x: number,
        y: number
    };
}

export interface Idebugger {
    writeData(): void;
    moveTracers(): void;
    dataAreaWriteLine(s: string): void;
    setSpeedReadout(s: string): void;
}

export function init_options(opts: options) {
    // Initialize tracers (but don't place them yet):
    var nTracers = this.opts.nTracers;
    var tracerX = new Array(nTracers);
    var tracerY = new Array(nTracers);

    for (var t = 0; t < nTracers; t++) {
        tracerX[t] = 0.0; tracerY[t] = 0.0;
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