<template>
  <div class="w-full h-full">
    <div id="stats" class="absolute top-20 left-4" />
    <canvas id="scene-container" class="w-full h-full block"></canvas>
  </div>
</template>

<script setup>
import vAtmos from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmos from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";
import daisyuiColors from "daisyui/src/theming/themes";

// set the preferred theme
const colorMode = useColorMode();
/*
const colorLoaded = ref(false);
watch(colorMode, (mode) => {
  if (mode.preference == mode.value) {
    colorLoaded.value = true;
  }
});
*/

// scene is loaded in onMounted
let $scene, $sun;
const sceneLoaded = ref(false);

// load data after scene
let $data;
const dataLoaded = ref(false);
watch(sceneLoaded, () => {
  if (sceneLoaded.value) {
    $data = useCluster([
      daisyuiColors["[data-theme=" + colorMode.value + "]"].primary,
      daisyuiColors["[data-theme=" + colorMode.value + "]"].secondary,
      daisyuiColors["[data-theme=" + colorMode.value + "]"].accent,
    ]);
    watch($data.loaded, () => {
      if ($data.loaded.value) {
        dataLoaded.value = true;
      }
    });
  }
});

// load objects after data
const objectsLoaded = ref(false);
watch(dataLoaded, () => {
  if (dataLoaded.value) {
    const $edges = useEdges($data.edges, $scene.bloom);
    const $satellites = useSatellites($data.satellites);

    watch([$edges.loaded, $satellites.loaded], () => {
      if ($edges.loaded.value && $satellites.loaded.value) {
        $scene.scene.add($edges.mesh);
        $scene.bloom.selection.add($edges.mesh);
        $scene.scene.add($satellites.mesh);
        objectsLoaded.value = true;
      }
    });
  }
});

onMounted(async () => {
  // load scene here as it needs the DOM
  const canvas = document.getElementById("scene-container");
  if (canvas != null) {
    $scene = useScene(canvas);
    gsap.ticker.add((time, deltaTime, frame) => {
      $scene.tick(time, deltaTime, frame);
    });

    $sun = await useSun($scene.scene);
    await useNaturalGlobe($scene.scene, $sun.light, vAtmos, fAtmos);
    await useDigitalGlobe($scene.scene, [
      daisyuiColors["[data-theme=" + colorMode.value + "]"].primary,
      daisyuiColors["[data-theme=" + colorMode.value + "]"].secondary,
    ]);
    sceneLoaded.value = true;
  }
});
</script>
