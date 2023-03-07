<template>
  <div>
    <div id="stats" />
    <div id="scene-container" class="overflow-x-hidden"></div>
  </div>
</template>

<script>
import { AppRenderer } from "../../threejs/scene/AppRenderer";
import { AppCamera } from "../../threejs/scene/AppCamera";
import { AppScene } from "../../threejs/scene/AppScene";
import { AppTheatre } from "../../threejs/scene/AppTheatre";
import { AnimationLoop } from "../../threejs/scene/AnimationLoop";

import { DigitalGlobe } from "../../threejs/globe/DigitalGlobe";
import { NaturalGlobe } from "../../threejs/globe/NaturalGlobe";
import { Sun } from "../../threejs/globe/Sun";
import { Cluster } from "~~/threejs/cluster/l0/Cluster";

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
      this.sun = markRaw(new Sun(this.appScene));
      this.sun.get().position.set(1000, 0, 1000)
      //window.addEventListener("resize", this.onWindowResize, false);

      // add meshes to the scene
      this.digitalGlobe = markRaw(new DigitalGlobe(this.appScene));
      this.naturalGlobe = markRaw(new NaturalGlobe(this.appScene, this.sun, vAtmosphere, fAtmosphere));
      this.cluster = markRaw(new Cluster(this.appScene));

      // setup animation frame loop, TODO: refactor this
      this.animationLoop = markRaw(new AnimationLoop(
        this.appScene,
        this.appCam,
        this.cluster)
      );
      const tick = (time, deltaTime, frame) => {
        this.animationLoop.tick(time, deltaTime, frame);
      };
      gsap.ticker.add(tick);

      // setup the animation sequences
      this.appTheatre = markRaw(new AppTheatre(
        this.animationLoop,
        this.appCam,
        this.appScene,
        this.sun,
        this.naturalGlobe,
        this.digitalGlobe,
        this.cluster));
    }
  },
  data() {
    return {
      appRenderer: AppRenderer,
      appCam: AppCamera,
      appScene: AppScene,
      appTheatre: AppTheatre,
      naturalGlobe: NaturalGlobe,
      digitalGlobe: DigitalGlobe,
      sun: Sun,
      cluster: Cluster,
      animationLoop: AnimationLoop,
    }
  }
}

</script>