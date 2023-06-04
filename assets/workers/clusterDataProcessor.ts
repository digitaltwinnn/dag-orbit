import createGraph, { Graph } from "ngraph.graph";
import createLayout, { Layout } from "ngraph.forcelayout";
import { Color, MathUtils, Vector3 } from "three";
import { useGlobeUtils } from "~/composables/useGlobeUtils";

const toGraph = (nodes: L0Node[]): Graph => {
  const graph = createGraph();
  const peers = [...nodes];

  nodes.forEach(async (node) => {
    graph.addNode(node.ip, node);
    // node.metrics.peers.forEach((peer) => {
    peers.forEach((peer) => {
      graph.addLink(node.ip, peer.ip);
    });
  });

  return graph;
};

const toSatellites = (
  nodes: L0Node[],
  layout: Layout<Graph>,
  settings: any
): Satellite[] => {
  const satellites: Satellite[] = [];
  const $globeUtils = useGlobeUtils();

  nodes.forEach((node) => {
    const nearbySatellites = searchSatellites(
      node.host.latitude,
      node.host.longitude,
      settings.globe.satellite.proximity,
      satellites
    );

    const graphPosition = layout.getNodePosition(node.ip);
    satellites.push({
      node: node,
      orientation: {
        globe: {
          position: $globeUtils.toVector(
            node.host.latitude,
            node.host.longitude,
            settings.globe.radius
          ),
          visible: nearbySatellites.length == 0,
        },
        graph: {
          position: new Vector3(
            graphPosition.x * settings.graph.scale,
            graphPosition.y * settings.graph.scale,
            graphPosition.z ? graphPosition.z * settings.graph.scale : 0
          ),
          visible: true,
        },
      },
      color: new Color(
        settings.colors[MathUtils.randInt(0, settings.colors.length - 1)]
      ),
    });
  });

  return satellites;
};

const toEdges = (graph: Graph, satellites: Satellite[]): Edge[] => {
  const edges: Edge[] = [];

  graph.forEachLink((link) => {
    const source = satellites.find((sat) => {
      return sat.node.ip == link.fromId;
    });
    const target = satellites.find((sat) => {
      return sat.node.ip == link.toId;
    });
    if (source && target) {
      const sameNode = source.node.ip == target.node.ip;

      const sameLocation =
        source.node.host.latitude == target.node.host.latitude &&
        source.node.host.longitude == target.node.host.longitude;

      const existingEdge = edges.find((edge) => {
        return (
          edge.source.node.ip == target.node.ip &&
          edge.target.node.ip == source.node.ip
        );
      });

      const maxEdgesReached = false;

      if (!sameNode && !sameLocation && !existingEdge) {
        edges.push({
          source: source,
          target: target,
          visible: !maxEdgesReached,
        });
        // TODO: same location should be shown in graph mode..
      }
    }
  });

  return edges;
};

const searchSatellites = (
  lat: number,
  lng: number,
  proximity: number,
  target: Satellite[]
): Satellite[] => {
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

self.addEventListener(
  "message",
  function (e) {
    const nodes: L0Node[] = e.data.nodes;
    const settings: L0Node[] = e.data.settings;
    const satellites: Satellite[] = [];
    const edges: Edge[] = [];

    // create graph layout
    const graph = toGraph(nodes);
    const layout = createLayout(graph, { dimensions: 3 });
    for (let i = 0; i < 3; ++i) {
      layout.step();
    }

    // create data objects
    satellites.push(...toSatellites(nodes, layout, settings));
    edges.push(...toEdges(graph, satellites));

    self.postMessage({
      satellites: satellites,
      edges: edges,
    });
  },
  false
);
