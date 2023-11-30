require(CFD);

const file = CFD::open.pack(`${@dir}/demo.dat`, mode = "read");
const frame = CFD::read.frameRaster(file, time = 100);

close(file);