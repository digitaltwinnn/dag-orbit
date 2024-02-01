import createGraph, { Graph } from "ngraph.graph";
import nodeModel from "../model/node.model";
import { AnyBulkWriteOperation } from "mongodb";
import createLayout from "ngraph.forcelayout";
import { Vector3 } from "three";
import { error } from "console";

export const config = {
  runtime: "edge",
};

export default defineEventHandler(async (event) => {
  let updates = 0;

  try {
    if (process.env.L0_BOOTSTRAP_IP == undefined) throw "o cluster bootstrap ip defined"
    const nodes = await getClusterDetails(process.env.L0_BOOTSTRAP_IP);
    updates = await updateNodeCollection(nodes);
  } catch (e) {
    console.error(e);
  }

  return {
    updates: updates,
  };
});

async function getClusterDetails(ip: string): Promise<any[]> {
  const nodes: any[] = await $fetch("http://" + ip + ":9000/cluster/info");
  await Promise.all(
    nodes.map(async (n, index, array) => {
      const host = await $fetch("/api/hosts/" + n.ip);
      n.host = host;
      array[index] = n;
    })
  );
  return nodes;
}

async function updateNodeCollection(nodes: any[]): Promise<number> {

  // calculate all node position vectors in 3d force directed graph
  const nodeGraph = toGraph(nodes);
  const forceLayout = createLayout(nodeGraph, { dimensions: 3 });
  for (let i = 0; i < 3; ++i) {
    forceLayout.step();
  }

  let nodeDocs: AnyBulkWriteOperation[] = [];
  nodes.forEach((node: any) => {
    // get the latitude and longitude coordinates
    const latLong = node.host.loc.split(",").map((coord: string) => {
      const f = parseFloat(coord);
      return isNaN(f) ? 0 : f;
    });

    // get the node position vector on a 3d force directed graph
    const graphPosition = forceLayout.getNodePosition(node.ip);

    // get the node position vector on a 3d globe
    const globePosition = toVector(
      latLong[0],
      latLong[1],
      120
    )

    let docOperation = {
      updateOne: {
        filter: { ip: ip4ToNumber(node.ip.toString()) },
        update: {
          $set: {
            state: node.state,
            "host.name": node.host.hostname,
            "host.city": node.host.city,
            "host.region": node.host.region,
            "host.country": node.host.country,
            "host.latitude": latLong[0],
            "host.longitude": latLong[1],
            "host.org": node.host.org,
            "vector.graph.x": graphPosition.x * 20,
            "vector.graph.y": graphPosition.y * 20,
            "vector.graph.z": graphPosition.z ? graphPosition.z * 20 : 0,
            "vector.globe.x": globePosition.x,
            "vector.globe.y": globePosition.y,
            "vector.globe.z": globePosition.z,
          },
        },
        upsert: true,
      },
    };
    nodeDocs.push(docOperation);
  });

  await nodeModel.bulkWrite(nodeDocs);
  return nodeDocs.length;
}

function toGraph(nodes: L0Node[]): Graph {
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

function toVector(lat: number, lng: number, radius: number): Vector3 {
  const latRad = lat * (Math.PI / 180);
  const lonRad = -lng * (Math.PI / 180);
  return new Vector3(
    Math.cos(latRad) * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.sin(lonRad) * radius
  );
};

function ip4ToNumber(ip: string) {
  return (
    ip.split(".").reduce(function (ipNumber, octet) {
      return (ipNumber << 8) + parseInt(octet, 10);
    }, 0) >>> 0
  );
}
