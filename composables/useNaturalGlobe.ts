import { gsap } from "gsap";
import {
  Light,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  SphereGeometry,
  TextureLoader,
} from "three";

export const useNaturalGlobe = async (
  parent: Object3D,
  light: Light,
  vAtmosphere: string,
  fAtmosphere: string
) => {
  const settings = {
    radius: 100,
  };

  const animate = () => {
    gsap.to(mesh.rotation, {
      y: MathUtils.degToRad(360),
      duration: 60,
      repeat: -1,
      ease: "linear",
    });
  };

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

  const mesh: Mesh = new Mesh(geometry, material);
  mesh.name = "NaturalGlobe";
  parent.add(mesh);

  useAtmosphere(mesh, light, vAtmosphere, fAtmosphere);
  animate();

  return {
    mesh,
  };
};
