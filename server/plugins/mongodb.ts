import mongoose from "mongoose";

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig();

  mongoose.connection.on("mongodb connected event", function () {
    console.log("connected");
  });
  mongoose.connection.on("mongodb disconnected event", function () {
    console.log("disconected");
  });

  mongoose
    .connect(config.MONGODB_URI)
    .then(() => console.log("connected to mongodb"))
    .catch((e) => console.log(e));
});
