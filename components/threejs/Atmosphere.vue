<script setup lang="ts">
import {
  SphereGeometry,
  Uniform,
  Vector3,
  ShaderMaterial,
  FrontSide,
  Mesh,
  Color,
  Object3D,
  PointLight,
} from "three";
import vertex from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fragment from "~/assets/shaders/atmosphere/fragment.glsl?raw";

const props = defineProps({
  parent: {
    type: Object3D,
    required: true,
  },
  /* TODO
  light: {
    type: PointLight,
    required: true,
  },
  */
});

const settings = {
  innerRadius: 101,
  outerRadius: 104,
  color: new Color("#54a6ef"),
};

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");

// TODO use the sun (from parent component)
const light = new PointLight(0xffffff);
light.name = "Sun";
light.intensity = 1;
light.position.set(1000, 0, 1000);

const atmosphereGeometry = new SphereGeometry(settings.outerRadius, 64, 64);
const uniforms = {
  earthCenter: new Uniform(props.parent.position),
  earthRadius: new Uniform(settings.innerRadius),
  atmosphereRadius: new Uniform(settings.outerRadius),
  atmosphereColor: new Uniform(new Vector3().setFromColor(settings.color)),
  lightDirection: new Uniform(light.position),
};
const atmosphereMaterial = new ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertex,
  fragmentShader: fragment,
  side: FrontSide,
  transparent: true,
});

const atmos = new Mesh(atmosphereGeometry, atmosphereMaterial);
atmos.name = "Atmosphere";
props.parent.add(atmos);

onMounted(() => {});
</script>

<template>
  <div></div>
</template>
