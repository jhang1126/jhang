import React from 'react';
import { UserRole, UserAccount } from '../types/ticket';
import { User as FirebaseUser } from 'firebase/auth';
import { PhoneCall, ShieldCheck, User, KeyRound, ChevronDown, Lock, PlusCircle, LogOut, Cloud, CloudCheck, RefreshCw } from 'lucide-react';

export type ActiveTab = 'tickets' | 'dispatch' | 'technician' | 'team' | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewTicket: () => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentAccount: UserAccount;
  onOpenAccountModal: () => void;
  onLogout?: () => void;
  pendingDispatchCount: number;
  pendingAcceptCount: number;
  firebaseUser?: FirebaseUser | null;
  onGoogleSignIn?: () => Promise<void>;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTicket,
  userRole: _userRole,
  onRoleChange: _onRoleChange,
  currentAccount,
  onOpenAccountModal,
  onLogout,
  pendingDispatchCount,
  pendingAcceptCount,
  firebaseUser,
  onGoogleSignIn,
  isSyncing,
}) => {
  const isAdmin = currentAccount.permissionLevel === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Strict 3-zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={() => onTabChange('tickets')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
            PM
          </span>
          <span className="hidden sm:inline">PRO-MAINT 設備維修派工系統</span>
          <span className="sm:hidden font-mono">PRO-MAINT</span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onTabChange('tickets')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'tickets'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            工單總覽
          </button>

          <button
            onClick={() => onTabChange('dispatch')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'dispatch'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            <span>派工工作台</span>
            {pendingDispatchCount > 0 && (
              <span className="text-[10px] font-mono bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                {pendingDispatchCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('technician')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'technician'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            <span>技師接單看板</span>
            {pendingAcceptCount > 0 && (
              <span className="text-[10px] font-mono bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                {pendingAcceptCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('team')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            <span>團隊人員管理</span>
            {!isAdmin && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> 唯讀
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'analytics'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'hover:text-slate-900'
            }`}
          >
            運維統計分析
          </button>
        </nav>

        {/* Zone 3: Actions & Account User Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Cloud Sync Status Pill */}
          {firebaseUser ? (
            <div 
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
              title={`Firebase 雲端已連線 · 多人同步中 (${firebaseUser.email || 'Google 帳號'})`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>雲端同步</span>
              {isSyncing && <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />}
            </div>
          ) : (
            onGoogleSignIn && (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium transition-colors"
                title="點擊以 Google 帳號授權連線，啟用多人即時資料同步"
              >
                <Cloud className="w-3.5 h-3.5 text-slate-500" />
                <span>開啟雲端同步</span>
              </button>
            )
          )}

          {/* New Ticket button */}
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            title="新增維修工單"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ 新增維修工單</span>
            <span className="sm:hidden">+ 新增工單</span>
          </button>

          {/* Account Profile / Switcher Button */}
          <button
            onClick={onOpenAccountModal}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-xs text-left ${
              isAdmin
                ? 'bg-blue-50/70 border-blue-200 hover:bg-blue-100/70 text-slate-900'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
            }`}
            title="點擊切換個人帳戶或檢視權限設定"
          >
            <div
              className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${
                isAdmin ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            <div className="hidden sm:flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-xs">{currentAccount.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isAdmin
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isAdmin ? '管理員' : '使用者'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">@{currentAccount.username}</span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-600 transition-all text-xs font-medium shrink-0 shadow-2xs"
              title="登出目前個人帳號，返回登入畫面"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">登出</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
