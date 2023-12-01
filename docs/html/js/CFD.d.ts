declare module "global" {
    export const mobile: boolean;
    export function componentToHex(c: number): string;
    /**
     * Functions to convert rgb to hex color string
     * (from stackoverflow)
    */
    export function rgbToHex(r: number, g: number, b: number): string;
    export interface IrequestAnimFrame {
        (callback: () => void): void;
    }
    /**
     * request canvas refresh a frame drawing;
    */
    export interface IrequestPaintCanvas {
        (): void;
    }
    /**
     * Mysterious gymnastics that are apparently useful
     * for better cross-browser animation timing:
    */
    export const requestAnimFrame: IrequestAnimFrame;
}
declare module "options" {
    export const four9ths: number;
    export const one9th: number;
    export const one36th: number;
    /**
     * the simulation options
    */
    export class options {
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
    export interface uiAdapter {
    }
    export function init_options(opts: options): void;
}
declare module "CFD" {
    import { IrequestPaintCanvas } from "global";
    import { options, uiAdapter } from "options";
    export class CFD {
        xdim: number;
        ydim: number;
        private pars;
        private opts;
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
        paintCanvas: IrequestPaintCanvas;
        /**
         * will be true when running
        */
        running: boolean;
        constructor(xdim: number, ydim: number, pars: uiAdapter, opts: options);
        setupGraphicsDevice(gr: IrequestPaintCanvas): void;
        private init;
        initFluid(): void;
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
declare module "barrier" {
    export interface barrier {
        name: string;
        locations: number[];
    }
    export const barrierList: barrier[];
}
declare module "ui" {
    import { CFD } from "CFD";
    import { graphics } from "graphics";
    import { options, uiAdapter } from "options";
    /**
     * this html user interface handler
    */
    export class ui implements uiAdapter {
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
        push(pushX: number, pushY: number, pushUX: number, pushUY: number): void;
        /**
         * Functions to handle mouse/touch interaction
        */
        mouseDown(e: any): void;
        mouseMove(e: any): void;
        mouseUp(e: any): void;
        mousePressDrag(e: any): void;
        pageToCanvas(pageX: any, pageY: any): {
            x: number;
            y: number;
        };
        canvasToGrid(canvasX: number, canvasY: number): {
            x: number;
            y: number;
        };
        addBarrier(x: any, y: any): void;
        removeBarrier(x: any, y: any): void;
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
declare module "graphics" {
    import { CFD } from "CFD";
    import { IrequestPaintCanvas } from "global";
    import { options } from "options";
    import { ui } from "ui";
    export class graphics {
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
        get requestPaintCanvas(): IrequestPaintCanvas;
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
declare module "app" {
    import { options } from "options";
    import { ui } from "ui";
    export class app {
        opts: options;
        html: ui;
        private engine;
        private graphics;
        constructor(opts?: options, html?: ui);
        /**
         * Resize the grid
        */
        resize(): void;
    }
}
