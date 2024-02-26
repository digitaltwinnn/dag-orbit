<script setup lang="ts">
import { Color, PointLight, TextureLoader } from "three";
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare.js";

const props = defineProps({
  light: {
    type: PointLight,
    required: true,
  },
});

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");

onMounted(() => {
  const loader = new TextureLoader();
  const $img = useImage();
  const sun = loader.load($img("/sun.jpg", { width: 320 }));
  const hexagon = loader.load($img("/hexagon.jpg", { width: 320 }));
  const circle = loader.load($img("/circle.jpg", { width: 320 }));

  const blue = new Color("blue");
  const yellow = new Color("yellow");
  const purple = new Color("purple");

  const flare = new Lensflare();
  flare.addElement(new LensflareElement(sun, 500, 0, props.light.color));
  flare.addElement(new LensflareElement(circle, 75, 0.55));
  flare.addElement(new LensflareElement(hexagon, 200, 0.6));
  flare.addElement(new LensflareElement(hexagon, 400, 0.7, purple));
  flare.addElement(new LensflareElement(circle, 100, 0.72, yellow));
  flare.addElement(new LensflareElement(hexagon, 600, 0.8, blue));
  flare.addElement(new LensflareElement(circle, 125, 0.9, purple));
  props.light.add(flare);
});
</script>

<template>
  <div></div>
</template>
