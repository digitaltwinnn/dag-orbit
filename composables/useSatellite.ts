import {
  BoxGeometry,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { GlobeUtils } from "~~/threejs/utils/GlobeUtils";

export const useSatellite = (
  parent: Group | Mesh,
  size: number,
  color: Color,
  lat: number,
  lng: number
) => {
  const material = new MeshBasicMaterial({ color: color, wireframe: true });
  const geometry = new BoxGeometry(size, size, size);
  const mesh = new Mesh(geometry, material);
  mesh.name = "Satellite" + Math.random();
  mesh.lookAt(0, 0, 0);

  const size2 = 0.3 * size;
  const insideGeometry = new BoxGeometry(size2, size2, size2);
  const insideMaterial = material.clone();
  insideMaterial.wireframe = false;
  mesh.add(new Mesh(insideGeometry, insideMaterial));
  parent.add(mesh);

  const state = reactive({
    position: mesh.position,
    name: mesh.name,
    lat: lat,
    lng: lng,
  });

  const anchor = (altitude: number) => {
    const target = GlobeUtils.toVector(state.lat, state.lng, altitude);
    state.position.set(target.x, target.y, target.z);
    mesh.lookAt(0, 0, 0);
    mesh.rotateX(MathUtils.degToRad(90));
  };

  const tick = (deltaTime: number) => {
    const degreesPerSecond = (MathUtils.degToRad(45) * deltaTime) / 1000;
    mesh.rotateX(degreesPerSecond);
    mesh.rotateY(degreesPerSecond);
    mesh.rotateZ(degreesPerSecond);
  };

  return {
    ...toRefs(state),
    tick,
    anchor,
  };
};
