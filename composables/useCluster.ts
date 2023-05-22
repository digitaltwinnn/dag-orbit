import createLayout from "ngraph.forcelayout";
import createGraph, { Graph } from "ngraph.graph";
import { Color, MathUtils, Vector3 } from "three";

export const useCluster = () => {
  const settings = {
    url: "/api/nodes",
    colors: ["#1E90FE", "#1467C8", "#1053AD"],
    globe: {
      radius: 120,
      satellite: {
        proximity: 0.1,
      },
    },
    graph: {
      scale: 20,
    },
  };

  const nodesToGraph = (): Graph => {
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

  const nodesToSatellites = (): Satellite[] => {
    const satellites: Satellite[] = [];
    nodes.forEach((node) => {
      const nearbySatellites = searchSatellites(
        node.host.latitude,
        node.host.longitude,
        satellites
      );

      const graphPosition = layout.getNodePosition(node.ip);
      satellites.push({
        node: node,
        orientation: {
          globe: {
            position: useGlobeUtils().toVector(
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

  const graphLinksToEdges = (): Edge[] => {
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
    target: Satellite[]
  ): Satellite[] => {
    const proximity = settings.globe.satellite.proximity;
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

  const load = async () => {
    // get nodes in the L0 cluster
    /*
    const { data, error } = await useFetch<L0Node[]>(settings.url);
    if (data.value) {
      nodes.push(...toRaw(data.value));
    }
    console.log("got the nodes from usefetch " + nodes.length);
    */
    nodes = await $fetch(settings.url);

    // create graph layout
    graph = nodesToGraph();
    layout = createLayout(graph, { dimensions: 3 });
    for (let i = 0; i < 3; ++i) {
      layout.step();
    }

    // create objects to manage the presentation
    satellites.push(...nodesToSatellites());
    edges.push(...graphLinksToEdges());
    loaded.value = true;
  };

    const loaded = ref(false);
  let nodes: L0Node[] = [];
  const satellites: Satellite[] = [];
  const edges: Edge[] = [];

  let graph: Graph = createGraph();
  let layout: any;
  load();

  return {
    nodes,
    graph,
    satellites,
    edges,
    loaded,
  };
};
