<template>
  <div class="overflow-x-hidden">
    <div id="stats" class="absolute bottom-0 right-0 m-4" />
    <div id="scene-container"></div>
    <slot />
  </div>
</template>

<script setup >
import vAtmosphere from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmosphere from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";

onMounted(async () => {
  const el = document.getElementById("scene-container");
  if (el != null) {
    const { scene, camera, bloom, tick: sceneTick } = await useScene(el);
    const { light } = await useSun(scene);
    const { mesh: natural } = await useNaturalGlobe(scene, light, vAtmosphere, fAtmosphere);
    const { mesh: digital } = await useDigitalGlobe(natural);
    const { cluster } = await useCluster(natural, bloom, "/api/nodes");
  //  const { tick: theatreTick } = await useTheatre(
  //    camera, scene, bloom, [light], [natural, digital, cluster])

    // setup animations
    gsap.ticker.add((time, deltaTime, frame) => {
      sceneTick(time, deltaTime, frame);
   //   theatreTick(time, deltaTime, frame);
    });
  }
});
</script>