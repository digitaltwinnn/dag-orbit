import { types, type ISheet, type ISheetObject, createRafDriver, getProject } from "@theatre/core";
import studio from "@theatre/studio";
import { SelectiveBloomEffect } from "postprocessing";
import { Camera, Light, Object3D, Scene, Vector3 } from "three";

type Range = [min: number, max: number];
type Setting = {
  range: {
    position: Range;
    rotation: Range;
    intensity: Range;
    scale: Range;
    normalized: Range;
  };
};

const settings: Setting = {
  range: {
    position: [-500, 500],
    rotation: [-2, 2],
    intensity: [0, 5],
    scale: [0, 5],
    normalized: [0, 1],
  },
};
const rafDriver = createRafDriver({ name: "theatre.js" });

const init = async (camera: Camera, scene: Scene, bloom: SelectiveBloomEffect, lights: Light[], objects: Object3D[]) => {
  if (import.meta.env.PROD) {
    //const project = getProject("Orbit", { state: projectState });
    //const sheet = project.sheet("Intro");
  } else {
    studio.initialize();
    const project = getProject("Orbit");
    const sheet = project.sheet("Intro");

    setCameraControls(sheet, camera);
    setSceneControls(sheet, scene, bloom);
    lights.forEach((light) => {
      setLightControls(light.name, sheet, light);
    });
    objects.forEach((object) => {
      setMovementControls(object.name, sheet, object);
      setVisibilityControls(object.name, sheet, object);
      // setColorControls(object.name, sheet, object);
    });
  }
};

const setVisibilityControls = (objectName: string, sheet: ISheet, obj: Object3D): ISheetObject<any> => {
  const control = sheet.object("visibility / " + objectName, { visible: types.boolean(true, { label: "Visible" }) });
  control.onValuesChange((v) => {
    obj.visible = v.visible;
  }, rafDriver);
  return control;
};

const setMovementControls = (objectName: string, sheet: ISheet, obj: Object3D): ISheetObject<any> => {
  const control = sheet.object("movement / " + objectName, {
    rotation: types.compound({
      x: types.number(obj.rotation.x, { range: settings.range.rotation }),
      y: types.number(obj.rotation.y, { range: settings.range.rotation }),
      z: types.number(obj.rotation.z, { range: settings.range.rotation }),
    }),
    position: types.compound({
      x: types.number(obj.position.x, { range: settings.range.position }),
      y: types.number(obj.position.y, { range: settings.range.position }),
      z: types.number(obj.position.z, { range: settings.range.position }),
    }),
    scale: types.compound({
      x: types.number(obj.scale.x, { range: settings.range.scale }),
      y: types.number(obj.scale.y, { range: settings.range.scale }),
      z: types.number(obj.scale.z, { range: settings.range.scale }),
    }),
  });

  control.onValuesChange((v) => {
    obj.rotation.set(v.rotation.x, v.rotation.y, v.rotation.z);
    obj.position.set(v.position.x, v.position.y, v.position.z);
    obj.scale.set(v.scale.x, v.scale.y, v.scale.z);
  }, rafDriver);

  return control;
};

/*
const setColorControls = (objectName: string, sheet: ISheet, mesh: any): ISheetObject<any> => {
  const control = sheet.object(objectName + " / color", {
    color: types.rgba({
      r: mesh.material.color.r,
      g: mesh.material.color.g,
      b: mesh.material.color.b,
      a: 1,
    }),
    opacity: types.number(mesh.material.opacity, {
      range: settings.range.normalized,
    }),
  });

  control.onValuesChange((v) => {
    mesh.material.color.setRGB(v.color.r, v.color.g, v.color.b);
    mesh.material.opacity = v.opacity;
  }, rafDriver);

  return control;
};
*/

const setLightControls = (objectName: string, sheet: ISheet, light: Light): ISheetObject<any> => {
  const control = sheet.object("light / " + objectName, {
    position: types.compound({
      x: types.number(light.position.x, { range: settings.range.position }),
      y: types.number(light.position.y, { range: settings.range.position }),
      z: types.number(light.position.z, { range: settings.range.position }),
    }),
    color: types.rgba({
      r: light.color.r,
      g: light.color.g,
      b: light.color.b,
      a: 1,
    }),
    intensity: types.number(light.intensity, {
      range: settings.range.intensity,
    }),
  });

  control.onValuesChange((v) => {
    light.position.set(v.position.x, v.position.y, v.position.z);
    light.color.setRGB(v.color.r, v.color.g, v.color.b);
    light.intensity = v.intensity;
  }, rafDriver);

  return control;
};

const setCameraControls = (sheet: ISheet, cam: Camera): ISheetObject<any> => {
  const cameraSubject = new Vector3(0, 0, 0);
  const control = sheet.object("camera", {
    position: types.compound({
      x: types.number(cam.position.x, { range: settings.range.position }),
      y: types.number(cam.position.y, { range: settings.range.position }),
      z: types.number(cam.position.z, { range: settings.range.position }),
    }),
    lookat: types.compound({
      x: types.number(0, { range: settings.range.position }),
      y: types.number(0, { range: settings.range.position }),
      z: types.number(0, { range: settings.range.position }),
    }),
  });

  control.onValuesChange((v) => {
    cam.position.set(v.position.x, v.position.y, v.position.z);
    cameraSubject.set(v.lookat.x, v.lookat.y, v.lookat.z);
    cam.lookAt(cameraSubject);
  }, rafDriver);

  return control;
};

const setSceneControls = (sheet: ISheet, scene: Scene, bloom: any): ISheetObject<any> => {
  const control = sheet.object("scene", {
    bloom: types.compound({
      intensity: types.number(bloom.intensity, {
        range: settings.range.intensity,
      }),
      radius: types.number(bloom.mipmapBlurPass.radius, {
        range: settings.range.normalized,
      }),
      luminance: types.compound({
        threshold: types.number(bloom.luminanceMaterial.threshold, {
          range: settings.range.normalized,
        }),
        smoothing: types.number(bloom.luminanceMaterial.smoothing, {
          range: settings.range.normalized,
        }),
      }),
      blend: types.compound({
        opacity: types.number(bloom.blendMode.opacity.value, {
          range: settings.range.normalized,
        }),
      }),
    }),
  });

  control.onValuesChange((v) => {
    // bloom
    bloom.intensity = v.bloom.intensity;
    bloom.mipmapBlurPass.radius = v.bloom.radius;
    bloom.luminanceMaterial.threshold = v.bloom.luminance.threshold;
    bloom.luminanceMaterial.smoothing = v.bloom.luminance.smoothing;
    //  bloom.blendMode.setBlendFunction(v.bloom.blend.mode);
    bloom.blendMode.opacity.value = v.bloom.blend.opacity;
  }, rafDriver);

  return control;
};

export const useTheatre = () => {
  return {
    rafDriver,
    init,
  };
};
