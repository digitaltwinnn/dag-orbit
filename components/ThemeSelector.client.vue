<script setup lang="ts">
import type { Theme } from "daisyui";

const colorMode = useColorMode();
const setTheme = (theme: Theme) => {
  colorMode.preference = theme;
  colorMode.value = theme;
};

const themes: Theme[] = [
  <Theme>"system",
  <Theme>"light",
  <Theme>"dark",
  <Theme>"cupcake",
  <Theme>"bumblebee",
  <Theme>"emerald",
  <Theme>"corporate",
  <Theme>"synthwave",
  <Theme>"retro",
  <Theme>"cyberpunk",
  <Theme>"valentine",
  <Theme>"halloween",
  <Theme>"garden",
  <Theme>"forest",
  <Theme>"aqua",
  <Theme>"lofi",
  <Theme>"pastel",
  <Theme>"fantasy",
  <Theme>"wireframe",
  <Theme>"black",
  <Theme>"luxury",
  <Theme>"dracula",
  <Theme>"cmyk",
  <Theme>"autumn",
  <Theme>"business",
  <Theme>"acid",
  <Theme>"lemonade",
  <Theme>"night",
  <Theme>"coffee",
  <Theme>"winter",
  <Theme>"dim",
  <Theme>"nord",
  <Theme>"sunset",
];
</script>

<template>
  <div class="dropdown dropdown-end">
    <label tabindex="0" class="btn btn-ghost">{{ colorMode.value }}</label>
    <ul tabindex="0" class="menu dropdown-content p-2 shadow bg-neutral border-2 border-primary rounded-box">
      <li v-for="theme of themes" :key="theme" class="w-44">
        <button @click="setTheme(theme)" class="btn-ghost overflow-hidden rounded-lg text-left pt-0 pb-0">
          {{ theme }}
        </button>
      </li>
    </ul>
  </div>
</template>
