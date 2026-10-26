import React, { useState } from 'react';
import { UserAccount } from '../types/ticket';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  Lock, 
  User, 
  LogIn, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Wrench, 
  AlertCircle,
  CheckCircle2,
  Users,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface LoginViewProps {
  accounts: UserAccount[];
  onLogin: (account: UserAccount) => void;
  firebaseUser?: FirebaseUser | null;
  onGoogleSignIn?: () => Promise<void>;
  onGoogleSignOut?: () => Promise<void>;
  isSyncing?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  accounts, 
  onLogin,
  firebaseUser,
  onGoogleSignIn,
  onGoogleSignOut,
  isSyncing
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleClick = async () => {
    if (!onGoogleSignIn) return;
    try {
      setGoogleLoading(true);
      await onGoogleSignIn();
    } catch (e) {
      console.error(e);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('請輸入個人登入帳號');
      return;
    }
    if (!password) {
      setErrorMsg('請輸入登入密碼');
      return;
    }

    const trimmedUser = username.trim().toLowerCase();
    const account = accounts.find((a) => a.username.toLowerCase() === trimmedUser);

    if (!account) {
      setErrorMsg(`找不到帳號「${username}」，請確認帳號名稱是否正確。`);
      return;
    }

    const expectedPwd = account.password || (account.permissionLevel === 'admin' ? 'admin123' : 'user123');
    if (password !== expectedPwd) {
      setErrorMsg('密碼不正確，請重新輸入！');
      return;
    }

    // Success!
    onLogin(account);
  };

  const handleQuickFill = (acc: UserAccount) => {
    const pwd = acc.password || (acc.permissionLevel === 'admin' ? 'admin123' : 'user123');
    setUsername(acc.username);
    setPassword(pwd);
    setErrorMsg('');
  };

  const adminAccounts = accounts.filter((a) => a.permissionLevel === 'admin');
  const userAccounts = accounts.filter((a) => a.permissionLevel === 'user');

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-1">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            設備維修派工管理系統
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            分區即時派工 · 多工程師現場維修 · 雲端數據同步
          </p>
        </div>

        {/* Firebase Cloud Sync Card */}
        <div className="rounded-2xl border p-4 transition-all bg-slate-800/90 border-slate-700 shadow-xl backdrop-blur-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                firebaseUser 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {firebaseUser ? <CloudCheck className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {firebaseUser ? 'Firebase 雲端即時資料庫' : '雲端多人連線與即時共用'}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                    firebaseUser 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-slate-700 text-slate-300 border-slate-600'
                  }`}>
                    {firebaseUser ? '🟢 即時連線中' : '可選連線'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {firebaseUser ? (
                    <span className="font-mono text-emerald-300">已授權：{firebaseUser.email || 'Google 帳號'}</span>
                  ) : (
                    <span>多人同時連線、手機平板即時更新工單資料</span>
                  )}
                </div>
              </div>
            </div>

            {firebaseUser ? (
              onGoogleSignOut && (
                <button
                  type="button"
                  onClick={onGoogleSignOut}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline shrink-0 mt-1"
                >
                  切換帳號
                </button>
              )
            ) : (
              onGoogleSignIn && (
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleClick}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-50"
                >
                  {googleLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Cloud className="w-3.5 h-3.5" />
                  )}
                  <span>Google 授權連線</span>
                </button>
              )
            )}
          </div>
          {firebaseUser && (
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                所有派工、接單、回報與人員異動將即時同步至雲端
              </span>
              {isSyncing && (
                <span className="flex items-center gap-1 text-blue-400 font-mono">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" /> 同步中
                </span>
              )}
            </div>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>帳號密碼登入</span>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              分級權限控管
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 text-xs">
                登入帳號 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="請輸入個人帳號 (例如：admin_chen 或 tech_lin)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 font-semibold text-xs">
                  登入密碼 <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="請輸入密碼"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? '隱藏密碼' : '顯示密碼'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>記住登入狀態</span>
              </label>
              <span className="text-slate-400 text-[11px]">預設密碼：admin123 / user123</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>登入系統</span>
            </button>
          </form>
        </div>

        {/* Quick Demo Credentials for Convenience */}
        <div className="bg-slate-800/80 backdrop-blur-xs rounded-2xl border border-slate-700/80 p-5 space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-bold flex items-center gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              快捷登入帳號（點選立即帶入）
            </span>
            <span className="text-[10px] text-slate-400">點選即可自動填寫</span>
          </div>

          {/* Admin Accounts */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>系統管理員（具團隊管理與工單取消權限）</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {adminAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-700/60 hover:border-amber-500/60 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 group-hover:text-amber-300">
                      {acc.name}
                    </span>
                    <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                      管理員
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    帳號: {acc.username}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User Accounts */}
          <div className="space-y-1.5 pt-1 border-t border-slate-700/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>維修工程師 / 使用者（無團隊管理與取消權限）</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {userAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-700/60 hover:border-sky-500/60 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 group-hover:text-sky-300">
                      {acc.name}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                      使用者
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1 truncate" title={acc.roleTitle}>
                    {acc.username} · {acc.roleTitle}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-slate-500 text-[11px]">
          設備維修派工管理系統 · 安全身分驗證與分區責任維護
        </div>
      </div>
    </div>
  );
};
