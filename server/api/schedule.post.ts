import nodeModel from "../models/node.model";
import { AnyBulkWriteOperation } from "mongodb";

export default defineEventHandler(async (event) => {
  let updates = 0;

  try {
    const clusterIP = await getClusterIP();
    const nodes = await getClusterDetails(clusterIP);
    updates = await updateNodeDb(nodes);
  } catch (e) {
    console.error(e);
  }

  return {
    updates: updates,
  };
});

async function getClusterIP(): Promise<string> {
  let ip = "0.0.0.0";

  // select the ip from a random active node if available
  const docs = await nodeModel.find();
  if (docs.length > 0) {
    const doc = docs.at(randomNumber(0, docs.length - 1));
    if (doc) {
      ip = numberToIP(doc.ip);
    } else if (process.env.L0_BOOTSTRAP_IP != undefined) {
      ip = process.env.L0_BOOTSTRAP_IP;
    }
  }

  return ip;
}

async function getClusterDetails(ip: string): Promise<any[]> {
  // query the node for all nodes in the cluster
  const nodes: any[] = await $fetch("http://" + ip + ":9000/cluster/info");
  return nodes;
}

async function updateNodeDb(nodes: any[]): Promise<number> {
  let nodeDocs: AnyBulkWriteOperation[] = [];

  nodes.forEach((n: { ip: string; state: string }) => {
    let docOperation = {
      updateOne: {
        filter: { ip: ipToNumber(n.ip) },
        update: { $set: { state: n.state } },
        upsert: true,
      },
    };
    nodeDocs.push(docOperation);
  });

  await nodeModel.bulkWrite(nodeDocs);
  console.log("nodes refreshed in mongodb from cluster: " + nodes.length);
  return nodeDocs.length;
}

function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// number to IP (v4)
function numberToIP(ip: number) {
  return (
    (ip >>> 24) +
    "." +
    ((ip >> 16) & 255) +
    "." +
    ((ip >> 8) & 255) +
    "." +
    (ip & 255)
  );
}

// IP (v4) to number
function ipToNumber(ip: string) {
  return (
    ip.split(".").reduce(function (ipNumber, octet) {
      return (ipNumber << 8) + parseInt(octet, 10);
    }, 0) >>> 0
  );
}
