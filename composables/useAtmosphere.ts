import {
  FrontSide,
  Light,
  Mesh,
  Object3D,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
} from "three";

export const useAtmosphere = (
  parent: Object3D,
  light: Light,
  vertex: string,
  fragment: string
) => {
  const settings = {
    innerRadius: 101,
    outerRadius: 105,
  };

  const atmosphereGeometry = new SphereGeometry(settings.outerRadius, 64, 64);

  const uniforms = {
    earthCenter: new Uniform(parent.position),
    earthRadius: new Uniform(settings.innerRadius),
    atmosphereRadius: new Uniform(settings.outerRadius),
    lightDirection: new Uniform(light.position),
  };
  const atmosphereMaterial = new ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    side: FrontSide,
    transparent: true,
  });

  const atmos = new Mesh(atmosphereGeometry, atmosphereMaterial);
  atmos.name = "Atmosphere";
  parent.add(atmos);

  return {
    atmos,
  };
};
