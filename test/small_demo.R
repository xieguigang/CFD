require(CFD);

setwd(@dir);

const file = CFD::open.pack("./demo.dat", mode = "write");
const dynamics = CFD::session(file, dims = [800,500], 
    interval = 90, 
    model.file = "../src/desktop/demo_model.png");

# run
CFD::start(dynamics, max.time = 100000);
close(file);