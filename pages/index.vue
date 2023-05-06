<template>
    
    <div class="navbar bg-base-100 fixed z-10">
        <div class="flex-none">
            <label for="my-drawer" class="btn drawer-button btn-ghost">
                <Bars3Icon class="h-6 w-6" />
            </label>
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
    <div class="drawer">
        <input id="my-drawer" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
            <ThreejsScene class="hero min-h-screen bg-base-200">
                <div class="hero-content flex-col lg:flex-row">
                    <div class="w-2/6" />
                    <div>
                        <h1 class="text-5xl font-bold">Constellation Network Explorer 3D!</h1>
                        <p class="py-6">A community driven initiative to try out visualisations that explore the different
                            concepts that define the Constellation Hypergraph and Metagraphs.</p>
                        <button class="btn btn-primary">Get Started</button>
                    </div>
                </div>
            </ThreejsScene>
        </div>
        <div class="drawer-side">
            <label for="my-drawer" class="drawer-overlay"></label>
            <ul class="menu p-4 w-80 bg-base-100 text-base-content mt-20">
                <li><a>Act 1</a></li>
                <li><a>Act 2</a></li>
            </ul>
        </div>
    </div>
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
</script>