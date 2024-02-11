import {
  BufferGeometry,
  BufferAttribute,
  Object3D,
  CircleGeometry,
  InstancedBufferGeometry,
  MeshPhongMaterial,
  DoubleSide,
  InstancedMesh,
  Color,
  MathUtils,
  Scene,
} from "three";
import { globedots } from "~/assets/dots/dots.globe";
import { mapdots } from "~/assets/dots/dots.map";
import { gsap } from "gsap";

export const useDigitalGlobe = (scene: Scene, colors: string[]) => {
  let globeOrientation: BufferGeometry;
  let mapOrientation: BufferGeometry;
  let globe: InstancedMesh = new InstancedMesh(undefined, undefined, 0);
  globe.name = "DigitalGlobe";
  const loaded = ref(false);

  const createGlobeOrientedGeometry = (): BufferGeometry => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", dotsToPositions(globedots));
    geometry.setAttribute("rotation", rotatePositionsToGlobe(geometry));
    return geometry;
  };

  const createMapOrientedGeometry = (): BufferGeometry => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", dotsToPositions(mapdots));
    geometry.setAttribute("rotation", rotatePositionsToMap(geometry));
    return geometry;
  };

  const dotsToPositions = (dots: Dot[]): BufferAttribute => {
    const position = new Float32Array(dots.length * 3);
    let i3 = 0;

    dots.map((dot) => {
      position[i3++] = dot.x;
      position[i3++] = dot.y;
      position[i3++] = dot.z;
    });

    return new BufferAttribute(position, 3);
  };

  const rotatePositionsToGlobe = (geom: BufferGeometry): BufferAttribute => {
    const rotation = new Float32Array(geom.attributes.position.array.length);
    const dummy = new Object3D();

    for (let i = 0; i < rotation.length; i += 3) {
      dummy.position.set(geom.attributes.position.array[i], geom.attributes.position.array[i + 1], geom.attributes.position.array[i + 2]);
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

  const instancedMeshFromGeometry = (geometry: BufferGeometry): InstancedMesh => {
    const instances = geometry.attributes.position.array.length / 3;
    const circle = new CircleGeometry(0.7, 6);
    const instancedCircle = new InstancedBufferGeometry().copy(circle);
    const material = new MeshPhongMaterial({ side: DoubleSide });

    const mesh = new InstancedMesh(instancedCircle, material, instances);
    mesh.name = "DigitalGlobe";
    const dummy = new Object3D();
    const color = new Color();
    let i3 = 0;
    for (let i = 0; i < instances; i++) {
      dummy.position.set(geometry.attributes.position.array[i3], geometry.attributes.position.array[i3 + 1], geometry.attributes.position.array[i3 + 2]);
      dummy.rotation.set(geometry.attributes.rotation.array[i3], geometry.attributes.rotation.array[i3 + 1], geometry.attributes.rotation.array[i3 + 2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.set(colors[MathUtils.randInt(0, colors.length - 1)]);
      mesh.setColorAt(i, color);
      i3 += 3;
    }

    return mesh;
  };

  const transformToGlobe = () => {
    let subject: number[] = [];
    let end: number[] = [];

    subject = concatBufferAttributes(mapOrientation.attributes.position.array, mapOrientation.attributes.rotation.array);
    end = concatBufferAttributes(globeOrientation.attributes.position.array, globeOrientation.attributes.rotation.array);

    animateTransformation(subject, end);
  };

  const transformToMap = () => {
    let subject: number[] = [];
    let end: number[] = [];

    subject = concatBufferAttributes(globeOrientation.attributes.position.array, globeOrientation.attributes.rotation.array);
    end = concatBufferAttributes(mapOrientation.attributes.position.array, mapOrientation.attributes.rotation.array);

    animateTransformation(subject, end);
  };

  const concatBufferAttributes = (a: ArrayLike<number>, b: ArrayLike<number>): number[] => {
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
        for (let i = 0; i < globe.count; i++) {
          dummy.position.set(subject[p3++], subject[p3++], subject[p3++]);
          dummy.rotation.set(subject[r3++], subject[r3++], subject[r3++]);
          dummy.updateMatrix();
          globe.setMatrixAt(i, dummy.matrix);
        }
        globe.instanceMatrix.needsUpdate = true;
      },
      duration: 2,
      ease: "power3.inOut",
    });
  };

  const changeColor = (newColors: string[]) => {
    colors = newColors;
    let color = new Color();
    for (let i = 0; i < globe.count; i++) {
      color.set(colors[MathUtils.randInt(0, colors.length - 1)]);
      globe.setColorAt(i, color);
    }
    if (globe.instanceColor) {
      globe.instanceColor.needsUpdate = true;
    }
  };

  const animate = () => {
    const color = new Color();
    const animateColors = () => {
      for (let i = 0; i < globe.count; i++) {
        if (Math.random() > 0.98) {
          color.set(colors[MathUtils.randInt(0, colors.length - 1)]);
          globe.setColorAt(i, color);
        }
      }

      if (globe.instanceColor) {
        globe.instanceColor.needsUpdate = true;
      }
    };
    gsap.set(animateColors, { delay: 1, onRepeat: animateColors, repeat: -1, repeatDelay: 0.1 });
    gsap.to(globe.rotation, {
      y: MathUtils.degToRad(360),
      duration: 60,
      repeat: -1,
      ease: "linear",
    });
  };

  const load = async () => {
    globeOrientation = createGlobeOrientedGeometry();
    mapOrientation = createMapOrientedGeometry();

    const orientation = globeOrientation;
    globe = instancedMeshFromGeometry(orientation);
    scene.add(globe);
    animate();
    loaded.value = true;
  };
  load();

  return {
    loaded,
    globe,
    changeColor,
    transformToGlobe,
    transformToMap,
  };
};
