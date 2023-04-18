import { Color, Object3D, PointLight, TextureLoader } from "three";
import {
  Lensflare,
  LensflareElement,
} from "three/examples/jsm/objects/Lensflare";

const light = new PointLight(0xffffff);
light.name = "Sun";
light.intensity = 1;

const init = async (parent: Object3D) => {
  light.position.set(1000, 0, 1000);
  const loader = new TextureLoader();
  const $img = useImage();

  const sun = loader.load($img("/sun.jpg", { width: 320 }));
  const hexagon = loader.load($img("/hexagon.jpg", { width: 320 }));
  const circle = loader.load($img("/circle.jpg", { width: 320 }));

  const flare = new Lensflare();
  const blue = new Color("blue");
  const yellow = new Color("yellow");
  const purple = new Color("purple");

  flare.addElement(new LensflareElement(sun, 500, 0, light.color));
  flare.addElement(new LensflareElement(circle, 75, 0.55));
  flare.addElement(new LensflareElement(hexagon, 200, 0.6));
  flare.addElement(new LensflareElement(hexagon, 400, 0.7, purple));
  flare.addElement(new LensflareElement(circle, 100, 0.72, yellow));
  flare.addElement(new LensflareElement(hexagon, 600, 0.8, blue));
  flare.addElement(new LensflareElement(circle, 125, 0.9, purple));
  light.add(flare);
  parent.add(light);
};

export const useSun = () => {
  return {
    light,
    init,
  };
};
