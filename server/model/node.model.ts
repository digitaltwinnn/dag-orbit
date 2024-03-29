import { model, Schema } from "mongoose";

const schema: Schema = new Schema(
  {
    ip: {
      type: Number,
      required: true,
      unique: true
    },
    state: {
      type: String,
      required: true,
    },
    host: {
      name: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      region: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      org: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    vector: {
      graph: {
        x: {
          type: Number,
          required: true,
        },
        y: {
          type: Number,
          required: true,
        },
        z: {
          type: Number,
          required: true,
        },
      },
      globe: {
        x: {
          type: Number,
          required: true,
        },
        y: {
          type: Number,
          required: true,
        },
        z: {
          type: Number,
          required: true,
        },
      }
    },
  },
  { timestamps: true }
);

export default model("node", schema);
