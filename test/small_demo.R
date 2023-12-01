require(CFD);

const file = CFD::open.pack(`${@dir}/demo.dat`, mode = "write");
const dynamics = CFD::session(file, interval = 90);

# run
CFD::start(dynamics, max.time = 100000);
close(file);