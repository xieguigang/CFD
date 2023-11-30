export class options {
    public stepCount = 0;
    public startTime = 0;
    public four9ths = 4.0 / 9.0;					// abbreviations
    public one9th = 1.0 / 9.0;
    public one36th = 1.0 / 36.0;
    public barrierCount = 0;
    public barrierxSum = 0;
    public barrierySum = 0;
    public barrierFx = 0.0;						// total force on all barrier sites
    public barrierFy = 0.0;

    public mouseX;
    public mouseY;							// mouse location in canvas coordinates
    public oldMouseX = -1;
    public oldMouseY = -1;			// mouse coordinates from previous simulation frame
    public collectingData = false;
    public time = 0;								// time (in simulation step units) since data collection started
    public showingPeriod = false;
    public lastBarrierFy = 1;						// for determining when F_y oscillation begins
    public lastFyOscTime = 0;						// for calculating F_y oscillation period
    public nTracers = 144;

    public sensorX: number;						// coordinates of "sensor" to measure local fluid properties	
    public sensorY: number;
}

export interface uiAdapter {
    get contrast(): number;
    get pxPerSquare(): number;
    get viscosity(): number;
    get plotType(): number ;
}