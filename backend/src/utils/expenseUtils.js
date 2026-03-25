// ******HELPER FUNCTIONS******

/**
 * Attaches balance (amountPaid - amountOwed) to each member.
 * All values are in CENTS (integers) to avoid floating-point errors.
 */
export const attachBalances = (withPaid) => {
  return withPaid.map((member) => ({
    ...member,
    balance: member.amountPaid - member.amountOwed,
  }));
};

/**
 * Looks up how much each member paid and attaches amountPaid.
 */
export const attachPayments = (withOwed, paidBy) => {
  return withOwed.map((member) => {
    const paidEntry = paidBy.find(
      (p) => p.user.toString() === member.user.toString(),
    );
    const amountPaid = paidEntry ? paidEntry.amount : 0;
    return { ...member, amountPaid };
  });
};

/**
 * Distributes remainder CENTS one at a time across members.
 * remainder must be a non-negative integer.
 */
export const distributeRemainder = (remainder, membersWithBase) => {
  let remaining = Math.round(remainder);
  return membersWithBase.map((member) => {
    const extra = remaining > 0 ? 1 : 0;
    if (remaining > 0) remaining--;
    return { ...member, amountOwed: member.amountOwed + extra };
  });
};

/**
 * Greedy debt simplification. Amounts in CENTS in, dollars out.
 */
export const settlement = (creditors, debtors) => {
  const creds = creditors.map((c) => ({ ...c }));
  const debts = debtors.map((d) => ({ ...d }));
  const settlements = [];

  for (const debtor of debts) {
    let debt = -debtor.balance;
    for (const creditor of creds) {
      if (creditor.balance <= 0) continue;
      const amount = Math.min(debt, creditor.balance);
      if (amount <= 0) continue;
      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: +(amount / 100).toFixed(2),
      });
      creditor.balance -= amount;
      debt -= amount;
      if (debt === 0) break;
    }
  }
  return settlements;
};

/**
 * Main entry point. Converts dollars -> cents, splits, converts back.
 */
export const calculateSplit = (paidBy, members, options) => {
  const paidByCents = paidBy.map((p) => ({
    ...p,
    amount: Math.round(p.amount * 100),
  }));
  const membersCents = members.map((m) => ({
    ...m,
    amountOwed: Math.round((m.amountOwed ?? 0) * 100),
    weight: m.weight ?? 0,
  }));

  let result;
  switch (options) {
    case "EQUALLY":     result = equalSplit(paidByCents, membersCents); break;
    case "UNEQUALLY":   result = unequalSplit(paidByCents, membersCents); break;
    case "PERCENTAGE":  result = percentageSplit(paidByCents, membersCents); break;
    case "SHARES":      result = sharesSplit(paidByCents, membersCents); break;
    case "ADJUSTMENT":  result = adjustmentSplit(paidByCents, membersCents); break;
    default: throw new Error("Invalid split option");
  }

  // Convert cents back to dollars on withBalance for DB storage
  result.withBalance = result.withBalance.map((m) => ({
    ...m,
    amountOwed:  +(m.amountOwed  / 100).toFixed(2),
    amountPaid:  +(m.amountPaid  / 100).toFixed(2),
    balance:     +(m.balance     / 100).toFixed(2),
  }));

  return result;
};

// ─── SPLIT STRATEGIES (all work in CENTS) ─────────────────────────────────────

const equalSplit = (paidBy, members) => {
  const count = members.length;
  const totalCents = paidBy.reduce((s, e) => s + e.amount, 0);
  const baseCents = Math.floor(totalCents / count);
  const remainder = totalCents - baseCents * count;

  const membersWithBase = members.map((m) => ({ ...m, amountOwed: baseCents }));
  const withOwed    = distributeRemainder(remainder, membersWithBase);
  const withPaid    = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors   = withBalance.filter((m) => m.balance > 0);
  const debtors     = withBalance.filter((m) => m.balance < 0);
  return { settlements: settlement(creditors, debtors), creditors, debtors, withBalance };
};

const unequalSplit = (paidBy, members) => {
  const totalPaid = paidBy.reduce((s, e) => s + e.amount, 0);
  const totalOwed = members.reduce((s, m) => s + m.amountOwed, 0);
  if (totalPaid !== totalOwed) {
    const err = new Error(`Paid (${totalPaid}) and owed (${totalOwed}) totals must match`);
    err.statusCode = 400;
    throw err;
  }
  const withPaid    = attachPayments(members, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors   = withBalance.filter((m) => m.balance > 0);
  const debtors     = withBalance.filter((m) => m.balance < 0);
  return { settlements: settlement(creditors, debtors), withBalance };
};

const percentageSplit = (paidBy, members) => {
  const totalPct = members.reduce((s, m) => s + m.weight, 0);
  if (Math.round(totalPct) !== 100) {
    const err = new Error("Sum of percentages must equal 100");
    err.statusCode = 400;
    throw err;
  }
  const totalCents = paidBy.reduce((s, e) => s + e.amount, 0);
  const withAmounts = members.map((m) => ({
    ...m,
    amountOwed: Math.floor((totalCents * m.weight) / 100),
  }));
  const remainder   = totalCents - withAmounts.reduce((s, m) => s + m.amountOwed, 0);
  const withOwed    = distributeRemainder(remainder, withAmounts);
  const withPaid    = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors   = withBalance.filter((m) => m.balance > 0);
  const debtors     = withBalance.filter((m) => m.balance < 0);
  return { settlements: settlement(creditors, debtors), creditors, debtors, withBalance };
};

const sharesSplit = (paidBy, members) => {
  const totalCents  = paidBy.reduce((s, e) => s + e.amount, 0);
  const totalShares = members.reduce((s, m) => s + m.weight, 0);
  if (totalShares <= 0) {
    const err = new Error("At least 1 share needed");
    err.statusCode = 400;
    throw err;
  }
  const withAmounts = members.map((m) => ({
    ...m,
    amountOwed: Math.floor((totalCents * m.weight) / totalShares),
  }));
  const remainder   = totalCents - withAmounts.reduce((s, m) => s + m.amountOwed, 0);
  const withOwed    = distributeRemainder(remainder, withAmounts);
  const withPaid    = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors   = withBalance.filter((m) => m.balance > 0);
  const debtors     = withBalance.filter((m) => m.balance < 0);
  return { settlements: settlement(creditors, debtors), creditors, debtors, withBalance };
};

const adjustmentSplit = (paidBy, members) => {
  const totalCents       = paidBy.reduce((s, e) => s + e.amount, 0);
  const count            = members.length;
  const totalWeightCents = members.reduce((s, m) => s + m.weight, 0);

  if (totalWeightCents >= totalCents) {
    const err = new Error("Total adjustments cannot exceed the expense total");
    err.statusCode = 400;
    throw err;
  }
  const baseCents = Math.floor((totalCents - totalWeightCents) / count);
  const withAmounts = members.map((m) => ({ ...m, amountOwed: baseCents + m.weight }));
  const remainder   = totalCents - withAmounts.reduce((s, m) => s + m.amountOwed, 0);
  const withOwed    = distributeRemainder(remainder, withAmounts);
  const withPaid    = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors   = withBalance.filter((m) => m.balance > 0);
  const debtors     = withBalance.filter((m) => m.balance < 0);
  return { settlements: settlement(creditors, debtors), creditors, debtors, withBalance };
};