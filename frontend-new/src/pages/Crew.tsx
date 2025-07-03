import React from 'react';
import { Search, Filter, Plus, Mail, Phone } from 'lucide-react';

const Crew: React.FC = () => {
  const departments = [
    { name: 'Camera', count: 12 },
    { name: 'Lighting', count: 8 },
    { name: 'Sound', count: 6 },
    { name: 'Art Department', count: 15 },
    { name: 'Production', count: 10 },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Crew Management</h1>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Crew Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Departments</h2>
            <div className="space-y-2">
              {departments.map((dept) => (
                <button
                  key={dept.name}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="text-slate-700">{dept.name}</span>
                  <span className="text-sm text-slate-500">{dept.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search crew..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Filter className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-300 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-slate-900">John Doe</h3>
                        <p className="text-sm text-slate-600">Director of Photography</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-slate-600 hover:text-slate-900">
                        <Mail className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-slate-900">
                        <Phone className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crew;
