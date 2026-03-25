import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // Store in cents
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const Settlement = mongoose.model("Settlement", settlementSchema);