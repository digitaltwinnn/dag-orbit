<template>
  <div>
    <div id="stats" class="absolute bottom-0 right-0 m-4" />
    <div id="scene-container" class="overflow-x-hidden"></div>
  </div>
</template>

<script>
import vAtmosphere from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmosphere from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";

export default {
  mounted() {
    const el = document.getElementById("scene-container");
    if (el != null) {
      const $main = useScene(el);
      useSun().init($main.scene);
      useDigitalGlobe().init($main.scene);
      useNaturalGlobe().init($main.scene, vAtmosphere, fAtmosphere);
      useCluster().init($main.scene, "/api/nodes");

      // setup animations
      gsap.ticker.add((time, deltaTime, frame) => {
        $main.tick(time, deltaTime, frame);
      });
      //this.appTheatre = markRaw(new AppTheatre(this.appCam, this.appScene));
    }
  },
}

</script>