<script setup lang="ts">
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Object3D,
  Uint16BufferAttribute,
} from "three";
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

const settings = { graph: { points: 5 } };

const edges = new LineSegments(
  undefined,
  new LineBasicMaterial({ vertexColors: true, transparent: true })
);
edges.name = "GraphEdges";
props.parent.add(edges);

const loaded = ref(false);
watch(props.satellites, async () => {
  if (loaded.value) {
    changeColor();
  } else {
    const vertices = await getVerticesFromWorker();
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices.points, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(vertices.colors, 3));
    geometry.setIndex(new Uint16BufferAttribute(vertices.indices, 1));
    edges.geometry = geometry;
    loaded.value = true;
  }
});

const changeColor = async () => {
  const colors = await getColorsFromWorker();
  edges.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
};

const getColorsFromWorker = (): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const worker = new lineSegmentsWorker();
    worker.postMessage({
      cmd: "createColors",
      linePoints: settings.graph.points,
      edges: toRaw(props.edges),
      satellites: toRaw(props.satellites),
    });
    worker.addEventListener(
      "message",
      (e: { data: ArrayBuffer }) => {
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

const getVerticesFromWorker = (): Promise<GeometryVertices> => {
  return new Promise((resolve, reject) => {
    const worker = new lineSegmentsWorker();
    worker.postMessage({
      cmd: "createGeometry",
      lineType: "line",
      arcRadius: 0,
      linePoints: settings.graph.points,
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
</script>

<template>
  <div></div>
</template>
