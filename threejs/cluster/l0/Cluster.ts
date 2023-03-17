import { Color, Group, MathUtils } from "three";
import { Satellite } from "./Satellite";
//import { SatelliteAnchor } from "./SatelliteAnchor";
import { AppScene } from "../../scene/AppScene";
import { GlobeUtils } from "../../utils/GlobeUtils";
import { Edge } from "./Edge";

const nodeColors = ["#1E90FE", "#1467C8", "#1053AD"];

class Cluster {
  private appScene: AppScene;
  private cluster: Group;
  private satellites: Satellite[];
  private satelliteEdges: Edge[];
  //private satelliteAnchors!: SatelliteAnchor[];

  private radius = 100;
  private alt = 20;
  private size = 2;

  constructor(appScene: AppScene) {
    this.appScene = appScene;
    this.cluster = new Group();
    this.satellites = [];
    this.satelliteEdges = [];

    appScene.add(this.cluster);
    appScene.addObjectAnimation(this);
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
          this.cluster,
          this.size,
          node.host.latitude,
          node.host.longitude,
          color
        );
        this.satellites.push(sat);
        this.appScene.applyBloomEffect(sat.get());
        this.anchorOnEarth(sat);
        this.drawEdges(sat, color);

        // this.drawAnchor(sat, color);
        // sat.addNode(this.scene, this.earth, node);
      } else {
        //  sats[0].addNode(this.scene, this.earth, node);
      }
    });
  }

  private anchorOnEarth(sat: Satellite): void {
    const target = GlobeUtils.toVector(
      sat.lat,
      sat.lng,
      this.radius + this.alt
    );

    const mesh = sat.get();
    mesh.position.set(target.x, target.y, target.z);
    mesh.lookAt(0, 0, 0);
    mesh.rotateX(MathUtils.degToRad(90));
  }

  private drawEdges(satellite: Satellite, color: Color): void {
    this.satellites.forEach((sat: Satellite) => {
      if (sat.get().name != satellite.get().name) {
        // create the edge
        const edge = new Edge(
          this.cluster,
          { lat: satellite.lat, lng: satellite.lng },
          { lat: sat.lat, lng: sat.lng },
          this.radius + this.alt,
          color
        );
        this.satelliteEdges.push(edge);
        this.appScene.applyBloomEffect(edge.get());
      }
    });
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

  public get(): Group {
    return this.cluster;
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

  public tick(deltaTime: number) {
    const radiansPerSecond = MathUtils.degToRad(4);
    this.cluster.rotation.y += (radiansPerSecond * deltaTime) / 1000;
    /*
    this.satelliteAnchors.forEach((anchor: SatelliteAnchor) => {
      anchor.tick(deltaTime);
    });
    */
    this.satellites.forEach((satellite: Satellite) => {
      satellite.tick(deltaTime);
    });
  }

  private inRange(x: number, min: number, max: number): boolean {
    return (x - min) * (x - max) <= 0;
  }
}

export { Cluster };
