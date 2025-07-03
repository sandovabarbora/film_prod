import React from 'react';
import { MessageSquare, Send, Paperclip, Users } from 'lucide-react';

const Communication: React.FC = () => {
  const channels = [
    { name: 'General', unread: 0 },
    { name: 'Production', unread: 3 },
    { name: 'Camera Dept', unread: 1 },
    { name: 'Locations', unread: 0 },
    { name: 'Emergency', unread: 0 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Team Communication</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Channels</h2>
            <div className="space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.name}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-slate-400 mr-3" />
                    <span className="text-slate-700">{channel.name}</span>
                  </div>
                  {channel.unread > 0 && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="border-b border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-6 h-6 text-slate-600 mr-3" />
                <h2 className="text-lg font-semibold text-slate-900">Production Channel</h2>
              </div>
              <button className="p-2 text-slate-600 hover:text-slate-900">
                <Users className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-slate-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-slate-900">John Doe</span>
                        <span className="text-sm text-slate-500">2:30 PM</span>
                      </div>
                      <p className="text-slate-700">
                        Just confirmed the location for tomorrow's shoot. Everything is set up and ready to go!
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-600 hover:text-slate-900">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-red-500"
                />
                <button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;
