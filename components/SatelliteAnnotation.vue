<script setup lang="ts">
const colors = ["#0000FF", "#00FF00", "#FF0000"];
</script>

<template>
  <div class="card card-compact w-96 bg-base-100 shadow-xl" id="annotation">
    <ChartsBarExample id="annotationBar1" :colors="colors" />
    <div class="card-body">
      <h2 class="card-title">A cluster of nodes (i.e. Satellites)</h2>
      <p>To prevent this particular visualisation to be too cluttered, nodes that are in close proximity of eachother are displayed together</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary">Click me</button>
      </div>
    </div>
  </div>
</template>
