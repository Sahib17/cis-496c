import mongoose from "mongoose";
import { z } from "zod";
import { objectId } from "./common.validator.js";

export const memberSchema = z.object({
    user: objectId,
    amountOwed: z.number().min(0).default(0).refine((val) => Number.isInteger(val * 100), {
        message: "Amount can have maximum 2 decimal places"
    }).transform((val) => Math.round(val * 100)),
    weight: z.number().min(0).default(0),
})

export const paidBy = z.object({
    user: objectId,
    amount: z.number().min(0.01).refine((val) => Number.isInteger(val * 100), {
        message: "Amount can have maximum 2 decimal places"
    }).transform((val) => Math.round(val * 100))
})

const postExpense = z.object({
    name: z.string().trim().min(1),
    groupId: objectId,   // ← was missing!
    paidBy: z.array(paidBy),
    members: z.array(memberSchema).min(1),
    status: z.enum(["ACTIVE","INACTIVE"]).default("ACTIVE"),
    options: z.enum(["EQUALLY","UNEQUALLY","PERCENTAGE","SHARES","ADJUSTMENT"]).default("EQUALLY"),
})

export const expenseValidator = {
    postExpense,
}