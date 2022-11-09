import { Vector3 } from "three";

class GlobeUtils {
  private radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  public toVector(lat: number, lng: number, altitude: number): Vector3 {
    const latRad = lat * (Math.PI / 180);
    const lonRad = -lng * (Math.PI / 180);
    return new Vector3(
      Math.cos(latRad) * Math.cos(lonRad) * (this.radius + altitude),
      Math.sin(latRad) * (this.radius + altitude),
      Math.cos(latRad) * Math.sin(lonRad) * (this.radius + altitude)
    );
  }

  public toLatLng(vector: Vector3) {
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
