import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Expenses from '../components/Expenses';
import { GetGroup } from '@/services/groupService';
import AddExpenseModal from '@/components/AddExpenseModal';

const GroupExpenses = () => {
  const { groupId } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

 useEffect(() => {
  const load = async () => {
    const data = await GetGroup(groupId);
    setGroupData(data);
  };

  load();
}, [groupId]);

  return (
    <div className="bg-[#0e0f0c] min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-[#f0f2e8] text-3xl font-bold font-['Syne']">
            {groupData?.group?.name}
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#c8f135] text-black px-6 py-2 rounded-full font-bold"
          >
            + New Expense
          </button>
        </div>

        <Expenses key={refresh} />

        {groupData?.members && (
          <AddExpenseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            groupId={groupId}
            members={groupData.members}
            onRefresh={() => setRefresh((r) => r + 1)}
          />
        )}
      </div>
    </div>
  );
};

export default GroupExpenses;