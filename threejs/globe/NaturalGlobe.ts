import {
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  SphereGeometry,
  TextureLoader,
} from "three";
import { AppScene } from "../scene/AppScene";
import { Atmosphere } from "./Atmosphere";
import { Sun } from "./Sun";

class NaturalGlobe {
  private mesh!: Mesh;
  private radius = 100;

  constructor(
    appScene: AppScene,
    sun: Sun,
    vAtmosphere: any,
    fAtmosphere: any
  ) {
    const loader = new TextureLoader();
    const $img = useImage();

    const mapImgUrl = $img("/earthmap.jpg", {width: 1536});
    const map = loader.load(mapImgUrl);

    const specularImgUrl = $img("/earthspec1k.jpg", { width: 640 });
    const specular = loader.load(specularImgUrl);

    const bumpImgUrl = $img("/earthbump10k.jpg", {width: 1536});
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

    // add atmosphere to globe
    new Atmosphere(this.mesh, sun, vAtmosphere, fAtmosphere);
    // add globe to scene
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
}

export { NaturalGlobe };
