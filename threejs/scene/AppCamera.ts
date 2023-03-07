import { PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AppRenderer } from "./AppRenderer";

class AppCamera {
  private camera!: PerspectiveCamera;
  private controls!: OrbitControls;
  private startPos = new Vector3(0, 0, 400);

  constructor(width: number, height: number, renderer: AppRenderer) {
    this.camera = new PerspectiveCamera(50, width / height, 0.1, 40000);
    this.camera.position.set(this.startPos.x, this.startPos.y, this.startPos.z);
    this.camera.up.set(0, 1, 0);

    this.controls = new OrbitControls(this.camera, renderer.get().domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 5000;
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public get(): PerspectiveCamera {
    return this.camera;
  }

  public getControls(): OrbitControls {
    return this.controls;
  }

  public tick(deltaTime: number): void {
    if (this.controls.enabled) {
      this.controls.update();
    }
  }
}

export { AppCamera };
