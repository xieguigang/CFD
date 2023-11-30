require(CFD);
require(graphics2D);

const file = CFD::open.pack(`${@dir}/demo.dat`, mode = "read");
const frame = CFD::read.frameRaster(file, time = 100);

bitmap(file = `${@dir}/frame_demo.png`);
rasterHeatmap(frame, colorName = "turbo", colorLevels = 20);
dev.off();

close(file);