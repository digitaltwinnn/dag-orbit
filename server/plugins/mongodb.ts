import mongoose from "mongoose";

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig();

  mongoose.connection.on("connected", function () {
    console.log("connected");
  });
  mongoose.connection.on("disconnected", function () {
    console.log("disconected");
  });

  mongoose
    .connect(config.MONGODB_URI)
    .then(() => console.log("Connected to Mongo DB"))
    .catch((e) => console.log(e));
});
