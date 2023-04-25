import {
  Group,
  BufferGeometry,
  ImageLoader,
  Vector3,
  BufferAttribute,
  Object3D,
  CircleGeometry,
  InstancedBufferGeometry,
  MeshPhongMaterial,
  DoubleSide,
  InstancedMesh,
  Color,
  MathUtils,
} from "three";
import { gsap } from "gsap";

const GLOBE = 0;
const MAP = 1;

const settings = {
  colors: ["#1E90FE", "#1467C8", "#1053AD"],
  mode: GLOBE,
  globe: {
    density: 0.5,
    rows: 150,
    radius: 130,
    maxDots: 11500,
  },
  map: {
    step: 4.2,
  },
};

let mesh: InstancedMesh;
let globeGeometry: BufferGeometry;
let mapGeometry: BufferGeometry;

const init = async (parent: Object3D) => {
  const $img = useImage();
  const imgUrl = $img("/earthspec1k.jpg", { width: 1024 });
  const loader = new ImageLoader();

  loader.load(imgUrl, (image) => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context ? context.drawImage(image, 0, 0) : null;

    if (context) {
      globeGeometry = createGlobeGeometry(image, context);
      mapGeometry = createMapGeometry(image, context);

      mesh = instancedMeshFromGeometry(globeGeometry);
      mesh.name = "DigitalGlobe";
      parent.add(mesh);
    }
  });
};

const createGlobeGeometry = (
  image: HTMLImageElement,
  context: CanvasRenderingContext2D
): BufferGeometry => {
  const dots = [];
  const $util = useGlobeUtils();

  for (let lat = -90; lat <= 90; lat += 180 / settings.globe.rows) {
    const r = Math.cos((Math.abs(lat) * Math.PI) / 180) * settings.globe.radius;
    const circumference = r * Math.PI * 2;
    const dotsForLat = circumference * settings.globe.density;

    for (let x = 0; x < dotsForLat; x++) {
      const long = -180 + (x * 360) / dotsForLat;
      const coordinate = $util.latLongToXY(
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
          $util
            .toVector(lat, long, settings.globe.radius)
            .normalize()
            .multiplyScalar(settings.globe.radius)
        );
      }
    }
  }
  if (dots.length < settings.globe.maxDots) {
    for (let i = 0; settings.globe.maxDots - dots.length; i++) {
      dots.push(new Vector3(0, 0, 0));
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", dotsToPositions(dots));
  geometry.setAttribute("rotation", rotatePositions(geometry, GLOBE));
  return geometry;
};

const createMapGeometry = (
  image: HTMLImageElement,
  context: CanvasRenderingContext2D
): BufferGeometry => {
  const dots = [];
  for (let x = 0; x < image.width; x += settings.map.step) {
    for (let y = 0; y < image.height; y += settings.map.step) {
      const pixelData = context.getImageData(x, y, 1, 1).data;
      if (pixelData[0] <= 5) {
        const posX = x - 0.5 * image.width;
        const posY = -y + 0.5 * image.height;
        dots.push(new Vector3(posX / 3, posY / 3, 0));
      }
    }
  }
  if (dots.length < settings.globe.maxDots) {
    for (let i = 0; settings.globe.maxDots - dots.length; i++) {
      dots.push(new Vector3(0, 0, 0));
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", dotsToPositions(dots));
  geometry.setAttribute("rotation", rotatePositions(geometry, MAP));
  return geometry;
};

const dotsToPositions = (dots: Vector3[]): BufferAttribute => {
  const position = new Float32Array(dots.length * 3);
  let i3 = 0;

  for (let i = 0; i < dots.length; i++) {
    position[i3++] = dots[i].x;
    position[i3++] = dots[i].y;
    position[i3++] = dots[i].z;
  }
  return new BufferAttribute(position, 3);
};

const rotatePositions = (
  geom: BufferGeometry,
  mode: number
): BufferAttribute => {
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
};

const instancedMeshFromGeometry = (geom: BufferGeometry): InstancedMesh => {
  let geometry: BufferGeometry = geom.clone();

  const size = geometry.attributes.position.array.length / 3;
  const circle = new CircleGeometry(0.7, 6);
  const instancedCircle = new InstancedBufferGeometry().copy(circle);
  const material = new MeshPhongMaterial({ side: DoubleSide });

  const mesh = new InstancedMesh(instancedCircle, material, size);
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
    if (settings.mode == GLOBE) {
      dummy.lookAt(0, 0, 0);
    } else {
      dummy.rotation.set(0, 0, Math.PI / 2);
    }
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    color.set(
      settings.colors[MathUtils.randInt(0, settings.colors.length - 1)]
    );
    mesh.setColorAt(i, color);
  }

  return mesh;
};

const transform = () => {
  let subject: number[] = [];
  let end: number[] = [];

  if (settings.mode == MAP) {
    subject = concatBufferAttributes(
      mapGeometry.attributes.position.array,
      mapGeometry.attributes.rotation.array
    );

    end = concatBufferAttributes(
      globeGeometry.attributes.position.array,
      globeGeometry.attributes.rotation.array
    );
    settings.mode = GLOBE;
  } else {
    subject = concatBufferAttributes(
      globeGeometry.attributes.position.array,
      globeGeometry.attributes.rotation.array
    );

    end = concatBufferAttributes(
      mapGeometry.attributes.position.array,
      mapGeometry.attributes.rotation.array
    );
    settings.mode = MAP;
  }

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
};

const concatBufferAttributes = (
  a: ArrayLike<number>,
  b: ArrayLike<number>
): number[] => {
  const array: any[] = [];
  for (let i = 0; i < a.length; i++) {
    array.push(a[i]);
  }
  for (let i = 0; i < b.length; i++) {
    array.push(b[i]);
  }
  return array;
};

/*
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
*/

export const useDigitalGlobe = () => {
  return {
    mesh,
    init,
    transform,
  };
};
