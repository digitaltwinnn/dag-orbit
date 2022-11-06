import {
  FrontSide,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
  Vector3,
} from "three";
import { AppScene } from "./AppScene";
import { Sun } from "./Sun";

class Atmosphere {
  private innerRadius = 100;
  private outerRadius = 103;
  private sun!: Sun;
  private lightPos!: Vector3;
  private uniforms!: any;
  private mesh!: Mesh;

  constructor(appScene: AppScene, sun: Sun, vertex: any, fragment: any) {
    this.sun = sun;
    this.lightPos = new Vector3();
    this.sun.get().getWorldPosition(this.lightPos);

    const atmosphereGeometry = new SphereGeometry(this.outerRadius, 64, 64);

    this.uniforms = {
      earthCenter: new Uniform(new Vector3(0, 0, 0)),
      earthRadius: new Uniform(this.innerRadius),
      atmosphereRadius: new Uniform(this.outerRadius),
      lightDirection: new Uniform(this.sun.get().position),
    };
    const atmosphereMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      side: FrontSide,
      transparent: true,
    });

    this.mesh = new Mesh(atmosphereGeometry, atmosphereMaterial);
    this.mesh.name = "Atmosphere";
    appScene.add(this.mesh);
  }

  public tick(delta: number): void {
    this.sun.get().getWorldPosition(this.lightPos);
    this.uniforms.lightDirection.value = this.lightPos;
  }
}

export { Atmosphere };
