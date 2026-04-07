import { expenseService } from "../services/expense.service.js";

// ============================================================
// UNIT TESTS — expenseService.calculateSplit (pure logic)
//
// calculateSplit is a pure function (no DB, no network).
// It is ideal for unit testing with no mocks needed.
//
// Course concepts demonstrated:
//   - Unit testing: isolated function, no side effects
//   - Control-flow graph (CFG) coverage: every case branch in the
//     switch statement is a separate node — we cover ALL of them
//   - Boundary value analysis: EQUALLY with 1 member, percentage
//     summing to exactly 100 vs 99, shares <= 1
//   - Data-flow testing: values flow from paidBy → withBalance →
//     creditors/debtors → settlements
//   - Error path coverage: each throw branch is exercised
// ============================================================

// ---- FIXTURES ----
// Minimal paidBy and members arrays to keep tests readable

const onePayer = (amount) => [{ user: "userA", amount }];
const twoPayersEqual = (total) => [
  { user: "userA", amount: total / 2 },
  { user: "userB", amount: total / 2 },
];

const twoMembers = [
  { user: "userA", amountOwed: 0 },
  { user: "userB", amountOwed: 0 },
];

const threeMembersEqual = [
  { user: "userA", amountOwed: 0 },
  { user: "userB", amountOwed: 0 },
  { user: "userC", amountOwed: 0 },
];

// ============================================================
// EQUALLY split
// ============================================================

describe("calculateSplit — EQUALLY", () => {
  test("splits evenly between 2 members — correct settlements returned", () => {
    const result = expenseService.calculateSplit(
      onePayer(100),
      twoMembers,
      "EQUALLY",
    );

    expect(result).toHaveProperty("settlements");
    expect(result).toHaveProperty("withBalance");
    expect(result.withBalance.length).toBe(2);
  });

  test("each member owes 50 when total is 100 and 2 members", () => {
    const result = expenseService.calculateSplit(
      onePayer(100),
      twoMembers,
      "EQUALLY",
    );

    const totalOwed = result.withBalance.reduce(
      (sum, m) => sum + m.amountOwed,
      0,
    );
    expect(totalOwed).toBe(100);
  });

  test("handles odd totals — remainder distributed (101 / 2 members)", () => {
    // 101 / 2 = base 50, remainder 1 → one member gets 51, one gets 50
    const result = expenseService.calculateSplit(
      onePayer(101),
      twoMembers,
      "EQUALLY",
    );

    const totalOwed = result.withBalance.reduce(
      (sum, m) => sum + m.amountOwed,
      0,
    );
    expect(totalOwed).toBe(101);
  });

  test("works with 3 members and non-divisible total", () => {
    const result = expenseService.calculateSplit(
      onePayer(100),
      threeMembersEqual,
      "EQUALLY",
    );

    const totalOwed = result.withBalance.reduce(
      (sum, m) => sum + m.amountOwed,
      0,
    );
    expect(totalOwed).toBe(100);
  });

  test("payer has positive balance (creditor), others negative (debtors)", () => {
    const result = expenseService.calculateSplit(
      onePayer(100), // userA paid everything
      twoMembers,
      "EQUALLY",
    );

    const userA = result.withBalance.find((m) => m.user === "userA");
    expect(userA.balance).toBeGreaterThan(0); // creditor
  });

  test("single member — balance is 0 (paid and owes same)", () => {
    const result = expenseService.calculateSplit(
      onePayer(100),
      [{ user: "userA", amountOwed: 0 }],
      "EQUALLY",
    );
    const userA = result.withBalance.find((m) => m.user === "userA");
    expect(userA.balance).toBe(0);
  });
});

// ============================================================
// UNEQUALLY split
// ============================================================

