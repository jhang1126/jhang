import React, { useState, useMemo } from 'react';
import { 
  Ticket, 
  TicketStatus, 
  UserRole, 
  UserAccount, 
  ServiceRegion, 
  SERVICE_REGIONS, 
  REGION_CONFIG,
  EquipmentCategory,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CATEGORY_CONFIG
} from '../types/ticket';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  UserCheck, 
  Share2, 
  Eye, 
  Printer, 
  Clock, 
  Check, 
  Wrench,
  CheckCircle2,
  FileSpreadsheet,
  Ban,
  Trash2,
  MapPin,
  LayoutGrid,
  List,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { STATUS_MAP } from '../utils/formatters';

interface TicketListProps {
  tickets: Ticket[];
  userRole?: UserRole;
  currentAccount: UserAccount;
  onSelectTicket: (ticket: Ticket) => void;
  onOpenDispatch: (ticket: Ticket) => void;
  onOpenTransfer: (ticket: Ticket) => void;
  onAcceptTicket: (ticket: Ticket) => void;
  onSelfClaimTicket: (ticket: Ticket) => void;
  onOpenProgress: (ticket: Ticket, mode: 'start' | 'waiting_parts' | 'resume' | 'complete') => void;
  onOpenSignoff: (ticket: Ticket) => void;
  onOpenPrint: (ticket: Ticket) => void;
  onExportCSV: () => void;
  onOpenDelete?: (ticket: Ticket) => void;
  onOpenCancel?: (ticket: Ticket) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  currentAccount,
  onSelectTicket,
  onOpenDispatch,
  onOpenTransfer,
  onAcceptTicket,
  onSelfClaimTicket,
  onOpenProgress,
  onOpenSignoff,
  onOpenPrint,
  onExportCSV,
  onOpenDelete,
  onOpenCancel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<ServiceRegion | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grouped_by_region' | 'table'>('grouped_by_region');
  const [sortBy, setSortBy] = useState<'createdAt' | 'status'>('createdAt');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Region collapsed state
  const [collapsedRegions, setCollapsedRegions] = useState<Record<ServiceRegion, boolean>>({
    市區: false,
    大武區: false,
    關山區: false,
    成功區: false,
  });

