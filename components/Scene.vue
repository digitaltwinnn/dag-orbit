<script setup lang="ts">
import vAtmos from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmos from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import daisyuiColors from "daisyui/src/theming/themes";
import { useClusterDataProcessor } from "~/composables/useClusterDataProcessor";

gsap.registerPlugin(ScrollTrigger);

// set the preferred theme and watch it (for threejs objects)
const colorMode = useColorMode();
let changeDigtalGlobeColor: (newColors: string[]) => void;
let changeSatelliteColor: (newColors: string[]) => void;

watch(colorMode, () => {
  const colors = [
    daisyuiColors["[data-theme=" + colorMode.value + "]"].primary,
    daisyuiColors["[data-theme=" + colorMode.value + "]"].secondary,
    daisyuiColors["[data-theme=" + colorMode.value + "]"].accent,
  ]
  if (changeDigtalGlobeColor) changeDigtalGlobeColor(colors);
  if (changeSatelliteColor) changeSatelliteColor(colors);
})

// get the latest cluster information from our db
const nodesResponse: L0Node[] = await $fetch("/api/nodes");

onMounted(async () => {
  // get the current theme color on the page
  const colors = [
    daisyuiColors["[data-theme=" + colorMode.value + "]"].primary,
    daisyuiColors["[data-theme=" + colorMode.value + "]"].secondary,
    daisyuiColors["[data-theme=" + colorMode.value + "]"].accent,
  ]

  // load the threejs scene
  const canvas = document.getElementById("scene-container");
  if (canvas != null) {
    let $scene = useScene(canvas);
    gsap.ticker.add((time, deltaTime, frame) => {
      $scene.tick(deltaTime);
    });

    // create data objects for threejs visualisations
    const $processedData = useClusterDataProcessor(nodesResponse, colors);
    watch($processedData.loaded, async () => {
      const $sun = await useSun($scene.scene);
      useNaturalGlobe(
        $scene.scene,
        $sun.light,
        vAtmos,
        fAtmos,
        "#54a6ef",
      );

      const $digitalGlobe = useDigitalGlobe($scene.scene, colors);
      changeDigtalGlobeColor = $digitalGlobe.changeColor;

      const $satellites = useSatellites($scene.scene, $scene.bloom, $processedData);
      changeSatelliteColor = $satellites.changeColor;
    });

    // page scroll animations
    /*
    gsap.to($satellites.object.scale, {
      x: 2,
      y: 2,
      z: 2,
      scrollTrigger: {
        trigger: "#panel-1",
        scrub: 0.6,
        markers: true,
      },
    })
    */
  }
});
</script>

<template>
  <div class="w-full h-full">
    <div id="stats" class="absolute top-20 left-4" />
    <canvas id="scene-container" class="w-full h-full block"></canvas>
  </div>
</template>