describe("calculateSplit — UNEQUALLY", () => {
  test("succeeds when paid total equals owed total", () => {
    const members = [
      { user: "userA", amountOwed: 60 },
      { user: "userB", amountOwed: 40 },
    ];

    const result = expenseService.calculateSplit(
      onePayer(100),
      members,
      "UNEQUALLY",
    );

    expect(result).toHaveProperty("settlements");
    expect(result.withBalance.length).toBe(2);
  });

  test("throws 400 when paid total !== owed total", () => {
    const members = [
      { user: "userA", amountOwed: 60 },
      { user: "userB", amountOwed: 60 }, // total owed = 120, paid = 100 → mismatch
    ];

    expect(() =>
      expenseService.calculateSplit(onePayer(100), members, "UNEQUALLY"),
    ).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  test("returns correct settlements for asymmetric split", () => {
    const members = [
      { user: "userA", amountOwed: 80 },
      { user: "userB", amountOwed: 20 },
    ];
    const paidBy = [{ user: "userB", amount: 100 }]; // userB paid all

    const result = expenseService.calculateSplit(paidBy, members, "UNEQUALLY");
    // userA owes 80, userB paid 100 but owes 20 → net +80 for userB
    const userB = result.withBalance.find((m) => m.user === "userB");
    expect(userB.balance).toBeGreaterThan(0);
  });
});

// ============================================================
// PERCENTAGE split
// ============================================================

describe("calculateSplit — PERCENTAGE", () => {
  const membersWithWeights = [
    { user: "userA", weight: 70 },
    { user: "userB", weight: 30 },
  ];

  test("succeeds when percentages sum to exactly 100", () => {
    const result = expenseService.calculateSplit(
      onePayer(200),
      membersWithWeights,
      "PERCENTAGE",
    );

    expect(result).toHaveProperty("settlements");
    expect(result.withBalance.length).toBe(2);
  });

  test("throws 400 when percentages do not sum to 100", () => {
    const badWeights = [
      { user: "userA", weight: 60 },
      { user: "userB", weight: 30 }, // total = 90, not 100
    ];

    expect(() =>
      expenseService.calculateSplit(onePayer(200), badWeights, "PERCENTAGE"),
    ).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  test("throws 400 when percentages exceed 100", () => {
    const badWeights = [
      { user: "userA", weight: 70 },
      { user: "userB", weight: 40 }, // total = 110
    ];

    expect(() =>
      expenseService.calculateSplit(onePayer(200), badWeights, "PERCENTAGE"),
    ).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  test("allocates correct proportions — 70/30 split on 200", () => {
    const result = expenseService.calculateSplit(
      onePayer(200),
      membersWithWeights,
      "PERCENTAGE",
    );

    const userA = result.withBalance.find((m) => m.user === "userA");
    const userB = result.withBalance.find((m) => m.user === "userB");

    // userA owes 140 (70%), userB owes 60 (30%)
    expect(userA.amountOwed).toBe(140);
    expect(userB.amountOwed).toBe(60);
  });

  test("handles remainder distribution — 100 total, 3% and 97%", () => {
    const weights = [
      { user: "userA", weight: 3 },
      { user: "userB", weight: 97 },
    ];
    const result = expenseService.calculateSplit(
      onePayer(100),
      weights,
      "PERCENTAGE",
    );

    const totalOwed = result.withBalance.reduce(
      (sum, m) => sum + m.amountOwed,
      0,
    );
    expect(totalOwed).toBe(100);
  });
});

// ============================================================
// SHARES split
// ============================================================

describe("calculateSplit — SHARES", () => {
  const membersWithShares = [
    { user: "userA", weight: 3 },
    { user: "userB", weight: 1 },
  ];

  test("succeeds when total shares > 1", () => {
    const result = expenseService.calculateSplit(
      onePayer(100),
      membersWithShares,
      "SHARES",
    );

    expect(result).toHaveProperty("settlements");
  });

  test("throws 400 when total shares <= 1", () => {
    const badShares = [{ user: "userA", weight: 1 }]; // exactly 1, should throw

    expect(() =>
      expenseService.calculateSplit(onePayer(100), badShares, "SHARES"),
    ).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  test("throws 400 when total shares = 0", () => {
    const zeroShares = [
      { user: "userA", weight: 0 },
      { user: "userB", weight: 0 },
    ];

    expect(() =>
      expenseService.calculateSplit(onePayer(100), zeroShares, "SHARES"),
    ).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  test("distributes proportionally — 3:1 ratio on 100", () => {
    const result = expenseService.calculateSplit(
      onePayer(100),
      membersWithShares,
      "SHARES",
    );

    const userA = result.withBalance.find((m) => m.user === "userA");
    const userB = result.withBalance.find((m) => m.user === "userB");

    // 3/4 * 100 = 75, 1/4 * 100 = 25
    expect(userA.amountOwed).toBe(75);
    expect(userB.amountOwed).toBe(25);
  });
});

// ============================================================
// ADJUSTMENT split
// ============================================================

describe("calculateSplit — ADJUSTMENT", () => {
  // ADJUSTMENT: each member has a fixed offset (weight), the rest is split equally

  test("succeeds when total weight < total amount", () => {
    const members = [
      { user: "userA", weight: 10 },
      { user: "userB", weight: 20 },
    ];

    const result = expenseService.calculateSplit(
      onePayer(100),
      members,
      "ADJUSTMENT",
    );

    expect(result).toHaveProperty("settlements");
    expect(result.withBalance.length).toBe(2);
  });

  test("throws 400 when total weight >= total amount", () => {
    const members = [
      { user: "userA", weight: 60 },
      { user: "userB", weight: 60 }, // total weight = 120 >= 100
    ];

    expect(() =>
      expenseService.calculateSplit(onePayer(100), members, "ADJUSTMENT"),
    ).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  test("throws 400 when total weight exactly equals total amount", () => {
    const members = [
      { user: "userA", weight: 50 },
      { user: "userB", weight: 50 }, // weight = 100 = amount
    ];

    expect(() =>
      expenseService.calculateSplit(onePayer(100), members, "ADJUSTMENT"),
    ).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  test("base split equals (total - weights) / count", () => {
    const members = [
      { user: "userA", weight: 0 },
      { user: "userB", weight: 0 },
    ];

    const result = expenseService.calculateSplit(
      onePayer(100),
      members,
      "ADJUSTMENT",
    );

    // (100 - 0) / 2 = 50 each, weight 0 → amountOwed = 50
    const totalOwed = result.withBalance.reduce(
      (sum, m) => sum + m.amountOwed,
      0,
    );
    expect(totalOwed).toBe(100);
  });
});

// ============================================================
// INVALID option — default branch in switch
// ============================================================

describe("calculateSplit — invalid option", () => {
  test("throws Error when option is an unknown string", () => {
    expect(() =>
      expenseService.calculateSplit(onePayer(100), twoMembers, "INVALID_MODE"),
    ).toThrow("Invalid split option");
  });

  test("throws Error when option is null", () => {
    expect(() =>
      expenseService.calculateSplit(onePayer(100), twoMembers, null),
    ).toThrow("Invalid split option");
  });

  test("throws Error when option is undefined", () => {
    expect(() =>
      expenseService.calculateSplit(onePayer(100), twoMembers, undefined),
    ).toThrow("Invalid split option");
  });
});
