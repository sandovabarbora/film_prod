import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const Budget: React.FC = () => {
  const budgetCategories = [
    { name: 'Above the Line', allocated: 2500000, spent: 1875000 },
    { name: 'Production', allocated: 5000000, spent: 3250000 },
    { name: 'Post Production', allocated: 1500000, spent: 450000 },
    { name: 'Marketing', allocated: 1000000, spent: 0 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Budget Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Total Budget</h3>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">$10,000,000</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Spent</h3>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">$5,825,000</p>
          <p className="text-sm text-slate-500 mt-1">58.25%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Remaining</h3>
            <TrendingDown className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">$4,175,000</p>
          <p className="text-sm text-slate-500 mt-1">41.75%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Projected</h3>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">$9,750,000</p>
          <p className="text-sm text-green-600 mt-1">Under budget</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Budget Breakdown</h2>
        
        <div className="space-y-6">
          {budgetCategories.map((category) => {
            const percentage = (category.spent / category.allocated) * 100;
            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900">{category.name}</h3>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">{percentage.toFixed(1)}% used</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      percentage > 75 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Budget;
