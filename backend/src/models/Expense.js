import mongoose from "mongoose";

const Schema = mongoose.Schema;

const expenseSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paidBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    members: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          amountOwed: {
            type: Number,
            required: true,
            min: 0,
          },
          weight: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      required: true,
      default: "ACTIVE",
    },
    options: {
      type: String,
      enum: ["EQUALLY", "UNEQUALLY", "PERCENTAGE", "SHARES", "ADJUSTMENT"],
      default: "EQUALLY",
      required: true,
    },
  },
  { timestamps: true,
   },
);


const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
