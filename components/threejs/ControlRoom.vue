<script setup lang="ts">
import {
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RectAreaLight,
} from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

RectAreaLightUniformsLib.init();

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");
watch(colors, () => changeColor(colors.value));

const room = new Group();
room.rotation.y = MathUtils.degToRad(45);
room.scale.set(1.2, 1.2, 1.2);
room.position.y = -150;
room.name = "Room";
scene.add(room);

const floorMaterial = new MeshStandardMaterial({
  color: "#bcc6cc",
  metalness: 0.8,
  roughness: 0.2,
  side: DoubleSide,
});

const wallMaterial = new MeshStandardMaterial({
  color: colors.value[1],
  transparent: true,
  opacity: 0.1,
  metalness: 0.9,
  roughness: 0.7,
  side: DoubleSide,
});

// Floor
const floorGeometry = new PlaneGeometry(500, 500);
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.name = "Floor";
room.add(floor);

// left wall
const leftWallGeometry = new PlaneGeometry(500, 350);
const leftWall = new Mesh(leftWallGeometry, wallMaterial);
leftWall.position.z = -250;
leftWall.position.y = 175;
leftWall.name = "LeftWall";
room.add(leftWall);

const leftLight = new RectAreaLight(colors.value[0], 1, 500, 350);
leftLight.position.z = -251;
leftLight.position.y = 176;
leftLight.rotation.y = -Math.PI;
leftLight.name = "LeftLight";
room.add(leftLight);

// Right wall
const rightWallGeometry = new PlaneGeometry(500, 350);
const rightWall = new Mesh(rightWallGeometry, wallMaterial);
rightWall.position.x = 250;
rightWall.position.y = 175;
rightWall.rotation.y = Math.PI / 2;
rightWall.name = "RightWall";
room.add(rightWall);

const rightLight = new RectAreaLight(colors.value[1], 1, 500, 350);
rightLight.position.x = 251;
rightLight.position.y = 176;
rightLight.rotation.y = Math.PI / 2;
rightLight.name = "RightLight";
room.add(rightLight);

const changeColor = (newColors: string[]) => {
  wallMaterial.color.set(newColors[1]);
  leftLight.color.set(newColors[0]);
  rightLight.color.set(newColors[1]);
};

onMounted(() => {
  const leftCharts = document.getElementById("left-charts");
  const rightCharts = document.getElementById("right-charts");
  if (!leftCharts || !rightCharts) throw new Error("Chart elements not found");

  const left = new CSS3DObject(leftCharts);
  left.position.z = -230;
  left.position.y = 160;
  left.name = "LeftCharts";
  room.add(left);

  const right = new CSS3DObject(rightCharts);
  right.position.x = 230;
  right.position.y = 160;
  right.rotation.y = -Math.PI / 2;
  right.name = "RightCharts";
  room.add(right);

  const $theatre = useTheatre();
  $theatre.registration.registerControlRoom(room);
});
</script>

<template>
  <div class="flow-row items-center justify-center">
    <div
      id="left-charts"
      class="grid grid-cols-2 grid-rows-2 gap-4 bg-primary border-2 border-secondary rounded-box"
    >
      <ChartsBarExample id="bar1" :colors="colors" :static="false" />
      <ChartsBarExample id="bar2" :colors="colors" :static="true" />
      <ChartsBarExample id="bar3" :colors="colors" :static="true" />
      <ChartsBarExample id="bar4" :colors="colors" :static="true" />
    </div>
    <div
      id="right-charts"
      class="grid grid-cols-2 grid-rows-2 gap-4 bg-secondary border-2 border-primary rounded-box"
    >
      <ChartsBarExample id="bar5" :colors="colors.slice().reverse()" :static="true" />
      <ChartsBarExample id="bar6" :colors="colors.slice().reverse()" :static="true" />
      <ChartsBarExample id="bar7" :colors="colors.slice().reverse()" :static="true" />
      <ChartsBarExample id="bar8" :colors="colors.slice().reverse()" :static="false" />
    </div>
  </div>
</template>
