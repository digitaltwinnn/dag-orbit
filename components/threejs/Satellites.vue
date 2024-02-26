<script setup lang="ts">
import { gsap } from "gsap";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedBufferGeometry,
  InstancedMesh,
  MathUtils,
  MeshBasicMaterial,
  Object3D,
} from "three";

const props = defineProps({
  nodes: {
    type: Array<L0Node>,
    required: true,
  },
});

const sats: Satellite[] = [];
const edges: Edge[] = [];

const settings = {
  satellite: {
    size: 2,
  },
};

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let bloom = inject(bloomKey);
if (!bloom) throw new Error("Bloom effect not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");
let changeEdgeColor: (satellites: Satellite[]) => void;
watch(colors, () => changeColor(colors.value));

let satellites = new InstancedMesh(undefined, undefined, 0);
const loaded = ref(false);

/**
 * Creates a globe geometry based on the data of satellites.
 * @returns The created BufferGeometry object.
 */
const createGlobeGeometry = (): BufferGeometry => {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(sats.length * 3);

  sats.sort((s1, s2) => {
    return s1.mode.globe.visible === s2.mode.globe.visible ? 0 : s1.mode.globe.visible ? -1 : 1;
  });
  const visibleSatellites = sats.filter((s) => {
    return s.mode.globe.visible;
  }).length;
  geometry.userData = { visibleSatellites: visibleSatellites };

  let i3 = 0;
  sats.map((sat) => {
    positions[i3++] = sat.mode.globe.vector.x;
    positions[i3++] = sat.mode.globe.vector.y;
    positions[i3++] = sat.mode.globe.vector.z;
  });
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return geometry;
};

/**
 * Creates a graph geometry based on the data of satellites.
 * @returns The created BufferGeometry object.
 */
const createGraphGeometry = () => {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(sats.length * 3);

  // always visible
  sats.sort((s1, s2) => {
    return s1.mode.graph.visible === s2.mode.graph.visible ? 0 : s1.mode.graph.visible ? -1 : 1;
  });
  const visibleSatellites = sats.filter((s) => {
    return s.mode.graph.visible;
  }).length;

  let i3 = 0;
  sats.forEach((sat) => {
    positions[i3++] = sat.mode.graph.vector.x;
    positions[i3++] = sat.mode.graph.vector.y;
    positions[i3++] = sat.mode.graph.vector.z;
  });
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.userData = { visibleSatellites: visibleSatellites };
  return geometry;
};

/**
 * Creates an InstancedMesh object from a BufferGeometry object.
 * @param geometry - The BufferGeometry object to create the InstancedMesh from.
 * @returns The created InstancedMesh object.
 */
const instancedMeshFromGeometry = (geometry: BufferGeometry): InstancedMesh => {
  const instances = geometry.attributes.position.array.length / 3;
  const cube = new BoxGeometry(
    settings.satellite.size,
    settings.satellite.size,
    settings.satellite.size
  );
  const instancedCube = new InstancedBufferGeometry().copy(cube);
  const material = new MeshBasicMaterial({ transparent: true });
  let mesh = new InstancedMesh(instancedCube, material, instances);
  mesh.name = "Satellites";

  const dummy = new Object3D();
  const color = new Color();
  let i3 = 0;
  for (let i = 0; i < instances; i++) {
    dummy.position.set(
      geometry.attributes.position.array[i3++],
      geometry.attributes.position.array[i3++],
      geometry.attributes.position.array[i3++]
    );
    dummy.lookAt(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, color.set(sats[i].color));
  }

  return mesh;
};

/**
 * Changes the color of the satellites.
 * @param newColors - The new colors to change to.
 */
const changeColor = (newColors: string[]) => {
  const color = new Color();
  let i = 0;

  if (satellites.instanceColor) {
    sats.forEach((sat) => {
      color.set(newColors[MathUtils.randInt(0, newColors.length - 1)]);
      sat.color = color.clone();
      satellites.setColorAt(i++, sat.color);
    });
    satellites.instanceColor.needsUpdate = true;
  }

  if (changeEdgeColor) changeEdgeColor(sats);
};

/**
 * Animates the satellites.
 */
const animate = () => {
  gsap.to(satellites.rotation, {
    y: MathUtils.degToRad(360),
    duration: 60,
    repeat: -1,
    ease: "linear",
  });
};

onMounted(() => {
  const $data = useClusterDataProcessor(props.nodes, colors.value);
  watch($data.loaded, () => {
    sats.push(...$data.satellites);
    edges.push(...$data.satelliteEdges);

    // Satellites
    const orientation = createGlobeGeometry();
    satellites = instancedMeshFromGeometry(orientation);
    satellites.count = orientation.userData.visibleSatellites;
    scene.add(satellites);

    // Edges
    const $edges = useSatelliteEdges(satellites, bloom, edges);
    changeEdgeColor = $edges.changeColor;

    animate();
  });
});
</script>

<template>
  <div></div>
</template>
