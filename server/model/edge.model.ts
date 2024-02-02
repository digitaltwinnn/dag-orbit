import { model, Schema } from "mongoose";

const schema: Schema = new Schema(
    {
        ip1: {
            type: Number,
            required: true,
        },
        ip2: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default model("edge", schema);