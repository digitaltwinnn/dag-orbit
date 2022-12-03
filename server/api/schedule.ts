import mongoose from "mongoose";
import axios from "axios";
import nodeModel from "../models/node.model";

export default defineEventHandler((event) => {
  connectionIsUp().then(() => {
    nodeModel
      .find()
      .then((docs) => {
        console.info("mongodb nodes found: " + docs.length);

        // select a node ip if recently active nodes are found
        let clusterIP = "54.215.18.98";
        if (docs.length > 0) {
          const doc = docs.at(randomNumber(0, docs.length - 1));
          clusterIP = numberToIP(doc.ip);
        }

        // call the node to retrieve and update the mongodb store
        updateNodeDb(clusterIP);
      })
      .catch((err) => {
        console.error(err);
      });
  });

  return {
    executed: true,
  };
});

function updateNodeDb(ip: string): void {
  // query the node for all nodes in the cluster
  axios
    .get("http://" + ip + ":9000/cluster/info")
    .then(function (response) {
      let nodes = [];
      let i: number;

      // update mongodb with the returned nodes
      response.data.forEach((n) => {
        let docOperation = {
          updateOne: {
            filter: { ip: ipToNumber(n.ip) },
            update: { $set: { state: n.state } },
            upsert: true,
          },
        };
        nodes.push(docOperation);
      });

      nodeModel.bulkWrite(nodes).catch((e) => {
        console.error("nodejs error: " + e.message);
      });
    })
    .catch(function (e) {
      console.error("axios error: ", e.message);
    });
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

async function connectionIsUp(): Promise<boolean> {
  try {
    return await mongoose.connection.db
      .admin()
      .ping()
      .then((res) => res?.ok === 1);
  } catch (err) {
    console.error(err);
    return false;
  }
}
