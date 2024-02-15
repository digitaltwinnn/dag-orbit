import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Object3D,
} from "three";
import { gsap } from "gsap";
import lineSegmentsWorker from "~/assets/workers/createLineSegments?worker";
import { SelectiveBloomEffect } from "postprocessing";

export const useSatelliteEdges = (
  parent: Object3D,
  bloom: SelectiveBloomEffect,
  edgeData: Edge[]
) => {
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

  const edges = new LineSegments(undefined, undefined);
  edges.name = "SatelliteEdges";
  parent.add(edges);
  const loaded = ref(false);

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
        for (let i = 0; i < edgeData.length; i++) {
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

  const getColors = (satelliteData: Satellite[]): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const worker = new lineSegmentsWorker();
      worker.postMessage({
        cmd: "createColors",
        linePoints: settings.edge.points,
        edges: edgeData,
        satellites: satelliteData,
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

  const changeColor = async (satelliteData: Satellite[]) => {
    const colors = await getColors(satelliteData);
    edges.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  };

  const getVertices = (): Promise<GeometryVertices> => {
    return new Promise((resolve, reject) => {
      const worker = new lineSegmentsWorker();
      worker.postMessage({
        cmd: "createGeometry",
        lineType: "arc",
        linePoints: settings.edge.points,
        arcRadius: settings.globe.radius,
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
    animate();
    loaded.value = true;
  };
  load();

  return { edges, loaded, changeColor };
};
