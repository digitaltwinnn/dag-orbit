import {
  AmbientLight,
  Color,
  DefaultLoadingManager,
  Light,
  Object3D,
  Scene,
} from "three";
import { AppRenderer } from "./AppRenderer";
import { AppCamera } from "./AppCamera";
import {
  BlendFunction,
  EffectComposer,
  EffectPass,
  RenderPass,
  SelectiveBloomEffect,
} from "postprocessing";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createRafDriver, IRafDriver } from "@theatre/core";

class AppScene {
  private theatreDriver = createRafDriver({ name: "theatre.js" });

  private scene!: Scene;
  private camera!: AppCamera;
  private light!: AmbientLight;
  private composer!: EffectComposer;
  private bloomEffect!: SelectiveBloomEffect;
  private stats!: Stats;

  constructor(renderer: AppRenderer, camera: AppCamera) {
    this.scene = new Scene();
    this.scene.background = new Color(0x00005a);
    this.camera = camera;

    DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.debug(
        "Started loading file: " +
          url +
          ".\nLoaded " +
          itemsLoaded +
          " of " +
          itemsTotal +
          " files."
      );
    };

    this.light = new AmbientLight(0xffffff);
    this.light.intensity = 0.15;
    this.scene.add(this.light);

    this.bloomEffect = new SelectiveBloomEffect(this.scene, camera.get(), {
      blendFunction: BlendFunction.ADD,
      mipmapBlur: true,
      luminanceThreshold: 0.025,
      luminanceSmoothing: 0.025,
      intensity: 1.1,
    });
    const renderPass = new RenderPass(this.scene, camera.get());
    const bloomPass = new EffectPass(camera.get(), this.bloomEffect);

    this.composer = new EffectComposer(renderer.get());
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);

    this.stats = Stats();
    const container = document.getElementById("stats");
    if (container) {
      this.stats.dom.removeAttribute("style");
      container.appendChild(this.stats.dom);
      this.stats.showPanel(0);
    }
  }

  public get(): Scene {
    return this.scene;
  }

  public getLight(): Light {
    return this.light;
  }

  public add(object: Object3D): void {
    this.scene.add(object);
  }

  public applyBloomEffect(object: Object3D) {
    this.bloomEffect.selection.add(object);
  }

  getTheatreDriver(): IRafDriver {
    return this.theatreDriver;
  }

  public tick(time: number, deltaTime: number, frame: number) {
    this.stats.begin();
    this.composer.render();
    this.theatreDriver.tick(deltaTime);
    this.camera.tick(deltaTime);
    this.stats.end();
  }
}

export { AppScene };
