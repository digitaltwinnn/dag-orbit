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

type Edge = {
  source: Satellite;
  target: Satellite;
};

const settings = {
  globe: {
    radius: 120,
  },
  line: {
    points: 40,
    opacity: 0.25,
  },
};

export const useEdges = async (
  parent: Object3D,
  edges: Edge[],
  effect: SelectiveBloomEffect
) => {
  const points: Vector3[] = [];
  const indicies: number[] = [];
  const colors: number[] = [];

  let linePos = 0;
  let colorPos = 0;
  edges.map(async (edge) => {
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
      indicies.push(...indice);
    }

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

    linePos += settings.line.points + 1;
  });

  const material = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: settings.line.opacity,
  });
  const geometry = new BufferGeometry().setFromPoints(points);
  geometry.setIndex(indicies);
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  const edgeLines = new LineSegments(geometry, material);

  parent.add(edgeLines);
  effect.selection.add(edgeLines);

  return { edges };
};
