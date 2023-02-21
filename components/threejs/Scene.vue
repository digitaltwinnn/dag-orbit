<template>
  <div>
    <div id="stats" class="absolute top-0 right-0 m-4" />
    <div id="scene-container" class="overflow-x-hidden"></div>
  </div>
</template>

<script>
import { AppRenderer } from "../../threejs/AppRenderer";
import { AppCamera } from "../../threejs/AppCamera";
import { AppScene } from "../../threejs/AppScene";
import { AnimationLoop } from "../../threejs/AnimationLoop";

import { DigitalGlobe } from "../../threejs/DigitalGlobe";
import { NaturalGlobe } from "../../threejs/NaturalGlobe";
import { Sun } from "../../threejs/Sun";

import vAtmosphere from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmosphere from "~/assets/shaders/atmosphere/fragment.glsl?raw";

export default {
  mounted() {
    const el = document.getElementById("scene-container");
    if (el != null) {
      // setup the threejs renderer, camera, scene and (sun)light
      this.appRenderer = markRaw(new AppRenderer(el));
      this.appCam = markRaw(new AppCamera(innerWidth, innerHeight, this.appRenderer));
      this.appScene = markRaw(new AppScene(this.appRenderer, this.appCam));
      this.sun = markRaw(new Sun(this.appScene));
      this.sun.get().position.set(1000, 0, 1000)
      //window.addEventListener("resize", this.onWindowResize, false);

      // add meshes to the scene
      this.digitalGlobe = markRaw(new DigitalGlobe(this.appScene));
      this.naturalGlobe = markRaw(new NaturalGlobe(this.appScene, this.sun, vAtmosphere, fAtmosphere));

      getNodes().then((nodes) => { console.log(nodes) });

      // setup animation loop
      this.animationLoop = markRaw(new AnimationLoop(this.appScene, this.appCam));

      // move the camera
      //   appCam.toGlobeView();
    }
  },
  data() {
    return {
      appRenderer: AppRenderer,
      appCam: AppCamera,
      appScene: AppScene,
      naturalGlobe: NaturalGlobe,
      digitalGlobe: DigitalGlobe,
      sun: Sun,
      animationLoop: AnimationLoop
    }
  }
}

async function getNodes() {
  const nodes = await $fetch("/api/nodes");
  return nodes;
}

</script>