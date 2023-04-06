import {
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  SphereGeometry,
  TextureLoader,
} from "three";

const settings = {
  radius: 100,
};

const globe: Mesh = new Mesh(undefined, undefined);
globe.name = "NaturalGlobe";

const init = (parent: Object3D, vAtmosphere: any, fAtmosphere: any) => {
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

  globe.geometry = geometry;
  globe.material = material;

  useAtmosphere().init(globe, vAtmosphere, fAtmosphere);
  parent.add(globe);
};

const tick = (deltaTime: number) => {
  const radiansPerSecond = MathUtils.degToRad(4);
  globe.rotation.y += (radiansPerSecond * deltaTime) / 1000;
};

const state = reactive({
  initialised: false,
});

export const useNaturalGlobe = () => {
  return {
    ...toRefs(state),
    globe,
    init,
    tick,
  };
};
