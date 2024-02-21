<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Theme } from "daisyui";
import daisyuiColors from "daisyui/src/theming/themes";

gsap.registerPlugin(ScrollTrigger);

// watch for theme changes and update the (reactive) colors array
const colorMode = useColorMode();
let colors = ref<string[]>(["#54a6ef", "#54a6ef", "#54a6ef"]);
provide(colorKey, colors);

// (currently) this is used to change color in threejs objects when theme changes
let changeSatelliteColor: (newColors: string[]) => void;

const $scene = useScene();
provide(sceneKey, $scene.scene);
provide(bloomKey, $scene.bloom);

// get the latest cluster information from our db
const nodes: L0Node[] = await $fetch("/api/nodes");
onMounted(() => {
  watch(
    colorMode,
    () => {
      const tmp = document.createElement("canvas");
      tmp.width = tmp.height = 1;
      colors.value = [];
      colors.value.push(
        cssColorToHEX(daisyuiColors[<Theme>colorMode.value].primary, tmp),
        cssColorToHEX(daisyuiColors[<Theme>colorMode.value].secondary, tmp),
        cssColorToHEX(daisyuiColors[<Theme>colorMode.value].accent, tmp)
      );
      if (changeSatelliteColor) changeSatelliteColor(colors.value);
    },
    { immediate: true }
  );

  // initiate the threejs scene renderer with the html elements
  const webglContainer = document.getElementById("webgl-container");
  const css3dContainer = document.getElementById("css3d-container");
  const statsContainer = document.getElementById("stats");
  if (webglContainer && css3dContainer && statsContainer) {
    $scene.initRenderer(webglContainer, css3dContainer, statsContainer);
    gsap.ticker.add((time, deltaTime, frame) => {
      $scene.tick(deltaTime);
    });
  }
});
</script>

<template>
  <div class="w-full h-full relative">
    <div id="stats" class="top-20 left-4 absolute" />
    <!-- canvas that is used by the webgl renderer to draw 3d objects -->
    <canvas id="webgl-container" class="w-full h-full block absolute z-10"></canvas>
    <!-- html panels visualised and controlled by the css3d renderer -->
    <ThreejsWallCharts />
    <ThreejsNaturalGlobe />
    <ThreejsDigitalGlobe />
    <ThreejsGraph :nodes="nodes" />
    <div id="css3d-container" class="w-full h-full block absolute pointer-events-none"></div>
  </div>
</template>
