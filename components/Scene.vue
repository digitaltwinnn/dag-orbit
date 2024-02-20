<script setup lang="ts">
import vAtmos from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmos from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Theme } from "daisyui";
import daisyuiColors from "daisyui/src/theming/themes";

gsap.registerPlugin(ScrollTrigger);

// watch for theme changes and update the (reactive) colors array
const colorMode = useColorMode();
let colors = ref<string[]>([]);
provide(colorKey, colors);

// (currently) this is used to change color in threejs objects when theme changes
let changeDigtalGlobeColor: (newColors: string[]) => void;
let changeSatelliteColor: (newColors: string[]) => void;
let changeGraphColor: (newColors: string[]) => void;
let changeRoomColor: (newColors: string[]) => void;

// get the latest cluster information from our db
const nodesResponse: L0Node[] = await $fetch("/api/nodes");

onMounted(async () => {
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
      if (changeDigtalGlobeColor) changeDigtalGlobeColor(colors.value);
      if (changeSatelliteColor) changeSatelliteColor(colors.value);
      if (changeGraphColor) changeGraphColor(colors.value);
      if (changeRoomColor) changeRoomColor(colors.value);
    },
    { immediate: true }
  );

  // load the threejs scene
  const webglContainer = document.getElementById("webgl-container");
  const css3dContainer = document.getElementById("css3d-container");
  if (webglContainer != null && css3dContainer != null) {
    const $scene = useScene(webglContainer, css3dContainer);
    gsap.ticker.add((time, deltaTime, frame) => {
      $scene.tick(deltaTime);
    });

    // threejs visualistions
    const $naturalGlobe = useNaturalGlobe($scene.scene, vAtmos, fAtmos, "#54a6ef");

    const $digitalGlobe = useDigitalGlobe($scene.scene, colors.value);
    changeDigtalGlobeColor = $digitalGlobe.changeColor;

    const $chartRoom = use3dChartRoom($scene.scene, colors.value);
    changeRoomColor = $chartRoom.changeColor;

    // create data objects for threejs visualisations
    const $processedData = useClusterDataProcessor(nodesResponse, colors.value);
    watch($processedData.loaded, async () => {
      const $satellites = useSatellites($scene.scene, $scene.camera, $scene.bloom, {
        satellites: $processedData.satellites,
        edges: $processedData.satelliteEdges,
      });
      changeSatelliteColor = $satellites.changeColor;

      const $clusterGraph = useGraph($scene.scene, $scene.bloom, {
        satellites: $processedData.satellites,
        edges: $processedData.graphEdges,
      });
      changeGraphColor = $clusterGraph.changeColor;

      // threejs animations
      const $theatre = useTheatre(
        $scene.camera,
        $scene.scene,
        $scene.bloom,
        [$scene.light],
        [
          $naturalGlobe.globe,
          $digitalGlobe.globe,
          $satellites.satellites,
          $clusterGraph.graph,
          $chartRoom.room,
        ]
      );
      gsap.ticker.add((time, deltaTime, frame) => {
        $theatre.rafDriver.tick(deltaTime);
      });
      $theatre.project.ready.then(() => {
        gsap.to($theatre.intro.sequence, {
          position: 5,
          scrollTrigger: {
            trigger: "#panel-2",
            scrub: 0.6,
            markers: true,
          },
        });
      });
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
    <ChartsPanel />
    <SatelliteAnnotation />
    <div id="css3d-container" class="w-full h-full block absolute pointer-events-none"></div>
  </div>
</template>
