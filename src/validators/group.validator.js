import { z } from "zod";

const createGroup = (body) => {
  const { name, type, members } = body;

  if (!name || !type) return "Name and type are required";

  if (!Array.isArray(members)) return "Members must be an array";

  if (type === "FRIEND" && members.length !== 1) {
  return "FRIEND must have exactly one member";
};

  const uniqueMembers = new Set(members);

  if (uniqueMembers.size !== members.length)
    return "Duplicate members not allowed";

  return null;
};

const patchGroup = z
  .object({
    name: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    image: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: "At least one field must be provided",
  });

export const groupValidator = {
  createGroup,
  patchGroup,
};
