import request from 'supertest';
import app from '../app.js';
import { groupService } from '../services/group.service.js';
import { token } from '../utils/token.js';

// ============================================================
// Mock the entire groupService — we're testing the CONTROLLER
// not the service. This is "unit testing with mocks" — the
// controller is isolated from DB dependencies entirely.
// This relates to the course concept of test isolation.
// ============================================================
jest.mock('../services/group.service.js', () => ({
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
  }
}));

// Mock the token util so we can fake being logged in
jest.mock('../utils/token.js', () => ({
  token: {
    verify: jest.fn(),
  }
}));

// Helper: set the fake logged-in user before each request
const mockAuth = () => {
  token.verify.mockReturnValue({
    sub: 'user123',
    email: 'test@example.com',
  });
};

// Helper: fake a valid auth cookie
const authCookie = 'token=faketoken';





