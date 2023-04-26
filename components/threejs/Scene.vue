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
  async mounted() {
    const el = document.getElementById("scene-container");
    if (el != null) {
      const $main = await useScene(el);

      const $sun = useSun();
      const $naturalGlobe = useNaturalGlobe();
      const $digitalGlobe = await useDigitalGlobe($naturalGlobe.globe);
      const $cluster = useCluster();
      // const $theatre = useTheatre();

      await $sun.init($main.scene);
      await $naturalGlobe.init($main.scene, vAtmosphere, fAtmosphere);
      await $cluster.init($naturalGlobe.globe, $main.bloom, "/api/nodes");
      /*
      await $theatre.init(
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
  }
}
</script>