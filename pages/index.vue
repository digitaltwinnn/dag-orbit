<template>
    <div>
        <threejsScene ref="threejs" class="background" />
        <div class="panel-0">
            <div class="w-64 h-64 bg-green-700"></div>
        </div>
        <div class="panel-1">
            <div class="h-full text-blue-700 text-9xl test1">
                HELLO WORLD
            </div>
        </div>
        <div class="panel-2">
            <div class="h-full">
                <div class="w-64 h-64 bg-blue-500 test2"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default {
    mounted() {
        gsap.registerPlugin(ScrollTrigger);

        gsap.from(".test1", {
            opacity: 0,
            scrollTrigger: {
                trigger: ".panel-1",
                scrub: 0.6,
                markers: true
            },
        })

        gsap.to(this.$refs.threejs.appScene.get().background, {
            duration: 6, r: 0, g: 0, b: 0,
            scrollTrigger: {
                trigger: ".panel-1",
                scrub: 0.6,
                markers: true
            }
        });

        gsap.to(this.$refs.threejs.naturalGlobe.get().position, {
            x: -200, y: -200, z: -200,
            scrollTrigger: {
                trigger: ".panel-1",
                scrub: 0.6,
                markers: true
            }
        });
        gsap.to(this.$refs.threejs.digitalGlobe.get().position, {
            x: 200, y: 200, z: 200,
            scrollTrigger: {
                trigger: ".panel-1",
                scrub: 0.6,
                markers: true
            }
        });

        gsap.to(".test2", {
            scrollTrigger: {
                trigger: ".panel-2",
                scrub: 0.6,
                markers: true
            },
            rotation: 360,
            transformOrigin: "center center",
        })

        getNodes().then((nodes) => {
            this.$refs.threejs.cluster.refresh(nodes);
        });
    }
}

async function getNodes() {
    const nodes = await $fetch("/api/nodes");
    return nodes;
}
</script>

<style>
.background {
    @apply fixed w-full h-screen bg-blue-900;
}

div[class^="panel-"] {
    @apply w-full h-screen;
}
</style>