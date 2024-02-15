import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Object3D,
} from "three";
import lineSegmentsWorker from "~/assets/workers/createLineSegments?worker";
import { SelectiveBloomEffect } from "postprocessing";

export const useGraphEdges = (parent: Object3D, bloom: SelectiveBloomEffect, edgeData: Edge[]) => {
  const settings = { graph: { points: 5 } };

  const edges = new LineSegments(undefined, undefined);
  edges.name = "GraphEdges";
  parent.add(edges);
  const loaded = ref(false);

  const getColors = (satelliteData: Satellite[]): Promise<ArrayBuffer> => {
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

  const changeColor = async (satelliteData: Satellite[]) => {
    const colors = await getColors(satelliteData);
    edges.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
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
      worker.addEventListener("error", (error) => {
        reject(new Error("Worker error: " + error.message));
      });
    });
  };

  const createGeometry = (vertices: GeometryVertices): BufferGeometry => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices.points, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(vertices.colors, 3));
    geometry.setIndex(vertices.indices);
    return geometry;
  };

  const load = async () => {
    const vertices = await getVertices();
    edges.geometry = createGeometry(vertices);
    edges.material = new LineBasicMaterial({ vertexColors: true, transparent: true });
    bloom.selection.add(edges);
    loaded.value = true;
  };
  load();

  return { edges, loaded, changeColor };
};
