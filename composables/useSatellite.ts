import { SelectiveBloomEffect } from "postprocessing";
import {
  BoxGeometry,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
} from "three";

export const useSatellite = (
  parent: Group | Mesh,
  bloomEffect: SelectiveBloomEffect,
  size: number,
  color: Color,
  lat: number,
  lng: number
) => {
  const innerSize = 0.3 * size;
  const material = new MeshBasicMaterial({ color: color });
  const geometry = new BoxGeometry(innerSize, innerSize, innerSize);
  const mesh = new Mesh(geometry, material);
  mesh.name = "Satellite" + Math.random();
  mesh.lookAt(0, 0, 0);

  const outerGeometry = new BoxGeometry(size, size, size);
  const outerMaterial = material.clone();
  outerMaterial.wireframe = true;
  mesh.add(new Mesh(outerGeometry, outerMaterial));
  parent.add(mesh);
  bloomEffect.selection.add(mesh);

  const state = reactive({
    position: mesh.position,
    name: mesh.name,
    lat: lat,
    lng: lng,
  });

  const anchor = (altitude: number) => {
    const target = useGlobeUtils().toVector(state.lat, state.lng, altitude);
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
