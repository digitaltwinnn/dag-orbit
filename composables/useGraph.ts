import { SelectiveBloomEffect } from "postprocessing";
import { Color, MathUtils, Scene } from "three";

export const useGraph = (scene: Scene, bloom: SelectiveBloomEffect, data: { satellites: Satellite[]; edges: Edge[] }) => {
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
    const $edges = useGraphEdges(scene, bloom, data.edges);
    changeEdgeColor = $edges.changeColor;
    loaded.value = true;
  };
  load();

  return { loaded, changeColor };
};
