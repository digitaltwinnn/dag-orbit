import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Scene,
} from "three";
import { gsap } from "gsap";
import edgeGeometryWorker from "~/assets/workers/edgeGeometry?worker";
import { SelectiveBloomEffect } from "postprocessing";

export const useEdges = (scene: Scene, bloom: SelectiveBloomEffect, edgeData: Edge[]) => {
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

  let globeGeometry: BufferGeometry;
  let graphGeometry: BufferGeometry;
  const edges = new LineSegments(undefined, undefined);
  edges.name = "Edges";
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

  const changeColor = (satellites: Satellite[]) => {
    const errorColor = new Color("black");
    const colors: number[] = [];
    let colorPos = 0;

    let source, target, color;
    edgeData.forEach((edge) => {
      // find the new colors of the edge
      source = satellites.find((sat) => { return edge.source.node.ip == sat.node.ip && sat.mode.globe.visible });
      target = satellites.find((sat) => { return edge.target.node.ip == sat.node.ip && sat.mode.globe.visible });
      if (source && target) {
        edge.source.color = source.color.clone();
        edge.target.color = target.color.clone();
      } else {
        edge.source.color = errorColor.clone();
        edge.target.color = errorColor.clone();
      }

      // create the color array 
      for (let i = 0; i <= settings.edge.points; i++) {
        color = gsap.utils.interpolate(
          edge.source.color,
          edge.target.color,
          i / settings.edge.points
        );
        colors[colorPos++] = color.r;
        colors[colorPos++] = color.g;
        colors[colorPos++] = color.b;
      }
    })

    edges.geometry.setAttribute(
      "color",
      new Float32BufferAttribute(colors, 3)
    );
  }

  const getVertices = (
    orientation: string
  ): Promise<GeometryVertices> => {
    return new Promise((resolve, reject) => {
      const worker = new edgeGeometryWorker();
      worker.postMessage({
        orientation: orientation,
        settings: settings,
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
    geometry.setAttribute(
      "color",
      new Float32BufferAttribute(vertices.colors, 3)
    );
    const edgeIndices = 2 * settings.edge.points;
    geometry.setDrawRange(0, 1 + edgeIndices * vertices.visibleEdges);

    return geometry;
  };

  const load = async () => {
    const [globeVertices, graphVertices] = await Promise.all([
      getVertices("globe"),
      getVertices("graph"),
    ]);

    globeGeometry = createGeometry(globeVertices);
    graphGeometry = createGeometry(graphVertices);

    edges.geometry = globeGeometry;
    edges.material = new LineBasicMaterial({
      vertexColors: true,
      opacity: settings.edge.opacity,
    });
    scene.add(edges);
    bloom.selection.add(edges);
    animate();
    loaded.value = true;
  };
  load();

  return { edges, loaded, changeColor };
};
