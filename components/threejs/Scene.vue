<template>
  <div class="overflow-x-hidden">
    <div id="stats" class="absolute bottom-0 right-0 m-4" />
    <div id="scene-container"></div>
    <slot />
  </div>
</template>

<script setup>
import vAtmos from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmos from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";

const emit = defineEmits(["loaded"]);

onMounted(async () => {
  const el = document.getElementById("scene-container");
  if (el != null) {
    // get and prepare data
    const { satellites, edges, loaded: dataLoaded } = useCluster();

    // setup the scene directly
    const { scene, bloom, tick } = useScene(el);
    gsap.ticker.add((time, deltaTime, frame) => {
      tick(time, deltaTime, frame);
    });
    const { light } = await useSun(scene);
    await useNaturalGlobe(scene, light, vAtmos, fAtmos);
    await useDigitalGlobe(scene);

    // setup scene objects when the data is loaded
    watch(dataLoaded, () => {
      if (dataLoaded.value) {
        const { mesh: edgeMesh, loaded: edgesLoaded } = useEdges(edges, bloom);
        const { mesh: satMesh, loaded: satsLoaded } = useSatellites(satellites);

        // wait till the scene objects are fully loaded
        watch([edgesLoaded, satsLoaded], () => {
          if (edgesLoaded.value && satsLoaded.value) {
            scene.add(edgeMesh);
            bloom.selection.add(edgeMesh);
            scene.add(satMesh);
            emit("loaded", true);
          }
        });
      }
    });
  }
});
</script>
