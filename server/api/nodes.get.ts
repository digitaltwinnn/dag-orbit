import nodeModel from "../models/node.model";

export default defineEventHandler(async (event) => {
  const docs = await nodeModel.find().lean();
  console.log("node docs found in mongodb: " + docs.length)
  return docs;
});
