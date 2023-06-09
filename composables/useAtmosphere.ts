import {
  Color,
  FrontSide,
  Light,
  Mesh,
  Object3D,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
  Vector3,
} from "three";

export const useAtmosphere = (
  parent: Object3D,
  light: Light,
  vertex: string,
  fragment: string,
  color: Color
) => {
  const settings = {
    innerRadius: 101,
    outerRadius: 104,
  };

  const atmosphereGeometry = new SphereGeometry(settings.outerRadius, 64, 64);

  const uniforms = {
    earthCenter: new Uniform(parent.position),
    earthRadius: new Uniform(settings.innerRadius),
    atmosphereRadius: new Uniform(settings.outerRadius),
    atmosphereColor: new Uniform(new Vector3(color.r, color.g, color.b)),
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
