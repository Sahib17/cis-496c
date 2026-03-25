import React, { useState } from 'react';
import { PostExpense } from '@/services/expenseService';

const AddExpenseForm = ({ groupId, members, onComplete }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [splitOption, setSplitOption] = useState("EQUALLY");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expenseData = {
      name,
      groupId,
      paidBy: [{ user: members[0].memberId, amount: parseFloat(amount) * 100 }], // Simplified: current user paid
      members: members.map(m => ({ user: m.memberId, weight: 1 })), // Default weights
      options: splitOption
    };

    try {
      await PostExpense(expenseData);
      onComplete();
    } catch (err) {
        console.log(err);
      alert("Error adding expense");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#161810] p-6 rounded-2xl border border-white/10">
      <input 
        type="text" placeholder="Expense Name" value={name} onChange={e => setName(e.target.value)}
        className="bg-[#0e0f0c] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#c8f135]"
      />
      <input 
        type="number" placeholder="Amount ($)" value={amount} onChange={e => setAmount(e.target.value)}
        className="bg-[#0e0f0c] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#c8f135]"
      />
      <select 
        value={splitOption} onChange={e => setSplitOption(e.target.value)}
        className="bg-[#0e0f0c] border border-white/10 p-3 rounded-xl text-white"
      >
        <option value="EQUALLY">Split Equally</option>
        <option value="PERCENTAGE">By Percentage</option>
        <option value="SHARES">By Shares</option>
      </select>
      <button type="submit" className="bg-[#c8f135] text-black font-bold py-3 rounded-full hover:bg-[#a8d020]">
        Save Expense
      </button>
    </form>
  );
};

export default AddExpenseForm;