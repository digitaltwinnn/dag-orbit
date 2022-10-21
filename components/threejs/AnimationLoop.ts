import { Clock, Scene } from "three";
import { AppCamera } from "./AppCamera";
import { AppScene } from "./AppScene";
import Stats from "three/examples/jsm/libs/stats.module.js";

class AnimationLoop {
  private composer: any;
  private clock!: Clock;
  //  private stats!: Stats;

  public members = [] as any;

  constructor(scene: AppScene, camera: AppCamera) {
    this.composer = scene.getComposer();
    //    this.stats = stats;
    this.members.push(camera);
    this.start();
  }

  private start() {
    this.clock = new Clock();

    const self = this;
    const tick = function () {
      //   self.stats.begin();

      const delta = self.clock.getDelta();
      const elapsed = self.clock.getElapsedTime();
      self.composer.render(delta);
      for (const member of self.members) {
        member.tick(delta, elapsed);
      }
      requestAnimationFrame(tick);

      // self.stats.end();
    };
    tick();
  }

  public showStats() {
    //   this.stats.domElement.classList.remove("hidden");
  }

  public hideStats() {
    //    this.stats.domElement.classList.add("hidden");
  }
}

export { AnimationLoop };
