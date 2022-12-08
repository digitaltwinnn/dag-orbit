import axios from "axios";
import nodeModel from "../models/node.model";
import { AnyBulkWriteOperation } from "mongodb";

export default defineEventHandler(async (event) => {
  let updates = 0;
  let success = false;

  try {
    const docs = await nodeModel.find();
    console.info("nodes found in mongodb: " + docs.length);

    // select a node ip if recently active nodes are found
    let clusterIP = "54.215.18.98";
    if (docs.length > 0) {
      const doc = docs.at(randomNumber(0, docs.length - 1));
      if (doc) {
        clusterIP = numberToIP(doc.ip);
      }
    }
    // call the node to retrieve and update the mongodb store
    updates = await updateNodeDb(clusterIP);
    success = true;
  } catch (e) {
    success = false;
    console.error(e);
  }

  return {
    success: success,
    updates: updates,
  };
});

async function updateNodeDb(ip: string): Promise<number> {
  // query the node for all nodes in the cluster
  const response = await axios.get("http://" + ip + ":9000/cluster/info");

  // update mongodb with the returned nodes
  let nodes: AnyBulkWriteOperation[] = [];
  response.data.forEach((n: { ip: string; state: string }) => {
    let docOperation = {
      updateOne: {
        filter: { ip: ipToNumber(n.ip) },
        update: { $set: { state: n.state } },
        upsert: true,
      },
    };
    nodes.push(docOperation);
  });
  await nodeModel.bulkWrite(nodes);

  console.log("nodes refreshed in mongodb from cluster: " + nodes.length);
  return nodes.length;
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
