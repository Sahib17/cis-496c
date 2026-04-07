export const attachBalances = (withPaid) => {
    return withPaid.map((member) => ({
    ...member,
    balance: member.amountPaid - member.amountOwed,
  }));
}

export const attachPayments = (withOwed, paidBy) => {
  return withOwed.map((member) => {
    console.log("matching member.user:", member.user, typeof member.user);
    console.log("paidBy entries:", paidBy.map(p => [p.user, typeof p.user]));
    if (!member.user) {
      console.log("BROKEN MEMBER", member)
      return { ...member, amountPaid: 0 }
    }

    const memberId =
      typeof member.user === "object"
        ? member.user._id?.toString() || member.user.toString()
        : member.user.toString()

    const paidEntry = paidBy.find((p) => {
      const payerId =
        typeof p.user === "object"
          ? p.user._id?.toString() || p.user.toString()
          : p.user.toString()

      return payerId === memberId
    })

    return {
      ...member,
      amountPaid: paidEntry?.amount ?? 0
    }
  })
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
  
  // ← work on copies so withBalance isn't mutated
  const creditorsCopy = creditors.map((c) => ({ ...c }));
  const debtorsCopy = debtors.map((d) => ({ ...d }));

  for (const debtor of debtorsCopy) {
    let debt = -debtor.balance;

    for (const creditor of creditorsCopy) {
      if (creditor.balance === 0) continue;

      const amount = Math.min(debt, creditor.balance);

      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount,
      });

      creditor.balance -= amount;
      debt -= amount;
      if (debt === 0) break;
    }
  }
  return settlements;
};