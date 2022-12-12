import nodeModel from "../models/node.model";

export default defineEventHandler(async (event) => {
  const docs = await nodeModel.find().lean();
  console.log("docs found in mongodb: " + docs.length)
  return { nodes: docs };
});
