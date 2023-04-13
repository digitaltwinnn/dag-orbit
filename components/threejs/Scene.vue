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
      useCluster().init($main.scene, $main.bloom, "/api/nodes");

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