import { Color, Group, MathUtils } from "three";
import { AppScene } from "../../scene/AppScene";

const COLORS = ["#1E90FE", "#1467C8", "#1053AD"];

type Satellite = {
  lat: number;
  lng: number;
  name: string;
};

class Cluster {
  private cluster: Group;
  private satellites: Satellite[] = [];

  private radius = 100;
  private alt = 20;
  private size = 2;

  constructor(appScene: AppScene) {
    this.cluster = new Group();
    appScene.add(this.cluster);
  }

  public refresh(nodes: any[]): void {
    nodes.forEach((node) => {
      const sats = this.findByLatLng(node.host.latitude, node.host.longitude);
      if (sats.length == 0) {
        const color = new Color(
          COLORS[MathUtils.randInt(0, COLORS.length - 1)]
        );
        const $sat = useSatellite(
          this.cluster,
          this.size,
          color,
          node.host.latitude,
          node.host.longitude
        );
        $sat.anchor(this.radius + this.alt);
        // this.appScene.applyBloomEffect(sat.get());

        const satellite = {
          lat: $sat.lat.value,
          lng: $sat.lng.value,
          name: $sat.name.value,
        };
        this.satellites.push(satellite);
        this.drawEdges(satellite, color);
      } else {
        //  sats[0].addNode(this.scene, this.earth, node);
      }
    });
  }

  private drawEdges(sat: Satellite, color: Color): void {
    this.satellites.forEach((satellite: Satellite) => {
      if (satellite.name != sat.name) {
        const $edge = useEdge(
          this.cluster,
          { lat: sat.lat, lng: sat.lng },
          { lat: satellite.lat, lng: satellite.lng },
          this.radius + this.alt,
          color
        );
        //this.appScene.applyBloomEffect(edge.get());
      }
    });
  }

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
  }

  private inRange(x: number, min: number, max: number): boolean {
    return (x - min) * (x - max) <= 0;
  }
}

export { Cluster };
