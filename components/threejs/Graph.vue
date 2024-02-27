<script setup lang="ts">
import { BoxGeometry, Color, MathUtils, Mesh, MeshBasicMaterial } from "three";

const props = defineProps({
  nodes: {
    type: Array<L0Node>,
    required: true,
  },
});

const satellites: Ref<Satellite[]> = ref([]);
const edges: Ref<Edge[]> = ref([]);

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");
watch(colors, () => changeColor(colors.value));

const geometry = new BoxGeometry(200, 200, 200);
const material = new MeshBasicMaterial({ transparent: true, wireframe: true });
const graph = new Mesh(geometry, material);
graph.name = "Graph";
scene.add(graph);

const changeColor = (newColors: string[]) => {
  const color = new Color();
  satellites.value.map((sat: Satellite) => {
    sat.color = color.set(newColors[MathUtils.randInt(0, newColors.length - 1)]).clone();
  });
};

onMounted(() => {
  const $data = useClusterDataProcessor(props.nodes, colors.value);
  watch($data.loaded, () => {
    satellites.value.push(...$data.satellites);
    edges.value.push(...$data.graphEdges);
  });
});
</script>

<template>
  <div><ThreejsGraphEdges :parent="graph" :satellites="satellites" :edges="edges" /></div>
</template>
