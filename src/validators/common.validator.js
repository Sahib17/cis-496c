import mongoose from "mongoose";
import z from "zod";

export const objectId = z
  .string()
  .refine(mongoose.Types.ObjectId.isValid, {
    message: "Invalid ObjectId",
  })
  .transform((val) => new mongoose.Types.ObjectId(val));

export const idValidate = z.object({
  id: objectId,
});
