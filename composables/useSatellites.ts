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
  Scene,
} from "three";

const settings = {
  satellite: {
    size: 2,
  },
};

export const useSatellites = (scene: Scene, bloom: SelectiveBloomEffect, data: { satellites: Satellite[]; edges: Edge[] }) => {
  const loaded = ref(false);
  let changeEdgeColor: (satellites: Satellite[]) => void;
  let satellites = new InstancedMesh(undefined, undefined, 0);
  satellites.name = "Satellites";

  // geometry for InstancedMesh that holds globe positions (hide soverlapping satellites)
  const createGlobeGeometry = (): BufferGeometry => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(data.satellites.length * 3);

    // invisible satellites to the end (InstancedMesh object count hides them)
    data.satellites.sort((s1, s2) => {
      return s1.mode.globe.visible === s2.mode.globe.visible ? 0 : s1.mode.globe.visible ? -1 : 1;
    });

    // count the number of satellites that should be visisble in InstancedMesh
    const visibleSatellites = data.satellites.filter((s) => {
      return s.mode.globe.visible;
    }).length;
    // add as user data so that the InstancedMesh can use it for object.count
    geometry.userData = { visibleSatellites: visibleSatellites };

    // return the geometry for all globe positions (incl. to be hidden)
    let i3 = 0;
    data.satellites.map((sat) => {
      positions[i3++] = sat.mode.globe.vector.x;
      positions[i3++] = sat.mode.globe.vector.y;
      positions[i3++] = sat.mode.globe.vector.z;
    });
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    return geometry;
  };

  // geometry for InstancedMesh that holds graph positions
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
    data.satellites.map((sat) => {
      positions[i3++] = sat.mode.graph.vector.x;
      positions[i3++] = sat.mode.graph.vector.y;
      positions[i3++] = sat.mode.graph.vector.z;
    });
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.userData = { visibleSatellites: visibleSatellites };
    return geometry;
  };

  const instancedMeshFromGeometry = (geometry: BufferGeometry): InstancedMesh => {
    const instances = geometry.attributes.position.array.length / 3;
    const cube = new BoxGeometry(settings.satellite.size, settings.satellite.size, settings.satellite.size);
    const instancedCube = new InstancedBufferGeometry().copy(cube);
    const material = new MeshBasicMaterial();
    let mesh = new InstancedMesh(instancedCube, material, instances);
    mesh.name = "Satellites";

    const dummy = new Object3D();
    const color = new Color();
    let i3 = 0;
    for (let i = 0; i < instances; i++) {
      dummy.position.set(geometry.attributes.position.array[i3++], geometry.attributes.position.array[i3++], geometry.attributes.position.array[i3++]);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(data.satellites[i].color));
    }

    return mesh;
  };

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

  const load = async () => {
    // create satellites
    const globe = createGlobeGeometry();
    const graph = createGraphGeometry();

    const orientation = globe;
    satellites = instancedMeshFromGeometry(orientation);
    satellites.count = orientation.userData.visibleSatellites;
    scene.add(satellites);

    // create edges between satellites
    const $edges = useSatelliteEdges(scene, bloom, data.edges);
    changeEdgeColor = $edges.changeColor;
    loaded.value = true;
  };
  load();

  return { satellites, loaded, changeColor };
};
