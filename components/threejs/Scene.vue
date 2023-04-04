<template>
  <div>
    <div id="stats" class="absolute bottom-0 right-0 m-4" />
    <div id="scene-container" class="overflow-x-hidden"></div>
  </div>
</template>

<script>
import { AppRenderer } from "../../threejs/scene/AppRenderer";
import { AppCamera } from "../../threejs/scene/AppCamera";
import { AppScene } from "../../threejs/scene/AppScene";
import { AppTheatre } from "../../threejs/scene/AppTheatre";

import vAtmosphere from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmosphere from "~/assets/shaders/atmosphere/fragment.glsl?raw";

import { gsap } from "gsap";

export default {
  mounted() {
    const el = document.getElementById("scene-container");
    if (el != null) {
      // setup the threejs renderer, camera, scene and (sun)light
      this.appRenderer = markRaw(new AppRenderer(el));
      this.appCam = markRaw(new AppCamera(innerWidth, innerHeight, this.appRenderer));
      this.appScene = markRaw(new AppScene(this.appRenderer, this.appCam));
      useSun().init(this.appScene);

      // setup a global animation loop using gsap
      gsap.ticker.add((time, deltaTime, frame) => {
        this.appScene.tick(time, deltaTime, frame);
      });

      //window.addEventListener("resize", this.onWindowResize, false);

      // add meshes to the scene
      useDigitalGlobe().init(this.appScene);
      useNaturalGlobe().init(this.appScene, vAtmosphere, fAtmosphere);
      useCluster(this.appScene, "/api/nodes");

      // setup the animation sequences
      this.appTheatre = markRaw(new AppTheatre(this.appCam, this.appScene));
    }
  },
  data() {
    return {
      appRenderer: AppRenderer,
      appCam: AppCamera,
      appScene: AppScene,
      appTheatre: AppTheatre,
    }
  }
}

</script>