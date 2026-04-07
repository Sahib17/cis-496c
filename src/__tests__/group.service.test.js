import mongoose from "mongoose";
import { groupService } from "../services/group.service.js";
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import User from "../models/User.js";

// ============================================================
// INTEGRATION TESTS — groupService
// These tests run against a real in-memory MongoDB instance
// (via setup.js / mongodb-memory-server). Unlike the controller
// tests which mock the service, here we test the actual business
// logic: DB reads/writes, transactions, permission checks, and
// custom error codes.
//
// Course concepts demonstrated:
//   - Integration testing (real DB, no mocks)
//   - Statement & branch coverage (happy path + all error branches)
//   - Boundary conditions (member counts, status transitions)
// ============================================================

// ---- TEST FIXTURES ----
// Helpers to seed the DB with known state before each test

const makeUser = (overrides = {}) =>
  User.create({
    name: "Test User",
    email: `user_${Date.now()}_${Math.random()}@test.com`,
    password: "hashed",
    timeZone: "UTC",
    status: "ACTIVE",
    defaultCurrency: "USD",
    language: "EN",
    ...overrides,
  });

const makeGroup = (userId, overrides = {}) =>
  Group.create({
    name: "Test Group",
    createdBy: userId,
    type: "GROUP",
    ...overrides,
  });

const makeGroupMember = (groupId, memberId, overrides = {}) =>
  GroupMember.create({
    groupId,
    memberId,
    status: "JOINED",
    role: "MEMBER",
    ...overrides,
  });


// ============================================================
// createGroup
// ============================================================

