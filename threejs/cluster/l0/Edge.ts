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
import { GlobeUtils } from "~~/threejs/utils/GlobeUtils";

class Edge {
  private mesh!: Mesh;

  constructor(
    cluster: Group,
    vertex1: { lat: number; lng: number },
    vertex2: { lat: number; lng: number },
    radius: number,
    color: Color
  ) {
    const arc = GlobeUtils.createSphereArc(vertex1, vertex2, radius);

    // create the line
    this.mesh = this.createLine(arc, color, 0.025, 0.15);
    this.mesh.name = "L0 Edge";
    cluster.add(this.mesh);

    // animate line across the static line
    const animatedLine = this.createLine(arc, color, 0.05, 0.5);

    animatedLine.visible = false;

    // TODO: reference here?
    cluster.add(animatedLine);
    // this.animateLine(animatedLine);
  }

  /*
  private animateLine(line: Mesh): void {
    const geom: TubeGeometry = line.geometry as TubeGeometry;
    const vertices = 6;
    const offset = 3;
    const max = vertices * geom.attributes.position.count;
    const size = 3 * vertices;

    new TWEEN.Tween({ progress: 0 })
      .to({ progress: 1 }, 15000)
      .delay(Math.random() * 10000)
      .repeat(Infinity)
      .repeatDelay(Math.random() * 2000)
      .yoyo(true)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onStart(function () {
        line.visible = true;
      })
      .onUpdate(function (values) {
        const end = values.progress * max;
        let start = end < size ? 0 : end - size;
        start = size * Math.floor(start / offset) * offset;
        geom.setDrawRange(start, end);
      })
      .start();
  }
  */

  public tick(delta: number) {}

  public get(): Mesh {
    return this.mesh;
  }

  private createLine(
    path: QuadraticBezierCurve3 | Curve<Vector3>,
    color: Color,
    width: number,
    opacity: number
  ): Mesh {
    const geometry = new TubeGeometry(path, 256, width, 6);
    const material = new MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
    });
    return new Mesh(geometry, material);
  }
}

export { Edge };
