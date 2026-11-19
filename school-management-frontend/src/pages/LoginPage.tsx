import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from '../context/NavigationContext';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@school.local',
    password: 'Admin123!',
    desc: 'Full CRUD + Imports',
    color: 'hover:border-purple-300 hover:bg-purple-50/50',
  },
  {
    role: 'Operator',
    email: 'operator@school.local',
    password: 'Operator123!',
    desc: 'Create & Edit only',
    color: 'hover:border-blue-300 hover:bg-blue-50/50',
  },
  {
    role: 'Teacher',
    email: 'teacher@school.local',
    password: 'Teacher123!',
    desc: 'Read-only access',
    color: 'hover:border-emerald-300 hover:bg-emerald-50/50',
  },
  {
    role: 'Student',
    email: 'student@school.local',
    password: 'Student123!',
    desc: 'Read-only access',
    color: 'hover:border-amber-300 hover:bg-amber-50/50',
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showApiError, showSuccess } = useToast();
  const { navigate } = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      showSuccess('Signed In', 'Welcome back to School Management');
      navigate('/teachers');
    } catch (err) {
      showApiError(err, 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            School Management System
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your credentials or pick a demo role
          </p>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.local"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                Demo Accounts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillCredentials(acc.email, acc.password)}
                className={`p-3 rounded-lg border border-slate-200 text-left transition-all bg-white ${acc.color}`}
              >
                <div className="text-xs font-bold text-slate-900">{acc.role}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{acc.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
