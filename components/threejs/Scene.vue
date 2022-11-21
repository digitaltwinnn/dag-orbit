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
      this.appRenderer = markRaw(new AppRenderer(el));
      this.appCam = markRaw(new AppCamera(innerWidth, innerHeight, this.appRenderer));
      this.appScene = markRaw(new AppScene(this.appRenderer, this.appCam));
      //window.addEventListener("resize", this.onWindowResize, false);

      // Add meshes to the scene
      this.naturalGlobe = markRaw(new NaturalGlobe(this.appScene));
      this.sun = markRaw(new Sun(this.appScene));
      this.sun.get().position.set(1000, 0, 1000)
      this.atmosphere = markRaw(new Atmosphere(this.appScene, this.sun, vAtmosphere, fAtmosphere));
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
      sun: Sun,
      atmosphere: Atmosphere,
      animationLoop: AnimationLoop
    }
  }
}
</script>