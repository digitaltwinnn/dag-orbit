<script setup lang="ts">
import { Chart, type ChartItem } from "chart.js/auto";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
const dataset = [12, 19, 3, 5, 2, 30];

onMounted(() => {
  const ctx = document.getElementById(props.id);
  if (ctx) {
    new Chart(ctx as ChartItem, {
      type: "bar",
      data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
          {
            label: "# of Votes",
            data: dataset,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
});
</script>

<template>
  <div>
    <canvas :id="id"></canvas>
  </div>
</template>
