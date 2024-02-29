import { types, type ISheet, createRafDriver, getProject } from "@theatre/core";
import studio from "@theatre/studio";
import { SelectiveBloomEffect } from "postprocessing";
import { Camera, Light, Object3D, Scene, Vector3 } from "three";
import projectState from "~/assets/animations/theatre.orbit.json";
import { gsap } from "gsap";

type Registration = {
  registerScene: (scene: Scene, camera: Camera, light: Light, bloom: SelectiveBloomEffect) => void;
  registerNaturalGlobe: (globe: Object3D, light: Light) => void;
  registerDigtalGlobe: (globe: Object3D) => void;
  registerSatellites: (satellites: Object3D) => void;
  registerControlRoom: (room: Object3D) => void;
  registerGraph: (graph: Object3D) => void;
  completed: Ref<boolean>;
};

type Animation = {
  intro: ISheet;
  natural: ISheet;
  digital: ISheet;
  network: ISheet;
};

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

// Singletons that are shared by each instance of the hook.
const project = getProject("Orbit", { state: projectState });
const intro = project.sheet("Intro");
const natural = project.sheet("Natural");
const digital = project.sheet("Digital");
const network = project.sheet("Network");
const rafDriver = createRafDriver({ name: "Theatre.js" });
gsap.ticker.add((deltaTime) => {
  rafDriver.tick(deltaTime);
});

const animation: Animation = {
  intro,
  natural,
  digital,
  network,
};

let sceneRegistered = false;
let naturalGlobeRegistered = false;
let digitalGlobeRegistered = false;
let satellitesRegistered = false;
let controlRoomRegistered = false;
let graphRegistered = false;

/**
 * Custom hook for managing theatre-related functionality.
 * @returns Objects to initialise and control animations.
 */
export const useTheatre = () => {
  if (!import.meta.env.PROD) {
    studio.initialize();
  }

  /**
   * Initializes a scene control for the scene in the sheet.
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
   * Initializes a camera control for a camera object in the sheet.
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
   * Initializes a visibility control for an object in the sheet.
   * @param sheet The sheet to add the control to
   * @param obj The object to control the visibility of
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

    obj.children.forEach((child) => {
      if (child instanceof Object3D) {
        initVisibility(sheet, child);
      }
    });
  };

  /**
   * Initializes a movement control for an object in the sheet.
   * @param sheet - The sheet to add the control to
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

    obj.children.forEach((child) => {
      if (child instanceof Object3D) {
        initMovement(sheet, child);
      }
    });
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
   * Initializes a light control for a light object in the sheet.
   * @param sheet The sheet to add the control to
   * @param light The object to control the light of.
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

    light.children.forEach((child) => {
      if (child instanceof Light) {
        initLight(sheet, child);
      }
    });
  };

  /**
   * Registers the scene that is used by the animations.
   * @param scene - The scene to register.
   * @param camera - The camera to use for the scene.
   * @param light - The light to use for the scene.
   * @param bloom - The bloom effect to apply to the scene.
   * @throws Error if the scene is already registered.
   */
  const registerScene = (
    scene: Scene,
    camera: Camera,
    light: Light,
    bloom: SelectiveBloomEffect
  ) => {
    initScene(intro, scene, bloom);
    initLight(intro, light);
    initCamera(intro, camera);
    initCamera(natural, camera);
    initCamera(digital, camera);
    initCamera(network, camera);

    if (sceneRegistered) throw new Error("Scene already registered");
    sceneRegistered = true;
  };

  /**
   * Registers the natural globe that is used by the animations.
   * @param globe - The globe object to register.
   * @param light - The light object to register.
   * @throws Error if the natural globe is already registered.
   */
  const registerNaturalGlobe = (globe: Object3D, light: Light) => {
    initMovement(natural, globe);
    initVisibility(natural, globe);
    initLight(natural, light);

    if (naturalGlobeRegistered) throw new Error("Natural globe already registered");
    naturalGlobeRegistered = true;
  };

  /**
   * Registers the digital globe that is used by the animations.
   * @param globe The globe object to register the digital globe with.
   * @throws Error if the digital globe is already registered.
   */
  const registerDigtalGlobe = (globe: Object3D) => {
    initMovement(digital, globe);
    initVisibility(digital, globe);

    if (digitalGlobeRegistered) throw new Error("Digital globe already registered");
    digitalGlobeRegistered = true;
  };

  /**
   * Registers the satellites object that is used by the animations.
   * @param satellites - The satellites to be registered.
   * @throws Error if the satellites are already registered.
   */
  const registerSatellites = (satellites: Object3D) => {
    initMovement(digital, satellites);
    initVisibility(digital, satellites);

    if (satellitesRegistered) throw new Error("Satellites already registered");
    satellitesRegistered = true;
  };

  /**
   * Registers the control room that is used by the animations
   * @param room - The control room object to be registered.
   * @throws Error if the control room is already registered.
   */
  const registerControlRoom = (room: Object3D) => {
    initMovement(digital, room);
    initVisibility(digital, room);

    if (controlRoomRegistered) throw new Error("Control room already registered");
    controlRoomRegistered = true;
  };

  /**
   * Registers the graph that is used by the animations
   * @param graph - The graph to be registered.
   * @throws Error if the graph is already registered.
   */
  const registerGraph = (graph: Object3D) => {
    initMovement(network, graph);
    initVisibility(network, graph);

    if (graphRegistered) throw new Error("Graph already registered");
    graphRegistered = true;
  };

  /**
   * Indicates whether the registration process is complete.
   * @returns {boolean} True if all components are registered.
   */
  const registrationComplete = computed(() => {
    return (
      sceneRegistered &&
      naturalGlobeRegistered &&
      digitalGlobeRegistered &&
      satellitesRegistered &&
      controlRoomRegistered &&
      graphRegistered
    );
  });

  const registration: Registration = {
    registerScene,
    registerNaturalGlobe,
    registerDigtalGlobe,
    registerSatellites,
    registerControlRoom,
    registerGraph,
    completed: registrationComplete,
  };

  return {
    rafDriver,
    project,
    registration,
    animation,
  };
};
