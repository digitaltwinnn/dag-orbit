import { DirectionalLight, Object3D, Scene, Vector2 } from "three";
/*
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
*/
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
  private light!: DirectionalLight;
  private composer!: any;
  private bloomEffect!: SelectiveBloomEffect;

  constructor(renderer: AppRenderer, camera: AppCamera) {
    this.scene = new Scene();

    this.light = new DirectionalLight(0xffffff);
    this.light.intensity = 1;
    this.scene.add(this.light);

    /*
    const renderPass = new RenderPass(this.scene, camera.get());
    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0.21;
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.65;
    bloomPass.renderToScreen = true;

    this.composer = new EffectComposer(renderer.get());
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
    */

    const renderPass = new RenderPass(this.scene, camera.get());

    this.bloomEffect = new SelectiveBloomEffect(this.scene, camera.get(), {
      blendFunction: BlendFunction.ADD,
      mipmapBlur: true,
      luminanceThreshold: 0.25,
      luminanceSmoothing: 0.1,
      intensity: 2.0,
    });
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

  public applyBloomEffect(object: Object3D) {
    this.bloomEffect.selection.add(object);
  }
}

export { AppScene };
