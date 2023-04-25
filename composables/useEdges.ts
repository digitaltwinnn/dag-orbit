import { SelectiveBloomEffect } from "postprocessing";
import {
  Vector3,
  LineBasicMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  LineSegments,
  Object3D,
} from "three";
import { gsap } from "gsap";

const settings = {
  globe: {
    radius: 120,
  },
  line: {
    points: 50,
    opacity: 0.5,
    animation: {
      points: 10,
      duriation: 2,
      highlight: 0.4,
    },
  },
};

export const useEdges = async (
  parent: Object3D,
  edges: Edge[],
  effect: SelectiveBloomEffect
) => {
  const points: Vector3[] = [];
  const indices: number[] = [];
  const colors: number[] = [];

  const init = () => {
    let linePos = 0;
    let colorPos = 0;
    edges.map((edge) => {
      // points
      const arc = useGlobeUtils().createSphereArc(
        edge.source,
        edge.target,
        settings.globe.radius
      );
      points.push(...arc.getPoints(settings.line.points));

      // indices
      for (let i = 0; i < settings.line.points; i++) {
        const indice = [linePos + i, linePos + i + 1];
        indices.push(...indice);
      }
      linePos += settings.line.points + 1;

      // colors
      let color;
      for (let i = 0; i <= settings.line.points; i++) {
        color = gsap.utils.interpolate(
          edge.source.color,
          edge.target.color,
          i / settings.line.points
        );
        colors[colorPos++] = color.r;
        colors[colorPos++] = color.g;
        colors[colorPos++] = color.b;
      }
    });

    const material = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: settings.line.opacity,
    });
    const geometry = new BufferGeometry().setFromPoints(points);
    geometry.setIndex(indices);
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    const edgeLines = new LineSegments(geometry, material);

    parent.add(edgeLines);
    effect.selection.add(edgeLines);
    animate(edgeLines);
  };

  const animate = (edgeLines: LineSegments) => {
    const line = settings.line.animation.points;
    let max = settings.line.points;
    let start: number, end: number, offset: number;

    const newColor = edgeLines.geometry.attributes.color as any;
    let target = { t: 0 };
    gsap.to(target, {
      duration: settings.line.animation.duriation,
      t: 1,
      repeat: -1,
      yoyo: true,
      onUpdate: function () {
        for (let i = 0; i < edges.length; i++) {
          offset = i * (settings.line.points + 1);
          end = offset + Math.floor(this.targets()[0].t * (max + line));
          start = end - line;

          if (end < offset + line) {
            start = offset;
          } else if (end > offset + max) {
            end = offset + max;
          }

          const highlight = settings.line.animation.highlight;
          for (let i = 3 * offset; i <= 3 * (offset + max); i += 3) {
            if (i > 3 * start && i < 3 * end) {
              newColor.array[i] = colors[i] + highlight;
              newColor.array[i + 1] = colors[i + 1] + highlight;
              newColor.array[i + 2] = colors[i + 2] + highlight;
            } else {
              newColor.array[i] = colors[i];
              newColor.array[i + 1] = colors[i + 1];
              newColor.array[i + 2] = colors[i + 2];
            }
          }
        }
        edgeLines.geometry.attributes.color.needsUpdate = true;
      },
    });
  };

  init();

  return { edges };
};
