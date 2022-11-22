import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  build: {
    transpile: [
      "three",
      "postprocessing",
      "d3-geo",
      "@tweenjs/tween.js",
      "gsap",
    ],
  },
  modules: ["@nuxt/image-edge", "@nuxtjs/tailwindcss"],
  runtimeConfig: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  nitro: {
    plugins: ["@/server/db/index.ts"],
  },
});
