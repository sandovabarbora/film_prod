import React from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye } from 'lucide-react';

const Weather: React.FC = () => {
  const forecast = [
    { day: 'Today', high: 75, low: 62, condition: 'Sunny', icon: Sun },
    { day: 'Tomorrow', high: 72, low: 58, condition: 'Partly Cloudy', icon: Cloud },
    { day: 'Wednesday', high: 68, low: 55, condition: 'Rain', icon: CloudRain },
    { day: 'Thursday', high: 70, low: 57, condition: 'Cloudy', icon: Cloud },
    { day: 'Friday', high: 73, low: 60, condition: 'Sunny', icon: Sun },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Weather Forecast</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">5-Day Forecast</h2>
            
            <div className="grid grid-cols-5 gap-4">
              {forecast.map((day) => {
                const Icon = day.icon;
                return (
                  <div key={day.day} className="text-center">
                    <p className="font-medium text-slate-900 mb-2">{day.day}</p>
                    <Icon className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm text-slate-600">{day.condition}</p>
                    <p className="text-lg font-semibold text-slate-900 mt-2">{day.high}°</p>
                    <p className="text-sm text-slate-500">{day.low}°</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Conditions</h2>
            
            <div className="text-center mb-6">
              <Sun className="w-24 h-24 mx-auto text-yellow-500 mb-4" />
              <p className="text-4xl font-bold text-slate-900">75°F</p>
              <p className="text-lg text-slate-600">Sunny</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wind className="w-5 h-5 text-slate-400 mr-2" />
                  <span className="text-slate-600">Wind</span>
                </div>
                <span className="font-medium text-slate-900">8 mph</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Droplets className="w-5 h-5 text-slate-400 mr-2" />
                  <span className="text-slate-600">Humidity</span>
                </div>
                <span className="font-medium text-slate-900">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 text-slate-400 mr-2" />
                  <span className="text-slate-600">Visibility</span>
                </div>
                <span className="font-medium text-slate-900">10 mi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Weather Advisory</h3>
        <p className="text-yellow-800">
          Rain expected on Wednesday. Consider rescheduling outdoor shoots or preparing rain covers for equipment.
          Indoor locations are recommended for scenes 24-28.
        </p>
      </div>
    </div>
  );
};

export default Weather;
