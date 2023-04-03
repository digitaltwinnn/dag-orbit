import {
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  SphereGeometry,
  TextureLoader,
} from "three";
import { AppScene } from "~~/threejs/scene/AppScene";

const settings = {
  radius: 100,
};

const mesh: Mesh = new Mesh(undefined, undefined);
mesh.name = "NaturalGlobe";

const init = (appScene: AppScene, vAtmosphere: any, fAtmosphere: any) => {
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

  mesh.geometry = geometry;
  mesh.material = material;

  useAtmosphere().init(mesh, vAtmosphere, fAtmosphere);
  appScene.add(mesh);
};

const tick = (deltaTime: number) => {
  const radiansPerSecond = MathUtils.degToRad(4);
  mesh.rotation.y += (radiansPerSecond * deltaTime) / 1000;
};

const state = reactive({
  initialised: false,
  position: mesh.position,
});

export const useNaturalGlobe = () => {
  return {
    ...toRefs(state),
    init,
    tick,
  };
};
