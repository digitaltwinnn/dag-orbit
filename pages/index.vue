<template>
    <canvas ref="threejsCanvas"></canvas>
</template>

<script>
import { DigitalGlobe } from "../components/threejs/DigitalGlobe";
import { AppRenderer } from "../components/threejs/AppRenderer"
import { AppCamera } from "../components/threejs/AppCamera"
import { AppScene } from "../components/threejs/AppScene"
import { AnimationLoop } from "../components/threejs/AnimationLoop"

export default {
    mounted() {
        // setup the threejs renderer, camera and scene
        const appRenderer = new AppRenderer(this.$refs.threejsCanvas);
        const appCam = new AppCamera(innerWidth, innerHeight, appRenderer);
        const appScene = new AppScene(appRenderer, appCam);

        // Add meshes to the scene
        const digitalGlobe = new DigitalGlobe(appScene);
        digitalGlobe.innerGlobe.position.set(-110, 0, 0);
        appScene.applyBloomEffect(digitalGlobe.innerGlobe);

        const digitalGlobe2 = new DigitalGlobe(appScene);
        digitalGlobe2.innerGlobe.position.set(110, 0, 0);

        // Start scene animation
        const animationLoop = new AnimationLoop(appScene, appCam);

        // move the camera
        // appCam.toGlobeView();
    }
}
</script>