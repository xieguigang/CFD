require(CFD);

const file = CFD::open.pack(`${@dir}/demo.dat`, mode = "write");
const dynamics = CFD::session(file, dims = [800,500], 
    interval = 90, model.file = "G:\CFD\src\desktop\demo_model.png");

# run
CFD::start(dynamics, max.time = 100000);
close(file);