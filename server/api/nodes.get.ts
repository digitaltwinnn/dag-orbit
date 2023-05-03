import nodeModel from "../model/node.model";

export const config = {
  runtime: "edge",
};

export default defineEventHandler(async (event) => {
  event.node.res.setHeader("Cache-Control", "s-maxage=300");

  const docs = await nodeModel.find().lean();
  console.log("node docs found in mongodb: " + docs.length);
  return docs;
});
