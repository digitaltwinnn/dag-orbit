import {
  EffectComposer,
  EffectPass,
  RenderPass,
  SelectiveBloomEffect,
} from "postprocessing";
import {
  AmbientLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

export const useScene = (canvas: HTMLElement) => {
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

  function resizeRendererToDisplaySize(renderer: WebGLRenderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    // const width  = canvas.clientWidth  * pixelRatio | 0;
    // const height = canvas.clientHeight * pixelRatio | 0;
    const width = canvas.clientWidth | 0;
    const height = canvas.clientHeight | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  /* renderer */
  const renderer = new WebGLRenderer({
    powerPreference: settings.renderer.powerPreference,
    antialias: false,
    stencil: false,
    depth: false,
    alpha: true,
    canvas: canvas,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(window.devicePixelRatio);

  /* camera */
  const camera = new PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight
  );
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

  const tick = (deltaTime: number) => {
    stats.begin();
    if (controls.enabled) {
      controls.update();
    }
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
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
