import {
  Color,
  Curve,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  QuadraticBezierCurve3,
  TubeGeometry,
  Vector3,
} from "three";
import { gsap } from "gsap";
import { SelectiveBloomEffect } from "postprocessing";

export const useAnimatedEdges = async (
  parent: Object3D,
  edges: Edge[],
  animated: number,
  effect: SelectiveBloomEffect
) => {
  const settings = {
    globe: {
      radius: 120,
    },
    tube: {
      segments: 256,
      radius: 6,
      color: "#1467C8",
      width: 0.2,
      opacity: 0.2,
      points: 30,
      animation: {
        duration: 3,
        size: 0.05,
      },
    },
  };

  const animate = (edges: Edge[], lines: Mesh[]) => {
    const offset = 3;
    const max = 6 * settings.tube.segments * settings.tube.radius;
    const size = settings.tube.animation.size * max;

    lines.map((line) => {
      let target = { t: 0 };
      let start, end, count;

      gsap.to(target, {
        duration: settings.tube.animation.duration,
        t: 1,
        repeat: -1,
        delay: Math.random() * settings.tube.animation.duration,
        onUpdate: function () {
          end = this.targets()[0].t * (max + size);
          start = end < size ? 0 : end - size;
          start = Math.floor(start / offset) * offset;

          if (end < size) {
            count = size - (size - end);
          } else if (end > max) {
            count = size - (end - max);
          } else {
            count = size;
          }

          line.geometry.setDrawRange(start, count);
        },
        onRepeat: function () {
          const edge = edges[Math.floor(Math.random() * edges.length)];
          let source = edge.source;
          let target = edge.target;
          if (Math.random() < 0.5) {
            source = edge.target;
            target = edge.source;
          }

          const path = useGlobeUtils().createSphereArc(
            source,
            target,
            settings.globe.radius
          );
          const nextGeometry = new TubeGeometry(
            path,
            settings.tube.segments,
            settings.tube.width,
            settings.tube.radius
          );
          nextGeometry.setDrawRange(0, 0);
          line.geometry.copy(nextGeometry);
          nextGeometry.dispose();
        },
      });
    });
  };

  const createTube = (path: QuadraticBezierCurve3 | Curve<Vector3>): Mesh => {
    const geometry = new TubeGeometry(
      path,
      settings.tube.segments,
      settings.tube.width,
      settings.tube.radius
    );
    geometry.setDrawRange(0, 0);

    const material = new MeshBasicMaterial({
      color: new Color(settings.tube.color),
      transparent: true,
      opacity: settings.tube.opacity,
    });
    const line = new Mesh(geometry, material);

    return line;
  };

  const maxEdges = edges.sort(() => 0.5 - Math.random()).slice(0, animated);
  const edgeLines: Mesh[] = [];

  maxEdges.map((edge) => {
    const arc = useGlobeUtils().createSphereArc(
      edge.source,
      edge.target,
      settings.globe.radius
    );
    edgeLines.push(createTube(arc));
  });

  parent.add(...edgeLines);
  edgeLines.map((line) => effect.selection.add(line));
  animate(edges, edgeLines);

  return { edgeLines };
};
