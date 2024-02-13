<script setup lang="ts">
import { Chart, type ChartItem } from "chart.js/auto";
import { gsap } from "gsap";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
const data = [12, 19, 3, 5, 2, 30];

onMounted(() => {
  const ctx = document.getElementById(props.id);
  if (ctx) {
    const exampleChart = new Chart(ctx as ChartItem, {
      type: "bar",
      data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
          {
            label: "# of Votes",
            data: data,
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

    // dummy data
    const updateData = () => {
      exampleChart.data.datasets.forEach((dataset, index) => {
        dataset.data = data.map(() => Math.floor(Math.random() * 51));
      });

      exampleChart.update();
    };

    let dummy = { value: 0 };
    gsap.to(dummy, {
      value: 1,
      duration: 1,
      repeat: -1,
      repeatDelay: 0,
      onRepeat: updateData,
      ease: "none",
    });
  }
});
</script>

<template>
  <div>
    <canvas :id="id"></canvas>
  </div>
</template>
