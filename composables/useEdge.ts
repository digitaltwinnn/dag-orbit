import {
  Color,
  Curve,
  Group,
  Mesh,
  MeshBasicMaterial,
  QuadraticBezierCurve3,
  TubeGeometry,
  Vector3,
} from "three";
import { gsap } from "gsap";

export const useEdge = (
  parent: Group | Mesh,
  vertex1: { lat: number; lng: number },
  vertex2: { lat: number; lng: number },
  radius: number,
  color: Color
) => {
  const settings = {
    tubeSegments: 256,
    radiusSegments: 6,
  };

  const animate = (line: Mesh) => {
    const geom: TubeGeometry = line.geometry as TubeGeometry;
    const offset = 3;
    const max = 6 * settings.tubeSegments * settings.radiusSegments;
    const size = 0.15 * max;

    let target = { t: 0 };
    let start, end, count;
    gsap.to(target, {
      duration: 3,
      t: 1,
      repeat: -1,
      delay: Math.random() * 30,
      repeatDelay: Math.random() * 30,
      yoyo: true,
      onStart: function () {
        line.visible = true;
      },
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

        geom.setDrawRange(start, count);
      },
    });
  };

  const createLine = (
    path: QuadraticBezierCurve3 | Curve<Vector3>,
    color: Color,
    width: number,
    opacity: number
  ): Mesh => {
    const geometry = new TubeGeometry(
      path,
      settings.tubeSegments,
      width,
      settings.radiusSegments
    );
    const material = new MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
    });
    return new Mesh(geometry, material);
  };

  const arc = useGlobeUtils().createSphereArc(vertex1, vertex2, radius);
  const mesh = createLine(arc, color, 0.025, 0.15);
  mesh.name = "Edge" + Math.random();

  const animatedLine = createLine(arc, color, 0.1, 0.5);
  animatedLine.visible = false;
  animate(animatedLine);

  mesh.add(animatedLine);
  parent.add(mesh);

  const state = reactive({});

  return {
    ...toRefs(state),
  };
};
