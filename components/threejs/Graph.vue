<script setup lang="ts">
import { BoxGeometry, Color, MathUtils, Mesh, MeshBasicMaterial } from "three";

const props = defineProps({
  nodes: {
    type: Array<L0Node>,
    required: true,
  },
});

const satellites: Satellite[] = [];
const edges: Edge[] = [];

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let bloom = inject(bloomKey);
if (!bloom) throw new Error("Bloom effect not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");
let changeEdgeColor: (satellites: Satellite[]) => void;
watch(colors, () => changeColor(colors.value));

const changeColor = (newColors: string[]) => {
  const color = new Color();
  satellites.map((sat: Satellite) => {
    sat.color = color.set(newColors[MathUtils.randInt(0, newColors.length - 1)]).clone();
  });
  if (changeEdgeColor) changeEdgeColor(satellites);
};

onMounted(() => {
  const $data = useClusterDataProcessor(props.nodes, colors.value);
  watch($data.loaded, () => {
    satellites.push(...$data.satellites);
    edges.push(...$data.graphEdges);

    const geometry = new BoxGeometry(200, 200, 200);
    const material = new MeshBasicMaterial({ transparent: true, wireframe: true });
    const graph = new Mesh(geometry, material);
    graph.name = "Graph";

    const $edges = useGraphEdges(graph, bloom, edges);
    changeEdgeColor = $edges.changeColor;
    scene.add(graph);
  });
});
</script>

<template>
  <div></div>
</template>
