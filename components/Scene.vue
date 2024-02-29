<script setup lang="ts">
import type { Theme } from "daisyui";
import daisyuiColors from "daisyui/src/theming/themes";

const $scene = useScene();
provide(sceneKey, $scene.scene);
provide(cameraKey, $scene.camera);
provide(bloomKey, $scene.bloom);

const colorMode = useColorMode();
let colors = ref<string[]>(["#54a6ef", "#54a6ef", "#54a6ef"]);
provide(colorKey, colors);

const nodes: L0Node[] = await $fetch("/api/nodes");

onMounted(() => {
  const $theatre = useTheatre();
  $theatre.registration.registerScene($scene.scene, $scene.camera, $scene.light, $scene.bloom);

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
    },
    { immediate: true }
  );

  const webglContainer = document.getElementById("webgl-container");
  const css3dContainer = document.getElementById("css3d-container");
  const statsContainer = document.getElementById("stats");
  if (webglContainer && css3dContainer && statsContainer) {
    $scene.initRenderer(webglContainer, css3dContainer, statsContainer);
  }
});
</script>

<template>
  <div class="w-full h-full relative">
    <div id="stats" class="top-20 left-4 absolute" />
    <!-- canvas that is used by the webgl renderer to draw 3d objects -->
    <canvas id="webgl-container" class="w-full h-full block absolute z-10"></canvas>
    <ThreejsControlRoom />
    <ThreejsNaturalGlobe />
    <ThreejsDigitalGlobe />
    <ThreejsSatellites :nodes="nodes" />
    <ThreejsGraph :nodes="nodes" />
    <!-- element that is used by the css3d renderer to draw css objects in 3d -->
    <div id="css3d-container" class="w-full h-full block absolute pointer-events-none"></div>
  </div>
</template>
