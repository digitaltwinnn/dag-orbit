import { Scene } from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

export const use3dChart = (scene: Scene) => {
  const bar1 = document.getElementById("bar1");
  if (bar1) {
    const cssObject = new CSS3DObject(bar1);
    cssObject.position.set(-200, 0, -200);
    cssObject.lookAt(0, 0, 0);
    scene.add(cssObject);
  }

  const bar2 = document.getElementById("bar2");
  if (bar2) {
    const cssObject = new CSS3DObject(bar2);
    cssObject.position.set(200, 0, 0);
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
