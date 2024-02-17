import { SelectiveBloomEffect } from "postprocessing";
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
  PerspectiveCamera,
  Scene,
} from "three";
import { gsap } from "gsap";

const settings = {
  satellite: {
    size: 2,
  },
};

/**
 * A composable function that handles the creation and manipulation of satellites in a scene.
 *
 * @param scene - The scene where the satellites will be added.
 * @param bloom - The bloom effect to apply to the satellites.
 * @param data - An object containing the satellite and edge data.
 * @returns An object with the satellites, loaded state, and a function to change the satellite colors.
 */
/**
 * A composable function that handles the management of satellites in a 3D scene.
 *
 * @param scene - The scene where the satellites will be rendered.
 * @param camera - The camera used to view the scene.
 * @param bloom - The bloom effect applied to the scene.
 * @param data - An object containing the satellite and edge data.
 * @returns An object with the satellites, loaded state, and changeColor function.
 */
export const useSatellites = (
  scene: Scene,
  camera: PerspectiveCamera,
  bloom: SelectiveBloomEffect,
  data: { satellites: Satellite[]; edges: Edge[] }
) => {
  let changeEdgeColor: (satellites: Satellite[]) => void;
  let satellites = new InstancedMesh(undefined, undefined, 0);
  const loaded = ref(false);

  /**
   * Creates a globe geometry based on the data.satellites array.
   * The geometry includes both visible and invisible satellites.
   * The visibility of satellites is determined by the 'globe.visible' property in each satellite's 'mode' object.
   * @returns The created BufferGeometry object.
   */
  const createGlobeGeometry = (): BufferGeometry => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(data.satellites.length * 3);

    data.satellites.sort((s1, s2) => {
      return s1.mode.globe.visible === s2.mode.globe.visible ? 0 : s1.mode.globe.visible ? -1 : 1;
    });
    const visibleSatellites = data.satellites.filter((s) => {
      return s.mode.globe.visible;
    }).length;
    // add as user data so that the InstancedMesh can use it for object.count
    geometry.userData = { visibleSatellites: visibleSatellites };

    let i3 = 0;
    data.satellites.map((sat) => {
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
    const positions = new Float32Array(data.satellites.length * 3);

    // always visible
    data.satellites.sort((s1, s2) => {
      return s1.mode.graph.visible === s2.mode.graph.visible ? 0 : s1.mode.graph.visible ? -1 : 1;
    });
    const visibleSatellites = data.satellites.filter((s) => {
      return s.mode.graph.visible;
    }).length;

    let i3 = 0;
    data.satellites.forEach((sat) => {
      positions[i3++] = sat.mode.graph.vector.x;
      positions[i3++] = sat.mode.graph.vector.y;
      positions[i3++] = sat.mode.graph.vector.z;
    });
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.userData = { visibleSatellites: visibleSatellites };
    return geometry;
  };

  /**
   * Creates an instanced mesh from a given geometry.
   *
   * @param geometry - The geometry to create the instanced mesh from.
   * @returns The instanced mesh.
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
      mesh.setColorAt(i, color.set(data.satellites[i].color));
    }

    return mesh;
  };

  /**
   * Changes the color of the satellites.
   *
   * @param newColors - An array of new colors to assign to the satellites.
   */
  const changeColor = (newColors: string[]) => {
    const color = new Color();
    let i = 0;

    if (satellites.instanceColor) {
      data.satellites.forEach((sat) => {
        color.set(newColors[MathUtils.randInt(0, newColors.length - 1)]);
        sat.color = color.clone();
        satellites.setColorAt(i++, sat.color);
      });
      satellites.instanceColor.needsUpdate = true;
    }

    if (changeEdgeColor) changeEdgeColor(data.satellites);
  };

  /**
   * Animates the rotation of satellites.
   */
  const animate = () => {
    gsap.to(satellites.rotation, {
      y: MathUtils.degToRad(360),
      duration: 60,
      repeat: -1,
      ease: "linear",
    });
  };

  /**
   * Loads the satellites, edges, and annotations.
   * @returns {Promise<void>} A promise that resolves when the loading is complete.
   */
  const load = async () => {
    // Satellites
    const orientation = createGlobeGeometry();
    satellites = instancedMeshFromGeometry(orientation);
    satellites.count = orientation.userData.visibleSatellites;
    scene.add(satellites);

    // Edges
    const $edges = useSatelliteEdges(satellites, bloom, data.edges);
    changeEdgeColor = $edges.changeColor;

    // Annotation
    const $annotation = useSatelliteAnnotation(satellites, camera, data.satellites[0]);

    animate();
    loaded.value = true;
  };
  load();

  return { satellites, loaded, changeColor };
};
