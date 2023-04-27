import createGraph, { Graph } from "ngraph.graph";
import { SelectiveBloomEffect } from "postprocessing";
import { Color, Group, MathUtils, Object3D } from "three";

export const useCluster = async (
  parent: Object3D,
  bloom: SelectiveBloomEffect,
  url: string
) => {
  const settings = {
    colors: ["#1E90FE", "#1467C8", "#1053AD"],
    satellite: {
      proximity: 0.1,
    },
  };

  const toGraph = (nodes: L0Node[], edges: Edge[]): Graph => {
    const graph = createGraph();

    nodes.map((node) => {
      graph.addNode(node.ip, node);
    });

    /* maybe virtual nodes/satellites to show relation to datacenter/location
    satellites.map((sat) => {
      graph.addNode(sat.id, sat);
      sat.nodeIPs.map((nodeIP) => {
        graph.addLink(sat.id, nodeIP);
      });
    });
    */

    edges.map((edge) => {
      graph.addLink(edge.source.node.ip, edge.target.node.ip);
    });

    return graph;
  };

  const toSatellites = (nodes: L0Node[]): Satellite[] => {
    const satellites: Satellite[] = [];
    nodes.forEach((node) => {
      const nearbySatellites = searchSatellites(
        node.host.latitude,
        node.host.longitude,
        satellites
      );

      satellites.push({
        node: node,
        color: new Color(
          settings.colors[MathUtils.randInt(0, settings.colors.length - 1)]
        ),
        visible: nearbySatellites.length == 0,
      });
    });

    return satellites;
  };

  const toEdges = (sats: Satellite[]): Edge[] => {
    const sources = [...sats];
    const targets = [...sats];
    const edges: Edge[] = [];

    sources.map(async (source) => {
      targets.map((target) => {
        if (source.node.ip != target.node.ip) {
          const edgeExists = edges.find((e) => {
            return (
              e.source.node.ip == target.node.ip &&
              e.target.node.ip == source.node.ip
            );
          });

          const sameLocation =
            source.node.host.latitude == target.node.host.latitude &&
            source.node.host.longitude == target.node.host.longitude;

          if (!edgeExists && !sameLocation) {
            edges.push({
              source: source,
              target: target,
              visible: source.visible && target.visible,
            });
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
    const proximity = settings.satellite.proximity;
    const sats = target.filter((s: Satellite) => {
      const latInRange = inRange(
        lat,
        s.node.host.latitude - proximity,
        s.node.host.latitude + proximity
      );
      const lngInRange = inRange(
        lng,
        s.node.host.longitude - proximity,
        s.node.host.longitude + proximity
      );
      return latInRange && lngInRange;
    });
    return sats;
  };

  const inRange = (x: number, min: number, max: number): boolean => {
    return (x - min) * (x - max) <= 0;
  };

  const cluster = new Group();
  cluster.name = "Cluster";

  const nodes: L0Node[] = await $fetch(url);
  const satellites = toSatellites(nodes);
  const edges = toEdges(satellites);
  const graph = toGraph(nodes, edges);

  const $satellites = await useSatellites(cluster, satellites);
  const $edges = await useEdges(cluster, edges, bloom);
  parent.add(cluster);

  return {
    cluster,
  };
};
