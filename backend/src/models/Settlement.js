import mongoose from "mongoose";

const Schema = mongoose.Schema;

const settlementSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "COMPLETED",
    }
  },
  { timestamps: true },
);

const Settlement = mongoose.model("Settlement", settlementSchema);

export default Settlement;