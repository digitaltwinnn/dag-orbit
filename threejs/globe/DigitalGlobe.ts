import {
  CircleGeometry,
  Color,
  DoubleSide,
  Group,
  ImageLoader,
  InstancedBufferGeometry,
  InstancedMesh,
  MathUtils,
  MeshPhongMaterial,
  Object3D,
  Vector3,
} from "three";
import { GlobeUtils } from "../utils/GlobeUtils";
import { AppScene } from "../scene/AppScene";

const GLOBE = 0;
const MAP = 1;
const shieldColors = ["#1E90FE", "#1467C8", "#1053AD"];

class DigitalGlobe {
  private group!: Group;
  private mesh!: InstancedMesh;
  private dotDensity = 0.5;
  private rows = 150;
  private radius = 130;
  private globeDots: Vector3[] = [];
  private mapDots: Vector3[] = [];
  private positions: Vector3[] = [];
  private mode = GLOBE;

  constructor(appScene: AppScene) {
    this.group = new Group();

    const $img = useImage();
    const imgUrl = $img("/earthspec1k.jpg", { width: 1024 });
    const loader = new ImageLoader();
    loader.load(imgUrl, (image) => {
      this.generateDots(image);

      this.mesh = this.createInstancedMesh(this.globeDots);
      this.group.add(this.mesh);
      this.animateColors();

      appScene.add(this.group);
      appScene.addObjectAnimation(this);
    });
  }

  private generateDots(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context) {
      context.drawImage(image, 0, 0);
      this.mapDots = this.createMapDots(image, context);
      this.globeDots = this.createGlobeDots(image, context);
    }
  }

  private createInstancedMesh(dots: Vector3[]): InstancedMesh {
    dots.forEach((dot) => this.positions.push(Object.assign({}, dot)));

    const circle = new CircleGeometry(0.7, 6);
    const instancedCircle = new InstancedBufferGeometry().copy(circle);
    const material = new MeshPhongMaterial({ side: DoubleSide });
    const mesh = new InstancedMesh(
      instancedCircle,
      material,
      this.positions.length
    );

    const dummy = new Object3D();
    const color = new Color();
    for (let i = 0; i < this.positions.length; i++) {
      const pos = this.positions[i];
      dummy.position.set(pos.x, pos.y, pos.z);
      this.orientateMesh(dummy);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(shieldColors[MathUtils.randInt(0, shieldColors.length - 1)]);
      mesh.setColorAt(i, color);
    }

    return mesh;
  }

  private orientateMesh(dummy: Object3D) {
    if (this.mode == GLOBE) {
      dummy.lookAt(0, 0, 0);
    } else {
      dummy.rotation.set(0, 0, Math.PI / 2);
    }
  }

  private animateColors() {
    const color = new Color();
    setInterval(() => {
      for (let i = 0; i < this.positions.length; i++) {
        if (Math.random() > 0.98) {
          color.set(
            shieldColors[MathUtils.randInt(0, shieldColors.length - 1)]
          );
          this.mesh.setColorAt(i, color);
        }
      }

      if (this.mesh.instanceColor) {
        this.mesh.instanceColor.needsUpdate = true;
      }
    }, 100);
  }

  private createGlobeDots(
    image: HTMLImageElement,
    context: CanvasRenderingContext2D
  ): Vector3[] {
    const dots = [];

    for (let lat = -90; lat <= 90; lat += 180 / this.rows) {
      const r = Math.cos((Math.abs(lat) * Math.PI) / 180) * this.radius;
      const circumference = r * Math.PI * 2;
      const dotsForLat = circumference * this.dotDensity;

      for (let x = 0; x < dotsForLat; x++) {
        const long = -180 + (x * 360) / dotsForLat;

        const coordinate = GlobeUtils.latLongToXY(
          lat,
          long,
          image.width,
          image.height
        );
        const pixelData = context.getImageData(
          coordinate.x,
          coordinate.y,
          1,
          1
        ).data;

        if (pixelData[0] <= 5) {
          dots.push(
            GlobeUtils.toVector(lat, long, this.radius)
              .normalize()
              .multiplyScalar(this.radius)
          );
        }
      }
    }
    return dots;
  }

  private createMapDots(
    image: HTMLImageElement,
    context: CanvasRenderingContext2D
  ): Vector3[] {
    const dots = [];
    const step = 4.2;

    for (let x = 0; x < image.width; x += step) {
      for (let y = 0; y < image.height; y += step) {
        const pixelData = context.getImageData(x, y, 1, 1).data;
        if (pixelData[0] <= 5) {
          const posX = x - 0.5 * image.width;
          const posY = -y + 0.5 * image.height;
          dots.push(new Vector3(posX / 3, posY / 3, 0));
        }
      }
    }
    return dots;
  }

  private transformMesh(target: Vector3[], mode: number) {
    this.mode = mode;

    const delta = target.length - this.positions.length;
    if (delta >= 0) {
      // more positions in target, ignore the rest
      const dummy = new Object3D();
      for (let i = 0; i < this.positions.length; i++) {
        const newPos = target[i];
        dummy.position.set(newPos.x, newPos.y, newPos.z);
        this.orientateMesh(dummy);
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
      }
      this.mesh.instanceMatrix.needsUpdate = true;
    } else {
      // less positions in target, fillers for the rest
      const dummy = new Object3D();
      for (let i = 0; i < target.length; i++) {
        const newPos = target[i];
        dummy.position.set(newPos.x, newPos.y, newPos.z);
        this.orientateMesh(dummy);
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
      }
      // fillers
      for (let i = target.length; i < this.positions.length; i++) {
        dummy.position.set(0, 0, 0);
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
      }
      this.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  public get(): Group {
    return this.group;
  }

  public tick(deltaTime: number) {
    const radiansPerSecond = MathUtils.degToRad(4);
    this.group.rotation.y += (radiansPerSecond * deltaTime) / 1000;
  }
}

export { DigitalGlobe };
