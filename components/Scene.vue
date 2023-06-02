<template>
  <div>
    <div id="stats" class="absolute top-20 left-4" />
    <canvas id="scene-container" class="w-full h-full block"></canvas>
    <!--<div>
      <h1 class="text-5xl font-bold">
        Constellation Network Explorer 3D!
      </h1>
      <p class="py-6">
        A community driven initiative to try out visualisations that
        explore the different concepts that define the Constellation
        Hypergraph and Metagraphs.
      </p>
      <progress v-if="!loaded" class="progress progress-primary w-full" max="100"></progress>
      <button v-else class="btn btn-primary">Get Started</button>
    </div>-->
  </div>
</template>

<script setup>
import vAtmos from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmos from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";

const loaded = ref(false);

onMounted(async () => {
  const canvas = document.getElementById("scene-container");
  if (canvas != null) {
    // get and prepare data
    const { satellites, edges, loaded: dataLoaded } = useCluster();

    // setup the scene directly
    const { scene, bloom, tick } = useScene(canvas);
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
            loaded.value = true;
          }
        });
      }
    });
  }
});
</script>
