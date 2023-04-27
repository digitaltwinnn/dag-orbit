import {
  BoxGeometry,
  Color,
  InstancedBufferGeometry,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
} from "three";

const settings = {
  globe: {
    radius: 120,
  },
  satellite: {
    size: 0.1,
  },
};

export const useSatellites = async (
  parent: Object3D,
  satellites: Satellite[]
) => {
  const satSize = settings.satellite.size;
  const cube = new BoxGeometry(satSize, satSize, satSize);
  const instancedCube = new InstancedBufferGeometry().copy(cube);
  const material = new MeshBasicMaterial();
  const mesh = new InstancedMesh(instancedCube, material, satellites.length);

  // invisible satellites at the end to be hidden by setting the count value
  satellites.sort((s1, s2) => {
    return s1.visible === s2.visible ? 0 : s1.visible ? -1 : 1;
  });
  const visibleSatellites = satellites.filter((s) => {
    return s.visible;
  }).length;

  // populate the instancedMesh matrix for all the satellites
  const dummy = new Object3D();
  const color = new Color();
  let position = new Vector3();
  for (let i = 0; i < satellites.length; i++) {
    const satellite = satellites[i];
    position = useGlobeUtils().toVector(
      satellite.node.host.latitude,
      satellite.node.host.longitude,
      settings.globe.radius
    );
    dummy.position.set(position.x, position.y, position.z);
    dummy.lookAt(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, color.set(satellite.color));
  }
  mesh.count = visibleSatellites;
  mesh.name = "Satellites";
  parent.add(mesh);

  return { mesh };
};
