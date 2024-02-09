import { SelectiveBloomEffect } from "postprocessing";
import { Color, Group, MathUtils, Scene } from "three";

export const useGraph = (scene: Scene, bloom: SelectiveBloomEffect, data: { satellites: Satellite[]; edges: Edge[] }) => {

  const graph = new Group();
  graph.name = "Graph";
  const loaded = ref(false);
  let changeEdgeColor: (satellites: Satellite[]) => void;

  const changeColor = (newColors: string[]) => {
    const color = new Color();
    let i = 0;

    data.satellites.forEach((sat) => {
      color.set(newColors[MathUtils.randInt(0, newColors.length - 1)]);
    });
    if (changeEdgeColor) changeEdgeColor(data.satellites);
  };

  const load = async () => {
    const $edges = useGraphEdges(graph, bloom, data.edges);
    changeEdgeColor = $edges.changeColor;
    scene.add(graph);
    loaded.value = true;
  };
  load();

  return { graph, loaded, changeColor };
};
