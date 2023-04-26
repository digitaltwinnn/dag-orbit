import createGraph, { Graph } from "ngraph.graph";
import { SelectiveBloomEffect } from "postprocessing";
import { Color, Group, MathUtils, Object3D } from "three";

const settings = {
  colors: ["#1E90FE", "#1467C8", "#1053AD"],
  node: {
    proximity: 0.5,
  },
};

const cluster = new Group();
cluster.name = "Cluster";
let satelliteId = 0;

const init = async (
  parent: Object3D,
  bloom: SelectiveBloomEffect,
  url: string
) => {
  const nodes: L0Node[] = await $fetch(url);
  const satellites = toSatellites(nodes);
  const edges = toEdges(satellites);
  const graph = toGraph(nodes, satellites, edges);

  const $satellites = await useSatellites(cluster, satellites, bloom);
  const $edges = await useEdges(cluster, edges, bloom);
  parent.add(cluster);
};

const toGraph = (
  nodes: L0Node[],
  satellites: Satellite[],
  edges: Edge[]
): Graph => {
  const graph = createGraph();

  nodes.map((node) => {
    graph.addNode(node.ip, node);
  });

  satellites.map((sat) => {
    graph.addNode(sat.id, sat);
    sat.nodeIPs.map((nodeIP) => {
      graph.addLink(sat.id, nodeIP);
    });
  });

  edges.map((edge) => {
    graph.addLink(edge.source.id, edge.target.id);
  });

  return graph;
};

const toSatellites = (nodes: L0Node[]): Satellite[] => {
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

  return satellites;
};

const toEdges = (sats: Satellite[]): Edge[] => {
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

  return edges;
};

const searchSatellites = (
  lat: number,
  lng: number,
  target: Satellite[]
): Satellite[] => {
  const proximity = settings.node.proximity;
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

export const useCluster = () => {
  return {
    init,
  };
};
