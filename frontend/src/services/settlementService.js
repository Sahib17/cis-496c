export const attachBalances = (withPaid) => {
    return withPaid.map((member) => ({
    ...member,
    balance: member.amountPaid - member.amountOwed,
  }));
}

export const attachPayments = (withOwed, paidBy) => {
    return withOwed.map((member) => {
    const paidEntry = paidBy.find(
      (p) => p.user.toString() === member.user.toString(),
    );

    const amountPaid = paidEntry ? paidEntry.amount : 0;

    return {
      ...member,
      amountPaid,
    };
  });
}

export const distributeRemainder = (remainder, membersWithBase) => {
  let remaining = remainder;

  return membersWithBase.map((member) => {
    const extra = remaining > 0 ? 1 : 0;
    if (remaining > 0) remaining--;

    return {
      ...member,
      amountOwed: member.amountOwed + extra,
    };
  });
};

export const settlement = (creditors, debtors) => {
  const settlements = [];
  for (const debtor of debtors) {
    let debt = -debtor.balance;

    for (const creditor of creditors) {
      if (creditor.balance === 0) continue;

      const amount = Math.min(debt, creditor.balance);

      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount,
      });

      ((creditor.balance -= amount), (debt -= amount));
      if (debt === 0) break;
    }
  }
  return settlements;
};

export const calculateSplit = (paidBy, members, options) => {
  switch (options) {
    case "EQUALLY":
      return equalSplit(paidBy, members);

    case "UNEQUALLY":
      return unequalSplit(paidBy, members);

    case "PERCENTAGE":
      return percentageSplit(paidBy, members);

    case "SHARES":
      return sharesSplit(paidBy, members);

    case "ADJUSTMENT":
      return adjustmentSplit(paidBy, members);

    default:
      throw new Error("Invalid split option");
  }
};

const equalSplit = (paidBy, members) => {
  // BASIC LOGIC
  const count = members.length; // count, totalAmount => baseAmount, remainder => membersWithBase => membersWithOwed, membersWithPaid => membersWithBalance => creditors, debitors, => settlements
  const totalAmount = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);

  const baseAmount = Math.floor(totalAmount / count);
  let remainder = totalAmount % count;
  const membersWithBase = members.map((m) => ({
    ...m,
    amountOwed: baseAmount,
  }));

  // common from here
  const withOwed = distributeRemainder(remainder, membersWithBase);
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  // settlements function
  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    creditors,
    debtors,
    withBalance,
  };
};

const unequalSplit = (paidBy, members) => {
  const totalAmountPaid = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);
  const totalAmountOwed = members.reduce((sum, e) => {
    return sum + e.amountOwed;
  }, 0);
  if (totalAmountPaid !== totalAmountOwed) {
    const error = new Error("paid and owed should be same");
    error.statusCode = 400;
    throw error;
  }
  const withOwed = members.map((m) => ({
    ...m,
  }));
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    withBalance,
    withOwed,
  };
};

const percentageSplit = (paidBy, members) => {
  const totalPercentage = members.reduce((sum, e) => {
    return sum + e.weight;
  }, 0);
  if (totalPercentage !== 100) {
    const error = new Error("sum of percentages should be 100");
    error.statusCode = 400;
    throw error;
  }
  const totalAmount = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);
  const withAmounts = members.map((m) => ({
    ...m,
    amountOwed: Math.floor((totalAmount * m.weight) / 100),
  }));
  const remainder =
    totalAmount - withAmounts.reduce((s, m) => s + m.amountOwed, 0);

  const withOwed = distributeRemainder(remainder, withAmounts);
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  // settlements function
  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    creditors,
    debtors,
    withBalance,
  };
};

const sharesSplit = (paidBy, members) => {
  const totalAmount = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);
  const totalShares = members.reduce((sum, e) => {
    return sum + e.weight;
  }, 0);
  if (totalShares <= 1) {
    const error = new Error("atleast 1 share needed");
    error.statusCode = 400;
    throw error;
  }
  const baseAmount = totalAmount / totalShares;
  const withAmounts = members.map((m) => ({
    ...m,
    amountOwed: Math.floor(baseAmount * m.weight),
  }));
  const remainder =
    totalAmount -
    withAmounts.reduce((sum, e) => {
      return sum + e.amountOwed;
    }, 0);

  const withOwed = distributeRemainder(remainder, withAmounts);
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  // settlements function
  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    creditors,
    debtors,
    withBalance,
  };
};

const adjustmentSplit = (paidBy, members) => {
  const totalAmount = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);
  const count = members.length;
  const totalWeight = members.reduce((sum, e) => {
    return sum + e.weight;
  }, 0)
  if (totalWeight >= totalAmount) {
    const error = new Error("Weight cannot be bigger than totalAmount");
    error.statusCode = 400;
    throw error;
  }
  const baseAmount = Math.floor((totalAmount - totalWeight) / count);

  const withAmounts = members.map((m) => ({
    ...m,
    amountOwed: baseAmount + m.weight,
  }))
  const remainder = totalAmount - withAmounts.reduce((sum, e) => {
    return sum + e.amountOwed;
  }, 0);
  const withOwed = distributeRemainder(remainder, withAmounts);
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  // settlements function
  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    creditors,
    debtors,
    withBalance,
  };
};
