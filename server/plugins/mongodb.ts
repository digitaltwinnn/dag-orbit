import mongoose from "mongoose";

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig();
  mongoose
    .connect(config.MONGODB_URI)
    .then(() => console.log("Connected to Mongo DB"))
    .catch((e) => console.log(e));
});