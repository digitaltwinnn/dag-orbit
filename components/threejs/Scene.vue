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

const isLoading = ref(true);
const emit = defineEmits(["loaded"]);

const load = async (el) => {
  const { scene, bloom, tick } = await useScene(el);
  gsap.ticker.add((time, deltaTime, frame) => {
    tick(time, deltaTime, frame);
  });

  const { light } = await useSun(scene);
  await useNaturalGlobe(scene, light, vAtmos, fAtmos);
  await useDigitalGlobe(scene);
  await useCluster(scene, bloom, "/api/nodes");

  isLoading.value = false;
  emit("loaded", true);
}

onMounted(() => {
  const el = document.getElementById("scene-container");
  if (el != null) {
    load(el);
  }
});
</script>
