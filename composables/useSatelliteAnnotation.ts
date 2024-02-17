import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Vector3,
} from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { gsap } from "gsap";

/**
 * Creates and manages a 3D annotation for a satellite.
 *
 * @param parent - The parent object to which the annotation will be added.
 * @param camera - The camera used for rendering the scene.
 * @param satellite - The satellite object for which the annotation is created.
 * @returns An object containing the annotation, loaded state, and a function to change the color.
 */
export const useSatelliteAnnotation = (
  parent: Object3D,
  camera: PerspectiveCamera,
  satellite: Satellite
) => {
  let label = document.getElementById("annotation");
  if (label == null) {
    console.error("label is undefined");
    label = document.createElement("div");
  }
  const annotation = new CSS3DObject(label);
  annotation.name = "Annotation";
  const loaded = ref(false);

  /**
   * Animates the annotation by continuously updating its orientation to face the camera.
   */
  const animate = () => {
    let target = { t: 0 };
    gsap.to(target, {
      t: 1,
      duration: 1,
      repeat: -1,
      yoyo: true,
      onUpdate: function () {
        annotation.lookAt(camera.position);
      },
    });
  };

  /**
   * Loads the annotation for the satellite.
   * @returns {Promise<void>} A promise that resolves once the annotation is loaded.
   */
  const load = async () => {
    const satelliteVector = new Vector3(
      satellite.mode.globe.vector.x,
      satellite.mode.globe.vector.y,
      satellite.mode.globe.vector.z
    );
    const annotationVector = satelliteVector.clone().setLength(satelliteVector.length() + 75);

    const geometry = new BufferGeometry().setFromPoints([satelliteVector, annotationVector]);
    const material = new LineBasicMaterial({ color: 0xffffff });
    const line = new Line(geometry, material);
    line.name = "AnnotationLine";
    annotation.add(line);

    annotation.position.set(annotationVector.x, annotationVector.y, annotationVector.z);
    annotation.scale.set(0.2, 0.2, 0.2);
    parent.add(annotation);

    animate();
    loaded.value = true;
  };
  load();

  return { annotation, loaded };
};
