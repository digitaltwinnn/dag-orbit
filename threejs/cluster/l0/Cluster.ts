import {
  Color,
  Curve,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  QuadraticBezierCurve3,
  TubeGeometry,
  Vector3,
} from "three";
import { Satellite } from "./Satellite";
import TWEEN from "@tweenjs/tween.js";
//import { SatelliteAnchor } from "./SatelliteAnchor";
import { AppScene } from "../../scene/AppScene";
import { GlobeUtils } from "../../utils/GlobeUtils";

const nodeColors = ["#1E90FE", "#1467C8", "#1053AD"];

class Cluster {
  private appScene: AppScene;
  private satellites: Satellite[];
  private satellitePaths: Mesh[];
  //private satelliteAnchors!: SatelliteAnchor[];

  private radius = 100;
  private alt = 20;
  private size = 2;

  constructor(appScene: AppScene) {
    this.appScene = appScene;
    this.satellites = [];
    this.satellitePaths = [];
    //   this.satelliteAnchors = [];
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

        // this.drawAnchor(sat, color);
        this.drawConnections(sat, color);
        // sat.addNode(this.scene, this.earth, node);
      } else {
        //  sats[0].addNode(this.scene, this.earth, node);
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

  private drawConnections(satellite: Satellite, color: Color): void {
    const origin = GlobeUtils.toVector(
      satellite.lat,
      satellite.lng,
      this.radius + this.alt
    );

    this.satellites.forEach((sat: Satellite) => {
      if (sat.get().name != satellite.get().name) {
        const dest = GlobeUtils.toVector(
          sat.lat,
          sat.lng,
          this.radius + this.alt
        );
        const arc = this.createSphereArc(origin, dest);

        // static line between satellites
        const line = this.createLine(arc, color, 0.03, 0.15);
        this.appScene.applyBloomEffect(line);
        this.appScene.get().add(line);
        this.satellitePaths.push(line);

        // animate line across the static line
        const animatedLine = this.createLine(arc, color, 0.035, 0.3);
        this.appScene.applyBloomEffect(animatedLine);
        animatedLine.visible = false;
        this.appScene.get().add(animatedLine);
        this.animateLine(animatedLine);
      }
    });
  }

  private animateLine(line: Mesh): void {
    const geom: TubeGeometry = line.geometry as TubeGeometry;
    const vertices = 6;
    const offset = 3;
    const max = vertices * geom.attributes.position.count;
    const size = 3 * vertices;

    new TWEEN.Tween({ progress: 0 })
      .to({ progress: 1 }, 15000)
      .delay(Math.random() * 10000)
      .repeat(Infinity)
      .repeatDelay(Math.random() * 2000)
      .yoyo(true)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onStart(function () {
        line.visible = true;
      })
      .onUpdate(function (values) {
        const end = values.progress * max;
        let start = end < size ? 0 : end - size;
        start = size * Math.floor(start / offset) * offset;
        geom.setDrawRange(start, end);
      })
      .start();
  }

  /*
  private drawAnchor(sat: Satellite, color: Color): void {
    const anchor = new SatelliteAnchor(
      this.scene,
      this.earth,
      sat.lat,
      sat.lng,
      sat.alt,
      color
    );
    this.satelliteAnchors.push(anchor);
  }
  */

  public findByLatLng(lat: number, lng: number): Satellite[] {
    const delta = 0.5;
    const sats = this.satellites.filter((s: Satellite) => {
      const latInRange = this.inRange(lat, s.lat - delta, s.lat + delta);
      const lngInRange = this.inRange(lng, s.lng - delta, s.lng + delta);
      return latInRange && lngInRange;
    });
    return sats;
  }

  /*
  public findById(id: string): Satellite | null {
    let satellite = null;
    const satIndex = this.satellites.findIndex((s: Satellite) => {
      return s.hasNode(id);
    });
    if (satIndex != -1) {
      satellite = this.satellites[satIndex];
    }
    return satellite;
  }
  */

  public tick(delta: number) {
    /*
    this.satelliteAnchors.forEach((anchor: SatelliteAnchor) => {
      anchor.tick(delta);
    });
    */
    this.satellites.forEach((satellite: Satellite) => {
      satellite.tick(delta);
    });
  }

  private createLine(
    path: QuadraticBezierCurve3 | Curve<Vector3>,
    color: Color,
    width: number,
    opacity: number
  ): Mesh {
    const geometry = new TubeGeometry(path, 256, width, 6);
    const material = new MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
    });
    return new Mesh(geometry, material);
  }

  private createSphereArc(P: Vector3, Q: Vector3): Curve<Vector3> {
    const sphereArc = new Curve<Vector3>();
    sphereArc.getPoint = this.greatCircleFunction(P, Q);
    return sphereArc;
  }

  private greatCircleFunction(P: Vector3, Q: Vector3) {
    const angle = P.angleTo(Q);
    return function (t: number) {
      const X = new Vector3()
        .addVectors(
          P.clone().multiplyScalar(Math.sin((1 - t) * angle)),
          Q.clone().multiplyScalar(Math.sin(t * angle))
        )
        .divideScalar(Math.sin(angle));
      return X;
    };
  }

  private inRange(x: number, min: number, max: number): boolean {
    return (x - min) * (x - max) <= 0;
  }
}

export { Cluster };
