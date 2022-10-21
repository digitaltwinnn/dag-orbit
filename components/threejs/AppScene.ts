import { AmbientLight, HalfFloatType, Object3D, Scene } from "three";
import {
  BlendFunction,
  EffectComposer,
  EffectPass,
  KernelSize,
  RenderPass,
  SelectiveBloomEffect,
} from "postprocessing";
import { AppRenderer } from "./AppRenderer";
import { AppCamera } from "./AppCamera";

class AppScene {
  private scene!: Scene;
  private light!: AmbientLight;
  private composer!: any;
  private bloomEffect!: any;

  constructor(renderer: AppRenderer, camera: AppCamera) {
    this.scene = new Scene();
    this.scene.background = null;

    this.light = new AmbientLight(0xffffff);
    this.light.intensity = 0.15;
    this.scene.add(this.light);

    //  this.camera = new Camera(w, h, this.renderer);
    //  this.scene.add(this.camera.get());

    this.composer = new EffectComposer(renderer.get(), {
      frameBufferType: HalfFloatType,
    });
    this.bloomEffect = new SelectiveBloomEffect(this.scene, camera.get(), {
      blendFunction: BlendFunction.SCREEN,
      kernelSize: KernelSize.MEDIUM,
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.075,
    });
    const renderPass = new RenderPass(this.scene, camera.get());
    const effectPass = new EffectPass(camera.get(), this.bloomEffect);
    // Removes banding from lighting calculations.
    //  effectPass.dithering = true;
    this.composer.addPass(renderPass);
    this.composer.addPass(effectPass);
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

  public getLight(): AmbientLight {
    return this.light;
  }

  public applyBloomEffect(object: Object3D) {
    this.bloomEffect.selection.add(object);
  }
}

export { AppScene };
