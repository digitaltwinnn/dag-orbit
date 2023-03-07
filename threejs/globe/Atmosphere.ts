import {
  FrontSide,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
  Vector3,
} from "three";
import { Sun } from "./Sun";

class Atmosphere {
  private innerRadius = 100;
  private outerRadius = 103;
  private sun!: Sun;
  private globe!: Mesh;
  private lightPos!: Vector3;
  private uniforms!: any;
  private mesh!: Mesh;

  constructor(globe: Mesh, sun: Sun, vertex: any, fragment: any) {
    this.globe = globe;
    this.sun = sun;
    this.lightPos = new Vector3();
    this.sun.get().getWorldPosition(this.lightPos);

    const atmosphereGeometry = new SphereGeometry(this.outerRadius, 64, 64);

    this.uniforms = {
      earthCenter: new Uniform(globe.position),
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
    globe.add(this.mesh);
  }

  public tick(deltaTime: number): void {
    this.sun.get().getWorldPosition(this.lightPos);
    this.uniforms.lightDirection.value = this.lightPos;
    this.uniforms.earthCenter.value = this.globe.position;
  }
}

export { Atmosphere };
