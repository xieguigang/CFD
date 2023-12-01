declare namespace Model {
    class CFD {
        xdim: number;
        ydim: number;
        private pars;
        private opts;
        private debug;
        n0: number[];
        nN: number[];
        nS: number[];
        nE: number[];
        nW: number[];
        nNE: number[];
        nSE: number[];
        nNW: number[];
        nSW: number[];
        rho: number[];
        ux: number[];
        uy: number[];
        barrier: boolean[];
        paintCanvas: Global.IrequestPaintCanvas;
        /**
         * will be true when running
        */
        running: boolean;
        constructor(xdim: number, ydim: number, pars: uiAdapter, opts: options, debug: Idebugger);
        setupGraphicsDevice(gr: Global.IrequestPaintCanvas): void;
        private init;
        initFluid(): void;
        push(pushX: number, pushY: number, pushUX: number, pushUY: number): void;
        /**
         * Set the fluid variables at the boundaries,
         * according to the current slider value
        */
        setBoundaries(): void;
        setEquil(x: number, y: number, newux: number, newuy: number, newrho?: number): void;
        /**
         * Collide particles within each cell (here's the physics!)
        */
        collide(): void;
        /**
         * Move particles along their directions of motion
        */
        stream(): void;
        /**
         * Simulate function executes a bunch of steps and then schedules another call to itself
        */
        simulate(): void;
    }
}
declare namespace Model {
    interface barrier {
        name: string;
        locations: number[];
    }
    const barrierList: barrier[];
}
declare class app {
    opts: Model.options;
    html: Model.ui;
    private engine;
    private graphics;
    constructor(opts?: Model.options, html?: Model.ui);
    startStop(): void;
    resetTimer(): void;
    clearBarriers(): void;
    paintCanvas(): void;
    placePresetBarrier(): void;
    initTracers(): void;
    showData(): void;
    startOrStopData(): void;
    /**
     * Resize the grid
    */
    resize(): void;
}
declare module Global {
    const UA: RegExp;
    const mobile: boolean;
    function componentToHex(c: number): string;
    /**
     * Functions to convert rgb to hex color string
     * (from stackoverflow)
    */
    function rgbToHex(r: number, g: number, b: number): string;
    interface IrequestAnimFrame {
        (callback: () => void): void;
    }
    /**
     * request canvas refresh a frame drawing;
    */
    interface IrequestPaintCanvas {
        (): void;
    }
    /**
     * Mysterious gymnastics that are apparently useful
     * for better cross-browser animation timing:
    */
    const requestAnimFrame: IrequestAnimFrame;
}
declare namespace Model {
    class graphics {
        private html;
        private cfd;
        private opts;
        private canvas;
        private pars;
        private image;
        redList: number[];
        greenList: number[];
        blueList: number[];
        hexColorList: string[];
        curl: number[];
        get requestPaintCanvas(): Global.IrequestPaintCanvas;
        constructor(html: ui, cfd: CFD, opts: options);
        private initGraphicsColors;
        /**
         * Initialize the tracer particles
        */
        initTracers(): void;
        /**
         * Draw the sensor and its associated data display
        */
        drawSensor(): void;
        /**
         * Draw an arrow to represent the total force on the barrier(s)
        */
        drawForceArrow(x: number, y: number, Fx: number, Fy: number): void;
        /**
         * Draw a grid of short line segments along flow directions
        */
        drawFlowlines(): void;
        /**
         * Draw the tracer particles
        */
        drawTracers(): void;
        /**
         * Paint the canvas
        */
        paintCanvas(): void;
        /**
         * Color a grid square in the image data array, one pixel at a time (rgb each in range 0 to 255)
        */
        colorSquare(x: any, y: any, r: any, g: any, b: any): void;
        /**
         * Compute the curl (actually times 2) of the macroscopic velocity field, for plotting
        */
        computeCurl(): void;
    }
}
declare namespace Model {
    const four9ths: number;
    const one9th: number;
    const one36th: number;
    /**
     * the simulation options
    */
    class options {
        stepCount: number;
        startTime: number;
        barrierCount: number;
        barrierxSum: number;
        barrierySum: number;
        barrierFx: number;
        barrierFy: number;
        mouseX: number;
        mouseY: number;
        oldMouseX: number;
        oldMouseY: number;
        collectingData: boolean;
        time: number;
        showingPeriod: boolean;
        lastBarrierFy: number;
        lastFyOscTime: number;
        nTracers: number;
        nColors: number;
        sensorX: number;
        sensorY: number;
        tracerX: number[];
        tracerY: number[];
        transBlackArraySize: number;
        transBlackArray: string[];
        /**
         * create new simulation parameter set with default values
        */
        constructor(stepCount?: number, startTime?: number, barrierCount?: number, barrierxSum?: number, barrierySum?: number, barrierFx?: number, // total force on all barrier sites
        barrierFy?: number, mouseX?: number, mouseY?: number, // mouse location in canvas coordinates
        oldMouseX?: number, oldMouseY?: number, // mouse coordinates from previous simulation frame
        collectingData?: boolean, time?: number, // time (in simulation step units) since data collection started
        showingPeriod?: boolean, lastBarrierFy?: number, // for determining when F_y oscillation begins
        lastFyOscTime?: number, // for calculating F_y oscillation period
        nTracers?: number, nColors?: number, sensorX?: number, // coordinates of "sensor" to measure local fluid properties	
        sensorY?: number, tracerX?: number[], tracerY?: number[], transBlackArraySize?: number, transBlackArray?: string[]);
    }
    interface uiAdapter {
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
        get requestFrame(): boolean;
        get dragFluid(): boolean;
        startStop(): void;
        canvasToGrid(x: number, y: number): {
            x: number;
            y: number;
        };
    }
    interface Idebugger {
        writeData(): void;
        moveTracers(): void;
        dataAreaWriteLine(s: string): void;
        setSpeedReadout(s: string): void;
        startOrStopData(): void;
    }
    function init_options(opts: options): void;
}
declare namespace Model {
    /**
     * this html user interface handler
    */
    class ui implements uiAdapter, Idebugger {
        private opts;
        readonly canvas: HTMLCanvasElement;
        readonly context: CanvasRenderingContext2D;
        readonly image: ImageData;
        readonly speedSlider: HTMLInputElement;
        readonly stepsSlider: HTMLInputElement;
        readonly startButton: HTMLInputElement;
        readonly speedValue: HTMLInputElement;
        readonly viscSlider: HTMLInputElement;
        readonly viscValue: HTMLInputElement;
        readonly mouseSelect: HTMLSelectElement;
        readonly plotSelect: HTMLSelectElement;
        readonly contrastSlider: HTMLInputElement;
        readonly pixelCheck: HTMLInputElement;
        readonly tracerCheck: HTMLInputElement;
        readonly flowlineCheck: HTMLInputElement;
        readonly forceCheck: HTMLInputElement;
        readonly sensorCheck: HTMLInputElement;
        readonly dataCheck: HTMLInputElement;
        readonly rafCheck: HTMLInputElement;
        readonly speedReadout: HTMLElement;
        readonly dataSection: HTMLElement;
        readonly dataArea: HTMLElement;
        readonly dataButton: HTMLInputElement;
        readonly periodButton: HTMLInputElement;
        readonly sizeSelect: HTMLSelectElement;
        readonly barrierSelect: HTMLSelectElement;
        private draggingSensor;
        private mouseIsDown;
        private CFD;
        private paintCanvas;
        get pxPerSquare(): number;
        get xdim(): number;
        get ydim(): number;
        constructor(opts: options, canvas_id?: string, speedSlider?: string, stepsSlider?: string, startButton?: string, speedValue?: string, viscSlider?: string, viscValue?: string, mouseSelect?: string, plotSelect?: string, contrastSlider?: string, pixelCheck?: string, tracerCheck?: string, flowlineCheck?: string, forceCheck?: string, sensorCheck?: string, dataCheck?: string, rafCheck?: string, speedReadout?: string, dataSection?: string, dataArea?: string, dataButton?: string, sizeSelect?: string, barrierSelect?: string, periodButton?: string);
        get dragFluid(): boolean;
        get requestFrame(): boolean;
        setSpeedReadout(s: string): void;
        dataAreaWriteLine(s: string): void;
        connectEngine(CFD: CFD): void;
        connectGraphicsDevice(g: graphics): void;
        get steps(): number;
        get speed(): number;
        get drawTracers(): boolean;
        get drawFlowlines(): boolean;
        get drawForceArrow(): boolean;
        get drawSensor(): boolean;
        get plotType(): number;
        get viscosity(): number;
        get contrast(): number;
        private setEvents;
        moveTracers(): void;
        /**
         * Functions to handle mouse/touch interaction
        */
        mouseDown(e: any): void;
        mouseMove(e: any): void;
        mouseUp(e: any): void;
        mousePressDrag(e: any): void;
        pageToCanvas(pageX: number, pageY: number): {
            x: number;
            y: number;
        };
        canvasToGrid(canvasX: number, canvasY: number): {
            x: number;
            y: number;
        };
        addBarrier(x: number, y: number): void;
        removeBarrier(x: number, y: number): void;
        clearBarriers(): void;
        startStop(): void;
        /**
         * Reset the timer that handles performance evaluation
        */
        resetTimer(): void;
        adjustSpeed(): void;
        adjustViscosity(): void;
        showData(): void;
        startOrStopData(): void;
        writeData(): void;
        showPeriod(): void;
        showBarrierLocations(): void;
        placePresetBarrier(): void;
        debug(): void;
    }
}
