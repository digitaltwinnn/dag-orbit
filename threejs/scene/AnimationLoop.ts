import { Clock } from "three";
import { AppCamera } from "./AppCamera";
import { AppScene } from "./AppScene";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Cluster } from "../cluster/l0/Cluster";
import { createRafDriver, IRafDriver } from "@theatre/core";

class AnimationLoop {
  private composer: any;
  private clock!: Clock;
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
    this.start();
  }

  private start() {
    this.clock = new Clock();
    const self = this;

    const tick = function () {
      self.stats.begin();
      const delta = self.clock.getDelta();
      const elapsed = self.clock.getElapsedTime();

      self.composer.render(delta);
      self.theatreDriver.tick(delta);
      for (const member of self.members) {
        member.tick(delta, elapsed);
      }

      requestAnimationFrame(tick);
      self.stats.end();
    };

    tick();
  }

  getTheatreDriver(): IRafDriver {
    return this.theatreDriver;
  }
}

export { AnimationLoop };
