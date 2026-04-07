import mongoose from "mongoose";

const Schema = mongoose.Schema;

const notoficationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recievers: [
      {
        _id: false,
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["READ", "UNREAD"],
        },
      },
    ],
    type: {
      type: String,
      enum: [
        "ADD_EXPENSE",
        "REMOVE_EXPENSE",
        "UPDATE_EXPENSE",
        "SETTLE_EXPENSE",
        "ADD_GROUP",
        "REMOVE_GROUP",
      ],
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    entityType: {
        type: String,
        enum: ["EXPENSE", "GROUP", "SETTLEMENT"]
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notoficationSchema);

export default Notification;
