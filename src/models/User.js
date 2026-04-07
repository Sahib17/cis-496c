import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    timeZone: {
      type: String,
      trim: true,
      required: true,
      default: "UTC",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DELETED", "INACTIVE", "BANNED"],
      default: "ACTIVE",
      required: true,
    },
    defaultCurrency: {
      type: String,
      enum: ["USD", "CAD", "EUR", "GBP", "JPY", "INR", "NA"],
      default: "USD",
      trim: true,
      required: true,
    },
    language: {
      type: String,
      enum: ["EN", "HI", "PA", "FR", "ES", "NA"],
      required: true,
      default: "EN",
    },
    blocklist: [                                    // ← add this
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;