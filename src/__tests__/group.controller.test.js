import request from "supertest";
import app from "../app.js";
import { groupService } from "../services/group.service.js";
import { token } from "../utils/token.js";

// ============================================================
// Mock the entire groupService — we're testing the CONTROLLER
// not the service. This is "unit testing with mocks" — the
// controller is isolated from DB dependencies entirely.
// This relates to the course concept of test isolation.
// ============================================================
jest.mock("../services/group.service.js", () => ({
  groupService: {
    createGroup: jest.fn(),
    getGroups: jest.fn(),
    getGroup: jest.fn(),
    patchGroup: jest.fn(),
    deleteGroup: jest.fn(),
    getGroupExpenses: jest.fn(),
    getGroupMembers: jest.fn(),
    postMembers: jest.fn(),
    removeMember: jest.fn(),
    acceptGroupInvitation: jest.fn(),
    rejectGroupInvitation: jest.fn(),
  },
}));

// Mock the token util so we can fake being logged in
jest.mock("../utils/token.js", () => ({
  token: {
    verify: jest.fn(),
  },
}));

// Helper: set the fake logged-in user before each request
const mockAuth = () => {
  token.verify.mockReturnValue({
    sub: "user123",
    email: "test@example.com",
  });
};

// Helper: fake a valid auth cookie
const authCookie = "token=faketoken";

describe("Group Controller — POST /groups", () => {
  beforeEach(() => {
    mockAuth();
    jest.clearAllMocks();
  });

  test("201 — creates group with valid body", async () => {
    groupService.createGroup.mockResolvedValue({
      _id: "group123",
      name: "Trip to Vegas",
      type: "GROUP",
    });

    const res = await request(app)
      .post("/groups")
      .set("Cookie", authCookie)
      .send({
        name: "Trip to Vegas",
        type: "GROUP",
        members: ["64f1a2b3c4d5e6f7a8b9c0d1", "64f1a2b3c4d5e6f7a8b9c0d2"],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(groupService.createGroup).toHaveBeenCalledTimes(1);
  });

  test("400 — fails when name is missing", async () => {
    const res = await request(app)
      .post("/groups")
      .set("Cookie", authCookie)
      .send({
        type: "GROUP",
        members: ["64f1a2b3c4d5e6f7a8b9c0d1"],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    // Service should NOT be called if validation fails
    expect(groupService.createGroup).not.toHaveBeenCalled();
  });

  test("400 — fails when FRIEND group has 2 members", async () => {
    const res = await request(app)
      .post("/groups")
      .set("Cookie", authCookie)
      .send({
        name: "My Friend",
        type: "FRIEND",
        members: ["64f1a2b3c4d5e6f7a8b9c0d1", "64f1a2b3c4d5e6f7a8b9c0d2"],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("401 — fails without auth cookie", async () => {
    token.verify.mockImplementation(() => {
      throw new Error("No token");
    });

    const res = await request(app)
      .post("/groups")
      .send({ name: "Test", type: "GROUP", members: [] });

    expect(res.statusCode).toBe(401);
  });

  test("500 — handles service throwing error", async () => {
    groupService.createGroup.mockRejectedValue(new Error("DB Error"));

    const res = await request(app)
      .post("/groups")
      .set("Cookie", authCookie)
      .send({
        name: "Trip",
        type: "GROUP",
        members: ["64f1a2b3c4d5e6f7a8b9c0d1"],
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Failed to create group");
  });
});

describe("Group Controller — GET /groups", () => {
  beforeEach(() => {
    mockAuth();
    jest.clearAllMocks();
  });

  test("200 — returns list of groups", async () => {
    groupService.getGroups.mockResolvedValue([
      { _id: "g1", name: "Group 1" },
      { _id: "g2", name: "Group 2" },
    ]);

    const res = await request(app).get("/groups").set("Cookie", authCookie);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test("401 — fails without auth", async () => {
    token.verify.mockImplementation(() => {
      throw new Error("Unauthorized");
    });

    const res = await request(app).get("/groups");
    expect(res.statusCode).toBe(401);
  });
});

describe("Group Controller — GET /groups/:groupId", () => {
  beforeEach(() => {
    mockAuth();
    jest.clearAllMocks();
  });

  test("200 — returns group when found", async () => {
    groupService.getGroup.mockResolvedValue({
      _id: "group123",
      name: "My Group",
    });

    const res = await request(app)
      .get("/groups/group123")
      .set("Cookie", authCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe("group123");
  });

  test("404 — returns error when group not found", async () => {
    const err = new Error("Group not found");
    err.statusCode = 404;
    groupService.getGroup.mockRejectedValue(err);

    const res = await request(app)
      .get("/groups/nonexistent")
      .set("Cookie", authCookie);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("Group Controller — PATCH /groups/:groupId", () => {
  beforeEach(() => {
    mockAuth();
    jest.clearAllMocks();
  });

  test("200 — patches group with valid name", async () => {
    groupService.patchGroup.mockResolvedValue({ _id: "g1", name: "New Name" });

    const res = await request(app)
      .patch("/groups/g1")
      .set("Cookie", authCookie)
      .send({ name: "New Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("400 — fails when body is empty (zod refine)", async () => {
    const res = await request(app)
      .patch("/groups/g1")
      .set("Cookie", authCookie)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("Group Controller — DELETE /groups/:groupId", () => {
  beforeEach(() => {
    mockAuth();
    jest.clearAllMocks();
  });

  test("200 — deletes group successfully", async () => {
    groupService.deleteGroup.mockResolvedValue("Group Deleted Successfully");

    const res = await request(app)
      .delete("/groups/g1")
      .set("Cookie", authCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Group deleted successfully");
  });

  test("400 — fails when group has more than 1 member", async () => {
    const err = new Error(
      "Cannot delete group as more than 1 members are there",
    );
    err.statusCode = 400;
    groupService.deleteGroup.mockRejectedValue(err);

    const res = await request(app)
      .delete("/groups/g1")
      .set("Cookie", authCookie);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("404 — fails when group not found", async () => {
    const err = new Error("Group not found");
    err.statusCode = 404;
    groupService.deleteGroup.mockRejectedValue(err);

    const res = await request(app)
      .delete("/groups/g1")
      .set("Cookie", authCookie);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("Group Controller — Invitation endpoints", () => {
  beforeEach(() => {
    mockAuth();
    jest.clearAllMocks();
  });

  test("PATCH /:groupId/acceptInvitation — 200 on success", async () => {
    groupService.acceptGroupInvitation.mockResolvedValue({ status: "JOINED" });

    const res = await request(app)
      .patch("/groups/g1/acceptInvitation")
      .set("Cookie", authCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(
      "Group join invitation accepted successfully",
    );
  });

  test("PATCH /:groupId/acceptInvitation — 400 when invitation not found", async () => {
    const err = new Error("Invitation not found or already joined");
    err.statusCode = 400;
    groupService.acceptGroupInvitation.mockRejectedValue(err);

    const res = await request(app)
      .patch("/groups/g1/acceptInvitation")
      .set("Cookie", authCookie);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("DELETE /:groupId/rejectInvitation — 200 on success", async () => {
    groupService.rejectGroupInvitation.mockResolvedValue({ status: "INVITED" });

    const res = await request(app)
      .delete("/groups/g1/rejectInvitation")
      .set("Cookie", authCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
