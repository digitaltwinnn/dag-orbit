<template>
    <div class="h-screen">
        <div id="stats" class="absolute top-0 right-0 m-4" />
        <div class="box box1 bg-green-500 w-64 h-64"></div>
        <div class="box box2 bg-orange-500 w-64 h-64"></div>
        <div class="box box3 bg-gray-500 w-64 h-64"></div>
    </div>
    <div class="h-screen bg-blue-300">
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

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger"; 

export default {
    mounted() {
        /*
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
        */

        gsap.registerPlugin(ScrollTrigger);
        const tl = gsap.timeline();
        //sequenced one-after-the-other

        gsap.to(".box3", {
            scrollTrigger: {
                trigger: ".box3",
               // start: "top 90%",
             //   end: "top 10%",
                scrub: 0.6,
                markers: true
            },
            rotation: 360,
            transformOrigin: "center center",
            ease: "Power2.easeInOut"
        })
    }
}
</script>