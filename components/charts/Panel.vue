<script setup lang="ts">
let colors = inject(colorKey, ref([""]));
</script>

<template>
  <div class="flow-row items-center justify-center">
    <div
      id="left-wall"
      class="grid grid-cols-2 grid-rows-2 gap-4 bg-primary border-2 border-secondary rounded-box"
    >
      <ChartsBarExample id="bar1" :colors="colors" :static="false" />
      <ChartsBarExample id="bar2" :colors="colors" :static="true" />
      <ChartsBarExample id="bar3" :colors="colors" :static="true" />
      <ChartsBarExample id="bar4" :colors="colors" :static="true" />
    </div>
    <div
      id="right-wall"
      class="grid grid-cols-2 grid-rows-2 gap-4 bg-secondary border-2 border-primary rounded-box"
    >
      <ChartsBarExample id="bar5" :colors="colors.slice().reverse()" :static="true" />
      <ChartsBarExample id="bar6" :colors="colors.slice().reverse()" :static="true" />
      <ChartsBarExample id="bar7" :colors="colors.slice().reverse()" :static="true" />
      <ChartsBarExample id="bar8" :colors="colors.slice().reverse()" :static="false" />
    </div>
  </div>
</template>
