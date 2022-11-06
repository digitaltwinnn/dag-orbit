<template>
    <div>
        <div id="stats" class="absolute top-0 right-0 m-4" />
        <canvas ref="threejsCanvas"></canvas>
    </div>
</template>

<script>
import { AppRenderer } from "../components/threejs/AppRenderer"
import { AppCamera } from "../components/threejs/AppCamera"
import { AppScene } from "../components/threejs/AppScene"
import { AnimationLoop } from "../components/threejs/AnimationLoop"

import { NaturalGlobe } from "../components/threejs/NaturalGlobe";
import { Sun } from "~~/components/threejs/Sun";
import { Atmosphere } from "~~/components/threejs/Atmosphere";

import vAtmosphere from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmosphere from "~/assets/shaders/atmosphere/fragment.glsl?raw";

export default {
    mounted() {
        // setup the threejs renderer, camera and scene
        const appRenderer = new AppRenderer(this.$refs.threejsCanvas);
        const appCam = new AppCamera(innerWidth, innerHeight, appRenderer);
        const appScene = new AppScene(appRenderer, appCam);

        // Add meshes to the scene
        const naturalGlobe = new NaturalGlobe(appScene);

        // Add sun
        const sun = new Sun(appScene);
        sun.get().position.set(1000, 0, 1000)

        // Add atmosphere
        const atmosphere = new Atmosphere(appScene, sun, vAtmosphere, fAtmosphere);

        // Start scene animation
        const animationLoop = new AnimationLoop(appScene, appCam);

        // move the camera
        //   appCam.toGlobeView();
    }
}
</script>