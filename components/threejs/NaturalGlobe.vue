<script setup lang="ts">
import { gsap } from "gsap";
import {
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  PointLight,
  SphereGeometry,
  TextureLoader,
} from "three";

const settings = {
  radius: 100,
};

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");

const globe: Mesh = new Mesh(undefined, undefined);
globe.name = "NaturalGlobe";
scene.add(globe);

const light = new PointLight(0xffffff);
light.name = "Sun";
light.position.set(1000, 0, 1000);
globe.add(light);

onMounted(() => {
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

<template>
  <div>
    <ThreejsSun :light="light" />
    <ThreejsAtmosphere :parent="globe" :light="light" />
  </div>
</template>
