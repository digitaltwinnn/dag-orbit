<template>
    <div>
        <threejsScene class="w-full h-screen bg-gray-700 panel-1" />
        <div class="w-full h-screen bg-gray-600 panel-2">
            <div class="w-64 h-64 bg-purple-500 test"></div>
        </div>
    </div>
</template>

<script>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default {
    mounted() {
        gsap.registerPlugin(ScrollTrigger);
        gsap.to(".test", {
            scrollTrigger: {
                trigger: ".panel-2",
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