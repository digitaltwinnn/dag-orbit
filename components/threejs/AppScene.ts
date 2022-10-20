import {
  AmbientLight,
  Camera,
  HalfFloatType,
  Object3D,
  Scene,
  UnsignedByteType,
  WebGLRenderer,
} from "three";
import {
  BlendFunction,
  EffectComposer,
  EffectPass,
  KernelSize,
  RenderPass,
  SelectiveBloomEffect,
} from "postprocessing";

class AppScene {
  private scene!: Scene;
  private light!: AmbientLight;
  private composer!: any;
  private bloomEffect!: any;

  constructor(renderer: WebGLRenderer, camera: Camera) {
    this.scene = new Scene();
    this.scene.background = null;

    this.light = new AmbientLight(0xffffff);
    this.light.intensity = 0.15;
    this.scene.add(this.light);

  //  this.camera = new Camera(w, h, this.renderer);
  //  this.scene.add(this.camera.get());

    this.composer = new EffectComposer(renderer, {
      // TODO: change to HalfFloatType / make it work
      frameBufferType: UnsignedByteType,
    });
    this.bloomEffect = new SelectiveBloomEffect(this.scene, camera, {
      blendFunction: BlendFunction.SCREEN,
      kernelSize: KernelSize.MEDIUM,
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.075,
    });
    const renderPass = new RenderPass(this.scene, camera);
    const effectPass = new EffectPass(camera, this.bloomEffect);
    // Removes banding from lighting calculations.
    //  effectPass.dithering = true;
    this.composer.addPass(renderPass);
    this.composer.addPass(effectPass);
  }

  public get(): Scene {
    return this.scene;
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