  const toggleRegionCollapse = (region: ServiceRegion) => {
    setCollapsedRegions((prev) => ({
      ...prev,
      [region]: !prev[region],
    }));
  };

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: tickets.length,
      pending_dispatch: tickets.filter((t) => t.status === 'pending_dispatch').length,
      dispatched: tickets.filter((t) => t.status === 'dispatched').length,
      in_progress: tickets.filter((t) => t.status === 'in_progress').length,
      waiting_parts: tickets.filter((t) => t.status === 'waiting_parts').length,
      completed: tickets.filter((t) => t.status === 'completed').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
      cancelled: tickets.filter((t) => t.status === 'cancelled').length,
    };
  }, [tickets]);

  // Region counts
  const regionCounts = useMemo(() => {
    return {
      all: tickets.length,
      市區: tickets.filter((t) => (t.region || '市區') === '市區').length,
      大武區: tickets.filter((t) => t.region === '大武區').length,
      關山區: tickets.filter((t) => t.region === '關山區').length,
      成功區: tickets.filter((t) => t.region === '成功區').length,
    };
  }, [tickets]);

  // Filtered & sorted tickets
  const filteredTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        const ticketRegion = t.region || '市區';
        if (regionFilter !== 'all' && ticketRegion !== regionFilter) return false;
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && t.equipmentCategory !== categoryFilter) return false;

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchId = t.id.toLowerCase().includes(q);
          const matchCustomer = t.customerName.toLowerCase().includes(q);
          const matchEquip = t.equipmentName.toLowerCase().includes(q);
          const matchCode = t.equipmentCode.toLowerCase().includes(q);
          const matchTech = (t.assignedTechnicianName || '').toLowerCase().includes(q);
          const matchDesc = t.faultDescription.toLowerCase().includes(q);
          const matchCancel = (t.cancelReason || '').toLowerCase().includes(q);
          const matchAddress = t.address.toLowerCase().includes(q);
          const matchRegion = ticketRegion.toLowerCase().includes(q);
          return matchId || matchCustomer || matchEquip || matchCode || matchTech || matchDesc || matchCancel || matchAddress || matchRegion;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'createdAt') {
          return sortAsc
            ? a.createdAt.localeCompare(b.createdAt)
            : b.createdAt.localeCompare(a.createdAt);
        }
        return sortAsc
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      });
  }, [tickets, regionFilter, statusFilter, categoryFilter, searchTerm, sortBy, sortAsc]);

  // Grouped tickets by region
  const ticketsByRegion = useMemo(() => {
    const grouped: Record<ServiceRegion, Ticket[]> = {
      市區: [],
      大武區: [],
      關山區: [],
      成功區: [],
    };

    filteredTickets.forEach((t) => {
      const reg = t.region || '市區';
      if (grouped[reg]) {
        grouped[reg].push(t);
      } else {
        grouped['市區'].push(t);
      }
    });

    return grouped;
  }, [filteredTickets]);

  const toggleSort = (field: 'createdAt' | 'status') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  // Helper for rendering ticket actions
  const renderActions = (ticket: Ticket) => {
    const isCancelled = ticket.status === 'cancelled';
    const isClosed = ticket.status === 'closed';
    const isPending = ticket.status === 'pending_dispatch';
    const isDispatched = ticket.status === 'dispatched';
    const isProgress = ticket.status === 'in_progress';
    const isWaitingParts = ticket.status === 'waiting_parts';
    const isCompleted = ticket.status === 'completed';

    const canDelete =
      currentAccount?.permissionLevel === 'admin' ||
      currentAccount?.permissions?.canDeleteTicket ||
      currentAccount?.permissions?.canCancelTicket;

    return (
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        <button
          onClick={() => onSelectTicket(ticket)}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          title="查看工單詳細資訊"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onOpenPrint(ticket)}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          title="列印工單記錄單"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>

        {/* Dispatch button */}
        {isPending && (
          <button
            onClick={() => onOpenDispatch(ticket)}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold shadow-2xs"
          >
            <UserCheck className="w-3 h-3" />
            <span>立即指派</span>
          </button>
        )}

        {/* Claim button if dispatched */}
        {isDispatched && !ticket.assignedTechnicianId && (
          <button
            onClick={() => onSelfClaimTicket(ticket)}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold shadow-2xs"
          >
            <Check className="w-3 h-3" />
            <span>技師接單</span>
          </button>
        )}

        {/* Transfer button */}
        {(isDispatched || isProgress || isWaitingParts) && (
          <button
            onClick={() => onOpenTransfer(ticket)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="轉發工單至其他技師"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* In-progress actions */}
        {isProgress && (
          <button
            onClick={() => onOpenProgress(ticket, 'complete')}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold shadow-2xs"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>申報完工</span>
          </button>
        )}

        {/* Waiting parts actions */}
        {isWaitingParts && (
          <button
            onClick={() => onOpenProgress(ticket, 'resume')}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md text-[11px] font-semibold shadow-2xs"
          >
            <Wrench className="w-3 h-3" />
            <span>恢復施工</span>
          </button>
        )}

        {/* Completed -> signoff */}
        {isCompleted && (
          <button
            onClick={() => onOpenSignoff(ticket)}
            className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[11px] font-semibold shadow-2xs"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>客戶驗收</span>
          </button>
        )}

        {/* Delete Ticket Button (Admin only: 刪除工單 · 完全刪除不留紀錄) */}
        {(onOpenDelete || onOpenCancel) && (
          <button
            onClick={() => {
              if (canDelete) {
                if (onOpenDelete) onOpenDelete(ticket);
                else if (onOpenCancel) onOpenCancel(ticket);
              }
            }}
            disabled={!canDelete}
            className={`p-1.5 rounded-md transition-colors ${
              canDelete
                ? 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title={canDelete ? '刪除工單 (管理員權限 · 完全清除不留紀錄)' : '刪除工單（僅系統管理員擁有刪除權限）'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Region Arrangement Banner & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                責任分區排列
              </span>
              <h2 className="font-bold text-sm text-slate-900">台東四大服務責任分區工單清冊</h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              依「市區、大武區、關山區、成功區」劃分責任維護範圍，支援分區彙整排列與個別工單狀態監控
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
            <button
              onClick={() => setViewMode('grouped_by_region')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === 'grouped_by_region'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>分區排列檢視</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>綜合列表清單</span>
            </button>
          </div>
        </div>

        {/* Region Filter Buttons */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>選擇責任分區：</span>
            {regionFilter !== 'all' && (
              <button
                onClick={() => setRegionFilter('all')}
                className="text-blue-600 hover:underline"
              >
                重設為全部分區
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {/* All Regions */}
            <button
              onClick={() => setRegionFilter('all')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                regionFilter === 'all'
                  ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>全部責任分區</span>
                <span
                  className={`font-mono text-xs px-1.5 py-0.2 rounded ${
                    regionFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {regionCounts.all}
                </span>
              </div>
              <div className={`text-[10px] mt-1 ${regionFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                涵蓋四大責任區全域
              </div>
            </button>

            {/* 4 Regions */}
            {SERVICE_REGIONS.map((reg) => {
              const cfg = REGION_CONFIG[reg];
              const isSelected = regionFilter === reg;
              const count = regionCounts[reg];

              return (
                <button
                  key={reg}
                  onClick={() => setRegionFilter(reg)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? `border-${cfg.themeColor}-600 ${cfg.badgeBg} ring-1 ring-${cfg.themeColor}-600 shadow-2xs`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>{cfg.iconEmoji}</span>
                      <span>{cfg.short}</span>
                    </span>
                    <span
                      className={`font-mono text-xs px-1.5 py-0.2 rounded font-bold ${
                        isSelected
                          ? `${cfg.badgeText} bg-white border ${cfg.badgeBorder}`
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate" title={cfg.townships}>
                    {cfg.townships}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            全部狀態 ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('pending_dispatch')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'pending_dispatch'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span>待派工</span>
            <span className="font-mono bg-amber-100/80 text-amber-900 px-1.5 py-0.2 rounded text-[11px]">
              {statusCounts.pending_dispatch}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('dispatched')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'dispatched'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>待接單</span>
            <span className="font-mono bg-blue-100/80 text-blue-900 px-1.5 py-0.2 rounded text-[11px]">
              {statusCounts.dispatched}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'in_progress'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-cyan-800 hover:bg-cyan-50'
            }`}
          >
            <span>維修中</span>
            <span className="font-mono bg-cyan-100/80 text-cyan-900 px-1.5 py-0.2 rounded text-[11px]">
              {statusCounts.in_progress}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('waiting_parts')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'waiting_parts'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-orange-700 hover:bg-orange-50'
            }`}
          >
            <span>待料中</span>
            <span className="font-mono bg-orange-100/80 text-orange-900 px-1.5 py-0.2 rounded text-[11px]">
              {statusCounts.waiting_parts}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>已完工</span>
            <span className="font-mono bg-emerald-100/80 text-emerald-900 px-1.5 py-0.2 rounded text-[11px]">
              {statusCounts.completed}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'closed'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>已結案</span>
            <span className="font-mono bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded text-[11px]">
              {statusCounts.closed}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'cancelled'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            <span>已取消</span>
            <span className="font-mono bg-rose-100/80 text-rose-900 px-1.5 py-0.2 rounded text-[11px]">
              {statusCounts.cancelled}
            </span>
          </button>
        </div>

        {/* Search & filters row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋工單號、分區、客戶、設備名稱、編號或技師..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>設備類別:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700 font-medium"
              >
                <option value="all">全類別 (5大類)</option>
                {EQUIPMENT_CATEGORIES.map((cat) => {
                  const cfg = EQUIPMENT_CATEGORY_CONFIG[cat];
                  return (
                    <option key={cat} value={cat}>
                      {cfg?.iconEmoji} {cat}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
              title="匯出工單清冊為 CSV 檔案"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>匯出分區 CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MODE A: Grouped by Region View (分區排列檢視) */}
      {viewMode === 'grouped_by_region' && (
        <div className="space-y-6">
          {SERVICE_REGIONS.map((regionKey) => {
            if (regionFilter !== 'all' && regionFilter !== regionKey) return null;

            const regionTickets = ticketsByRegion[regionKey];
            const cfg = REGION_CONFIG[regionKey];
            const isCollapsed = collapsedRegions[regionKey];

            const pendingCount = regionTickets.filter((t) => t.status === 'pending_dispatch').length;
            const inProgressCount = regionTickets.filter((t) => t.status === 'in_progress').length;
            const waitingCount = regionTickets.filter((t) => t.status === 'waiting_parts').length;
            const completedCount = regionTickets.filter((t) => t.status === 'completed' || t.status === 'closed').length;

            return (
              <div
                key={regionKey}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                {/* Region Section Header */}
                <div
                  onClick={() => toggleRegionCollapse(regionKey)}
                  className={`px-5 py-3.5 border-b border-slate-200 cursor-pointer select-none flex flex-col md:flex-row md:items-center justify-between gap-3 ${cfg.cardBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                      {cfg.iconEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{cfg.label}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder}`}>
                          {regionTickets.length} 張工單
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        管轄涵蓋：{cfg.townships} · {cfg.description}
                      </p>
                    </div>
                  </div>

                  {/* Regional quick metric tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium">
                      待派工: <strong className="text-amber-700 font-mono font-bold">{pendingCount}</strong>
                    </span>
                    <span className="text-[11px] bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium">
                      檢修中: <strong className="text-cyan-800 font-mono font-bold">{inProgressCount}</strong>
                    </span>
                    <span className="text-[11px] bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium">
                      待料: <strong className="text-orange-700 font-mono font-bold">{waitingCount}</strong>
                    </span>
                    <span className="text-[11px] bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium">
                      完工/結案: <strong className="text-emerald-700 font-mono font-bold">{completedCount}</strong>
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                      title={isCollapsed ? '展開此分區工單' : '摺疊此分區工單'}
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Region Tickets Table / Cards */}
                {!isCollapsed && (
                  <div>
                    {regionTickets.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        此責任分區目前無符合搜尋或篩選條件的工單
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold select-none text-[11px]">
                              <th className="py-2.5 px-4">工單編號 / 叫修時段</th>
                              <th className="py-2.5 px-4">客戶名稱 / 詳細地址</th>
                              <th className="py-2.5 px-4">設備規格 / 故障現況</th>
                              <th className="py-2.5 px-3">狀態進度</th>
                              <th className="py-2.5 px-3">主責技師</th>
                              <th className="py-2.5 px-4 text-right">作業操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {regionTickets.map((t) => {
                              const st = STATUS_MAP[t.status];
                              const isCancelled = t.status === 'cancelled';

                              return (
                                <tr
                                  key={t.id}
                                  className={`hover:bg-slate-50/80 transition-colors ${
                                    isCancelled ? 'bg-slate-50/50 opacity-80' : ''
                                  }`}
                                >
                                  {/* Ticket ID & Time */}
                                  <td className="py-3 px-4 align-top">
                                    <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                                      <span
                                        onClick={() => onSelectTicket(t)}
                                        className="cursor-pointer hover:text-blue-600 hover:underline"
                                      >
                                        {t.id}
                                      </span>
                                      {isCancelled && (
                                        <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded font-sans">
                                          已撤銷
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{t.createdAt}</span>
                                    </div>
                                    <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                                      {t.requestedVisitTime}
                                    </div>
                                  </td>

                                  {/* Customer & Address */}
                                  <td className="py-3 px-4 align-top max-w-[200px]">
                                    <div className="font-bold text-slate-900 truncate" title={t.customerName}>
                                      {t.customerName}
                                    </div>
                                    <div className="text-[11px] text-slate-600 truncate mt-0.5">
                                      {t.contactPerson} ({t.contactPhone})
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5" title={t.address}>
                                      <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                                      <span className="truncate">{t.address}</span>
                                    </div>
                                  </td>

                                  {/* Equipment & Fault */}
                                  <td className="py-3 px-4 align-top max-w-[240px]">
                                    <div className="flex items-center gap-1.5">
                                      {(() => {
                                        const catCfg = EQUIPMENT_CATEGORY_CONFIG[t.equipmentCategory as EquipmentCategory];
                                        return (
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 shrink-0 ${
                                            catCfg ? `${catCfg.badgeBg} ${catCfg.badgeText} ${catCfg.badgeBorder}` : 'bg-slate-100 text-slate-700 border-slate-200'
                                          }`}>
                                            <span>{catCfg?.iconEmoji}</span>
                                            <span>{t.equipmentCategory}</span>
                                          </span>
                                        );
                                      })()}
                                      <span className="font-medium text-slate-800 truncate" title={t.equipmentName}>
                                        {t.equipmentName}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-600 line-clamp-2 mt-1" title={t.faultDescription}>
                                      {t.faultDescription}
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-3 px-3 align-top whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.text} ${st.border}`}
                                    >
                                      {isCancelled && <Ban className="w-3 h-3 text-rose-600" />}
                                      {st.label}
                                    </span>
                                    {isCancelled && t.cancelReason && (
                                      <div className="text-[10px] text-rose-600 max-w-[120px] truncate mt-1" title={t.cancelReason}>
                                        原因: {t.cancelReason}
                                      </div>
                                    )}
                                  </td>

                                  {/* Technician */}
                                  <td className="py-3 px-3 align-top whitespace-nowrap">
                                    {t.assignedTechnicianName ? (
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                                          {t.assignedTechnicianName.slice(0, 1)}
                                        </div>
                                        <span className="font-medium text-slate-900">{t.assignedTechnicianName}</span>
                                      </div>
                                    ) : (
                                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                        待派專案技師
                                      </span>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                                    {renderActions(t)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MODE B: Consolidated Table View (綜合清單檢視) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                  <th
                    onClick={() => toggleSort('createdAt')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>工單號 / 叫修時間</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3">責任分區</th>
                  <th className="py-3 px-4">客戶名稱 / 聯絡窗口</th>
                  <th className="py-3 px-4">設備名稱 / 故障現況</th>
                  <th
                    onClick={() => toggleSort('status')}
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>進度狀態</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3">指派維修技師</th>
                  <th className="py-3 px-4 text-right">作業操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-slate-300" />
                        <p>無符合條件的叫修工單</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const st = STATUS_MAP[t.status];
                    const reg = t.region || '市區';
                    const regCfg = REGION_CONFIG[reg];
                    const isCancelled = t.status === 'cancelled';

                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCancelled ? 'bg-slate-50/60 opacity-80' : ''
                        }`}
                      >
                        {/* ID and Created */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <span
                              onClick={() => onSelectTicket(t)}
                              className="cursor-pointer hover:text-blue-600 hover:underline"
                            >
                              {t.id}
                            </span>
                            {isCancelled && (
                              <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded font-sans">
                                取消
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{t.createdAt}</span>
                          </div>
                          <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                            {t.requestedVisitTime}
                          </div>
                        </td>

                        {/* Region */}
                        <td className="py-3.5 px-3 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${regCfg.badgeBg} ${regCfg.badgeText} ${regCfg.badgeBorder}`}
                          >
                            <span>{regCfg.iconEmoji}</span>
                            <span>{regCfg.short}</span>
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4 align-top max-w-[200px]">
                          <div className="font-bold text-slate-900 truncate" title={t.customerName}>
                            {t.customerName}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate mt-0.5">
                            {t.contactPerson} · {t.contactPhone}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5" title={t.address}>
                            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate">{t.address}</span>
                          </div>
                        </td>

                        {/* Equipment */}
                        <td className="py-3.5 px-4 align-top max-w-[240px]">
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const catCfg = EQUIPMENT_CATEGORY_CONFIG[t.equipmentCategory as EquipmentCategory];
                              return (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 shrink-0 ${
                                  catCfg ? `${catCfg.badgeBg} ${catCfg.badgeText} ${catCfg.badgeBorder}` : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  <span>{catCfg?.iconEmoji}</span>
                                  <span>{t.equipmentCategory}</span>
                                </span>
                              );
                            })()}
                            <span className="font-medium text-slate-800 truncate" title={t.equipmentName}>
                              {t.equipmentName}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 line-clamp-2 mt-1" title={t.faultDescription}>
                            {t.faultDescription}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.text} ${st.border}`}
                          >
                            {isCancelled && <Ban className="w-3 h-3 text-rose-600" />}
                            {st.label}
                          </span>
                        </td>

                        {/* Tech */}
                        <td className="py-3.5 px-3 align-top whitespace-nowrap">
                          {t.assignedTechnicianName ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                                {t.assignedTechnicianName.slice(0, 1)}
                              </div>
                              <span className="font-medium text-slate-900">{t.assignedTechnicianName}</span>
                            </div>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                              待派工
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          {renderActions(t)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
