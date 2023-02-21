import { model, Schema } from "mongoose";

const schema: Schema = new Schema(
  {
    ip: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("node", schema);
