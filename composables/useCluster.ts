import createGraph, { Graph } from "ngraph.graph";
import { SelectiveBloomEffect } from "postprocessing";
import { Color, Group, MathUtils, Object3D } from "three";

const settings = {
  colors: ["#ff0000", "#00ff00", "#0000ff"],
  globe: {
    radius: 100,
  },
  satellite: {
    altitude: 20,
    size: 2,
    proximity: 0.5,
  },
  edge: {
    animated: 100,
  },
};

const graph: Graph = createGraph();
const cluster = new Group();
cluster.name = "Cluster";
let satelliteId = 0;

const init = async (
  parent: Object3D,
  effect: SelectiveBloomEffect,
  url: string
) => {
  const nodes = await nodesToGraph(url);
  const satellites = await satellitesToGraph(nodes);
  const edges = await edgesToGraph(satellites);
  
  await drawSatellites(satellites, effect);
  await useEdges(cluster, edges, effect);
  await useAnimatedEdges(cluster, edges, settings.edge.animated, effect);

  parent.add(cluster);
};

const nodesToGraph = async (url: string): Promise<L0Node[]> => {
  const nodes: L0Node[] = await $fetch(url);
  nodes.map((node) => {
    graph.addNode(node.ip, node);
  });
  return nodes;
};

const satellitesToGraph = async (nodes: L0Node[]): Promise<Satellite[]> => {
  const satellites: Satellite[] = [];
  nodes.forEach((node) => {
    const satsInRange = searchSatellites(
      node.host.latitude,
      node.host.longitude,
      satellites
    );
    if (satsInRange.length == 0) {
      const color = new Color(
        settings.colors[MathUtils.randInt(0, settings.colors.length - 1)]
      );

      const satellite = {
        lat: node.host.latitude,
        lng: node.host.longitude,
        id: satelliteId++,
        objectId: -1,
        nodeIPs: [node.ip],
        color: color,
      };
      satellites.push(satellite);
    } else {
      satsInRange.map((sat) => {
        sat.nodeIPs.push(node.ip);
      });
    }
  });

  satellites.map((sat) => {
    graph.addNode(sat.id, sat);
    sat.nodeIPs.map((nodeIP) => {
      graph.addLink(sat.id, nodeIP);
    });
  });

  return satellites;
};

const edgesToGraph = async (sats: Satellite[]): Promise<Edge[]> => {
  const sources = [...sats];
  const targets = [...sats];
  const edges: Edge[] = [];

  sources.map(async (source) => {
    targets.map((target) => {
      if (source.id != target.id) {
        const mirror = edges.find((edge) => {
          return edge.source.id == target.id && edge.target.id == source.id;
        });
        if (!mirror) {
          edges.push({ source: source, target: target });
        }
      }
    });
  });

  edges.map((edge) => {
    graph.addLink(edge.source.id, edge.target.id);
  });

  return edges;
};

const searchSatellites = (
  lat: number,
  lng: number,
  target: Satellite[]
): Satellite[] => {
  const proximity = settings.satellite.proximity;
  const sats = target.filter((s: Satellite) => {
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
  satellites: Satellite[],
  effect: SelectiveBloomEffect
) => {
  await Promise.all(
    satellites.map(async (satellite) => {
      const $sat = await useSatellite(
        cluster,
        effect,
        settings.satellite.size,
        satellite.color,
        satellite.lat,
        satellite.lng
      );
      satellite.objectId = $sat.satellite.id;
      $sat.anchor(settings.globe.radius + settings.satellite.altitude);
    })
  );
};

export const useCluster = () => {
  return {
    init,
  };
};
