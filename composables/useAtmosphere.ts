import {
  FrontSide,
  Mesh,
  Object3D,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
} from "three";

const settings = {
  innerRadius: 100,
  outerRadius: 103,
};

let uniforms: any;
let atmos: Mesh;

const init = async (parent: Object3D, vertex: any, fragment: any) => {
  const atmosphereGeometry = new SphereGeometry(settings.outerRadius, 64, 64);
  const $sun = useSun();

  uniforms = {
    earthCenter: new Uniform(parent.position),
    earthRadius: new Uniform(settings.innerRadius),
    atmosphereRadius: new Uniform(settings.outerRadius),
    lightDirection: new Uniform($sun.light.position),
  };
  const atmosphereMaterial = new ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    side: FrontSide,
    transparent: true,
  });

  atmos = new Mesh(atmosphereGeometry, atmosphereMaterial);
  atmos.name = "Atmosphere";
  parent.add(atmos);
};

export const useAtmosphere = () => {
  return {
    init,
  };
};