describe("groupService.createGroup", () => {

  test("creates group and GroupMember records for creator + members", async () => {
    const creator = await makeUser();
    const member = await makeUser();

    const result = await groupService.createGroup(creator._id.toString(), {
      name: "Vegas Trip",
      type: "GROUP",
      members: [member._id.toString()],
    });

    expect(result.group.name).toBe("Vegas Trip");
    expect(result.group.type).toBe("GROUP");

    // Creator should be ADMIN + JOINED
    const creatorMember = result.groupMember.find(
      (m) => m.memberId.toString() === creator._id.toString()
    );
    expect(creatorMember.status).toBe("JOINED");
    expect(creatorMember.role).toBe("ADMIN");

    // Invited member should be INVITED + MEMBER
    const invitedMember = result.groupMember.find(
      (m) => m.memberId.toString() === member._id.toString()
    );
    expect(invitedMember.status).toBe("INVITED");
    expect(invitedMember.role).toBe("MEMBER");
  });

  test("creates FRIEND group with 1 member", async () => {
    const creator = await makeUser();
    const friend = await makeUser();

    const result = await groupService.createGroup(creator._id.toString(), {
      name: "My Friend",
      type: "FRIEND",
      members: [friend._id.toString()],
    });

    expect(result.group.type).toBe("FRIEND");
    expect(result.groupMember.length).toBe(2); // creator + 1 friend
  });

  test("throws 401 when a member ID does not exist in DB", async () => {
    const creator = await makeUser();
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(
      groupService.createGroup(creator._id.toString(), {
        name: "Bad Group",
        type: "GROUP",
        members: [fakeId],
      })
    ).rejects.toMatchObject({ statusCode: 401, message: "Invalid members in request" });
  });

  test("throws 401 when a member is INACTIVE", async () => {
    const creator = await makeUser();
    const inactive = await makeUser({ status: "INACTIVE" });

    await expect(
      groupService.createGroup(creator._id.toString(), {
        name: "Bad Group",
        type: "GROUP",
        members: [inactive._id.toString()],
      })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("deduplicates creator if also passed in members array", async () => {
    const creator = await makeUser();
    const member = await makeUser();

    const result = await groupService.createGroup(creator._id.toString(), {
      name: "No Dupe",
      type: "GROUP",
      members: [creator._id.toString(), member._id.toString()],
    });

    // Creator appears only once in GroupMember
    const creatorEntries = result.groupMember.filter(
      (m) => m.memberId.toString() === creator._id.toString()
    );
    expect(creatorEntries.length).toBe(1);
  });
});


// ============================================================
// getGroups
// ============================================================

describe("groupService.getGroups", () => {

  test("returns all groups the user is a member of", async () => {
    const user = await makeUser();
    const group1 = await makeGroup(user._id);
    const group2 = await makeGroup(user._id);
    await makeGroupMember(group1._id, user._id);
    await makeGroupMember(group2._id, user._id);

    const result = await groupService.getGroups(user._id.toString());
    expect(result.length).toBe(2);
  });

  test("returns empty array when user has no groups", async () => {
    const user = await makeUser();
    const result = await groupService.getGroups(user._id.toString());
    expect(result).toEqual([]);
  });

  test("does not return groups the user is not a member of", async () => {
    const user = await makeUser();
    const otherUser = await makeUser();
    const group = await makeGroup(otherUser._id);
    await makeGroupMember(group._id, otherUser._id);

    const result = await groupService.getGroups(user._id.toString());
    expect(result.length).toBe(0);
  });
});


// ============================================================
// deleteGroup
// ============================================================

describe("groupService.deleteGroup", () => {

  test("deletes group when user is the only JOINED member", async () => {
    const user = await makeUser();
    const group = await makeGroup(user._id);
    await makeGroupMember(group._id, user._id, { status: "JOINED", role: "ADMIN" });

    const result = await groupService.deleteGroup(
      user._id.toString(),
      group._id.toString()
    );

    expect(result).toBe("Group Deleted Successfully");

    const deletedGroup = await Group.findById(group._id);
    expect(deletedGroup).toBeNull();

    const deletedMembers = await GroupMember.find({ groupId: group._id });
    expect(deletedMembers.length).toBe(0);
  });

  test("throws 404 when group does not exist", async () => {
    const user = await makeUser();
    const fakeGroupId = new mongoose.Types.ObjectId().toString();

    await expect(
      groupService.deleteGroup(user._id.toString(), fakeGroupId)
    ).rejects.toMatchObject({ statusCode: 404, message: "Group not found" });
  });

  test("throws 401 when user is not a JOINED member", async () => {
    const user = await makeUser();
    const outsider = await makeUser();
    const group = await makeGroup(user._id);
    await makeGroupMember(group._id, user._id, { status: "JOINED", role: "ADMIN" });

    await expect(
      groupService.deleteGroup(outsider._id.toString(), group._id.toString())
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("throws 400 when more than 1 JOINED member exists", async () => {
    const user = await makeUser();
    const member = await makeUser();
    const group = await makeGroup(user._id);
    await makeGroupMember(group._id, user._id, { status: "JOINED", role: "ADMIN" });
    await makeGroupMember(group._id, member._id, { status: "JOINED", role: "MEMBER" });

    await expect(
      groupService.deleteGroup(user._id.toString(), group._id.toString())
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Cannot delete group as more than 1 members are there",
    });
  });

  test("INVITED members do not block deletion", async () => {
    const user = await makeUser();
    const invited = await makeUser();
    const group = await makeGroup(user._id);
    await makeGroupMember(group._id, user._id, { status: "JOINED", role: "ADMIN" });
    await makeGroupMember(group._id, invited._id, { status: "INVITED", role: "MEMBER" });

    const result = await groupService.deleteGroup(
      user._id.toString(),
      group._id.toString()
    );
    expect(result).toBe("Group Deleted Successfully");
  });
});


// ============================================================
// acceptGroupInvitation
// ============================================================

describe("groupService.acceptGroupInvitation", () => {

  test("changes status from INVITED to JOINED", async () => {
    const user = await makeUser();
    const group = await makeGroup(user._id);
    await makeGroupMember(group._id, user._id, { status: "INVITED" });

    const result = await groupService.acceptGroupInvitation(
      user._id.toString(),
      group._id.toString()
    );

    expect(result.status).toBe("JOINED");
  });

  test("throws 400 when no INVITED record exists", async () => {
    const user = await makeUser();
    const group = await makeGroup(user._id);
    // No GroupMember record at all

    await expect(
      groupService.acceptGroupInvitation(
        user._id.toString(),
        group._id.toString()
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Invitation not found or already joined",
    });
  });

  test("throws 400 when user already JOINED (not INVITED)", async () => {
    const user = await makeUser();
    const group = await makeGroup(user._id);
    await makeGroupMember(group._id, user._id, { status: "JOINED" });

    await expect(
      groupService.acceptGroupInvitation(
        user._id.toString(),
        group._id.toString()
      )
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});


// ============================================================
// rejectGroupInvitation
// ============================================================

describe("groupService.rejectGroupInvitation", () => {

  test("deletes the INVITED GroupMember record", async () => {
    const user = await makeUser();
    const group = await makeGroup(user._id);
    await makeGroupMember(group._id, user._id, { status: "INVITED" });

    await groupService.rejectGroupInvitation(
      user._id.toString(),
      group._id.toString()
    );

    const record = await GroupMember.findOne({
      memberId: user._id,
      groupId: group._id,
    });
    expect(record).toBeNull();
  });

  test("throws 400 when no INVITED record exists", async () => {
    const user = await makeUser();
    const group = await makeGroup(user._id);

    await expect(
      groupService.rejectGroupInvitation(
        user._id.toString(),
        group._id.toString()
      )
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});


// ============================================================
// getGroupMembers
// ============================================================

describe("groupService.getGroupMembers", () => {

  test("returns JOINED and INVITED members to a JOINED member", async () => {
    const admin = await makeUser();
    const invited = await makeUser();
    const group = await makeGroup(admin._id);
    await makeGroupMember(group._id, admin._id, { status: "JOINED", role: "ADMIN" });
    await makeGroupMember(group._id, invited._id, { status: "INVITED" });

    const result = await groupService.getGroupMembers(
      admin._id.toString(),
      group._id.toString()
    );

    expect(result.length).toBe(2);
  });

  test("throws 401 when requester is not a JOINED member", async () => {
    const owner = await makeUser();
    const outsider = await makeUser();
    const group = await makeGroup(owner._id);
    await makeGroupMember(group._id, owner._id, { status: "JOINED" });

    await expect(
      groupService.getGroupMembers(outsider._id.toString(), group._id.toString())
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});