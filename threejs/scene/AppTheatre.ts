import { getProject, IRafDriver, ISheet, types } from "@theatre/core";
import studio from "@theatre/studio";
import { Camera, Color, Light, Object3D, Scene, Vector3 } from "three";
import { Cluster } from "../cluster/l0/Cluster";
import { DigitalGlobe } from "../globe/DigitalGlobe";
import { NaturalGlobe } from "../globe/NaturalGlobe";
import { Sun } from "../globe/Sun";
import { AppCamera } from "./AppCamera";
import { AppScene } from "./AppScene";

class AppTheatre {
  cameraSubject: Vector3 = new Vector3(0, 0, 0);
  sceneColor: Color = new Color();
  rafDriver!: IRafDriver;

  private positionRange: [min: number, max: number] = [-500, 500];
  private rotationRange: [min: number, max: number] = [-2, 2];
  private intensityRange: [min: number, max: number] = [0, 5];
  private scaleRange: [min: number, max: number] = [0, 5];
  private opacityRange: [min: number, max: number] = [0, 1];

  constructor(
    camera: AppCamera,
    scene: AppScene,
    sunLight: Sun,
    naturalGlobe: NaturalGlobe,
    digitalGlobe: DigitalGlobe,
    cluster: Cluster
  ) {
    this.rafDriver = scene.getTheatreDriver();

    const color = scene.get().background;
    if (color instanceof Color) {
      this.sceneColor = color;
    }

    // Setup the studio
    studio.initialize();

    const project = getProject("Orbit");
    const introSheet = project.sheet("Intro");
    this.initIntro(
      introSheet,
      camera,
      scene,
      sunLight,
      naturalGlobe,
      digitalGlobe,
      cluster
    );
  }

  private initIntro(
    sheet: ISheet,
    camera: AppCamera,
    scene: AppScene,
    sunLight: Sun,
    naturalGlobe: NaturalGlobe,
    digitalGlobe: DigitalGlobe,
    cluster: Cluster
  ) {
    // scene and camera
    this.setCameraControls(sheet, camera.get());
    this.setSceneControls(sheet, scene.get());

    // lights
    this.setLightControls("scene", sheet, scene.getLight());
    this.setLightControls("sun", sheet, sunLight.get());

    // objects in the scene
    this.setMovementControls("naturalGlobe", sheet, naturalGlobe.get());
    this.setColorControls("naturalGlobe", sheet, naturalGlobe.get());

    this.setMovementControls("digitalGlobe", sheet, digitalGlobe.get());
    this.setColorControls("digitalGlobe", sheet, digitalGlobe.get());

    this.setMovementControls("cluster", sheet, cluster.get());
  }

  private setMovementControls(
    objectName: string,
    sheet: ISheet,
    obj: Object3D
  ): any {
    const control = sheet.object(objectName + " / movement", {
      rotation: types.compound({
        x: types.number(obj.rotation.x, { range: this.rotationRange }),
        y: types.number(obj.rotation.y, { range: this.rotationRange }),
        z: types.number(obj.rotation.z, { range: this.rotationRange }),
      }),
      position: types.compound({
        x: types.number(obj.position.x, { range: this.positionRange }),
        y: types.number(obj.position.y, { range: this.positionRange }),
        z: types.number(obj.position.z, { range: this.positionRange }),
      }),
      scale: types.compound({
        x: types.number(obj.scale.x, { range: this.scaleRange }),
        y: types.number(obj.scale.y, { range: this.scaleRange }),
        z: types.number(obj.scale.z, { range: this.scaleRange }),
      }),
    });

    control.onValuesChange((v) => {
      obj.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
      obj.position.set(v.position.x, v.position.y, v.position.z);
      obj.scale.set(v.scale.x, v.scale.y, v.scale.z);
    }, this.rafDriver);

    return control;
  }

  // TODO: fix mesh type
  private setColorControls(objectName: string, sheet: ISheet, mesh: any) {
    const control = sheet.object(objectName + " / color", {
      color: types.rgba({
        r: mesh.material.color.r,
        g: mesh.material.color.g,
        b: mesh.material.color.b,
        a: 1,
      }),
      opacity: types.number(mesh.material.opacity, {
        range: this.opacityRange,
      }),
    });

    control.onValuesChange((v) => {
      mesh.material.color.setRGB(v.color.r, v.color.g, v.color.b);
      mesh.material.opacity = v.opacity;
    }, this.rafDriver);

    return control;
  }

  private setLightControls(objectName: string, sheet: ISheet, light: Light) {
    const control = sheet.object("light / " + objectName, {
      position: types.compound({
        x: types.number(light.position.x, { range: this.positionRange }),
        y: types.number(light.position.y, { range: this.positionRange }),
        z: types.number(light.position.z, { range: this.positionRange }),
      }),
      color: types.rgba({
        r: light.color.r,
        g: light.color.g,
        b: light.color.b,
        a: 1,
      }),
      intensity: types.number(light.intensity, { range: this.intensityRange }),
    });

    control.onValuesChange((v) => {
      light.position.set(v.position.x, v.position.y, v.position.z);
      light.color.setRGB(v.color.r, v.color.g, v.color.b);
      light.intensity = v.intensity;
    }, this.rafDriver);

    return control;
  }

  private setCameraControls(sheet: ISheet, cam: Camera) {
    const control = sheet.object("camera / movement", {
      position: types.compound({
        x: types.number(cam.position.x, { range: this.positionRange }),
        y: types.number(cam.position.y, { range: this.positionRange }),
        z: types.number(cam.position.z, { range: this.positionRange }),
      }),
      lookat: types.compound({
        x: types.number(0, { range: this.positionRange }),
        y: types.number(0, { range: this.positionRange }),
        z: types.number(0, { range: this.positionRange }),
      }),
    });

    control.onValuesChange((v) => {
      cam.position.set(v.position.x, v.position.y, v.position.z);
      this.cameraSubject.set(v.lookat.x, v.lookat.y, v.lookat.z);
      cam.lookAt(this.cameraSubject);
    }, this.rafDriver);

    return control;
  }

  private setSceneControls(sheet: ISheet, scene: Scene) {
    const control = sheet.object("scene / color", {
      color: types.rgba({
        r: this.sceneColor.r,
        g: this.sceneColor.g,
        b: this.sceneColor.b,
        a: 1,
      }),
    });

    control.onValuesChange((v) => {
      this.sceneColor.setRGB(v.color.r, v.color.g, v.color.b);
      scene.background = this.sceneColor;
    }, this.rafDriver);

    return control;
  }
}

export { AppTheatre };
