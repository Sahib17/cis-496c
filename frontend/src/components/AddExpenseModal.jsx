import React from "react";
import AddExpenseForm from "./AddExpenseForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AddExpenseModal = ({ isOpen, onClose, groupId, members, onRefresh }) => {
  const handleComplete = () => {
    onRefresh();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111309] border border-white/[0.07] text-[#f0f2e8] max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="mb-1">
          <DialogTitle
            className="text-[#f0f2e8] text-lg font-extrabold"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.03em" }}
          >
            New Expense
          </DialogTitle>
          <p
            className="text-[#3d4030] text-xs mt-0.5"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Fill in the details below to track a split.
          </p>
        </DialogHeader>

        <AddExpenseForm
          groupId={groupId}
          members={members}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;