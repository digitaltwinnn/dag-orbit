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

import { NaturalGlobe } from "../../threejs/NaturalGlobe";
import { Sun } from "../../threejs/Sun";
import { Atmosphere } from "../../threejs/Atmosphere";

import vAtmosphere from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmosphere from "~/assets/shaders/atmosphere/fragment.glsl?raw";

export default {
  mounted() {
    const el = document.getElementById("scene-container");
    if (el != null) {
      // setup the threejs renderer, camera and scene
      const appRenderer = new AppRenderer(el);
      const appCam = new AppCamera(innerWidth, innerHeight, appRenderer);
      const appScene = new AppScene(appRenderer, appCam);
      //window.addEventListener("resize", this.onWindowResize, false);

      // Add meshes to the scene
      const naturalGlobe = new NaturalGlobe(appScene);
      const sun = new Sun(appScene);
      sun.get().position.set(1000, 0, 1000)
      const atmosphere = new Atmosphere(appScene, sun, vAtmosphere, fAtmosphere);
      const animationLoop = new AnimationLoop(appScene, appCam);

      // move the camera
      //   appCam.toGlobeView();
    }
  },
  data() {
    return {
      count: 0
    }
  }
}
</script>