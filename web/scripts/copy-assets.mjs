import fs from "fs";
import path from "path";

const src = "C:/Users/solom/.gemini/antigravity-ide/brain/bd5a1802-7844-46cb-823f-92b104a6807e/gallery_flush_arch_1790187548269.jpg";
const dest = "d:/articulate-tour-guide/web/public/landing-gallery-bg.jpg";

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log("✅ Successfully copied gallery_flush_arch to web/public/landing-gallery-bg.jpg");
} else {
  console.error("❌ Source file not found:", src);
}

// Also copy the floor plan
const floorPlanSrc = "C:/Users/solom/.gemini/antigravity-ide/brain/bd5a1802-7844-46cb-823f-92b104a6807e/museum_floor_plan_1790187452542.jpg";
const floorPlanDest = "d:/articulate-tour-guide/web/public/museum-floorplan-art.jpg";

if (fs.existsSync(floorPlanSrc)) {
  fs.copyFileSync(floorPlanSrc, floorPlanDest);
  console.log("✅ Successfully copied museum_floor_plan to web/public/museum-floorplan-art.jpg");
}
