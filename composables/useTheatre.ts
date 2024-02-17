import { types, type ISheet, createRafDriver, getProject } from "@theatre/core";
import studio from "@theatre/studio";
import { SelectiveBloomEffect } from "postprocessing";
import { Camera, Light, Object3D, Scene, Vector3 } from "three";
import projectState from "~/assets/animations/theatre.orbit.json";

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

/**
 * A custom hook for managing theatre-related functionality.
 * @returns An object containing various properties and methods related to theatre.
 */
export const useTheatre = () => {
  if (!import.meta.env.PROD) {
    studio.initialize();
  }
  const rafDriver = createRafDriver({ name: "Theatre.js" });
  const project = getProject("Orbit", { state: projectState });
  const intro = project.sheet("Intro");

  const settings: Setting = {
    range: {
      position: [-500, 500],
      rotation: [-2, 2],
      intensity: [0, 5],
      scale: [0, 5],
      normalized: [0, 1],
    },
  };

  /**
   * Initializes the visibility control for an object in a sheet.
   * @param sheet The sheet containing the visibility control.
   * @param obj The object to control the visibility of.
   */
  const initVisibility = (sheet: ISheet, obj: Object3D) => {
    const control = sheet.object("visibility / " + obj.name, {
      visible: types.boolean(true, { label: "Visible" }),
      /*
      opacity: types.number(obj.material.opacity, {
        range: settings.range.normalized,
      }),
      */
    });
    control.onValuesChange((v) => {
      obj.visible = v.visible;
      //  obj.material.opacity = v.opacity;
    }, rafDriver);
  };

  /**
   * Initializes the movement control for an object.
   * @param sheet - The sheet object.
   * @param obj - The object to control the movement of.
   */
  const initMovement = (sheet: ISheet, obj: Object3D) => {
    const control = sheet.object("movement / " + obj.name, {
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
  };

  /*
const initColor = (sheet: ISheet, obj: Object3D): ISheetObject<any> => {
  const control = sheet.object(name + " / color", {
    color: types.rgba({
      r: obj.material.color.r,
      g: obj.material.color.g,
      b: obj.material.color.b,
      a: 1,
    }),
    opacity: types.number(obj.material.opacity, {
      range: settings.range.normalized,
    }),
  });

  control.onValuesChange((v) => {
    obj.material.color.setRGB(v.color.r, v.color.g, v.color.b);
    obj.material.opacity = v.opacity;
  }, rafDriver);

  return control;
};
*/

  /**
   * Initializes a light control using the provided sheet and light object.
   * @param sheet The sheet object used for creating the light control.
   * @param light The light object containing the initial values for the control.
   */
  const initLight = (sheet: ISheet, light: Light) => {
    const control = sheet.object("light / " + light.name, {
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
  };

  /**
   * Initializes the camera with the provided sheet and camera object.
   * @param sheet - The sheet object.
   * @param cam - The camera object.
   */
  const initCamera = (sheet: ISheet, cam: Camera) => {
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
  };

  /**
   * Initializes a scene control using the provided sheet and scene objects.
   * @param sheet - The sheet object.
   * @param scene - The scene object.
   * @param bloom - The bloom settings.
   */
  const initScene = (sheet: ISheet, scene: Scene, bloom: any) => {
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
      bloom.intensity = v.bloom.intensity;
      bloom.mipmapBlurPass.radius = v.bloom.radius;
      bloom.luminanceMaterial.threshold = v.bloom.luminance.threshold;
      bloom.luminanceMaterial.smoothing = v.bloom.luminance.smoothing;
      //  bloom.blendMode.setBlendFunction(v.bloom.blend.mode);
      bloom.blendMode.opacity.value = v.bloom.blend.opacity;
    }, rafDriver);
  };

  /**
   * Initializes the theatre with the given camera, scene, bloom effect, lights, and objects.
   * @param camera - The camera used in the theatre.
   * @param scene - The scene used in the theatre.
   * @param bloom - The bloom effect used in the theatre.
   * @param lights - The lights used in the theatre.
   * @param objects - The objects used in the theatre.
   */
  const init = async (
    camera: Camera,
    scene: Scene,
    bloom: SelectiveBloomEffect,
    lights: Light[],
    objects: Object3D[]
  ) => {
    try {
      initCamera(intro, camera);
      initScene(intro, scene, bloom);
      lights.forEach((light) => {
        initLight(intro, light);
      });
      objects.forEach((object) => {
        initMovement(intro, object);
        initVisibility(intro, object);
        // initColor(sheet, object);
        object.children.forEach((child) => {
          if (child instanceof Object3D) {
            initMovement(intro, child);
            initVisibility(intro, child);
          }
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  return {
    rafDriver,
    init,
    project,
    intro,
  };
};
