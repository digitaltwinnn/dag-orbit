<template>
  <NavBar />
  <div class="drawer">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col" style="overflow-y: hidden">
      <div id="panel-0" class="bg-primary h-screen">
        <Scene class="bg-primary-focus m-16" />
      </div>
      <div id="panel-1" class="bg-secondary h-screen">
        <div class="text-secondary-content text-9xl text-right">#1</div>
        <div id="box-1" class="w-64 h-64 bg-accent"></div>
      </div>
      <div id="panel-2" class="bg-neutral h-screen">
        <div class="text-neutral-content text-9xl text-right">#2</div>
        <div class="flex flex-row m-8 h-full text-9xl text-center">
          <div class="bg-primary text-primary-content flex-grow">A</div>
          <div class="bg-secondary text-secondary-content flex-grow">B</div>
          <div class="bg-accent text-accent-content flex-grow">C</div>
        </div>
      </div>
    </div>
    <div class="drawer-side">
      <SideBar />
    </div>
  </div>
</template>

<script setup>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger);
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
  })
})
</script>