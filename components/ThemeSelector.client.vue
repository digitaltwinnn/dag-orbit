<template>
  <div class="dropdown dropdown-end">
    <label tabindex="0" class="btn btn-ghost">{{ colorMode.value }}</label>
    <ul
      tabindex="0"
      class="menu dropdown-content p-2 shadow bg-neutral border-2 border-primary rounded-box"
    >
      <li v-for="theme of themes" :key="theme" class="w-44">
        <button
          @click="setTheme(theme)"
          class="btn-ghost overflow-hidden rounded-lg text-left pt-0 pb-0"
        >
          {{ theme }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
const colorMode = useColorMode();
const setTheme = (theme) => {
  colorMode.preference = theme;
  colorMode.value = theme;
};

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
