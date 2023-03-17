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
import { GlobeUtils } from "~~/threejs/utils/GlobeUtils";

class Edge {
  private mesh!: Mesh;
  private tubeSegments = 256;
  private radiusSegments = 6;

  constructor(
    cluster: Group,
    vertex1: { lat: number; lng: number },
    vertex2: { lat: number; lng: number },
    radius: number,
    color: Color
  ) {
    const arc = GlobeUtils.createSphereArc(vertex1, vertex2, radius);
    this.mesh = this.createLine(arc, color, 0.025, 0.15);
    this.mesh.name = "L0 Edge";
    cluster.add(this.mesh);

    // animate another line between start & end
    const animatedLine = this.createLine(arc, color, 0.1, 0.5);
    animatedLine.visible = false;
    this.mesh.add(animatedLine);
    this.animateLine(animatedLine);
  }

  private animateLine(l: Mesh): void {
    const geom: TubeGeometry = l.geometry as TubeGeometry;
    const offset = 3;
    const max = 6 * this.tubeSegments * this.radiusSegments;
    const size = 0.15 * max;

    let line = { t: 0 };
    let start, end, count;
    gsap.to(line, {
      duration: 3,
      t: 1,
      repeat: -1,
      delay: Math.random() * 30,
      repeatDelay: Math.random() * 30,
      yoyo: true,
      onStart: function () {
        l.visible = true;
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
  }

  public get(): Mesh {
    return this.mesh;
  }

  private createLine(
    path: QuadraticBezierCurve3 | Curve<Vector3>,
    color: Color,
    width: number,
    opacity: number
  ): Mesh {
    const geometry = new TubeGeometry(
      path,
      this.tubeSegments,
      width,
      this.radiusSegments
    );
    const material = new MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
    });
    return new Mesh(geometry, material);
  }
}

export { Edge };
