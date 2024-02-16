import { EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect } from "postprocessing";
import { AmbientLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

export const useScene = (webglContainer: HTMLElement, css3dContainer: HTMLElement) => {
  const settings = {
    renderer: {
      powerPreference: "high-performance",
    },
    camera: {
      position: new Vector3(0, 0, 1000),
      controls: {
        minDistance: 0,
        maxDistance: 5000,
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

  function resizeRendererToDisplaySize(webgl: WebGLRenderer, css3d: CSS3DRenderer) {
    const canvas = webgl.domElement;
    const pixelRatio = window.devicePixelRatio;
    // const width  = canvas.clientWidth  * pixelRatio | 0;
    // const height = canvas.clientHeight * pixelRatio | 0;
    const width = canvas.clientWidth | 0;
    const height = canvas.clientHeight | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      webgl.setSize(width, height, false);
      css3d.setSize(width, height);
    }
    return needResize;
  }

  // CSS3D
  const css3dRenderer = new CSS3DRenderer();
  css3dRenderer.setSize(css3dContainer.clientWidth, css3dContainer.clientHeight);
  css3dContainer.appendChild(css3dRenderer.domElement);
  css3dRenderer.setSize(css3dContainer.offsetWidth, css3dContainer.offsetHeight);

  // WebGL
  const webglRenderer = new WebGLRenderer({
    powerPreference: settings.renderer.powerPreference,
    antialias: false,
    stencil: false,
    depth: false,
    alpha: true,
    canvas: webglContainer,
  });
  webglRenderer.setSize(webglContainer.clientWidth, webglContainer.clientHeight, false);
  webglRenderer.setPixelRatio(window.devicePixelRatio);

  // Camera
  const camera = new PerspectiveCamera(
    50,
    webglContainer.clientWidth / webglContainer.clientHeight
  );
  camera.position.set(
    settings.camera.position.x,
    settings.camera.position.y,
    settings.camera.position.z
  );
  camera.up.set(0, 1, 0);

  const controls = new OrbitControls(camera, webglRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = settings.camera.controls.minDistance;
  controls.maxDistance = settings.camera.controls.maxDistance;

  // Scene
  const scene = new Scene();
  scene.name = "Scene";
  const light = new AmbientLight(0xffffff);
  light.name = "Ambient";
  light.intensity = settings.scene.light.intensity;
  scene.add(light);

  // Bloom
  const bloom = new SelectiveBloomEffect(scene, camera, {
    luminanceThreshold: settings.bloom.luminanceThreshold,
    luminanceSmoothing: settings.bloom.luminanceSmoothing,
    intensity: settings.bloom.intensity,
  });
  const webglRenderPass = new RenderPass(scene, camera);
  const webglBloomPass = new EffectPass(camera, bloom);
  const webglComposer = new EffectComposer(webglRenderer);
  webglComposer.addPass(webglRenderPass);
  webglComposer.addPass(webglBloomPass);

  // Stats
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
    if (resizeRendererToDisplaySize(webglRenderer, css3dRenderer)) {
      const canvas = webglRenderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    webglComposer.render();
    css3dRenderer.render(scene, camera);
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
