<template>
    <canvas ref="threejsCanvas"></canvas>
</template>

<script>
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    SphereGeometry,
    MeshBasicMaterial,
} from "three";
import { DigitalGlobe } from "../components/threejs/DigitalGlobe";
import { AppCamera } from "../components/threejs/AppCamera"
import { AppScene } from "../components/threejs/AppScene"
import { AnimationLoop } from "../components/threejs/AnimationLoop"

export default {
    mounted() {
        // setup a webgl renderer
        const renderer = new WebGLRenderer({
            canvas: this.$refs.threejsCanvas,
        });
        renderer.setSize(innerWidth, innerHeight);
        document.body.appendChild(renderer.domElement);

        // setup the camera and the scene
        const appCam = new AppCamera(innerWidth, innerHeight, renderer);
        const appScene = new AppScene(renderer, appCam.get());

        // Create meshes in the scene
        const digitalGlobe = new DigitalGlobe();
        appScene.get().add(digitalGlobe.innerGlobe);

        // Start animation
        const animationLoop = new AnimationLoop(appScene, appCam);
        //  animationLoop.members.push(digitalGlobe);
        animationLoop.start();

        appCam.toGlobeView()
    }
}
</script>