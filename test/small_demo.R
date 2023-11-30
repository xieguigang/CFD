require(CFD);

const file = CFD::open.pack(`${@dir}/demo.dat`, mode = "write");
const dynamics = CFD::session(file);

# run
CFD::start(dynamics, max.time = 1000);
close(file);