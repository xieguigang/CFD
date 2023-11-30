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

    constructor(public xdim: number, public ydim: number) {
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
    }
}