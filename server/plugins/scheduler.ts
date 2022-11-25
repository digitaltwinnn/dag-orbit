import axios from "axios";
import cron from "node-cron";
import nodeModel from "../models/node.model";

export default defineNitroPlugin((nitroApp) => {
  cron.schedule("*/15 * * * *", () => {
    let iPv4: Number;
    axios
      .get("http://54.215.18.98:9000/cluster/info")
      .then(function (response) {
        response.data.forEach((n) => {
          iPv4 = n.ip.split(".").reduce(function (int, value) {
            return int * 256 + +value;
          });

          nodeModel
            .updateOne(
              { iPv4: iPv4 },
              { $set: { state: n.state } },
              { upsert: true }
            )
            .catch(function (e) {
              console.error("Mongodb: ", e.message);
            });
        });
      });
  });
  console.log("Scheduled the cron tasks");
});
