import { DirectionalLight, LoadingManager, Object3D, Scene } from "three";
import { AppRenderer } from "./AppRenderer";
import { AppCamera } from "./AppCamera";
import {
  BlendFunction,
  EffectComposer,
  EffectPass,
  RenderPass,
  SelectiveBloomEffect,
} from "postprocessing";

class AppScene {
  private scene!: Scene;
  private loadingManager!: LoadingManager;
  private light!: DirectionalLight;
  private composer!: any;
  private bloomEffect!: SelectiveBloomEffect;

  constructor(renderer: AppRenderer, camera: AppCamera) {
    this.scene = new Scene();
    this.loadingManager = new LoadingManager();
    this.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.debug("Assets loaded " + (itemsLoaded / itemsTotal) * 100 + "%");
    };

    this.light = new DirectionalLight(0xffffff);
    this.light.intensity = 1;
    this.scene.add(this.light);

    this.bloomEffect = new SelectiveBloomEffect(this.scene, camera.get(), {
      blendFunction: BlendFunction.ADD,
      mipmapBlur: true,
      luminanceThreshold: 0.25,
      luminanceSmoothing: 0.1,
      intensity: 2.0,
    });
    const renderPass = new RenderPass(this.scene, camera.get());
    const bloomPass = new EffectPass(camera.get(), this.bloomEffect);

    this.composer = new EffectComposer(renderer.get());
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
  }

  public get(): Scene {
    return this.scene;
  }

  public add(object: Object3D): void {
    this.scene.add(object);
  }

  public getComposer(): any {
    return this.composer;
  }

  public getLoadingManager(): LoadingManager {
    return this.loadingManager;
  }

  public applyBloomEffect(object: Object3D) {
    this.bloomEffect.selection.add(object);
  }
}

export { AppScene };
