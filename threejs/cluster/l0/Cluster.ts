import { Color, MathUtils } from "three";
import { Satellite } from "./Satellite";
import TWEEN from "@tweenjs/tween.js";
import { AppScene } from "../../scene/AppScene";
import { GlobeUtils } from "../../utils/GlobeUtils";
import { Edge } from "./Edge";

const nodeColors = ["#1E90FE", "#1467C8", "#1053AD"];

class Cluster {
  private appScene: AppScene;
  private satellites: Satellite[];
  private satelliteEdges: Edge[];

  private radius = 100;
  private alt = 20;
  private size = 2;

  constructor(appScene: AppScene) {
    this.appScene = appScene;
    this.satellites = [];
    this.satelliteEdges = [];
  }

  public refresh(nodes: any[]): void {
    nodes.forEach((node) => {
      const color = new Color(
        nodeColors[MathUtils.randInt(0, nodeColors.length - 1)]
      );

      const sats = this.findByLatLng(node.host.latitude, node.host.longitude);
      if (sats.length == 0) {
        const sat = new Satellite(
          this.appScene,
          this.size,
          node.host.latitude,
          node.host.longitude,
          color
        );
        this.satellites.push(sat);
        this.anchorOnEarth(sat);
        this.drawEdges(sat, color);
      }
    });
  }

  private anchorOnEarth(sat: Satellite): void {
    const position = sat.get().position;
    const target = GlobeUtils.toVector(
      sat.lat,
      sat.lng,
      this.radius + this.alt
    );

    const mesh = sat.get();
    new TWEEN.Tween(position)
      .to(target, 2000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(function () {
        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.position.z = position.z;
      })
      .onComplete(function () {
        mesh.lookAt(0, 0, 0);
        mesh.rotateX(MathUtils.degToRad(90));
      })
      .start();
  }

  private drawEdges(satellite: Satellite, color: Color): void {
    this.satellites.forEach((sat: Satellite) => {
      if (sat.get().name != satellite.get().name) {
        // create the edge
        const edge = new Edge(
          this.appScene,
          { lat: satellite.lat, lng: satellite.lng },
          { lat: sat.lat, lng: sat.lng },
          this.radius + this.alt,
          color
        );
        this.satelliteEdges.push(edge);
      }
    });
  }

  public findByLatLng(lat: number, lng: number): Satellite[] {
    const delta = 0.5;
    const sats = this.satellites.filter((s: Satellite) => {
      const latInRange = this.inRange(lat, s.lat - delta, s.lat + delta);
      const lngInRange = this.inRange(lng, s.lng - delta, s.lng + delta);
      return latInRange && lngInRange;
    });
    return sats;
  }

  public tick(delta: number) {
    this.satellites.forEach((satellite: Satellite) => {
      satellite.tick(delta);
    });
  }

  private inRange(x: number, min: number, max: number): boolean {
    return (x - min) * (x - max) <= 0;
  }
}

export { Cluster };
