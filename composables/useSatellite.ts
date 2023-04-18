import { SelectiveBloomEffect } from "postprocessing";
import {
  BoxGeometry,
  Color,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from "three";

export const useSatellite = async (
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
  const satellite = new Mesh(geometry, material);
  satellite.name = "Satellite" + Math.random();
  satellite.lookAt(0, 0, 0);

  const outerGeometry = new BoxGeometry(size, size, size);
  const outerMaterial = material.clone();
  outerMaterial.wireframe = true;
  satellite.add(new Mesh(outerGeometry, outerMaterial));
  parent.add(satellite);
  bloomEffect.selection.add(satellite);

  const anchor = (altitude: number) => {
    const target = useGlobeUtils().toVector(lat, lng, altitude);
    satellite.position.set(target.x, target.y, target.z);
    satellite.lookAt(0, 0, 0);
    satellite.rotateX(MathUtils.degToRad(90));
  };

  return {
    satellite,
    lat,
    lng,
    anchor,
  };
};
