require(CFD);
require(graphics2D);

const file = CFD::open.pack(`${@dir}/demo.dat`, mode = "read");
const frame = CFD::read.frameRaster(file, time = 600);

bitmap(file = `${@dir}/frame_demo.png`, size = [1920,1080], fill = "darkblue");
rasterHeatmap(frame, colorName = "viridis", colorLevels = 255);
dev.off();

close(file);