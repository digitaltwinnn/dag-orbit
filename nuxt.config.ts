export default defineNuxtConfig({
  devtools: { enabled: true },
  vite: {
    define: { "process.env.TESS_ENV": process.env.ENV },
  },
  build: {
    transpile: ["three", "postprocessing", "gsap"],
  },
  modules: ["@nuxt/image", "@nuxtjs/tailwindcss", "@nuxtjs/color-mode"],
  colorMode: {
    preference: "system",
    dataValue: "theme",
    classSuffix: "",
  },
  runtimeConfig: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
});
