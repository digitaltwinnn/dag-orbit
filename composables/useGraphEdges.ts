import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments, Scene } from "three";
import lineSegmentsWorker from "~/assets/workers/createLineSegments?worker";
import { SelectiveBloomEffect } from "postprocessing";

export const useGraphEdges = (scene: Scene, bloom: SelectiveBloomEffect, edgeData: Edge[]) => {
  const settings = {
    graph: {
      points: 5,
      opacity: 0.4,
    },
  };

  const graph = new LineSegments(undefined, undefined);
  graph.name = "ClusterGraph";
  const loaded = ref(false);

  const getColors = (satelliteData: Satellite[]): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      const worker = new lineSegmentsWorker();
      worker.postMessage({
        cmd: "createColors",
        linePoints: settings.graph.points,
        edges: edgeData,
        satellites: satelliteData,
      });
      worker.addEventListener(
        "message",
        (e: { data: number[] }) => {
          if (e.data) {
            resolve(e.data);
            worker.terminate();
          }
        },
        false
      );
    });
  };

  const changeColor = async (satelliteData: Satellite[]) => {
    const colors = await getColors(satelliteData);
    graph.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  };

  const getVertices = (): Promise<GeometryVertices> => {
    return new Promise((resolve, reject) => {
      const worker = new lineSegmentsWorker();
      worker.postMessage({
        cmd: "createGeometry",
        lineType: "line",
        arcRadius: 0,
        linePoints: settings.graph.points,
        edges: edgeData,
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
    });
  };

  const createGeometry = (vertices: GeometryVertices): BufferGeometry => {
    const geometry = new BufferGeometry().setFromPoints(vertices.points);
    geometry.setIndex(vertices.indices);
    geometry.setAttribute("color", new Float32BufferAttribute(vertices.colors, 3));
    return geometry;
  };

  const load = async () => {
    const vertices = await getVertices();
    graph.geometry = createGeometry(vertices);
    graph.material = new LineBasicMaterial({
      vertexColors: true,
      opacity: settings.graph.opacity,
    });
    scene.add(graph);
    bloom.selection.add(graph);
    loaded.value = true;
  };
  load();

  return { edges: graph, loaded, changeColor };
};
