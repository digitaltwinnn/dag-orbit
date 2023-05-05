import {
  BlendFunction,
  EffectComposer,
  EffectPass,
  RenderPass,
  SelectiveBloomEffect,
} from "postprocessing";
import {
  AmbientLight,
  Color,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

export const useScene = async (el: HTMLElement) => {
  const settings = {
    renderer: {
      powerPreference: "high-performance",
    },
    camera: {
      position: new Vector3(0, 0, 400),
      controls: {
        minDistance: 0,
        maxDistance: 2000,
      },
    },
    scene: {
      light: {
        intensity: 0.15,
      },
    },
    bloom: {
      luminanceThreshold: 0.025,
      luminanceSmoothing: 0.025,
      intensity: 2,
    },
  };

  /* renderer */
  const renderer = new WebGLRenderer({
    powerPreference: settings.renderer.powerPreference,
    antialias: false,
    stencil: false,
    depth: false,
    alpha: true,
  });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  el.appendChild(renderer.domElement);

  /* camera */
  const camera = new PerspectiveCamera(50, innerWidth / innerHeight);
  camera.position.set(
    settings.camera.position.x,
    settings.camera.position.y,
    settings.camera.position.z
  );
  camera.up.set(0, 1, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = settings.camera.controls.minDistance;
  controls.maxDistance = settings.camera.controls.maxDistance;

  /* scene */
  const scene = new Scene();
  scene.name = "Scene";
  const light = new AmbientLight(0xffffff);
  light.name = "Ambient";
  light.intensity = settings.scene.light.intensity;
  scene.add(light);

  /* bloom */
  const bloom = new SelectiveBloomEffect(scene, camera, {
    blendFunction: BlendFunction.ADD,
    mipmapBlur: true,
    luminanceThreshold: settings.bloom.luminanceThreshold,
    luminanceSmoothing: settings.bloom.luminanceSmoothing,
    intensity: settings.bloom.intensity,
  });
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new EffectPass(camera, bloom);
  const composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);

  /* stats */
  const stats = Stats();
  const container = document.getElementById("stats");
  if (container) {
    stats.dom.removeAttribute("style");
    container.appendChild(stats.dom);
    stats.showPanel(0);
  }

  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const tick = (deltaTime: number) => {
    stats.begin();
    if (controls.enabled) {
      controls.update();
    }
    composer.render();
    //theatreDriver.tick(deltaTime);
    stats.end();
  };

  return {
    camera,
    scene,
    bloom,
    light,
    tick,
  };
};
