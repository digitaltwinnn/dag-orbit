import nodeModel from "../model/node.model";
import { AnyBulkWriteOperation } from "mongodb";

export const config = {
  runtime: "edge",
};

export default defineEventHandler(async (event) => {
  let nodeUpdates = 0;

  try {
    const nodes = await getClusterInfo();
    nodeUpdates = await updateNodeCollection(nodes);
  } catch (e) {
    console.error(e);
  }

  return {
    updated: {
      nodes: nodeUpdates,
    },
  };
});

async function getClusterInfo(): Promise<any[]> {
  if (process.env.L0_BOOTSTRAP_IP == undefined) throw "no cluster bootstrap ip defined"
  
  const ip = process.env.L0_BOOTSTRAP_IP;
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
  // update the docs in bulk
  let nodeDocs: AnyBulkWriteOperation[] = [];
  nodes.forEach((node) => {
    // get the latitude and longitude coordinates
    const latLong = node.host.loc.split(",").map((coord: string) => {
      const f = parseFloat(coord);
      return isNaN(f) ? 0 : f;
    });

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

function ip4ToNumber(ip: string) {
  return (
    ip.split(".").reduce(function (ipNumber, octet) {
      return (ipNumber << 8) + parseInt(octet, 10);
    }, 0) >>> 0
  );
}
