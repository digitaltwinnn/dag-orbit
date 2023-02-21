import { Vector3 } from "three";

class GlobeUtils {
  static toVector(lat: number, lng: number, radius: number): Vector3 {
    const latRad = lat * (Math.PI / 180);
    const lonRad = -lng * (Math.PI / 180);
    return new Vector3(
      Math.cos(latRad) * Math.cos(lonRad) * radius,
      Math.sin(latRad) * radius,
      Math.cos(latRad) * Math.sin(lonRad) * radius
    );
  }

  static toLatLng(vector: Vector3) {
    const v = vector.clone();
    const norm = v.normalize();

    const latRads = Math.acos(norm.y);
    const lngRads = Math.atan2(norm.z, norm.x);
    const lat = (Math.PI / 2 - latRads) * (180 / Math.PI);
    const lng = (Math.PI - lngRads) * (180 / Math.PI);

    return [lat, lng - 180];
  }
}

export { GlobeUtils };
