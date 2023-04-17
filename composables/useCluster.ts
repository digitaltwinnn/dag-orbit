import { SelectiveBloomEffect } from "postprocessing";
import { Color, Group, MathUtils, Object3D } from "three";

const COLORS = ["#1E90FE", "#1467C8", "#1053AD"];

type Satellite = {
  lat: number;
  lng: number;
  id: number;
  ip: number[];
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

const init = async (
  parent: Object3D,
  effect: SelectiveBloomEffect,
  url: string
) => {
  const nodes: any[] = await $fetch(url);
  const newSatellites = await NodesToSatellites(nodes);
  satellites.push(...newSatellites);

  await drawSatellites(newSatellites, effect);
  await drawEdges(newSatellites, effect);
  parent.add(cluster);
};

const NodesToSatellites = async (nodes: any[]): Promise<Satellite[]> => {
  const satellites: Satellite[] = [];
  nodes.forEach((node) => {
    const result = findByLatLng(node.host.latitude, node.host.longitude);
    if (result.length == 0) {
      const satellite = {
        lat: node.host.latitude,
        lng: node.host.longitude,
        id: 0,
        ip: [node.ip],
      };
      satellites.push(satellite);
    }
  });
  return satellites;
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

const drawSatellites = async (
  sats: Satellite[],
  effect: SelectiveBloomEffect
) => {
  await Promise.all(
    sats.map(async (sat) => {
      const color = new Color(COLORS[MathUtils.randInt(0, COLORS.length - 1)]);
      const $sat = await useSatellite(
        cluster,
        effect,
        settings.satellite.size,
        color,
        sat.lat,
        sat.lng
      );
      sat.id = $sat.satellite.id;
      $sat.anchor(settings.radius + settings.satellite.altitude);
    })
  );
};

const drawEdges = async (sats: Satellite[], effect: SelectiveBloomEffect) => {
  const source = [1, 2, 3, 4];
  const target = [1, 2, 3, 4];
  const lines: { source: number; target: number }[] = [];

  source.map(async (s) => {
    target.map((t) => {
      if (s != t) {
        lines.push({ source: s, target: t });
      }
    });
  });
  // remove 2,1 if we also have 1,2
};

export const useCluster = () => {
  return {
    init,
  };
};
