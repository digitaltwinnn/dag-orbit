<template>
    <div class="navbar bg-base-100">
        <div class="flex-none">
            <button class="btn btn-square btn-ghost">
                <Bars3Icon class="h-6 w-6" />
            </button>
        </div>
        <div class="flex-1">
            <a class="btn btn-ghost normal-case text-xl">DAG Orbit</a>
        </div>
        <div class="flex-none">
            <select class="select w-full max-w-xs" v-model="colorMode.preference">
                <option disabled selected>Theme</option>
                <option v-for="theme of themes" :key="theme">{{ theme }}</option>
            </select>
        </div>
    </div>
    <threejsScene class="hero min-h-screen bg-base-200">
        <div class="hero-content flex-col lg:flex-row">
            <div class="w-2/6" />
            <div>
                <h1 class="text-5xl font-bold">Constellation Network Explorer 3D!</h1>
                <p class="py-6">A community driven initiative to try out visualisations and to explore the different
                    concepts that define the Constellation Hypergraph.</p>
                <button class="btn btn-primary">Get Started</button>
            </div>
        </div>
    </threejsScene>
</template>


<script setup>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bars3Icon } from "@heroicons/vue/24/solid"

const colorMode = useColorMode();
const themes = [
    'system',
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter',
];

onMounted(async () => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".test1", {
        opacity: 0,
        scrollTrigger: {
            trigger: ".panel-1",
            scrub: 0.6,
            markers: true
        },
    })
    gsap.to(".test2", {
        scrollTrigger: {
            trigger: ".panel-2",
            scrub: 0.6,
            markers: true
        },
        rotation: 360,
        transformOrigin: "center center",
    })
})
</script>