import {
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  SphereGeometry,
  TextureLoader,
} from "three";
import { AppScene } from "./AppScene";

class NaturalGlobe {
  private mesh!: Mesh;
  private radius = 100;

  constructor(appScene: AppScene) {
    const loader = new TextureLoader();
    const $img = useImage();

    const mapImgUrl = $img("/earthmap.jpg");
    const map = loader.load(mapImgUrl);

    const specularImgUrl = $img("/earthspec1k.jpg", { width: 500 });
    const specular = loader.load(specularImgUrl);

    const bumpImgUrl = $img("/earthbump10k.jpg");
    const bump = loader.load(bumpImgUrl);

    const materialNormalMap = new MeshPhongMaterial({
      specular: 0x333333,
      shininess: 9,
      map: map,
      specularMap: specular,
      bumpMap: bump,
      bumpScale: 1,
    });

    const geometry = new SphereGeometry(this.radius, 64, 64);
    this.mesh = new Mesh(geometry, materialNormalMap);
    this.mesh.name = "NaturalGlobe";
    appScene.add(this.mesh);
  }

  public tick(delta: number, elapsed: number) {
    const radiansPerSecond = MathUtils.degToRad(4);
    this.mesh.rotation.y += radiansPerSecond * delta;
  }

  public show(): void {
    this.mesh.visible = true;
  }

  public hide(): void {
    this.mesh.visible = false;
  }

  public get(): Mesh {
    return this.mesh;
  }

  /*
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
  */
}

export { NaturalGlobe };
