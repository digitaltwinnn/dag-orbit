<script setup lang="ts">
import { gsap } from "gsap";
import {
  Color,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Scene,
  SphereGeometry,
  TextureLoader,
} from "three";
import vAtmos from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmos from "~/assets/shaders/atmosphere/fragment.glsl?raw";

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");

const settings = {
  radius: 100,
  atmosphereColor: new Color("#54a6ef"),
};

onMounted(() => {
  const globe: Mesh = new Mesh(undefined, undefined);
  globe.name = "NaturalGlobe";

  const loader = new TextureLoader();
  const $img = useImage();
  const mapImgUrl = $img("/earthmap.jpg", { width: 1536 });
  const specularImgUrl = $img("/earthspec1k.jpg", { width: 640 });
  const bumpImgUrl = $img("/earthbump10k.jpg", { width: 1536 });

  const geometry = new SphereGeometry(settings.radius, 64, 64);
  const material = new MeshPhongMaterial({
    specular: 0x333333,
    shininess: 9,
    map: loader.load(mapImgUrl),
    specularMap: loader.load(specularImgUrl),
    bumpMap: loader.load(bumpImgUrl),
    bumpScale: 1,
    transparent: true,
  });

  globe.geometry = geometry;
  globe.material = material;
  scene.add(globe);

  // Sun
  const $sun = useSun(globe);

  // Atmosphere
  useAtmosphere(globe, $sun.light, vAtmos, fAtmos, settings.atmosphereColor);

  const animate = () => {
    gsap.to(globe.rotation, {
      y: MathUtils.degToRad(360),
      duration: 60,
      repeat: -1,
      ease: "linear",
    });
  };
  animate();
});
</script>

<template></template>
