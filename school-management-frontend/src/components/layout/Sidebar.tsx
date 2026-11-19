import React from 'react';
import { Users, BookOpen, GraduationCap, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../context/NavigationContext';

export const Sidebar: React.FC = () => {
  const { canAccessImports } = useAuth();
  const { currentPath, navigate } = useNavigate();

  const navItems = [
    { label: 'Teachers', path: '/teachers', icon: Users },
    { label: 'Classes', path: '/classes', icon: BookOpen },
    { label: 'Students', path: '/students', icon: GraduationCap },
    ...(canAccessImports
      ? [{ label: 'CSV Imports', path: '/imports', icon: FileSpreadsheet }]
      : []),
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
