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

export const useSatellites = (satellites: Satellite[]): ThreeJsComposable => {
  
  // geometry for InstancedMesh that holds globe positions (hide soverlapping satellites)
  const createGlobeGeometry = (
    satellites: Satellite[]
  ): BufferGeometry => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(satellites.length * 3);

    // invisible satellites to the end (InstancedMesh object count hides them)
    satellites.sort((s1, s2) => {
      return s1.visibility.globe === s2.visibility.globe
        ? 0
        : s1.visibility.globe
          ? -1
          : 1;
    });

    // count the number of satellites that should be visisble in InstancedMesh
    const visibleSatellites = satellites.filter((s) => {
      return s.visibility.globe;
    }).length;
    // add as user data so that the InstancedMesh can use it for object.count
    geometry.userData = { visibleSatellites: visibleSatellites };

    // return the geometry for all globe positions (incl. to be hidden)
    let i3 = 0;
    for (let i = 0; i < satellites.length; i++) {
      positions[i3++] = satellites[i].node.vector.globe.x;
      positions[i3++] = satellites[i].node.vector.globe.y;
      positions[i3++] = satellites[i].node.vector.globe.z;
    }
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    return geometry;
  };

  // geometry for InstancedMesh that holds graph positions
  const createGraphGeometry = (satellites: Satellite[]) => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(satellites.length * 3);

    // always visible
    /*
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
    */
    const visibleSatellites = satellites;

    let i3 = 0;
    for (let i = 0; i < satellites.length; i++) {
      positions[i3++] = satellites[i].node.vector.graph.x;
      positions[i3++] = satellites[i].node.vector.graph.y;
      positions[i3++] = satellites[i].node.vector.graph.z;
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
    const globe = createGlobeGeometry(satellites);
    const graph = createGraphGeometry(satellites);

    const orientation = globe;
    object = instancedMeshFromGeometry(orientation);
    object.count = orientation.userData.visibleSatellites;
    loaded.value = true;
  };

  const loaded = ref(false);
  let object = new InstancedMesh(undefined, undefined, 0);
  object.name = "Satellites";
  load();

  return { object, loaded };
};
