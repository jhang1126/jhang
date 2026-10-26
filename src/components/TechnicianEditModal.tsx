import React, { useState, useEffect } from 'react';
import { Technician, UserAccount, PermissionLevel } from '../types/ticket';
import { 
  X, 
  UserCheck, 
  Plus, 
  Check, 
  Trash2, 
  Phone, 
  Briefcase, 
  Award,
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface TechnicianEditModalProps {
  technician: Technician | 'new';
  accounts?: UserAccount[];
  onClose: () => void;
  onSave: (
    tech: Technician, 
    accountData?: {
      permissionLevel: PermissionLevel;
      username: string;
      password?: string;
    }
  ) => void;
}

const COMMON_SPECIALTIES = [
  '商用列表機',
  '家用列表機',
  '辦公儀器',
  '影音設備',
  '工程儀器',
  '雷射多功能複合機',
  '連續供墨印表機',
  '全測站光波經緯儀',
  '4K高階雷射投影機',
  '重型工業連續碎紙機',
  '電動裝訂膠裝機',
  '大圖工程繪圖機',
];

export const TechnicianEditModal: React.FC<TechnicianEditModalProps> = ({
  technician,
  accounts = [],
  onClose,
  onSave,
}) => {
  const isNew = technician === 'new';

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Technician['status']>('available');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Account & Permission State
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('user123');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (technician && technician !== 'new') {
      setName(technician.name);
      setTitle(technician.title);
      setPhone(technician.phone);
      setStatus(technician.status);
      setSpecialties(technician.specialties || []);

      // Find matching existing account
      const matchedAcc = accounts.find(
        (a) => a.associatedTechId === technician.id || a.name === technician.name
      );

      if (matchedAcc) {
        setPermissionLevel(matchedAcc.permissionLevel);
        setUsername(matchedAcc.username);
        setPassword(matchedAcc.password || (matchedAcc.permissionLevel === 'admin' ? 'admin123' : 'user123'));
      } else {
        const defaultLevel = technician.permissionLevel || 'user';
        setPermissionLevel(defaultLevel);
        setUsername(technician.username || `tech_${technician.id.replace(/[^a-zA-Z0-9]/g, '')}`);
        setPassword(defaultLevel === 'admin' ? 'admin123' : 'user123');
      }
    } else {
      setName('');
      setTitle('');
      setPhone('09');
      setStatus('available');
      setSpecialties(['商用列表機', '辦公儀器']);
      setPermissionLevel('user');
      setUsername('');
      setPassword('user123');
    }
  }, [technician, accounts]);

  // When changing permission level in new mode, update default password if unchanged
  const handlePermissionChange = (newLevel: PermissionLevel) => {
    setPermissionLevel(newLevel);
    if (password === 'user123' && newLevel === 'admin') {
      setPassword('admin123');
    } else if (password === 'admin123' && newLevel === 'user') {
      setPassword('user123');
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (specialties.includes(trimmed)) return;
    setSpecialties([...specialties, trimmed]);
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSpecialties(specialties.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('請輸入姓名');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('請輸入聯絡電話或手機');
      return;
    }
    if (specialties.length === 0) {
      setErrorMsg('請至少設定一項專業領域或技能標籤');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('請設定個人登入帳號');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('請設定個人登入密碼');
      return;
    }

    const techId = isNew ? `tech-${Date.now()}` : (technician as Technician).id;
    const finalTitle = title.trim() || (permissionLevel === 'admin' ? '運維管理主管' : '維護工程師');

    const techToSave: Technician = {
      id: techId,
      name: name.trim(),
      title: finalTitle,
      phone: phone.trim(),
      status,
      specialties,
      permissionLevel,
      username: username.trim(),
      activeTicketsCount: isNew ? 0 : (technician as Technician).activeTicketsCount,
      completedCount: isNew ? 0 : (technician as Technician).completedCount,
      rating: isNew ? 5.0 : (technician as Technician).rating,
    };

    onSave(techToSave, {
      permissionLevel,
      username: username.trim(),
      password: password.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isNew ? '新增人員' : `編輯人員資料：${name || (technician as Technician).name}`}
              </h2>
              <p className="text-xs text-slate-500">
                設定人員基本資料、專長範疇與系統登入身分權限
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                姓名 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="例如：陳建宏 或 林志豪"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                聯絡手機 / 廠內分機 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="例如：0912-345-678"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 font-mono text-xs"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Title & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                職稱 / 專業組別 <span className="text-slate-400 font-normal text-[11px]">(選填)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="選填，預設依身分指派（例如：維護工程師）"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 text-xs"
                />
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                當前出勤狀態
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Technician['status'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 text-xs font-medium"
              >
                <option value="available">待命中 · 在勤可派工/自主接單</option>
                <option value="busy">忙碌中 · 現場檢修施工中</option>
                <option value="off_duty">休假中 · 暫停派工/離線</option>
              </select>
            </div>
          </div>

          {/* Account & Permission Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-slate-800 font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>帳號身分與權限級別設定</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">控管工程師個人登入與系統操作權限</span>
            </div>

            {/* Permission Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* User Option */}
              <div
                onClick={() => handlePermissionChange('user')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  permissionLevel === 'user'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>使用者 (User)</span>
                  </div>
                  <input
                    type="radio"
                    name="permissionLevel"
                    checked={permissionLevel === 'user'}
                    onChange={() => handlePermissionChange('user')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  專職現場維修檢修、自選接單與進度填報。
                  <span className="text-rose-600 block mt-0.5 font-medium">✕ 無團隊人員管理及工單取消權限</span>
                </p>
              </div>

              {/* Admin Option */}
              <div
                onClick={() => handlePermissionChange('admin')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  permissionLevel === 'admin'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>系統管理員 (Admin)</span>
                  </div>
                  <input
                    type="radio"
                    name="permissionLevel"
                    checked={permissionLevel === 'admin'}
                    onChange={() => handlePermissionChange('admin')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  具備團隊管理與工單取消之最高權限。
                  <span className="text-emerald-700 block mt-0.5 font-bold">✓ 擁有團隊管理與工單取消權限</span>
                </p>
              </div>
            </div>

            {/* Login Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  個人登入帳號 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="例如：tech_wang"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 font-mono text-xs"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  個人登入密碼 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="例如：user123 或自訂密碼"
                    className="w-full pl-8 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 font-mono text-xs"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? '隱藏密碼' : '顯示密碼'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Specialties / Skill Tags */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-slate-700 font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                專業技術領域標籤 <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">系統將依此比對適合之叫修設備類別</span>
            </div>

            {/* Current Tags */}
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]">
              {specialties.length === 0 ? (
                <span className="text-slate-400 text-[11px] italic">尚未設定專長標籤，請點選下方常用標籤或自訂新增</span>
              ) : (
                specialties.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 font-medium text-xs shadow-2xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600 focus:outline-none ml-0.5"
                      title="移除此專長"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Custom Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(newTagInput);
                  }
                }}
                placeholder="手動輸入自訂專長領域 (按 Enter 新增)"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 text-xs"
              />
              <button
                type="button"
                onClick={() => handleAddTag(newTagInput)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                新增標籤
              </button>
            </div>

            {/* Common Preset Specialties Chips */}
            <div className="pt-1.5">
              <span className="text-[11px] text-slate-500 block mb-1.5">點選快速加入常用設備維修專業領域：</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SPECIALTIES.map((preset) => {
                  const isSelected = specialties.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          handleRemoveTag(preset);
                        } else {
                          handleAddTag(preset);
                        }
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Historical Statistics (Read-only if editing) */}
          {!isNew && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px]">
              <div>
                <span className="text-slate-400 block">當前進行中工單</span>
                <span className="font-mono font-bold text-blue-600 text-sm">
                  {(technician as Technician).activeTicketsCount} 件
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">累計完工數</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {(technician as Technician).completedCount} 件
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">客戶滿意度</span>
                <span className="font-mono font-bold text-amber-500 text-sm">
                  {(technician as Technician).rating} ★
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              {isNew ? '確認新增人員' : '儲存變更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
