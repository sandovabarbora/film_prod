import React from 'react';
import { FileText, Search, Upload, Download, Eye, Folder } from 'lucide-react';

const Documents: React.FC = () => {
  const folders = [
    { name: 'Scripts', count: 12 },
    { name: 'Contracts', count: 45 },
    { name: 'Call Sheets', count: 23 },
    { name: 'Permits', count: 18 },
    { name: 'Insurance', count: 8 },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Document Management</h1>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Folders</h2>
            <div className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Folder className="w-5 h-5 text-slate-400 mr-3" />
                    <span className="text-slate-700">{folder.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">{folder.count}</span>
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
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-red-500" />
                      <div>
                        <h3 className="font-medium text-slate-900">Production_Script_v{i}.pdf</h3>
                        <p className="text-sm text-slate-500">Updated 2 days ago • 2.4 MB</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-slate-600 hover:text-slate-900">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-slate-900">
                        <Download className="w-5 h-5" />
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

export default Documents;
