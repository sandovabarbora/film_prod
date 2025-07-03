import React from 'react';
import { Clock, MapPin, Users } from 'lucide-react';

const Schedule: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Production Schedule</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">This Week</h2>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Add Shoot Day
          </button>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((day) => (
            <div key={day} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Day {day} - Interior Office</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Call: 7:00 AM - Wrap: 7:00 PM
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      Downtown Studio - Stage 3
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="w-4 h-4 mr-2" />
                      45 crew members
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">Confirmed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
