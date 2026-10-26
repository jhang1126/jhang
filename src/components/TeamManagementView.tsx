import React, { useState, useMemo } from 'react';
import { Technician, UserAccount, PermissionLevel } from '../types/ticket';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Phone, 
  Briefcase, 
  Award, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Coffee,
  ShieldCheck,
  AlertCircle,
  ShieldAlert,
  Lock,
  User,
  KeyRound,
  Users
} from 'lucide-react';

interface TeamManagementViewProps {
  technicians: Technician[];
  accounts?: UserAccount[];
  currentAccount: UserAccount;
  onOpenCreate: () => void;
  onOpenEdit: (tech: Technician) => void;
  onDeletePerson: (person: UnifiedPersonnelItem) => void;
  onDeleteTech?: (techId: string) => void;
  onToggleStatus: (techId: string, status: Technician['status']) => void;
}

export interface UnifiedPersonnelItem {
  id: string; // unique member key
  techId?: string;
  accountId?: string;
  name: string;
  username: string;
  roleTitle: string;
  department: string;
  phone: string;
  permissionLevel: PermissionLevel;
  status: Technician['status'];
  specialties: string[];
  activeTicketsCount: number;
  completedCount: number;
  rating: number;
  isDispatchable: boolean;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  technicians,
  accounts = [],
  currentAccount,
  onOpenCreate,
  onOpenEdit,
  onDeletePerson,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Technician['status']>('all');

  const canManage = currentAccount.permissions.canManageTeam;

  // Unify all personnel across all tiers: both Administrators and Users
  const allPersonnel = useMemo(() => {
    const list: UnifiedPersonnelItem[] = [];
    const processedTechIds = new Set<string>();

    // 1. Process all registered accounts
    accounts.forEach((acc) => {
      const matchedTech = technicians.find(
        (t) => t.id === acc.associatedTechId || t.name === acc.name || (t.username && t.username === acc.username)
      );

      if (matchedTech) {
        processedTechIds.add(matchedTech.id);
      }

      list.push({
        id: acc.id,
        techId: matchedTech?.id || acc.associatedTechId,
        accountId: acc.id,
        name: acc.name,
        username: acc.username,
        roleTitle: acc.roleTitle,
        department: acc.department || '運維管理處',
        phone: acc.phone,
        permissionLevel: acc.permissionLevel,
        status: matchedTech ? matchedTech.status : 'available',
        specialties: matchedTech
          ? matchedTech.specialties
          : acc.permissionLevel === 'admin'
          ? ['全域調度指揮', '團隊人員管理', '刪除工單權限']
          : ['客戶叫修受理', '工單進度追蹤'],
        activeTicketsCount: matchedTech ? matchedTech.activeTicketsCount : 0,
        completedCount: matchedTech ? matchedTech.completedCount : 0,
        rating: matchedTech ? matchedTech.rating : 5.0,
        isDispatchable: !!matchedTech,
      });
    });

    // 2. Add any technicians not yet in accounts list
    technicians.forEach((t) => {
      if (!processedTechIds.has(t.id)) {
        list.push({
          id: t.id,
          techId: t.id,
          accountId: undefined,
          name: t.name,
          username: t.username || `tech_${t.id.replace(/[^a-zA-Z0-9]/g, '')}`,
          roleTitle: t.title,
          department: '維護技術工程組',
          phone: t.phone,
          permissionLevel: t.permissionLevel || 'user',
          status: t.status,
          specialties: t.specialties,
          activeTicketsCount: t.activeTicketsCount,
          completedCount: t.completedCount,
          rating: t.rating,
          isDispatchable: true,
        });
      }
    });

    return list;
  }, [accounts, technicians]);

  // Overall Statistics
  const stats = useMemo(() => {
    return {
      total: allPersonnel.length,
      admins: allPersonnel.filter((p) => p.permissionLevel === 'admin').length,
      users: allPersonnel.filter((p) => p.permissionLevel === 'user').length,
      available: allPersonnel.filter((p) => p.status === 'available').length,
      busy: allPersonnel.filter((p) => p.status === 'busy').length,
      off_duty: allPersonnel.filter((p) => p.status === 'off_duty').length,
      totalActiveTickets: allPersonnel.reduce((acc, p) => acc + p.activeTicketsCount, 0),
    };
  }, [allPersonnel]);

