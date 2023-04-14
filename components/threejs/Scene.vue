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
      const $sun = useSun();
      const $naturalGlobe = useNaturalGlobe();
      const $digitalGlobe = useDigitalGlobe();
      const $cluster = useCluster();

      $sun.init($main.scene);
      $naturalGlobe.init($main.scene, vAtmosphere, fAtmosphere);
      $digitalGlobe.init($naturalGlobe.globe);
      $cluster.init($naturalGlobe.globe, $main.bloom, "/api/nodes");

      /*
      const $theatre = useTheatre();
      $theatre.init(
        $main.camera, $main.scene, $main.bloom,
        [$main.light, $sun.light],
        [$natural.globe, $digital.globe, $cluster.cluster]
      )
      */

      // setup animations
      gsap.ticker.add((time, deltaTime, frame) => {
        $main.tick(time, deltaTime, frame);
        // $theatre.rafDriver.tick(time, deltaTime, frame);
      });
    }
  },
}

</script>