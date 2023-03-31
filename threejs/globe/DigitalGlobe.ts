import {
  BufferAttribute,
  BufferGeometry,
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
import { gsap } from "gsap";

const GLOBE = 0;
const MAP = 1;
const MAXDOTS = 11500;
const shieldColors = ["#1E90FE", "#1467C8", "#1053AD"];

class DigitalGlobe {
  private group!: Group;
  private mesh!: InstancedMesh;
  private mode = GLOBE;
  private globeGeometry!: BufferGeometry;
  private mapGeometry!: BufferGeometry;
  private dotDensity = 0.5;
  private rows = 150;
  private radius = 130;
  private mapStep = 4.2;

  constructor(appScene: AppScene) {
    this.group = new Group();

    const $img = useImage();
    const imgUrl = $img("/earthspec1k.jpg", { width: 1024 });
    const loader = new ImageLoader();
    loader.load(imgUrl, (image) => {
      this.generateGeometries(image);
      this.createInstancedMesh();
      this.animateColors();

      appScene.add(this.group);
      appScene.addObjectAnimation(this);
    });
  }

  private generateGeometries(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context) {
      context.drawImage(image, 0, 0);
      this.createMapGeometry(image, context);
      this.createGlobeGeometry(image, context);
    }
  }

  private createInstancedMesh() {
    let geometry: BufferGeometry;
    if (this.mode == GLOBE) {
      geometry = this.globeGeometry.clone();
    } else {
      geometry = this.mapGeometry.clone();
    }

    const size = geometry.attributes.position.array.length / 3;
    const circle = new CircleGeometry(0.7, 6);
    const instancedCircle = new InstancedBufferGeometry().copy(circle);
    const material = new MeshPhongMaterial({ side: DoubleSide });

    this.mesh = new InstancedMesh(instancedCircle, material, size);
    const dummy = new Object3D();
    const color = new Color();
    let i3 = 0;
    for (let i = 0; i < size; i++) {
      i3 += 3;
      dummy.position.set(
        geometry.attributes.position.array[i3],
        geometry.attributes.position.array[i3 + 1],
        geometry.attributes.position.array[i3 + 2]
      );
      if (this.mode == GLOBE) {
        dummy.lookAt(0, 0, 0);
      } else {
        dummy.rotation.set(0, 0, Math.PI / 2);
      }
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);

      color.set(shieldColors[MathUtils.randInt(0, shieldColors.length - 1)]);
      this.mesh.setColorAt(i, color);
    }
    this.group.add(this.mesh);
  }

  private animateColors() {
    const color = new Color();
    setInterval(() => {
      for (let i = 0; i < this.mesh.count; i++) {
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

  private createGlobeGeometry(
    image: HTMLImageElement,
    context: CanvasRenderingContext2D
  ) {
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
    if (dots.length < MAXDOTS) {
      for (let i = 0; MAXDOTS - dots.length; i++) {
        dots.push(new Vector3(0, 0, 0));
      }
    }

    this.globeGeometry = new BufferGeometry();
    this.globeGeometry.setAttribute("position", this.dotsToPositions(dots));
    this.globeGeometry.setAttribute(
      "rotation",
      this.rotatePositions(this.globeGeometry, GLOBE)
    );
  }

  private createMapGeometry(
    image: HTMLImageElement,
    context: CanvasRenderingContext2D
  ) {
    const dots = [];
    for (let x = 0; x < image.width; x += this.mapStep) {
      for (let y = 0; y < image.height; y += this.mapStep) {
        const pixelData = context.getImageData(x, y, 1, 1).data;
        if (pixelData[0] <= 5) {
          const posX = x - 0.5 * image.width;
          const posY = -y + 0.5 * image.height;
          dots.push(new Vector3(posX / 3, posY / 3, 0));
        }
      }
    }
    if (dots.length < MAXDOTS) {
      for (let i = 0; MAXDOTS - dots.length; i++) {
        dots.push(new Vector3(0, 0, 0));
      }
    }

    this.mapGeometry = new BufferGeometry();
    this.mapGeometry.setAttribute("position", this.dotsToPositions(dots));
    this.mapGeometry.setAttribute(
      "rotation",
      this.rotatePositions(this.mapGeometry, MAP)
    );
  }

  private dotsToPositions(dots: Vector3[]): BufferAttribute {
    const position = new Float32Array(dots.length * 3);
    let i3 = 0;

    for (let i = 0; i < dots.length; i++) {
      position[i3++] = dots[i].x;
      position[i3++] = dots[i].y;
      position[i3++] = dots[i].z;
    }
    return new BufferAttribute(position, 3);
  }

  private rotatePositions(geom: BufferGeometry, mode: number): BufferAttribute {
    const rotation = new Float32Array(geom.attributes.position.array.length);
    const dummy = new Object3D();

    for (let i = 0; i < rotation.length; i += 3) {
      if (mode == GLOBE) {
        dummy.position.set(
          geom.attributes.position.array[i],
          geom.attributes.position.array[i + 1],
          geom.attributes.position.array[i + 2]
        );
        dummy.lookAt(0, 0, 0);
      } else {
        dummy.rotation.set(0, 0, Math.PI / 2);
      }

      rotation[i] = dummy.rotation.x;
      rotation[i + 1] = dummy.rotation.y;
      rotation[i + 2] = dummy.rotation.z;
    }
    return new BufferAttribute(rotation, 3);
  }

  private concatBufferAttributes(
    a: ArrayLike<number>,
    b: ArrayLike<number>
  ): number[] {
    const array: any[] = [];
    for (let i = 0; i < a.length; i++) {
      array.push(a[i]);
    }
    for (let i = 0; i < b.length; i++) {
      array.push(b[i]);
    }
    return array;
  }

  public transformMesh() {
    let subject: number[] = [];
    let end: number[] = [];

    if (this.mode == MAP) {
      subject = this.concatBufferAttributes(
        this.mapGeometry.attributes.position.array,
        this.mapGeometry.attributes.rotation.array
      );

      end = this.concatBufferAttributes(
        this.globeGeometry.attributes.position.array,
        this.globeGeometry.attributes.rotation.array
      );
      this.mode = GLOBE;
    } else {
      subject = this.concatBufferAttributes(
        this.globeGeometry.attributes.position.array,
        this.globeGeometry.attributes.rotation.array
      );

      end = this.concatBufferAttributes(
        this.mapGeometry.attributes.position.array,
        this.mapGeometry.attributes.rotation.array
      );
      this.mode = MAP;
    }

    const mesh = this.mesh;
    const dummy = new Object3D();
    let p3, r3;

    gsap.to(subject, {
      endArray: end,
      onUpdate() {
        p3 = 0;
        r3 = subject.length / 2;
        for (let i = 0; i < mesh.count; i++) {
          dummy.position.set(subject[p3++], subject[p3++], subject[p3++]);
          dummy.rotation.set(subject[r3++], subject[r3++], subject[r3++]);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      },
      duration: 2,
      ease: "power3.inOut",
    });
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
