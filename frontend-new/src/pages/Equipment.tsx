import React from 'react';
import { Package, Search, Plus, AlertTriangle } from 'lucide-react';

const Equipment: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Equipment Tracking</h1>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Equipment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Total Equipment</h3>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">234</p>
          <p className="text-sm text-slate-600 mt-1">Items tracked</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Checked Out</h3>
            <Package className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">89</p>
          <p className="text-sm text-slate-600 mt-1">Currently in use</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Maintenance</h3>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">5</p>
          <p className="text-sm text-slate-600 mt-1">Items need attention</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search equipment..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Item</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Assigned To</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3 px-4">RED Komodo 6K</td>
                  <td className="py-3 px-4">Camera</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Checked Out
                    </span>
                  </td>
                  <td className="py-3 px-4">John Doe</td>
                  <td className="py-3 px-4">Dec 15, 2024</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Equipment;
