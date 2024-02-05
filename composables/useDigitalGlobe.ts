import {
  BufferGeometry,
  ImageLoader,
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
import { globedots } from "~/assets/dots/dots.globe";
import { mapdots } from "~/assets/dots/dots.map";
import { gsap } from "gsap";

export const useDigitalGlobe = async (parent: Object3D, colors: string[]) => {
  const settings = {
    colors: colors,
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

  const createGlobeOrientedGeometry = (
    image: HTMLImageElement,
    context: CanvasRenderingContext2D
  ): BufferGeometry => {
    /*
    const dots = [];
    const $globeUtils = useGlobeUtils();

    let r = 0;
    let circumference = 0;
    let dotsForLat = 0;

    let long = 0;
    let coordinate = { x: 0, y: 0 };
    let pixelData = null;

    for (let lat = -90; lat <= 90; lat += 180 / settings.globe.rows) {
      r = Math.cos((Math.abs(lat) * Math.PI) / 180) * settings.globe.radius;
      circumference = r * Math.PI * 2;
      dotsForLat = circumference * settings.globe.density;

      if (dotsForLat >= 1) {
        for (let x = 0; x < dotsForLat; x++) {
          long = -180 + (x * 360) / dotsForLat;
          coordinate = $globeUtils.latLongToXY(
            lat,
            long,
            image.width,
            image.height
          );

          pixelData = context.getImageData(
            coordinate.x,
            coordinate.y,
            1,
            1
          ).data;
          if (pixelData[0] <= 5) {
            dots.push(
              $globeUtils
                .toVector(lat, long, settings.globe.radius)
                .normalize()
                .multiplyScalar(settings.globe.radius)
            );
          }
        }
      }
    }
    if (dots.length < settings.globe.maxDots) {
      for (let i = 0; settings.globe.maxDots - dots.length; i++) {
        dots.push(new Vector3(0, 0, 0));
      }
    }
    */

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", dotsToPositions(globedots));
    geometry.setAttribute("rotation", rotatePositionsToGlobe(geometry));
    return geometry;
  };

  const createMapOrientedGeometry = (
    image: HTMLImageElement,
    context: CanvasRenderingContext2D
  ): BufferGeometry => {
    /*
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
    */

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", dotsToPositions(mapdots));
    geometry.setAttribute("rotation", rotatePositionsToMap(geometry));
    return geometry;
  };

  const dotsToPositions = (dots: Dot[]): BufferAttribute => {
    const position = new Float32Array(dots.length * 3);
    let i3 = 0;

    for (let i = 0; i < dots.length; i++) {
      position[i3++] = dots[i].x;
      position[i3++] = dots[i].y;
      position[i3++] = dots[i].z;
    }
    return new BufferAttribute(position, 3);
  };

  const rotatePositionsToGlobe = (geom: BufferGeometry): BufferAttribute => {
    const rotation = new Float32Array(geom.attributes.position.array.length);
    const dummy = new Object3D();

    for (let i = 0; i < rotation.length; i += 3) {
      dummy.position.set(
        geom.attributes.position.array[i],
        geom.attributes.position.array[i + 1],
        geom.attributes.position.array[i + 2]
      );
      dummy.lookAt(0, 0, 0);

      rotation[i] = dummy.rotation.x;
      rotation[i + 1] = dummy.rotation.y;
      rotation[i + 2] = dummy.rotation.z;
    }
    return new BufferAttribute(rotation, 3);
  };

  const rotatePositionsToMap = (geom: BufferGeometry): BufferAttribute => {
    const rotation = new Float32Array(geom.attributes.position.array.length);
    const dummy = new Object3D();

    for (let i = 0; i < rotation.length; i += 3) {
      dummy.rotation.set(0, 0, Math.PI / 2);
      rotation[i] = dummy.rotation.x;
      rotation[i + 1] = dummy.rotation.y;
      rotation[i + 2] = dummy.rotation.z;
    }
    return new BufferAttribute(rotation, 3);
  };

  const instancedMeshFromGeometry = (
    geometry: BufferGeometry
  ): InstancedMesh => {
    const instances = geometry.attributes.position.array.length / 3;
    const circle = new CircleGeometry(0.7, 6);
    const instancedCircle = new InstancedBufferGeometry().copy(circle);
    const material = new MeshPhongMaterial({ side: DoubleSide });

    const mesh = new InstancedMesh(instancedCircle, material, instances);
    const dummy = new Object3D();
    const color = new Color();
    let i3 = 0;
    for (let i = 0; i < instances; i++) {
      dummy.position.set(
        geometry.attributes.position.array[i3],
        geometry.attributes.position.array[i3 + 1],
        geometry.attributes.position.array[i3 + 2]
      );
      dummy.rotation.set(
        geometry.attributes.rotation.array[i3],
        geometry.attributes.rotation.array[i3 + 1],
        geometry.attributes.rotation.array[i3 + 2]
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.set(
        settings.colors[MathUtils.randInt(0, settings.colors.length - 1)]
      );
      mesh.setColorAt(i, color);
      i3 += 3;
    }

    return mesh;
  };

  const transformToGlobe = () => {
    let subject: number[] = [];
    let end: number[] = [];

    subject = concatBufferAttributes(
      mapOrientation.attributes.position.array,
      mapOrientation.attributes.rotation.array
    );
    end = concatBufferAttributes(
      globeOrientation.attributes.position.array,
      globeOrientation.attributes.rotation.array
    );

    animateTransformation(subject, end);
  };

  const transformToMap = () => {
    let subject: number[] = [];
    let end: number[] = [];

    subject = concatBufferAttributes(
      globeOrientation.attributes.position.array,
      globeOrientation.attributes.rotation.array
    );
    end = concatBufferAttributes(
      mapOrientation.attributes.position.array,
      mapOrientation.attributes.rotation.array
    );

    animateTransformation(subject, end);
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

  const animateTransformation = (subject: number[], end: number[]) => {
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


  const animate = () => {
    const color = new Color();
    const animateColors = () => {
      for (let i = 0; i < mesh.count; i++) {
        if (Math.random() > 0.98) {
          color.set(
            colors[MathUtils.randInt(0, colors.length - 1)]
          );
          mesh.setColorAt(i, color);
        }
      }

      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }

    }
    gsap.set(animateColors, { delay: 1, onRepeat: animateColors, repeat: -1, repeatDelay: 0.1 });
  }

  let mesh: InstancedMesh = new InstancedMesh(undefined, undefined, 0);
  let globeOrientation: BufferGeometry;
  let mapOrientation: BufferGeometry;

  const $img = useImage();
  const imgUrl = $img("/earthspec1k.jpg", { width: 1024 });
  const loader = new ImageLoader();

  const image = await loader.loadAsync(imgUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context ? context.drawImage(image, 0, 0) : null;

  if (context) {
    globeOrientation = createGlobeOrientedGeometry(image, context);
    mapOrientation = createMapOrientedGeometry(image, context);

    const orientation = globeOrientation;
    mesh = instancedMeshFromGeometry(orientation);
    mesh.name = "DigitalGlobe";
    parent.add(mesh);
    animate();
  }

  return {
    mesh,
    transformToGlobe,
    transformToMap,
  };
};
