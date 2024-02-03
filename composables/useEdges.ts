import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Scene,
  Vector3,
} from "three";
import { gsap } from "gsap";
import edgeGeometryWorker from "~/assets/workers/edgeGeometry?worker";
import { SelectiveBloomEffect } from "postprocessing";

type geometryVertices = {
  points: Vector3[];
  indices: number[];
  colors: number[];
  visibleEdges: number;
};

export const useEdges = (scene: Scene, bloom: SelectiveBloomEffect, edges: Edge[]): ThreeJsComposable => {
  const settings = {
    globe: {
      radius: 120,
    },
    edge: {
      points: 30,
      opacity: 0.4,
      animation: {
        points: 4,
        duriation: 2,
        highlight: 0.5,
      },
    },
  };

  const animate = (edgeLines: LineSegments) => {
    const edgePoints = settings.edge.animation.points;
    let max = settings.edge.points;
    let start: number, end: number, offset: number;

    const newColor = edgeLines.geometry.attributes.color as any;
    const originalColor = edgeLines.geometry.attributes.color.clone();
    const highlight = settings.edge.animation.highlight;
    let target = { t: 0 };
    gsap.to(target, {
      duration: settings.edge.animation.duriation,
      t: 1,
      repeat: -1,
      yoyo: true,
      onUpdate: function () {
        for (let i = 0; i < edges.length; i++) {
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
        edgeLines.geometry.attributes.color.needsUpdate = true;
      },
    });
  };

  const geometryVerticesFromWorker = (
    orientation: string
  ): Promise<geometryVertices> => {
    return new Promise((resolve, reject) => {
      const worker = new edgeGeometryWorker();
      worker.postMessage({
        orientation: orientation,
        settings: settings,
        edges: edges,
      });
      worker.addEventListener(
        "message",
        (e: { data: geometryVertices }) => {
          if (e.data) {
            resolve(e.data);
            worker.terminate();
          }
        },
        false
      );
    });
  };

  const geometryFromVertices = (vertices: geometryVertices): BufferGeometry => {
    const geometry = new BufferGeometry().setFromPoints(vertices.points);
    geometry.setIndex(vertices.indices);
    geometry.setAttribute(
      "color",
      new Float32BufferAttribute(vertices.colors, 3)
    );
    const edgeIndices = 2 * settings.edge.points;
    geometry.setDrawRange(0, 1 + edgeIndices * vertices.visibleEdges);

    return geometry;
  };

  const loaded = ref(false);
  const object = new LineSegments(undefined, undefined);
  object.name = "edges";

  const load = async () => {
    const [globeVertices, graphVertices] = await Promise.all([
      geometryVerticesFromWorker("globe"),
      geometryVerticesFromWorker("graph"),
    ]);

    const globeGeometry = geometryFromVertices(globeVertices);
    const graphGeometry = geometryFromVertices(graphVertices);

    object.geometry = globeGeometry;
    object.material = new LineBasicMaterial({
      vertexColors: true,
      opacity: settings.edge.opacity,
    });
    scene.add(object);
    bloom.selection.add(object);
    animate(object);
    loaded.value = true;
  };
  load();

  return { object, loaded };
};
