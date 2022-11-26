import axios from "axios";
import cron from "node-cron";
import nodeModel from "../models/node.model";

export default defineNitroPlugin((nitroApp) => {
  cron.schedule("*/15 * * * *", () => {
    nodeModel.find(function (err, docs) {
      if (err) {
        console.error(err);
      } else {
        console.info("mongodb nodes found: " + docs.length);
        let ip = ipToNumber("54.215.18.98");

        // select random ip if more node are online
        if (docs.length > 0) {
          const doc = docs.at(randomNumber(0, docs.length - 1));
          ip = doc.ip;
        }

        queryNodes(numberToIP(ip));
      }
    });
  });
  console.info("Cron: scheduled the tasks to update nodes in mongodb");
});

function queryNodes(ip: string) {
  axios
    .get("http:/" + ip + ":9000/cluster/info")
    .then(function (response) {
      response.data.forEach((n) => {
        nodeModel
          .updateOne(
            { ip: ipToNumber(n.ip) },
            { $set: { state: n.state } },
            { upsert: true }
          )
          .catch(function (e) {
            console.error("mongodb error: ", e.message);
          });
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
