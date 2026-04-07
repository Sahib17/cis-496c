import { z } from "zod";

const patchUser = z
  .object({
    name: z
      .string()
      .trim()
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    phone: z
      .string()
      .trim()
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: "At least one field must be provided",
  });

export const userValidator = {
  patchUser,
};
