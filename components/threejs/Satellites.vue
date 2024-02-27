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

const settings = {
  satellite: {
    size: 2,
    maxCount: 1000,
  },
};

let scene = inject(sceneKey);
if (!scene) throw new Error("Scene not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");
watch(colors, () => changeColor(colors.value));

const sats: Ref<Satellite[]> = ref([]);
const edges: Ref<Edge[]> = ref([]);

const cube = new BoxGeometry(
  settings.satellite.size,
  settings.satellite.size,
  settings.satellite.size
);
const satellites = new InstancedMesh(
  new InstancedBufferGeometry().copy(cube),
  new MeshBasicMaterial({ transparent: true }),
  settings.satellite.maxCount
);
satellites.name = "Satellites";
satellites.count = 0;
const loaded = ref(false);

/**
 * Creates a globe geometry based on the data of satellites.
 * @returns The created BufferGeometry object.
 */
const createGlobeGeometry = (): BufferGeometry => {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(sats.value.length * 3);

  sats.value.sort((s1, s2) => {
    return s1.mode.globe.visible === s2.mode.globe.visible ? 0 : s1.mode.globe.visible ? -1 : 1;
  });
  const visibleSatellites = sats.value.filter((s) => {
    return s.mode.globe.visible;
  }).length;
  geometry.userData = { visibleSatellites: visibleSatellites };

  let i3 = 0;
  sats.value.map((sat) => {
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
  const positions = new Float32Array(sats.value.length * 3);

  // always visible
  sats.value.sort((s1, s2) => {
    return s1.mode.graph.visible === s2.mode.graph.visible ? 0 : s1.mode.graph.visible ? -1 : 1;
  });
  const visibleSatellites = sats.value.filter((s) => {
    return s.mode.graph.visible;
  }).length;

  let i3 = 0;
  sats.value.forEach((sat) => {
    positions[i3++] = sat.mode.graph.vector.x;
    positions[i3++] = sat.mode.graph.vector.y;
    positions[i3++] = sat.mode.graph.vector.z;
  });
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.userData = { visibleSatellites: visibleSatellites };
  return geometry;
};

/**
 * Changes the color of the satellites.
 * @param newColors - The new colors to change to.
 */
const changeColor = (newColors: string[]) => {
  const color = new Color();
  let i = 0;

  if (satellites.instanceColor) {
    sats.value.forEach((sat) => {
      color.set(newColors[MathUtils.randInt(0, newColors.length - 1)]);
      sat.color = color.clone();
      satellites.setColorAt(i++, sat.color);
    });
    satellites.instanceColor.needsUpdate = true;
  }
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
    sats.value.push(...$data.satellites);
    edges.value.push(...$data.satelliteEdges);

    const templateGeometry = createGlobeGeometry();
    satellites.count = templateGeometry.userData.visibleSatellites;
    const maxInstances = templateGeometry.attributes.position.array.length / 3;

    if (maxInstances > settings.satellite.maxCount)
      throw new Error("Maximum satellite count exceeded");

    const dummy = new Object3D();
    const color = new Color();
    let i3 = 0;
    for (let i = 0; i < maxInstances; i++) {
      dummy.position.set(
        templateGeometry.attributes.position.array[i3++],
        templateGeometry.attributes.position.array[i3++],
        templateGeometry.attributes.position.array[i3++]
      );
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      satellites.setMatrixAt(i, dummy.matrix);
      satellites.setColorAt(i, color.set(sats.value[i].color));
    }

    scene.add(satellites);
    animate();
  });
});
</script>

<template>
  <div><ThreejsSatelliteEdges :parent="satellites" :satellites="sats" :edges="edges" /></div>
</template>
