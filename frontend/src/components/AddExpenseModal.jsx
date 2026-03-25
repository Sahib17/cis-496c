import React, { useState } from 'react';
import { PostExpense } from '@/services/expenseService';
import { calculateSplit } from '@/services/settlementService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AddExpenseModal = ({ isOpen, onClose, groupId, members, onRefresh }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [splitOption, setSplitOption] = useState("EQUALLY");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalAmount = parseFloat(amount);
    
    // Prepare split data for the backend
    const paidBy = [{ user: members[0].memberId, amount: totalAmount }]; // Default: Current user paid
    const memberWeights = members.map(m => ({ user: m.memberId, weight: 1 }));
    
    try {
      const splitResult = calculateSplit(paidBy, memberWeights, splitOption);
      const expenseData = {
        name,
        groupId,
        paidBy,
        members: splitResult.withBalance,
        options: splitOption
      };

      await PostExpense(expenseData);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.message || "Failed to add expense");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#161810] border-white/10 text-[#f0f2e8]">
        <DialogHeader>
          <DialogTitle className="font-['Syne']">Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <input 
            type="text" placeholder="What was this for?" value={name} onChange={e => setName(e.target.value)}
            className="bg-[#0e0f0c] border border-white/10 p-3 rounded-xl outline-none focus:border-[#c8f135]"
            required
          />
          <input 
            type="number" placeholder="Amount ($)" value={amount} onChange={e => setAmount(e.target.value)}
            className="bg-[#0e0f0c] border border-white/10 p-3 rounded-xl outline-none focus:border-[#c8f135]"
            required
          />
          <select 
            value={splitOption} onChange={e => setSplitOption(e.target.value)}
            className="bg-[#0e0f0c] border border-white/10 p-3 rounded-xl"
          >
            <option value="EQUALLY">Split Equally</option>
            <option value="PERCENTAGE">By Percentage</option>
            <option value="SHARES">By Shares</option>
          </select>
          <button type="submit" className="bg-[#c8f135] text-black font-bold py-3 rounded-full hover:bg-[#a8d020] transition-colors">
            Add Expense
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;