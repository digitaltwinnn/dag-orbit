import {
  FrontSide,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
  Vector3,
} from "three";
import { Sun } from "~~/threejs/globe/Sun";

const settings = {
  innerRadius: 100,
  outerRadius: 103,
};

const lightPos = new Vector3();
let uniforms: any;
let mesh: Mesh;

const init = (globe: Mesh, sun: Sun, vertex: any, fragment: any) => {
  const atmosphereGeometry = new SphereGeometry(settings.outerRadius, 64, 64);
  sun.get().getWorldPosition(lightPos);

  uniforms = {
    earthCenter: new Uniform(globe.position),
    earthRadius: new Uniform(settings.innerRadius),
    atmosphereRadius: new Uniform(settings.outerRadius),
    lightDirection: new Uniform(sun.get().position),
  };
  const atmosphereMaterial = new ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    side: FrontSide,
    transparent: true,
  });

  mesh = new Mesh(atmosphereGeometry, atmosphereMaterial);
  mesh.name = "Atmosphere";
  globe.add(mesh);
  state.initialised = true;
};

const state = reactive({
  initialised: false,
});

export const useAtmosphere = () => {
  return {
    ...toRefs(state),
    init,
  };
};
