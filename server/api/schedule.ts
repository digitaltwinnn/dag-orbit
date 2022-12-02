import mongoose from "mongoose";
import axios from "axios";
import nodeModel from "../models/node.model";

export default defineEventHandler((event) => {
  console.log("mongodb readyState: " + mongoose.connection.readyState);

  // look for recently active nodes in mongodb
  /*
  nodeModel.find(function (err, docs) {
    if (err) {
      console.error(err);
    } else {
      
      console.info("mongodb nodes found: " + docs.length);
      */
      let clusterIP = "54.215.18.98";

      /*
      // select a node ip if recently active nodes are found
      if (docs.length > 0) {
        const doc = docs.at(randomNumber(0, docs.length - 1));
        clusterIP = numberToIP(doc.ip);
      }
      */

      // call the node to retrieve and update the mongodb store
      updateNodeDb(clusterIP);
//    }
//  });

  return {
    executed: true,
  };
});

function updateNodeDb(ip: string): void {
  // query the node for all nodes in the cluster
  console.log("updateNodeDb using api ip: " + ip)
  axios
    .get("http://" + ip + ":9000/cluster/info")
    .then(function (response) {
      console.log("got axios response")
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

      nodeModel
        .bulkWrite(nodes)
        .then(() => console.log("mongodb bulkwrite completed"))
        .catch((e) => {
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
