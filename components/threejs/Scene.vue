<template>
  <div>
    <div id="stats" class="absolute bottom-0 right-0 m-4" />
    <div id="scene-container" class="overflow-x-hidden"></div>
  </div>
</template>

<script setup >
import vAtmosphere from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmosphere from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";

onMounted(async () => {
  const el = document.getElementById("scene-container");
  if (el != null) {
    const { scene, bloom, tick } = await useScene(el);
    const { light } = await useSun(scene);
    const { mesh: natural } = await useNaturalGlobe(scene, light, vAtmosphere, fAtmosphere);
    const { mesh: digital } = await useDigitalGlobe(natural);
    const { cluster } = await useCluster(natural, bloom, "/api/nodes");

    // setup animations
    gsap.ticker.add((time, deltaTime, frame) => {
      tick(time, deltaTime, frame);
      // $theatre.rafDriver.tick(time, deltaTime, frame);
    });
  }
});
</script>