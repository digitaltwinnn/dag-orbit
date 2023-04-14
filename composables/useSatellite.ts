import { SelectiveBloomEffect } from "postprocessing";
import {
  BoxGeometry,
  Color,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from "three";

export const useSatellite = (
  parent: Object3D,
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

  return {
    ...toRefs(state),
    anchor,
  };
};
