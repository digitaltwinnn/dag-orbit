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

  await drawSatellites(newSatellites, effect);
  await drawEdges(newSatellites, effect);
  parent.add(cluster);
};

const NodesToSatellites = async (nodes: any[]): Promise<Satellite[]> => {
  const newSatellites: Satellite[] = [];
  nodes.forEach((node) => {
    const result = findByLatLng(node.host.latitude, node.host.longitude);
    if (result.length == 0) {
      const satellite = {
        lat: node.host.latitude,
        lng: node.host.longitude,
        id: 0,
        ip: [node.ip],
      };
      newSatellites.push(satellite);
      satellites.push(satellite);
    }
  });
  return newSatellites;
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
  const sources = [...sats];
  const targets = [...sats];
  const lines: { source: Satellite; target: Satellite }[] = [];

  sources.map(async (source) => {
    targets.map((target) => {
      if (source.id != target.id) {
        const mirror = lines.find((line) => {
          return line.source.id == target.id && line.target.id == source.id;
        });
        if (!mirror) {
          lines.push({ source: source, target: target });
        }
      }
    });
  });

  await Promise.all(
    lines.map((line) => {
      const color = new Color(COLORS[MathUtils.randInt(0, COLORS.length - 1)]);
      const $edge = useEdge(
        cluster,
        effect,
        { lat: line.source.lat, lng: line.source.lng },
        { lat: line.target.lat, lng: line.target.lng },
        settings.radius + settings.satellite.altitude,
        color
      );
    })
  );
};

export const useCluster = () => {
  return {
    init,
  };
};
