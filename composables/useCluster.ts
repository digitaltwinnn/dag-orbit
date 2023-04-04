import { Color, Group, MathUtils } from "three";
import { AppScene } from "~~/threejs/scene/AppScene";

const COLORS = ["#1E90FE", "#1467C8", "#1053AD"];

type Satellite = {
  lat: number;
  lng: number;
  name: string;
};

const settings = {
  radius: 100,
  satellite: {
    altitude: 20,
    size: 2,
  },
};

const cluster = new Group();
const satellites: Satellite[] = [];

const refresh = (nodes: any[]) => {
  nodes.forEach((node) => {
    const sats = findByLatLng(node.host.latitude, node.host.longitude);
    if (sats.length == 0) {
      const color = new Color(COLORS[MathUtils.randInt(0, COLORS.length - 1)]);
      const $sat = useSatellite(
        cluster,
        settings.satellite.size,
        color,
        node.host.latitude,
        node.host.longitude
      );
      $sat.anchor(settings.radius + settings.satellite.altitude);
      // this.appScene.applyBloomEffect(sat.get());

      const satellite = {
        lat: $sat.lat.value,
        lng: $sat.lng.value,
        name: $sat.name.value,
      };
      satellites.push(satellite);
      drawEdges(satellite, color);
    } else {
      //  sats[0].addNode(this.scene, this.earth, node);
    }
  });
};

const findByLatLng = (lat: number, lng: number): Satellite[] => {
  const delta = 0.5;
  const sats = satellites.filter((s: Satellite) => {
    const latInRange = inRange(lat, s.lat - delta, s.lat + delta);
    const lngInRange = inRange(lng, s.lng - delta, s.lng + delta);
    return latInRange && lngInRange;
  });
  return sats;
};

const inRange = (x: number, min: number, max: number): boolean => {
  return (x - min) * (x - max) <= 0;
};

const drawEdges = (sat: Satellite, color: Color) => {
  satellites.forEach((satellite: Satellite) => {
    if (satellite.name != sat.name) {
      const $edge = useEdge(
        cluster,
        { lat: sat.lat, lng: sat.lng },
        { lat: satellite.lat, lng: satellite.lng },
        settings.radius + settings.satellite.altitude,
        color
      );
      //this.appScene.applyBloomEffect(edge.get());
    }
  });
};

const tick = (deltaTime: number) => {
  const radiansPerSecond = MathUtils.degToRad(4);
  cluster.rotation.y += (radiansPerSecond * deltaTime) / 1000;
};

const getNodes = (url: string) => {
  const nodes = $fetch(url);
  return nodes;
};

const state = reactive({});

export const useCluster = (appScene: AppScene, url: string) => {
  getNodes(url).then((nodes: any) => {
    refresh(nodes);
    appScene.add(cluster);
  });

  return {
    ...toRefs(state),
    tick,
  };
};
