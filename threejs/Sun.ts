import { Color, PointLight, TextureLoader } from "three";
import {
  Lensflare,
  LensflareElement,
} from "three/examples/jsm/objects/Lensflare.js";
import { AppScene } from "./AppScene";

class Sun {
  private light!: PointLight;

  constructor(appScene: AppScene) {
    this.light = new PointLight(0xffffff);
    this.light.name = "Sun";
    this.light.intensity = 1;

    const loader = new TextureLoader();
    const $img = useImage();

    const sun = loader.load($img("/sun.jpg", { width: 320 }));
    const hexagon = loader.load($img("/hexagon.jpg", { width: 320 }));
    const circle = loader.load($img("/circle.jpg", { width: 320 }));

    const flare = new Lensflare();
    const blue = new Color("blue");
    const yellow = new Color("yellow");
    const purple = new Color("purple");

    flare.addElement(new LensflareElement(sun, 750, 0, this.light.color));
    flare.addElement(new LensflareElement(circle, 75, 0.55));
    flare.addElement(new LensflareElement(hexagon, 200, 0.6));
    flare.addElement(new LensflareElement(hexagon, 400, 0.7, purple));
    flare.addElement(new LensflareElement(circle, 100, 0.72, yellow));
    flare.addElement(new LensflareElement(hexagon, 600, 0.8, blue));
    flare.addElement(new LensflareElement(circle, 125, 0.9, purple));
    this.light.add(flare);

    this.light.name = "Sun";
    appScene.add(this.light);
  }

  public get(): PointLight {
    return this.light;
  }
}

export { Sun };
