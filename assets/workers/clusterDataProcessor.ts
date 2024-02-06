import createGraph, { Graph } from "ngraph.graph";
import createLayout, { Layout } from "ngraph.forcelayout";
import { Color, MathUtils, Vector3 } from "three";
import { useGlobeUtils } from "~/composables/useGlobeUtils";

const settings = {
    colors: [],
    globe: {
        radius: 120,
        satellite: {
            proximity: 10,
        },
    },
    graph: {
        scale: 20,
    },
};

const toGraph = (nodes: L0Node[]): Graph => {
    const graph = createGraph();
    const peers = [...nodes];

    nodes.forEach(async (node) => {
        graph.addNode(node.ip, node);
        // node.metrics.peers.forEach((peer) => {
        peers.forEach((peer) => {
            if (node.ip != peer.ip) {
                graph.addLink(node.ip, peer.ip);
            }
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

    let graphVector = new Vector3();
    let globeVector = new Vector3();
    nodes.forEach((node) => {
        const graphPosition = layout.getNodePosition(node.ip);
        graphVector = new Vector3(
            graphPosition.x * settings.graph.scale,
            graphPosition.y * settings.graph.scale,
            graphPosition.z ? graphPosition.z * settings.graph.scale : 0
        )
        globeVector = $globeUtils.toVector(
            node.host.latitude,
            node.host.longitude,
            settings.globe.radius
        );

        satellites.push({
            node: node,
            color: new Color(
                settings.colors[MathUtils.randInt(0, settings.colors.length - 1)]
            ),
            mode: {
                graph: {
                    vector: graphVector,
                    visible: true,
                },
                globe: {
                    vector: globeVector,
                    visible: !nearbySatellites(globeVector, settings.globe.satellite.proximity, satellites),
                },
            },
        });
    });

    return satellites;
};

const toEdges = (graph: Graph, satellites: Satellite[]): Edge[] => {
    const edges: Edge[] = [];

    let sourceIp = 0;
    let targetIp = 0;
    graph.forEachLink((link) => {
        sourceIp = ip4ToNumber(link.fromId.toString());
        targetIp = ip4ToNumber(link.toId.toString());

        const existingEdge = edges.find((edge) => {
            return (
                (sourceIp == edge.source.node.ip && targetIp == edge.target.node.ip) ||
                (targetIp == edge.source.node.ip && sourceIp == edge.target.node.ip));
        });

        if (!existingEdge) {
            const source = satellites.find((sat) => {
                return sat.node.ip == link.fromId;
            });
            const target = satellites.find((sat) => {
                return sat.node.ip == link.toId;
            });
            if (source && target) {
                if (source.mode.globe.visible && target.mode.globe.visible) {
                    // TODO: will only create globe edges (graph has many many more visible sats (all))
                    edges.push({
                        source: source,
                        target: target,
                        // TODO different for globe and graph, can't be captured here
                        visible: (source.mode.globe.visible && target.mode.globe.visible),
                    });
                }
            }
        }
    });

    return edges;
};

const nearbySatellites = (
    globeVector: Vector3,
    proximity: number,
    target: Satellite[]
): boolean => {
    const sats = target.filter((s: Satellite) => {
        return globeVector.distanceTo(s.mode.globe.vector) < proximity
    });
    return sats.length > 0;
};

function ip4ToNumber(ip: string) {
    return (
        ip.split(".").reduce(function (ipNumber, octet) {
            return (ipNumber << 8) + parseInt(octet, 10);
        }, 0) >>> 0
    );
}

self.addEventListener(
    "message",
    function (e) {
        const nodes: L0Node[] = e.data.nodes;
        settings.colors = e.data.colors;

        // create graph layout
        const graph = toGraph(nodes);
        const layout = createLayout(graph, { dimensions: 3 });
        for (let i = 0; i < 3; ++i) {
            layout.step();
        }

        // create data objects
        const satellites: Satellite[] = [];
        const edges: Edge[] = [];
        satellites.push(...toSatellites(nodes, layout, settings));
        edges.push(...toEdges(graph, satellites));

        self.postMessage({
            satellites: satellites,
            edges: edges,
        });
    },
    false
);