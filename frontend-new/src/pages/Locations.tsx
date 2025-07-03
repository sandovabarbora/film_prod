import React from 'react';
import { MapPin, Plus, Camera, Clock, DollarSign } from 'lucide-react';

const Locations: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Location Management</h1>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-48 bg-slate-300"></div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Downtown Office Building</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  123 Main St, Los Angeles, CA
                </div>
                <div className="flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Scenes: 12, 24, 45
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Available: Dec 10-15
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  $2,500/day
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
                  View Details
                </button>
                <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                  Book Location
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Locations;
