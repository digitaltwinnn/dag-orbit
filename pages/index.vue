<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

onMounted(() => {
  gsap.to("#box-1", {
    scrollTrigger: {
      trigger: "#panel-1",
      scrub: 0.6,
      markers: {
        fontWeight: "bold",
      },
    },
    rotation: 360,
    transformOrigin: "center center",
  });
});
</script>

<template>
  <SpeedInsights />
  <NavBar class="bg-transparent text-neutral-content fixed top-0 z-20" />
  <div class="bg-transparent w-screen h-screen fixed top-0 z-10">
    <Scene />
  </div>
  <div class="drawer">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col overflow-hidden">
      <div id="panel-0" class="bg-neutral w-screen h-screen"></div>
      <div id="panel-1" class="bg-primary h-screen">
        <div class="text-primary-content text-9xl text-right">#1</div>
        <div id="box-1" class="w-64 h-64 bg-accent"></div>
      </div>
      <div id="panel-2" class="bg-neutral h-screen z-10">
        <div class="text-neutral-content text-9xl text-right">#2</div>
        <div class="flex flex-row m-8 h-full text-9xl text-center">
          <div class="bg-primary text-primary-content flex-grow">A</div>
          <div class="bg-secondary text-secondary-content flex-grow">B</div>
          <div class="bg-accent text-accent-content flex-grow">C</div>
        </div>
      </div>
    </div>
    <div class="drawer-side z-20">
      <SideBar />
    </div>
  </div>
</template>
