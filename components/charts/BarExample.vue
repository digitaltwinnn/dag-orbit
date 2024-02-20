<script setup lang="ts">
import { Chart, type ChartItem } from "chart.js/auto";
import { gsap } from "gsap";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  colors: {
    type: Array<string>,
    required: true,
  },
  static: {
    type: Boolean,
    default: false,
  },
});
const data = [12, 19, 3, 5, 2, 30];
let chart: Chart;
const loaded = ref(false);
let canvas: HTMLCanvasElement;
let image: HTMLImageElement;

const imageId = "imageId" + props.id;

watch(
  () => props.colors,
  () => {
    if (loaded.value) {
      if (!props.static) {
        chart.data.datasets[0].backgroundColor = props.colors[0];
        chart.data.datasets[0].borderColor = props.colors[1];
        chart.update();
      } else {
        const temp = document.createElement("canvas") as HTMLCanvasElement;
        temp.width = image.width;
        temp.height = image.height;
        createChart(temp).then((newChart) => {
          chart = newChart;
          image.src = chart.toBase64Image();
          chart.destroy();
          temp.remove();
        });
      }
    } else {
      console.error("unable to update with loaded: ", loaded.value);
    }
  }
);

/**
 * Creates a chart on the given canvas element.
 * @param {HTMLCanvasElement} canvas - The canvas element to create the chart on.
 * @returns {Promise<Chart>} A promise that resolves to the created chart.
 */
const createChart = (canvas: HTMLCanvasElement): Promise<Chart> => {
  if (!canvas) return Promise.reject("No canvas element found");

  return new Promise((resolve, reject) => {
    new Chart(canvas as ChartItem, {
      type: "bar",
      data: {
        labels: ["a", "b", "c", "d", "e", "f"],
        datasets: [
          {
            label: "count",
            data: data,
            borderWidth: 1,
            backgroundColor: props.colors[0],
            borderColor: props.colors[1],
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        responsive: false,
        animation: {
          onComplete: function () {
            resolve(this);
          },
        },
      },
    });
  });
};

/**
 * Generates dummy data for the chart.
 *
 * @returns {Array} The generated dummy data.
 */
const generateDummyData = () => {
  const update = () => {
    chart.data.datasets.forEach((dataset, index) => {
      dataset.data = data.map(() => Math.floor(Math.random() * 51));
    });
    chart.update();
    image.remove();
  };

  let dummy = { value: 0 };
  gsap.to(dummy, {
    value: 1,
    duration: 2,
    repeat: -1,
    repeatDelay: 0,
    onRepeat: update,
    ease: "none",
  });
};

onMounted(() => {
  canvas = document.getElementById(props.id) as HTMLCanvasElement;
  image = document.getElementById(imageId) as HTMLImageElement;

  createChart(canvas)
    .then((newChart) => {
      chart = newChart;
      loaded.value = true;
      if (props.static) {
        image.width = chart.width;
        image.height = chart.height;
        image.src = chart.toBase64Image();
        chart.destroy();
        canvas.remove();
      } else {
        generateDummyData();
      }
    })
    .catch((err) => {
      console.error(err);
    });
});
</script>

<template>
  <div class="p-2">
    <img :id="imageId" class="pointer-events-auto w-[200px] h-[100px]" />
    <canvas :id="id" class="pointer-events-auto w-[200px] h-[100px]"></canvas>
  </div>
</template>
