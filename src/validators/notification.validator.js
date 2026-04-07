import { z } from "zod";
import { objectId } from "./common.validator.js";

const receivers = z.object({
  user: objectId,
  status: z.enum(["READ", "UNREAD"]).default("UNREAD"),
});

const notification = z.object({
  sender: objectId,
  receivers: z.array(receivers).min(1),
  type: z.enum([
    "ADD_EXPENSE",
    "REMOVE_EXPENSE",
    "UPDATE_EXPENSE",
    "SETTLE_EXPENSE",
    "ADD_GROUP",
    "REMOVE_GROUP",
  ]),
  entityId: objectId,
  entityType: z.enum(["EXPENSE", "GROUP", "SETTLEMENT"])
});

export const notificationValidator = {
    notification
}