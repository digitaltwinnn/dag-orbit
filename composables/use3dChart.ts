import { Scene } from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

export const use3dChart = (scene: Scene) => {
  const left = document.getElementById("left-wall");
  if (left) {
    const cssObject = new CSS3DObject(left);
    cssObject.position.set(-500, 0, -500);
    cssObject.lookAt(0, 0, 0);
    scene.add(cssObject);
  }

  const right = document.getElementById("right-wall");
  if (right) {
    const cssObject = new CSS3DObject(right);
    cssObject.position.set(500, 0, -500);
    cssObject.lookAt(0, 0, 0);
    scene.add(cssObject);
  }
  const loaded = ref(false);

  const load = async () => {
    loaded.value = true;
  };
  load();

  return { loaded };
};
