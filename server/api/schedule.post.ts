import nodeModel from "../model/node.model";
import { AnyBulkWriteOperation } from "mongodb";

export default defineEventHandler(async (event) => {
  let updates = 0;

  try {
    const clusterIP = await getClusterIP();
    const nodes = await getClusterDetails(clusterIP);
    updates = await updateNodeCollection(nodes);
  } catch (e) {
    console.error(e);
  }

  return {
    updates: updates,
  };
});

async function getClusterIP(): Promise<string> {
  let ip = "0.0.0.0";
  if (process.env.L0_BOOTSTRAP_IP != undefined) {
    ip = process.env.L0_BOOTSTRAP_IP;
  }

  // select the ip from a random active node if available
  const docs = await nodeModel.find();
  if (docs.length > 0) {
    const doc = docs.at(randomNumber(0, docs.length - 1));
    if (doc) {
      ip = numberToIP(doc.ip);
    }
  }

  return ip;
}

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
  let nodeDocs: AnyBulkWriteOperation[] = [];

  nodes.forEach((n: { ip: string; state: string; host: any }) => {
    const latLong = n.host.loc.split(",").map((coord: string) => {
      const f = parseFloat(coord);
      return isNaN(f) ? 0 : f;
    });

    let docOperation = {
      updateOne: {
        filter: { ip: ipToNumber(n.ip) },
        update: {
          $set: {
            state: n.state,
            "host.name": n.host.hostname,
            "host.city": n.host.city,
            "host.region": n.host.region,
            "host.country": n.host.country,
            "host.latitude": latLong[0],
            "host.longitude": latLong[1],
            "host.org": n.host.org,
          },
        },
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
