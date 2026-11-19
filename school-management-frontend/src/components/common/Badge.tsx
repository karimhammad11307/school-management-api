import React from 'react';
import { UserRole } from '../../types';

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles: Record<UserRole, string> = {
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    operator: 'bg-blue-50 text-blue-700 border-blue-200',
    teacher: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    student: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
        styles[role] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {role}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: 'created' | 'skipped' | 'rejected' }> = ({
  status,
}) => {
  const styles = {
    created: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    skipped: 'bg-amber-50 text-amber-700 border-amber-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}
    >
      {status}
    </span>
  );
};
