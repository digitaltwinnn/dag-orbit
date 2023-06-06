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

let $scene, $sun;
const sceneLoaded = ref(false);

// set the preferred theme
const colorMode = useColorMode();
const colorLoaded = ref(false);
watch(colorMode, (mode) => {
  if (mode.preference == mode.value) {
    colorLoaded.value = true;
  }
});

// prepare the presentation data once the theme is set
let $data;
const dataLoaded = ref(false);
watch([colorLoaded], () => {
  if (sceneLoaded.value & colorLoaded.value) {
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

onMounted(async () => {
  // load the scene here as it needs the DOM for its canvas
  const canvas = document.getElementById("scene-container");
  if (canvas != null) {
    $scene = useScene(canvas);
    gsap.ticker.add((time, deltaTime, frame) => {
      $scene.tick(time, deltaTime, frame);
    });

    $sun = await useSun($scene.scene);
    await useNaturalGlobe($scene.scene, $sun.light, vAtmos, fAtmos);
    sceneLoaded.value = true;
  }

  // load objects here (when data is loaded) as some need the DOM anyways
  const objectsLoaded = ref(false);
  watch(dataLoaded, () => {
    if (dataLoaded.value) {
      const $globe = useDigitalGlobe([
        daisyuiColors["[data-theme=" + colorMode.value + "]"].primary,
        daisyuiColors["[data-theme=" + colorMode.value + "]"].secondary,
      ]);
      const $edges = useEdges($data.edges, $scene.bloom);
      const $satellites = useSatellites($data.satellites);

      watch([$edges.loaded, $satellites.loaded, $globe.loaded], () => {
        if ($edges.loaded.value && $satellites.loaded.value && $globe.loaded.value) {
          $scene.scene.add($globe.mesh);
          $scene.scene.add($edges.mesh);
          $scene.bloom.selection.add($edges.mesh);
          $scene.scene.add($satellites.mesh);
          objectsLoaded.value = true;
        }
      });
    }
  });
});
</script>
