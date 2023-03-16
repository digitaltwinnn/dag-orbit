import {
  BoxGeometry,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { Node } from "./Node";

class Satellite {
  private mesh!: Mesh;
  private color!: Color;
  private size!: number;
  private nodes!: Node[];

  public lat!: number;
  public lng!: number;

  constructor(
    cluster: Group,
    size: number,
    lat: number,
    lng: number,
    color: Color
  ) {
    this.color = color;
    this.nodes = [];
    this.size = size;

    this.lat = lat;
    this.lng = lng;

    const outsideFrame = new BoxGeometry(size, size, size);
    const mat = new MeshBasicMaterial({ color: color, wireframe: true });
    this.mesh = new Mesh(outsideFrame, mat);
    this.mesh.name = "Satellite" + Math.random();
    this.mesh.lookAt(0, 0, 0);

    const size2 = 0.3 * size;
    const insideBox = new BoxGeometry(size2, size2, size2);
    const mat2 = new MeshBasicMaterial({ color: color });
    this.mesh.add(new Mesh(insideBox, mat2));
    cluster.add(this.mesh);
  }

  /*
  public addNode(scene: EarthScene, earth: Earth, n: ClusterNode) {
    const nodeLength = this.nodes.length;
    const size = 0.6 * this.size;
    const alt =
      this.alt +
      1 * this.size +
      nodeLength * size +
      (nodeLength + 1) * 0.08 * size;

    const node = new Node(n.id, size, this.color);
    this.nodes.push(node);

    const pos = earth.toVector(this.lat, this.lng, alt);
    const nodeMesh = node.get();
    nodeMesh.position.set(pos.x, pos.y, pos.z);
    nodeMesh.lookAt(0, 0, 0);
    nodeMesh.rotateX(MathUtils.degToRad(90));
    scene.get().add(node.get());
  }

  public hasNode(id: string): boolean {
    const nodeIndex = this.nodes.findIndex((n: Node) => {
      return n.id === id;
    });
    return nodeIndex != -1;
  }
  */

  public get(): Mesh {
    return this.mesh;
  }

  public tick(deltaTime: number): void {
    const degreesPerSecond = (MathUtils.degToRad(45) * deltaTime) / 1000;
    this.mesh.rotateX(degreesPerSecond);
    this.mesh.rotateY(degreesPerSecond);
    this.mesh.rotateZ(degreesPerSecond);
  }
}

export { Satellite };
