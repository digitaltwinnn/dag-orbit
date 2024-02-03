import { gsap } from "gsap";
import {
  Color,
  Light,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Scene,
  SphereGeometry,
  TextureLoader,
} from "three";

export const useNaturalGlobe = (
  scene: Scene,
  light: Light,
  vAtmosphere: string,
  fAtmosphere: string,
  atmosphereColor: string
): ThreeJsComposable => {
  const settings = {
    radius: 100,
  };

  const animate = () => {
    gsap.to(object.rotation, {
      y: MathUtils.degToRad(360),
      duration: 60,
      repeat: -1,
      ease: "linear",
    });
  };

  const loaded = ref(false);
  const object: Mesh = new Mesh(undefined, undefined);
  object.name = "NaturalGlobe";

  const load = async () => {
    const loader = new TextureLoader();
    const $img = useImage();
    const mapImgUrl = $img("/earthmap.jpg", { width: 1536 });
    const specularImgUrl = $img("/earthspec1k.jpg", { width: 640 });
    const bumpImgUrl = $img("/earthbump10k.jpg", { width: 1536 });

    const geometry = new SphereGeometry(settings.radius, 64, 64);
    const material = new MeshPhongMaterial({
      specular: 0x333333,
      shininess: 9,
      map: loader.load(mapImgUrl),
      specularMap: loader.load(specularImgUrl),
      bumpMap: loader.load(bumpImgUrl),
      bumpScale: 1,
    });

    object.geometry = geometry;
    object.material = material;
    scene.add(object);

    const color = new Color(atmosphereColor);
    useAtmosphere(object, light, vAtmosphere, fAtmosphere, color);
    // animate();
    loaded.value = true;
  };

  load();

  return {
    loaded,
    object,
  };
};
