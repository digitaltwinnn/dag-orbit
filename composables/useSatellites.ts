import { SelectiveBloomEffect } from "postprocessing";
import {
  BoxGeometry,
  Color,
  InstancedBufferGeometry,
  InstancedMesh,
  MeshPhongMaterial,
  Object3D,
  Vector3,
} from "three";

const settings = {
  globe: {
    radius: 120,
  },
  satellite: {
    size: 1,
  },
};

export const useSatellites = async (
  parent: Object3D,
  satellites: Satellite[],
  bloom: SelectiveBloomEffect
) => {
  const satSize = settings.satellite.size;
  const cube = new BoxGeometry(satSize, satSize, satSize);

  const instancedCube = new InstancedBufferGeometry().copy(cube);
  const material = new MeshPhongMaterial();
  const mesh = new InstancedMesh(instancedCube, material, satellites.length);

  const dummy = new Object3D();
  const color = new Color();
  let position = new Vector3();
  for (let i = 0; i < satellites.length; i++) {
    const satellite = satellites[i];
    position = useGlobeUtils().toVector(
      satellite.lat,
      satellite.lng,
      settings.globe.radius
    );
    dummy.position.set(position.x, position.y, position.z);
    dummy.lookAt(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    color.set(satellite.color);
    mesh.setColorAt(i, color);
  }
  mesh.name = "Satellites";
  parent.add(mesh);
  bloom.selection.add(mesh);

  return { mesh };
};
