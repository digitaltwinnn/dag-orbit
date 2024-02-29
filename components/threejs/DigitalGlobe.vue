<script setup lang="ts">
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
} from "three";
import { globedots } from "~/assets/dots/dots.globe";
import { mapdots } from "~/assets/dots/dots.map";
import { gsap } from "gsap";

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");
watch(colors, () => changeColor(colors.value));

/**
 * Creates a globe geometry.
 * @returns {BufferGeometry} The created globe geometry.
 */
const createGlobeGeometry = (): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", dotsToPositions(globedots));
  geometry.setAttribute("rotation", rotatePositionsToGlobe(geometry));
  return geometry;
};

/**
 * Creates a map geometry.
 * @returns {BufferGeometry} The created map geometry.
 */
const createMapGeometry = (): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", dotsToPositions(mapdots));
  geometry.setAttribute("rotation", rotatePositionsToMap(geometry));
  return geometry;
};

/**
 * Converts an array of dots to a BufferAttribute of positions.
 * @param {Dot[]} dots - The array of dots to convert.
 * @returns {BufferAttribute} - The BufferAttribute of positions.
 */
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

/**
 * Rotates the positions of a geometry to align with the globe.
 * @param {BufferGeometry} geom - The geometry to rotate.
 * @returns {BufferAttribute} - The rotated geometry.
 */
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

/**
 * Rotates the positions of a geometry to the map.
 * @param {BufferGeometry} geom - The geometry to convert.
 * @returns {BufferAttribute} - The converted geometry positions as a buffer attribute.
 */
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

/**
 * Creates an instanced mesh from a given geometry.
 * @param {BufferGeometry} geometry - The geometry to create the instanced mesh from.
 * @returns {InstancedMesh} The created instanced mesh.
 */
const instancedMeshFromGeometry = (geometry: BufferGeometry): InstancedMesh => {
  const instances = geometry.attributes.position.array.length / 3;
  const circle = new CircleGeometry(0.7, 6);
  const instancedCircle = new InstancedBufferGeometry().copy(circle);
  const material = new MeshPhongMaterial({ side: DoubleSide, transparent: true });

  const mesh = new InstancedMesh(instancedCircle, material, instances);
  mesh.name = "DigitalGlobe";
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

    color.set(colors[MathUtils.randInt(0, colors.length - 1)]);
    mesh.setColorAt(i, color);
    i3 += 3;
  }

  return mesh;
};

/**
 * Transforms the geometry to a globe.
 */
const transformToGlobe = () => {
  let subject: number[] = [];
  let end: number[] = [];

  subject = concatBufferAttributes(
    mapGeometry.attributes.position.array,
    mapGeometry.attributes.rotation.array
  );
  end = concatBufferAttributes(
    globeGeometry.attributes.position.array,
    globeGeometry.attributes.rotation.array
  );

  animateTransformation(subject, end);
};

/**
 * Transforms the geometry to a map.
 */
const transformToMap = () => {
  let subject: number[] = [];
  let end: number[] = [];

  subject = concatBufferAttributes(
    globeGeometry.attributes.position.array,
    globeGeometry.attributes.rotation.array
  );
  end = concatBufferAttributes(
    mapGeometry.attributes.position.array,
    mapGeometry.attributes.rotation.array
  );

  animateTransformation(subject, end);
};

/**
 * Concatenates two buffer attributes.
 * @param a - The first buffer attribute.
 * @param b - The second buffer attribute.
 * @returns The concatenated buffer attribute.
 */
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

/**
 * Animates the transformation from one array of vertices to another.
 * @param {number[]} subject - The subject to be transformed.
 * @param {number[]} end - The end state of the transformation.
 */
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

/**
 * Changes the color of the DigitalGlobe.
 * @param {string[]} newColors - An array of new colors to apply.
 */
const changeColor = (newColors: string[]) => {
  let color = new Color();
  for (let i = 0; i < globe.count; i++) {
    color.set(colors.value[MathUtils.randInt(0, colors.value.length - 1)]);
    globe.setColorAt(i, color);
  }
  if (globe.instanceColor) {
    globe.instanceColor.needsUpdate = true;
  }
};

/**
 * Animates the DigitalGlobe by rotating it and changing the dot colors at random intervals.
 */
const animate = () => {
  const color = new Color();
  const animateColors = () => {
    for (let i = 0; i < globe.count; i++) {
      if (Math.random() > 0.98) {
        color.set(colors.value[MathUtils.randInt(0, colors.value.length - 1)]);
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

const globeGeometry = createGlobeGeometry();
const mapGeometry = createMapGeometry();
const activeGeometry = globeGeometry;
const globe = instancedMeshFromGeometry(activeGeometry);
globe.name = "DigitalGlobe";
scene.add(globe);
animate();

onMounted(() => {
  const $theatre = useTheatre();
  $theatre.registration.registerDigtalGlobe(globe);
});
</script>

<template>
  <div></div>
</template>
