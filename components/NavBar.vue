<template>
    <div class="navbar sticky top-0 z-10 bg-base-100">
        <div class="flex-none">
            <label for="my-drawer" class="btn drawer-button btn-ghost">
                <Bars3Icon class="h-6 w-6" />
            </label>
        </div>
        <div class="flex-1">
            <a class="btn btn-ghost normal-case text-xl text-base-content">DAG Orbit</a>
        </div>
        <div class="flex-none">
            <select class="select w-full max-w-xs" v-model="colorMode.preference">
                <option disabled selected>Theme</option>
                <option v-for="theme of themes" :key="theme">{{ theme }}</option>
            </select>
        </div>
    </div>
</template>

<script setup>
import { Bars3Icon } from "@heroicons/vue/24/solid";

const colorMode = useColorMode();
const themes = [
    "system",
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
];
</script>