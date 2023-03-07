import { AppCamera } from "./AppCamera";
import { AppScene } from "./AppScene";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Cluster } from "../cluster/l0/Cluster";
import { createRafDriver, IRafDriver } from "@theatre/core";

class AnimationLoop {
  private composer: any;
  private stats!: Stats;
  private theatreDriver = createRafDriver({ name: "theatre.js" });

  public members = [] as any;

  constructor(scene: AppScene, camera: AppCamera, cluster: Cluster) {
    this.composer = scene.getComposer();

    this.stats = Stats();
    const container = document.getElementById("stats");
    if (container) {
      this.stats.dom.removeAttribute("style");
      container.appendChild(this.stats.dom);
      this.stats.showPanel(0);
    }

    this.members.push(camera, cluster);
  }

  public tick(time: number, deltaTime: number, frame: number) {
    this.stats.begin();
    this.composer.render();
    this.theatreDriver.tick(deltaTime);
    for (const member of this.members) {
      member.tick(deltaTime);
    }
    this.stats.end();
  }

  getTheatreDriver(): IRafDriver {
    return this.theatreDriver;
  }
}

export { AnimationLoop };
