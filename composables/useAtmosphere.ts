import {
  FrontSide,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
  Vector3,
} from "three";

const settings = {
  innerRadius: 100,
  outerRadius: 103,
};

let uniforms: any;
let mesh: Mesh;

const init = (globe: Mesh, vertex: any, fragment: any) => {
  const atmosphereGeometry = new SphereGeometry(settings.outerRadius, 64, 64);
  const $sun = useSun();

  uniforms = {
    earthCenter: new Uniform(globe.position),
    earthRadius: new Uniform(settings.innerRadius),
    atmosphereRadius: new Uniform(settings.outerRadius),
    lightDirection: new Uniform($sun.position.value),
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
