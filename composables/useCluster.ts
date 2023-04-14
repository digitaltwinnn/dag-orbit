import { SelectiveBloomEffect } from "postprocessing";
import { Color, Group, MathUtils, Object3D } from "three";

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
    proximity: 0.5,
  },
};

const satellites: Satellite[] = [];
const cluster = new Group();
cluster.name = "Cluster";
let bloomEffect: SelectiveBloomEffect;

const init = (parent: Object3D, effect: SelectiveBloomEffect, url: string) => {
  bloomEffect = effect;
  $fetch(url).then((nodes: any) => {
    refresh(nodes);
    parent.add(cluster);
    state.initialised = true;
  });
};

const refresh = (nodes: any[]) => {
  nodes.forEach((node) => {
    const sats = findByLatLng(node.host.latitude, node.host.longitude);
    if (sats.length == 0) {
      const color = new Color(COLORS[MathUtils.randInt(0, COLORS.length - 1)]);
      const $sat = useSatellite(
        cluster,
        bloomEffect,
        settings.satellite.size,
        color,
        node.host.latitude,
        node.host.longitude
      );
      $sat.anchor(settings.radius + settings.satellite.altitude);

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
  const proximity = settings.satellite.proximity;
  const sats = satellites.filter((s: Satellite) => {
    const latInRange = inRange(lat, s.lat - proximity, s.lat + proximity);
    const lngInRange = inRange(lng, s.lng - proximity, s.lng + proximity);
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
        bloomEffect,
        { lat: sat.lat, lng: sat.lng },
        { lat: satellite.lat, lng: satellite.lng },
        settings.radius + settings.satellite.altitude,
        color
      );
    }
  });
};

const state = reactive({
  initialised: false,
});

export const useCluster = () => {
  return {
    ...toRefs(state),
    init,
  };
};
