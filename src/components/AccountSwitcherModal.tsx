import React, { useState } from 'react';
import { UserAccount, PermissionLevel } from '../types/ticket';
import { 
  X, 
  ShieldCheck, 
  User, 
  Check, 
  Lock, 
  Plus, 
  LogIn, 
  KeyRound, 
  CheckCircle2, 
  Ban, 
  Users,
  ShieldAlert,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  Trash2
} from 'lucide-react';

interface AccountSwitcherModalProps {
  accounts: UserAccount[];
  currentAccount: UserAccount | null;
  onClose: () => void;
  onSelectAccount: (account: UserAccount) => void;
  onUpdateAccountPassword: (accountId: string, newPassword: string) => void;
  onCreateAccount: (newAccount: UserAccount) => void;
  onDeleteAccount?: (account: UserAccount) => void;
  onLogout?: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  accounts,
  currentAccount,
  onClose,
  onSelectAccount,
  onUpdateAccountPassword,
  onCreateAccount,
  onDeleteAccount,
  onLogout,
}) => {
  const [tab, setTab] = useState<'login' | 'change_pwd' | 'create'>('login');

  // Selected account for password authentication
  const [selectedAccId, setSelectedAccId] = useState<string>(
    currentAccount ? currentAccount.id : accounts[0]?.id || ''
  );
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Password change state
  const [currentPwdInput, setCurrentPwdInput] = useState<string>('');
  const [newPwdInput, setNewPwdInput] = useState<string>('');
  const [confirmPwdInput, setConfirmPwdInput] = useState<string>('');
  const [pwdChangeMsg, setPwdChangeMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Form state for creating custom account
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('user123');
  const [newName, setNewName] = useState('');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('台東維護工程處');
  const [newPhone, setNewPhone] = useState('');
  const [newLevel, setNewLevel] = useState<PermissionLevel>('user');
  const [formError, setFormError] = useState('');

  const targetAccount = accounts.find((a) => a.id === selectedAccId) || accounts[0];
  const adminAccounts = accounts.filter((a) => a.permissionLevel === 'admin');
  const userAccounts = accounts.filter((a) => a.permissionLevel === 'user');

  // Handle password login verification
  const handleVerifyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccount) return;

    const expectedPwd = targetAccount.password || (targetAccount.permissionLevel === 'admin' ? 'admin123' : 'user123');
    if (passwordInput !== expectedPwd) {
      setLoginError(`密碼驗證失敗！請確認密碼是否正確（提示預設密碼：${expectedPwd}）。`);
      return;
    }

    setLoginError('');
    onSelectAccount(targetAccount);
    onClose();
  };

  // Quick fill password for testing
  const handleFillDemoPassword = () => {
    if (!targetAccount) return;
    const pwd = targetAccount.password || (targetAccount.permissionLevel === 'admin' ? 'admin123' : 'user123');
    setPasswordInput(pwd);
    setLoginError('');
  };

  // Handle password change
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;

    const expectedOld = currentAccount.password || (currentAccount.permissionLevel === 'admin' ? 'admin123' : 'user123');
    if (currentPwdInput !== expectedOld) {
      setPwdChangeMsg({ text: '目前原密碼輸入不正確，請重新確認！', isError: true });
      return;
    }

    if (!newPwdInput.trim() || newPwdInput.length < 4) {
      setPwdChangeMsg({ text: '新密碼至少需 4 個字元以上！', isError: true });
      return;
    }

    if (newPwdInput !== confirmPwdInput) {
      setPwdChangeMsg({ text: '兩次輸入的新密碼不一致！', isError: true });
      return;
    }

    onUpdateAccountPassword(currentAccount.id, newPwdInput);
    setPwdChangeMsg({ text: '密碼已成功更新！下次登入請使用新密碼。', isError: false });
    setCurrentPwdInput('');
    setNewPwdInput('');
    setConfirmPwdInput('');
  };

  // Handle create account
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim() || !newPassword.trim()) {
      setFormError('請完整填寫帳號、密碼與姓名！');
      return;
    }

    const isExisting = accounts.some((a) => a.username.toLowerCase() === newUsername.trim().toLowerCase());
    if (isExisting) {
      setFormError('此帳號名稱已被使用，請更換一個帳號！');
      return;
    }

    const finalRoleTitle = newRoleTitle.trim() || (newLevel === 'admin' ? '運維管理主管' : '維護工程師');

    const created: UserAccount = {
      id: `acc-custom-${Date.now()}`,
      username: newUsername.trim(),
      password: newPassword.trim(),
      name: newName.trim(),
      roleTitle: finalRoleTitle,
      department: newDepartment.trim(),
      phone: newPhone.trim() || '0900-000-000',
      permissionLevel: newLevel,
      permissions: {
        canManageTeam: newLevel === 'admin',
        canDeleteTicket: newLevel === 'admin',
        canCancelTicket: newLevel === 'admin',
        canDispatch: newLevel === 'admin',
        canSelfClaim: newLevel === 'user',
        canExecuteRepair: newLevel === 'user',
      },
    };

    onCreateAccount(created);
    onSelectAccount(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 text-white flex items-center justify-center font-bold shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">個人帳戶密碼控管與登入認證</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  安全密碼防護
                </span>
              </div>
              <p className="text-[12px] text-slate-300">
                個人僅能憑帳號密碼登入所屬帳戶，系統依權限層級嚴格控管團隊管理與工單取消功能
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Quick Info Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">目前登入身分：</span>
            {currentAccount ? (
              <>
                <span className="font-bold text-slate-900">{currentAccount.name}</span>
                <span className="font-mono text-slate-500 text-[11px]">(@{currentAccount.username})</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                    currentAccount.permissionLevel === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {currentAccount.permissionLevel === 'admin' ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      系統管理員
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      一般使用者
                    </>
                  )}
                </span>
              </>
            ) : (
              <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                未登入（受限狀態）
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentAccount && onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setPasswordInput('');
                  setLoginError('');
                }}
                className="text-[11px] font-medium text-slate-600 hover:text-rose-600 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors flex items-center gap-1"
                title="登出當前帳戶"
              >
                <LogOut className="w-3 h-3" />
                登出
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-2 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold bg-white shrink-0">
          <button
            onClick={() => setTab('login')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              tab === 'login'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            個人帳號密碼登入
          </button>
          {currentAccount && (
            <button
              onClick={() => setTab('change_pwd')}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                tab === 'change_pwd'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              修改個人密碼
            </button>
          )}
          <button
            onClick={() => setTab('create')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              tab === 'create'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            新增人員帳號
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {tab === 'login' && (
            <div className="space-y-6">
              {/* Permission Level Summary Note */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-600">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                    各級帳號權限規範與密碼防護政策：
                  </div>
                  <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                    需輸入個人專屬密碼驗證
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-blue-200 shadow-2xs">
                    <div className="font-bold text-blue-900 flex items-center gap-1 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      管理員帳戶 (Administrator)
                    </div>
                    <ul className="text-slate-600 space-y-1 mt-1.5 list-disc list-inside">
                      <li><strong className="text-emerald-700">擁有</strong>「團隊人員管理」權限（新增/修改/刪除人員）</li>
                      <li><strong className="text-emerald-700">擁有</strong>「刪除工單」權限（完全清除不留紀錄）</li>
                      <li className="text-[10px] text-slate-500">預設密碼：<code className="text-blue-700 font-mono font-bold">admin123</code></li>
                    </ul>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      使用者帳戶 (Standard User)
                    </div>
                    <ul className="text-slate-600 space-y-1 mt-1.5 list-disc list-inside">
                      <li><strong className="text-rose-600">無</strong>「團隊人員管理」權限（名冊唯讀）</li>
                      <li><strong className="text-rose-600">無</strong>「刪除工單」權限（禁止刪除工單）</li>
                      <li className="text-[10px] text-slate-500">預設密碼：<code className="text-indigo-700 font-mono font-bold">user123</code></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Account Selection and Password Input Form */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  請選擇要登入的個人帳戶並輸入密碼
                </div>

                {/* Step 1: Account selection grid */}
                <div className="space-y-1.5">
                  <label className="block text-slate-600 font-semibold text-[11px]">
                    1. 選擇登入帳號：
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
                    {accounts.map((acc) => {
                      const isSelected = acc.id === selectedAccId;
                      const isCurrent = acc.id === currentAccount?.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setSelectedAccId(acc.id);
                            setPasswordInput('');
                            setLoginError('');
                          }}
                          className={`p-2 rounded-lg text-left transition-all border flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                              acc.permissionLevel === 'admin' ? 'bg-blue-600' : 'bg-slate-600'
                            }`}
                          >
                            {acc.name.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate text-[11px]">{acc.name}</span>
                              <span
                                className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                                  acc.permissionLevel === 'admin'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {acc.permissionLevel === 'admin' ? '管理員' : '使用者'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate font-mono">
                              @{acc.username}
                              {isCurrent && ' (當前登入)'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {currentAccount?.permissionLevel === 'admin' && onDeleteAccount && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteAccount(acc);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title={`管理員刪除帳號：${acc.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Password Input */}
                {targetAccount && (
                  <form onSubmit={handleVerifyLogin} className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-700 font-semibold text-xs flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        2. 輸入帳號密碼以解鎖登入：
                      </label>
                      <button
                        type="button"
                        onClick={handleFillDemoPassword}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                        title="帶入預設密碼進行測試"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        點此一鍵帶入預設密碼 ({targetAccount.permissionLevel === 'admin' ? 'admin123' : 'user123'})
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          setLoginError('');
                        }}
                        placeholder="請輸入此帳戶的個人密碼"
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showPassword ? '隱藏密碼' : '顯示密碼'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {loginError && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-500">
                        登入對象：<strong className="text-slate-800">{targetAccount.name}</strong> 
                        （層級：{targetAccount.permissionLevel === 'admin' ? '系統管理員' : '一般使用者'}）
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        驗證密碼並登入
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Roster Guide */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 space-y-2">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-600" />
                  現有團隊人員帳號與密碼對照表：
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-1 px-2">姓名</th>
                        <th className="py-1 px-2">帳號</th>
                        <th className="py-1 px-2">權限層級</th>
                        <th className="py-1 px-2">預設密碼</th>
                        <th className="py-1 px-2">刪除工單</th>
                        <th className="py-1 px-2">團隊人員管理</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 font-mono">
                      {accounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-slate-100/50">
                          <td className="py-1.5 px-2 font-sans font-semibold text-slate-900">{acc.name}</td>
                          <td className="py-1.5 px-2 text-slate-600">@{acc.username}</td>
                          <td className="py-1.5 px-2 font-sans">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                acc.permissionLevel === 'admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {acc.permissionLevel === 'admin' ? '管理員' : '一般使用者'}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-blue-700 font-bold">{acc.password || 'user123'}</td>
                          <td className="py-1.5 px-2 font-sans">
                            {acc.permissions.canDeleteTicket || acc.permissions.canCancelTicket ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> 可刪除
                              </span>
                            ) : (
                              <span className="text-rose-500 font-medium flex items-center gap-0.5">
                                <Ban className="w-3 h-3" /> 禁止
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 font-sans">
                            {acc.permissions.canManageTeam ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> 可維護
                              </span>
                            ) : (
                              <span className="text-rose-500 font-medium flex items-center gap-0.5">
                                <Ban className="w-3 h-3" /> 唯讀禁止
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'change_pwd' && currentAccount && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-md mx-auto py-2">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-[11px] text-blue-800">
                目前登入人員：<strong>{currentAccount.name}</strong> (@{currentAccount.username})。
                請輸入原密碼與欲設定的新密碼，完成後即可使用新密碼登入。
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">目前原密碼：</label>
                <input
                  type="password"
                  required
                  value={currentPwdInput}
                  onChange={(e) => setCurrentPwdInput(e.target.value)}
                  placeholder="請輸入原密碼"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">新密碼：</label>
                <input
                  type="password"
                  required
                  value={newPwdInput}
                  onChange={(e) => setNewPwdInput(e.target.value)}
                  placeholder="至少 4 位字元"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">確認新密碼：</label>
                <input
                  type="password"
                  required
                  value={confirmPwdInput}
                  onChange={(e) => setConfirmPwdInput(e.target.value)}
                  placeholder="再次輸入新密碼確認"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              {pwdChangeMsg && (
                <div
                  className={`p-2.5 rounded-lg border text-[11px] ${
                    pwdChangeMsg.isError
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {pwdChangeMsg.text}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  確認修改密碼
                </button>
              </div>
            </form>
          )}

          {tab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                可隨時建立新的測試人員帳戶，並設定<strong>「專屬登入密碼」</strong>與<strong>「權限層級」</strong>（管理員 vs 一般使用者），即刻驗證功能權限防護。
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    登入帳號 (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="例如: tech_taitung 或 admin_kyle"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    設定登入密碼 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="請設定密碼 (例: user123)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    人員真實姓名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如: 廖建華"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">
                    職稱與角色說明 <span className="text-slate-400 font-normal text-[11px]">(選填)</span>
                  </label>
                  <input
                    type="text"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    placeholder="選填，預設為「維護工程師」或「運維主管」"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">所屬部門</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="例如: 關山區巡修工程組"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">聯絡手機</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="09xx-xxx-xxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="block font-bold text-slate-800 text-xs">
                  設定此帳號的權限級別：
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      newLevel === 'admin'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value="admin"
                      checked={newLevel === 'admin'}
                      onChange={() => setNewLevel('admin')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        系統管理員 (Admin)
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        具備<strong>團隊人員維護</strong>與<strong>工單取消</strong>最高權限。
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      newLevel === 'user'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="level"
                      value="user"
                      checked={newLevel === 'user'}
                      onChange={() => setNewLevel('user')}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        一般使用者 (User)
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        <strong>無</strong>團隊管理權限，<strong>無</strong>工單取消權限。
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  確認建立帳戶並登入
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            安全機制：每位人員僅能透過個人密碼登入，保障責任明確與系統安全
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
