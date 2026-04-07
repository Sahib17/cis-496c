import { groupValidator } from "../validators/group.validator.js";

// ============================================================
// UNIT TESTS — groupValidator.createGroup
// Tests the pure validation function with no DB or network
// This maps to "unit testing" and "domain/boundary testing"
// from the course — we test valid inputs, invalid inputs,
// and boundary conditions (e.g. exactly 1 FRIEND member)
// ============================================================

describe("groupValidator.createGroup — Unit Tests", () => {
  // ---- VALID INPUTS ----

  test("returns null for valid FRIEND group with 1 member", () => {
    const body = {
      name: "My Friend",
      type: "FRIEND",
      members: ["64f1a2b3c4d5e6f7a8b9c0d1"],
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBeNull();
  });

  test("returns null for valid GROUP type with multiple members", () => {
    const body = {
      name: "Trip to Vegas",
      type: "GROUP",
      members: ["64f1a2b3c4d5e6f7a8b9c0d1", "64f1a2b3c4d5e6f7a8b9c0d2"],
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBeNull();
  });

  // ---- MISSING REQUIRED FIELDS ----

  test("returns error when name is missing", () => {
    const body = {
      type: "GROUP",
      members: ["64f1a2b3c4d5e6f7a8b9c0d1"],
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBe("Name and type are required");
  });

  test("returns error when type is missing", () => {
    const body = {
      name: "My Group",
      members: ["64f1a2b3c4d5e6f7a8b9c0d1"],
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBe("Name and type are required");
  });

  test("returns error when both name and type are missing", () => {
    const body = {
      members: ["64f1a2b3c4d5e6f7a8b9c0d1"],
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBe("Name and type are required");
  });

  // ---- MEMBERS VALIDATION ----

  test("returns error when members is not an array", () => {
    const body = {
      name: "My Group",
      type: "GROUP",
      members: "notAnArray",
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBe("Members must be an array");
  });

  test("returns error when members is a number", () => {
    const body = {
      name: "My Group",
      type: "GROUP",
      members: 123,
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBe("Members must be an array");
  });

  // ---- FRIEND TYPE BOUNDARY TESTS ----
  // This is "boundary value analysis" from the course —
  // FRIEND groups must have EXACTLY 1 member

  test("returns error when FRIEND group has 0 members", () => {
    const body = {
      name: "My Friend",
      type: "FRIEND",
      members: [],
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBe("FRIEND must have exactly one member");
  });

  test("returns error when FRIEND group has 2 members", () => {
    const body = {
      name: "My Friend",
      type: "FRIEND",
      members: ["64f1a2b3c4d5e6f7a8b9c0d1", "64f1a2b3c4d5e6f7a8b9c0d2"],
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBe("FRIEND must have exactly one member");
  });

  // ---- DUPLICATE MEMBERS ----

  test("returns error when duplicate members are provided", () => {
    const body = {
      name: "My Group",
      type: "GROUP",
      members: ["64f1a2b3c4d5e6f7a8b9c0d1", "64f1a2b3c4d5e6f7a8b9c0d1"],
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBe("Duplicate members not allowed");
  });

  // ---- EMPTY STRING EDGE CASES ----

  test("returns error when name is empty string", () => {
    const body = {
      name: "",
      type: "GROUP",
      members: ["64f1a2b3c4d5e6f7a8b9c0d1"],
    };
    const result = groupValidator.createGroup(body);
    expect(result).toBe("Name and type are required");
  });
});

// ============================================================
// UNIT TESTS — groupValidator.patchGroup (Zod schema)
// ============================================================

describe("groupValidator.patchGroup — Zod Schema Tests", () => {
  test("passes with valid name", () => {
    const result = groupValidator.patchGroup.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe("New Name");
  });

  test("passes with valid image", () => {
    const result = groupValidator.patchGroup.safeParse({
      image: "https://example.com/img.jpg",
    });
    expect(result.success).toBe(true);
  });

  test("passes with both name and image", () => {
    const result = groupValidator.patchGroup.safeParse({
      name: "New Name",
      image: "https://example.com/img.jpg",
    });
    expect(result.success).toBe(true);
  });

  test("fails when both fields are empty strings (nothing to update)", () => {
    const result = groupValidator.patchGroup.safeParse({ name: "", image: "" });
    expect(result.success).toBe(false);
  });

  test("fails when body is completely empty", () => {
    const result = groupValidator.patchGroup.safeParse({});
    expect(result.success).toBe(false);
  });

  test("trims whitespace from name", () => {
    const result = groupValidator.patchGroup.safeParse({
      name: "  My Group  ",
    });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe("My Group");
  });
});
