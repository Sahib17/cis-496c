import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [balance, setBalance] = useState({ totalOwedToUser: 0, totalUserOwes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/balance-summary`, { withCredentials: true });
        setBalance(res.data.data);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  if (loading) return <div className="text-[#c8f135] p-10">Calculating balances...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-[#f0f2e8] text-4xl font-extrabold font-['Syne'] mb-10">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#161810] border border-white/[0.07] rounded-3xl p-8">
          <p className="text-[#8a8d70] text-xs uppercase tracking-widest mb-3">You are owed</p>
          <p className="text-[#c8f135] text-5xl font-extrabold font-['Syne']">
            ${(balance.totalOwedToUser / 100).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-[#161810] border border-white/[0.07] rounded-3xl p-8">
          <p className="text-[#8a8d70] text-xs uppercase tracking-widest mb-3">You owe</p>
          <p className="text-orange-400 text-5xl font-extrabold font-['Syne']">
            ${(balance.totalUserOwes / 100).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;