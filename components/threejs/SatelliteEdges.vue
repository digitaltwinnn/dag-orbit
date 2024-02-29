<script setup lang="ts">
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Object3D,
  Uint16BufferAttribute,
} from "three";
import { gsap } from "gsap";
import lineSegmentsWorker from "~/assets/workers/createLineSegments?worker";

const props = defineProps({
  parent: {
    type: Object3D,
    required: true,
  },
  satellites: {
    type: Array<Satellite>,
    required: true,
  },
  edges: {
    type: Array<Edge>,
    required: true,
  },
});

const settings = {
  globe: {
    radius: 120,
  },
  edge: {
    points: 30,
    animation: {
      points: 4,
      duriation: 2,
      highlight: 0.5,
    },
  },
};

let bloom = inject(bloomKey);
if (!bloom) throw new Error("Bloom effect not found");

const edges = new LineSegments(
  undefined,
  new LineBasicMaterial({ vertexColors: true, transparent: true })
);
edges.name = "SatelliteEdges";
props.parent.add(edges);

/**
 * Animate edges by moving highlighted sections back and forth across the edge nodes continueously.
 */
const animate = () => {
  const edgePoints = settings.edge.animation.points;
  let max = settings.edge.points;
  let start: number, end: number, offset: number;

  const newColor = edges.geometry.attributes.color as any;
  const originalColor = edges.geometry.attributes.color.clone();
  const highlight = settings.edge.animation.highlight;
  let target = { t: 0 };
  gsap.to(target, {
    duration: settings.edge.animation.duriation,
    t: 1,
    repeat: -1,
    yoyo: true,
    onUpdate: function () {
      for (let i = 0; i < props.edges.length; i++) {
        offset = i * (settings.edge.points + 1);
        end = offset + this.targets()[0].t * (max + edgePoints);
        start = end - edgePoints;

        if (end < offset + edgePoints) {
          start = offset;
        } else if (end > offset + max) {
          end = offset + max;
        }

        for (let i = 3 * offset; i <= 3 * (offset + max); i += 3) {
          if (i > 3 * start && i < 3 * end) {
            newColor.array[i] = originalColor.array[i] + highlight;
            newColor.array[i + 1] = originalColor.array[i + 1] + highlight;
            newColor.array[i + 2] = originalColor.array[i + 2] + highlight;
          } else {
            newColor.array[i] = originalColor.array[i];
            newColor.array[i + 1] = originalColor.array[i + 1];
            newColor.array[i + 2] = originalColor.array[i + 2];
          }
        }
      }
      edges.geometry.attributes.color.needsUpdate = true;
    },
  });
};

/**
 * Changes the color of the satellite edges.
 * @async because it is using a worker to generate the color vertices.
 */
const changeColor = async () => {
  const colors = await createColorsInWorker();
  edges.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
};

/**
 * Creates the colors in a web worker separate from the main thread
 * @returns {Promise<ArrayBuffer>} A promise that resolves to an ArrayBuffer containing the colors.
 */
const createColorsInWorker = (): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const worker = new lineSegmentsWorker();
    worker.postMessage({
      cmd: "createColors",
      linePoints: settings.edge.points,
      edges: toRaw(props.edges),
      satellites: toRaw(props.satellites),
    });
    worker.addEventListener(
      "message",
      (e: { data: Float32Array }) => {
        if (e.data) {
          resolve(e.data);
          worker.terminate();
        }
      },
      false
    );
    worker.addEventListener("error", (error) => {
      reject(new Error("Worker error: " + error.message));
    });
  });
};

/**
 * Creates the vertices in a web worker separate from the main thread
 * @returns {Promise<GeometryVertices>} A Promise that resolves to the GeometryVertices object.
 */
const createVerticesInWorker = (): Promise<GeometryVertices> => {
  return new Promise((resolve, reject) => {
    const worker = new lineSegmentsWorker();
    worker.postMessage({
      cmd: "createGeometry",
      lineType: "arc",
      linePoints: settings.edge.points,
      arcRadius: settings.globe.radius,
      edges: toRaw(props.edges),
    });
    worker.addEventListener(
      "message",
      (e: { data: GeometryVertices }) => {
        if (e.data) {
          resolve(e.data);
          worker.terminate();
        }
      },
      false
    );
    worker.addEventListener("error", (error) => {
      reject(new Error("Worker error: " + error.message));
    });
  });
};

const loaded = ref(false);
watch(props.satellites, async () => {
  if (loaded.value) {
    changeColor();
  } else {
    const vertices = await createVerticesInWorker();
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices.points, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(vertices.colors, 3));
    geometry.setIndex(new Uint16BufferAttribute(vertices.indices, 1));
    edges.geometry = geometry;
    bloom.selection.add(edges);
    animate();
    loaded.value = true;
  }
});
</script>

<template>
  <div></div>
</template>
