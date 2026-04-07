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
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
