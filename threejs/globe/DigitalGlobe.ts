import {
  CircleGeometry,
  Color,
  DoubleSide,
  ImageLoader,
  InstancedBufferGeometry,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import { GlobeUtils } from "../utils/GlobeUtils";
import { AppScene } from "../scene/AppScene";

const GLOBE = 0;
const MAP = 1;
const shieldColors = ["#1E90FE", "#1467C8", "#1053AD"];

class DigitalGlobe {
  private mesh!: InstancedMesh;
  private innerGlobe!: Mesh;
  private dotDensity = 0.5;
  private rows = 150;
  private radius = 130;
  private globeDots: Vector3[] = [];
  private mapDots: Vector3[] = [];
  private positions: Vector3[] = [];
  private colorInterval = false;
  private mode = GLOBE;

  constructor(appScene: AppScene) {
    // inner globe
    const globeGeometry = new SphereGeometry(this.radius, 32, 32);
    const globeMaterial = new MeshBasicMaterial({ visible: false });
    this.innerGlobe = new Mesh(globeGeometry, globeMaterial);

    // digital globe
    const $img = useImage();
    const imgUrl = $img("/earthspec1k.jpg", { width: 1024 });
    const loader = new ImageLoader();
    loader.load(imgUrl, (image) => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context) {
        context.drawImage(image, 0, 0);
        this.mapDots = this.createMapDots(image, context);
        this.globeDots = this.createGlobeDots(image, context);

        if (this.mode == MAP) {
          this.mesh = this.createMesh(this.mapDots);
        } else {
          this.mesh = this.createMesh(this.globeDots);
        }
        this.mesh.name = "DigitalGlobe";
        this.innerGlobe.add(this.mesh);
        this.rotateColors();
      }
    });

    appScene.add(this.innerGlobe);
  }

  private createMesh(positions: Vector3[]): InstancedMesh {
    this.positions = [];
    positions.forEach((val) => this.positions.push(Object.assign({}, val)));

    const baseGeometry = new CircleGeometry(0.7, 6);
    const instancedGeometry = new InstancedBufferGeometry().copy(baseGeometry);
    const material = new MeshPhongMaterial({
      side: DoubleSide,
      transparent: true,
    });
    const mesh = new InstancedMesh(
      instancedGeometry,
      material,
      this.positions.length
    );

    const dummy = new Object3D();
    const color = new Color();
    for (let i = 0; i < this.positions.length; i++) {
      const pos = this.positions[i];
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.set(shieldColors[MathUtils.randInt(0, shieldColors.length - 1)]);
      mesh.setColorAt(i, color);
    }

    return mesh;
  }

  private rotateColors() {
    if (!this.colorInterval) {
      this.colorInterval = true;

      setInterval(() => {
        const color = new Color();

        for (let i = 0; i < this.positions.length; i++) {
          const random = Math.random();
          if (random > 0.98) {
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
  }

  private createGlobeDots(
    image: HTMLImageElement,
    context: CanvasRenderingContext2D
  ): Vector3[] {
    const positions = [];

    for (let lat = -90; lat <= 90; lat += 180 / this.rows) {
      const r = Math.cos((Math.abs(lat) * Math.PI) / 180) * this.radius;
      const circumference = r * Math.PI * 2;
      const dotsForLat = circumference * this.dotDensity;

      for (let x = 0; x < dotsForLat; x++) {
        const long = -180 + (x * 360) / dotsForLat;

        const coordinate = this.latLonToXY(
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
          positions.push(
            GlobeUtils.toVector(lat, long, this.radius)
              .normalize()
              .multiplyScalar(this.radius)
          );
        }
      }
    }
    return positions;
  }

  private createMapDots(
    image: HTMLImageElement,
    context: CanvasRenderingContext2D
  ): Vector3[] {
    const positions = [];

    // to get close to same amount of dots when projected on 3d globe
    const step = 4.8;

    for (let x = 0; x < image.width; x += step) {
      for (let y = 0; y < image.height; y += step) {
        const pixelData = context.getImageData(x, y, 1, 1).data;

        if (pixelData[0] <= 5) {
          const posX = x - 0.5 * image.width;
          const posY = y - 0.5 * image.height;
          positions.push(new Vector3(posX / 3, posY / 3, 0));
        }
      }
    }
    return positions;
  }

  private transformMesh(target: Vector3[]) {
    if (target.length >= this.positions.length) {
      const dummy = new Object3D();
      for (let i = 0; i < this.positions.length; i++) {
        const newPos = target[i];
        dummy.position.set(newPos.x, newPos.y, newPos.z);
        if (this.mode == GLOBE) {
          dummy.lookAt(0, 0, 0);
        }
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
      }
      this.mesh.instanceMatrix.needsUpdate = true;
    } else {
      console.warn("couldn't transform mesh");
    }
  }

  private latLonToXY(
    lat: number,
    long: number,
    mapWidth: number,
    mapHeight: number
  ): Vector2 {
    const y = (-1 * lat + 90) * (mapHeight / 180);
    const x = (long + 180) * (mapWidth / 360);
    return new Vector2(Math.floor(x), Math.floor(y));
  }

  public get(): Mesh {
    // TODO replace with the digital instancedMesh
    return this.innerGlobe;
  }

  public showGlobe(): void {
    this.mode = GLOBE;
    this.mesh.visible = true;
    this.transformMesh(this.globeDots);
  }

  public showMap(): void {
    this.mode = MAP;
    this.mesh.visible = true;
    this.transformMesh(this.mapDots);
  }

  public hide(): void {
    this.mesh.visible = false;
  }
}

export { DigitalGlobe };
