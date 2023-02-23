import { getProject, types } from "@theatre/core";
import studio from "@theatre/studio";
import { DigitalGlobe } from "../globe/DigitalGlobe";

class AppTheatre {
  constructor(digitalGlobe: DigitalGlobe) {
    // Setup the studio
    studio.initialize();

    const project = getProject("THREE.js x Theatre.js");
    const sheet = project.sheet("Animated scene");

    const digitalGlobeObj = sheet.object("digitalGlobe", {
      rotation: types.compound({
        x: types.number(digitalGlobe.get().rotation.x, { range: [-2, 2] }),
        y: types.number(digitalGlobe.get().rotation.y, { range: [-2, 2] }),
        z: types.number(digitalGlobe.get().rotation.z, { range: [-2, 2] }),
      }),
    });
    digitalGlobeObj.onValuesChange((values) => {
      const { x, y, z } = values.rotation;
      digitalGlobe.get().rotation.set(x * Math.PI, y * Math.PI, z * Math.PI);
    });
  }
}

export { AppTheatre };
