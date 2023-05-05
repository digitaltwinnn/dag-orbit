export default defineNuxtConfig({
  vite: { define: { "process.env.TESS_ENV": process.env.ENV } },
  build: {
    transpile: ["three", "postprocessing", "gsap", "@theatre/core"],
  },
  modules: ["@nuxt/image-edge", "@nuxtjs/tailwindcss"],
  runtimeConfig: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
});