  // Filtered personnel
  const filteredPersonnel = useMemo(() => {
    return allPersonnel.filter((person) => {
      if (levelFilter !== 'all' && person.permissionLevel !== levelFilter) return false;
      if (statusFilter !== 'all' && person.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = person.name.toLowerCase().includes(q);
        const matchUsername = person.username.toLowerCase().includes(q);
        const matchTitle = person.roleTitle.toLowerCase().includes(q);
        const matchDepartment = person.department.toLowerCase().includes(q);
        const matchPhone = person.phone.toLowerCase().includes(q);
        const matchSpec = person.specialties.some((s) => s.toLowerCase().includes(q));
        return matchName || matchUsername || matchTitle || matchDepartment || matchPhone || matchSpec;
      }
      return true;
    });
  }, [allPersonnel, levelFilter, statusFilter, searchTerm]);

  const handleEditPerson = (person: UnifiedPersonnelItem) => {
    // Construct technician object for editing in modal
    const techToEdit: Technician = {
      id: person.techId || person.id,
      name: person.name,
      title: person.roleTitle,
      phone: person.phone,
      status: person.status,
      specialties: person.specialties,
      permissionLevel: person.permissionLevel,
      username: person.username,
      activeTicketsCount: person.activeTicketsCount,
      completedCount: person.completedCount,
      rating: person.rating,
    };
    onOpenEdit(techToEdit);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">團隊人員管理</h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                canManage
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800 flex items-center gap-1'
              }`}
            >
              {canManage ? '管理員授權模式' : (
                <>
                  <Lock className="w-3 h-3" />
                  使用者唯讀檢視模式
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            完整呈現全體層級人員名冊（管理員與使用者），支援資料編輯修改、出勤排班與權限設定
          </p>
        </div>

        {canManage ? (
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            + 新增人員
          </button>
        ) : (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold border border-slate-200 cursor-not-allowed shrink-0"
            title="您目前的帳戶權限為「一般使用者」，無團隊人員新增與管理權限"
          >
            <Lock className="w-4 h-4" />
            + 新增人員 (限管理員)
          </button>
        )}
      </div>

      {/* Permission Restriction Banner for Non-Admin */}
      {!canManage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
              <span>帳戶權限限制提示（目前身分：一般使用者）</span>
              <span className="font-normal font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-amber-200">
                {currentAccount.name} (@{currentAccount.username})
              </span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              依系統安全設定，<strong>一般使用者帳戶無「團隊人員管理權限」</strong>。您在此僅能檢視全員名單與在勤狀態，無法新增或修改人員。若需編輯修改人員資料，請切換登入為<strong>系統管理員帳戶</strong>。
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-400 font-medium">全員編制總數</div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {stats.total} <span className="text-xs font-normal text-slate-500">人</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span className="text-amber-700 font-semibold">{stats.admins} 管理員</span>
            <span>·</span>
            <span className="text-sky-700 font-semibold">{stats.users} 使用者</span>
          </div>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs space-y-1">
          <div className="text-amber-800 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            系統管理員 (全權限)
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900">
            {stats.admins} <span className="text-xs font-normal text-amber-700">位</span>
          </div>
          <div className="text-[11px] text-amber-700">具備團隊管理與取消權限</div>
        </div>

        <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 shadow-xs space-y-1">
          <div className="text-sky-800 font-medium flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-sky-600" />
            一般使用者 (專責操作)
          </div>
          <div className="text-2xl font-bold font-mono text-sky-900">
            {stats.users} <span className="text-xs font-normal text-sky-700">位</span>
          </div>
          <div className="text-[11px] text-sky-700">專責檢修接單與服務台</div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs space-y-1">
          <div className="text-emerald-800 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            在勤待命正常
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {stats.available} <span className="text-xs font-normal text-emerald-600">位</span>
          </div>
          <div className="text-[11px] text-emerald-600">可即時出勤或接單處理</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs">
        {/* Tier / Level Segmented Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-slate-400 font-semibold shrink-0">層級篩選：</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                levelFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部人員 ({stats.total})
            </button>
            <button
              onClick={() => setLevelFilter('admin')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                levelFilter === 'admin'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-amber-800 hover:bg-amber-100/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>系統管理員 ({stats.admins})</span>
            </button>
            <button
              onClick={() => setLevelFilter('user')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                levelFilter === 'user'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-sky-800 hover:bg-sky-100/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>一般使用者 ({stats.users})</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

          {/* Status Quick Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium shrink-0"
          >
            <option value="all">全體出勤狀態</option>
            <option value="available">🟢 待命中 (可即刻派工)</option>
            <option value="busy">🔵 檢修忙碌中</option>
            <option value="off_duty">⚪ 休假中 / 暫停派工</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋姓名、帳號、職稱或專長..."
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 text-xs"
          />
        </div>
      </div>

      {/* Personnel Grid List (All tiers: Admins & Users) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonnel.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">查無符合條件的團隊人員</p>
            <p className="text-xs text-slate-400">請嘗試清除搜尋條件，或點選上方按鈕新增人員</p>
          </div>
        ) : (
          filteredPersonnel.map((person) => {
            const isAdmin = person.permissionLevel === 'admin';
            const isAvail = person.status === 'available';
            const isBusy = person.status === 'busy';
            const isSelf = currentAccount && (person.accountId === currentAccount.id || person.username === currentAccount.username);

            return (
              <div
                key={person.id}
                className={`bg-white rounded-xl border transition-all flex flex-col justify-between p-5 space-y-4 shadow-xs hover:shadow-md ${
                  isAdmin
                    ? 'border-amber-200/90 hover:border-amber-400'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                {/* Header: Avatar, Name, Title, and Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar with Tier Badging */}
                      <div
                        className={`w-11 h-11 rounded-xl text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 ${
                          isAdmin
                            ? 'bg-gradient-to-br from-amber-500 to-amber-700'
                            : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                        }`}
                      >
                        {person.name.slice(0, 1)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base truncate">
                            {person.name}
                          </h3>
                          {isSelf && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                              目前登入者
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate" title={person.roleTitle}>
                          <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{person.roleTitle}</span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Status Badge */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 border whitespace-nowrap ${
                        isAvail
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isBusy
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {isAvail ? '🟢 待命中' : isBusy ? '🔵 檢修中' : '⚪ 休假停派'}
                    </span>
                  </div>

                  {/* Permission & Account Info Badge */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isAdmin
                            ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                            : 'bg-sky-100/80 text-sky-900 border-sky-300'
                        }`}
                      >
                        {isAdmin ? (
                          <ShieldCheck className="w-3 h-3 text-amber-700" />
                        ) : (
                          <User className="w-3 h-3 text-sky-700" />
                        )}
                        <span>{isAdmin ? '系統管理員 (Admin)' : '一般使用者 (User)'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600">
                      <KeyRound className="w-3 h-3 text-slate-400" />
                      <span>@{person.username}</span>
                    </div>
                  </div>

                  {/* Phone & Department */}
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <div className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{person.phone}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate max-w-[130px]" title={person.department}>
                      {person.department}
                    </span>
                  </div>

                  {/* Specialties & Responsibilities */}
                  <div className="space-y-1 text-xs pt-1">
                    <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
                      <Award className="w-3 h-3 text-blue-500" />
                      {isAdmin ? '管理與職能職掌：' : '專業技術與負責領域：'}
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {person.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Metrics if dispatchable */}
                  {person.isDispatchable && (
                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50/70 p-2 rounded-lg border border-slate-100 text-[11px]">
                      <div>
                        <div className="text-slate-400">進行中</div>
                        <div className="font-mono font-bold text-blue-600 mt-0.5">
                          {person.activeTicketsCount} 件
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">完工結案</div>
                        <div className="font-mono font-bold text-slate-800 mt-0.5">
                          {person.completedCount} 件
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">客戶評分</div>
                        <div className="font-mono font-bold text-amber-500 mt-0.5">
                          {person.rating} ★
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {/* Status Toggle if Dispatchable & Admin */}
                    {canManage && person.techId ? (
                      <select
                        value={person.status}
                        onChange={(e) => onToggleStatus(person.techId!, e.target.value as Technician['status'])}
                        className="text-[11px] font-medium px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        title="切換人員出勤排班狀態"
                      >
                        <option value="available">待命可派工</option>
                        <option value="busy">檢修中</option>
                        <option value="off_duty">休假停派</option>
                      </select>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {isAdmin ? '👑 具備管理員權限' : '👤 使用者帳戶'}
                      </span>
                    )}

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {canManage ? (
                        <>
                          <button
                            onClick={() => handleEditPerson(person)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors border border-blue-200"
                            title="編輯修改此人員之姓名、職稱、帳號密碼、權限與專長"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>編輯修改</span>
                          </button>

                          <button
                            onClick={() => onDeletePerson(person)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-300"
                            title={`刪除帳號：${person.name} (${person.permissionLevel === 'admin' ? '系統管理員' : '一般使用者'})`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">唯讀檢視</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
