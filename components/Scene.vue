<script setup lang="ts">
import vAtmos from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmos from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Theme } from "daisyui";
import daisyuiColors from "daisyui/src/theming/themes";

gsap.registerPlugin(ScrollTrigger);

// watch for theme changes for the threejs objects
const colorMode = useColorMode();
let changeDigtalGlobeColor: (newColors: string[]) => void;
let changeSatelliteColor: (newColors: string[]) => void;
let changeGraphColor: (newColors: string[]) => void;

watch(colorMode, () => {
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = tmpCanvas.height = 1;
  const colors = [
    cssColorToHEX(daisyuiColors[<Theme>colorMode.value].primary, tmpCanvas),
    cssColorToHEX(daisyuiColors[<Theme>colorMode.value].secondary, tmpCanvas),
    cssColorToHEX(daisyuiColors[<Theme>colorMode.value].accent, tmpCanvas),
  ];
  if (changeDigtalGlobeColor) changeDigtalGlobeColor(colors);
  if (changeSatelliteColor) changeSatelliteColor(colors);
  if (changeGraphColor) changeGraphColor(colors);
});

// get the latest cluster information from our db
const nodesResponse: L0Node[] = await $fetch("/api/nodes");

onMounted(async () => {
  // get the current theme on the page for the threejs objects
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = tmpCanvas.height = 1;
  const colors = [
    cssColorToHEX(daisyuiColors[<Theme>colorMode.value].primary, tmpCanvas),
    cssColorToHEX(daisyuiColors[<Theme>colorMode.value].secondary, tmpCanvas),
    cssColorToHEX(daisyuiColors[<Theme>colorMode.value].accent, tmpCanvas),
  ];

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
      const $naturalGlobe = useNaturalGlobe($scene.scene, $sun.light, vAtmos, fAtmos, "#54a6ef");

      const $digitalGlobe = useDigitalGlobe($scene.scene, colors);
      changeDigtalGlobeColor = $digitalGlobe.changeColor;

      const $satellites = useSatellites($scene.scene, $scene.bloom, { satellites: $processedData.satellites, edges: $processedData.satelliteEdges });
      changeSatelliteColor = $satellites.changeColor;

      const $clusterGraph = useGraph($scene.scene, $scene.bloom, { satellites: $processedData.satellites, edges: $processedData.graphEdges });
      changeGraphColor = $clusterGraph.changeColor;

      const $theatre = useTheatre();
      $theatre.init(
        $scene.camera,
        $scene.scene,
        $scene.bloom,
        [$scene.light, $sun.light],
        [$naturalGlobe.globe, $digitalGlobe.globe, $satellites.satellites, $clusterGraph.graph]
      );
      gsap.ticker.add((time, deltaTime, frame) => {
        $theatre.rafDriver.tick(deltaTime);
      });
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
