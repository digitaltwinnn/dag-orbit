import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedBufferGeometry,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
} from "three";

const settings = {
  satellite: {
    size: 1,
  },
};

export const useSatellites = (satellites: Satellite[]) => {
  const createGlobeOrientedGeometry = (
    satellites: Satellite[]
  ): BufferGeometry => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(satellites.length * 3);

    satellites.sort((s1, s2) => {
      return s1.orientation.globe.visible === s2.orientation.globe.visible
        ? 0
        : s1.orientation.globe.visible
        ? -1
        : 1;
    });
    const visibleSatellites = satellites.filter((s) => {
      return s.orientation.globe.visible;
    }).length;

    let i3 = 0;
    for (let i = 0; i < satellites.length; i++) {
      positions[i3++] = satellites[i].orientation.globe.position.x;
      positions[i3++] = satellites[i].orientation.globe.position.y;
      positions[i3++] = satellites[i].orientation.globe.position.z;
    }
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.userData = { visibleSatellites: visibleSatellites };
    return geometry;
  };

  const createGraphOrientedGeometry = (satellites: Satellite[]) => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(satellites.length * 3);

    satellites.sort((s1, s2) => {
      return s1.orientation.graph.visible === s2.orientation.graph.visible
        ? 0
        : s1.orientation.graph.visible
        ? -1
        : 1;
    });
    const visibleSatellites = satellites.filter((s) => {
      return s.orientation.graph.visible;
    }).length;

    let i3 = 0;
    for (let i = 0; i < satellites.length; i++) {
      positions[i3++] = satellites[i].orientation.graph.position.x;
      positions[i3++] = satellites[i].orientation.graph.position.y;
      positions[i3++] = satellites[i].orientation.graph.position.z;
    }
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    // geometry.scale(10, 10, 10);
    geometry.userData = { visibleSatellites: visibleSatellites };
    return geometry;
  };

  const instancedMeshFromGeometry = (
    geometry: BufferGeometry
  ): InstancedMesh => {
    const instances = geometry.attributes.position.array.length / 3;
    const cube = new BoxGeometry(
      settings.satellite.size,
      settings.satellite.size,
      settings.satellite.size
    );
    const instancedCube = new InstancedBufferGeometry().copy(cube);
    const material = new MeshBasicMaterial();
    let mesh = new InstancedMesh(instancedCube, material, instances);

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
      mesh.setColorAt(i, color.set(satellites[i].color));
    }

    return mesh;
  };

  const load = async () => {
    const globeOrientation = createGlobeOrientedGeometry(satellites);
    const graphOrientation = createGraphOrientedGeometry(satellites);

    const orientation = globeOrientation;
    mesh = instancedMeshFromGeometry(orientation);
    mesh.count = orientation.userData.visibleSatellites;
    loaded.value = true;
  };

  const loaded = ref(false);
  let mesh = new InstancedMesh(undefined, undefined, 0);
  mesh.name = "Satellites";
  load();

  return { mesh, loaded };
};
