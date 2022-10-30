import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  build: {
    transpile: ["three", "postprocessing", "d3-geo", "@tweenjs/tween.js"],
  },
  modules: ["@nuxt/image-edge", "@nuxtjs/tailwindcss"],
});
