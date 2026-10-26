import React, { useState } from 'react';
import { 
  Technician, 
  Ticket, 
  ServiceRegion, 
  SERVICE_REGIONS, 
  REGION_CONFIG,
  EQUIPMENT_CATEGORY_CONFIG 
} from '../types/ticket';
import { 
  UserCheck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  ArrowRight,
  ShieldAlert,
  Edit3,
  Plus
} from 'lucide-react';

interface DispatchWorkbenchProps {
  tickets: Ticket[];
  technicians: Technician[];
  canManageTeam?: boolean;
  onOpenDispatch: (ticket: Ticket) => void;
  onSelfClaimTicket: (ticket: Ticket) => void;
  onSelectTicket: (ticket: Ticket) => void;
  onOpenTransfer: (ticket: Ticket) => void;
  onOpenEditTech?: (tech: Technician) => void;
  onOpenCreateTech?: () => void;
  onManageTeam?: () => void;
}

export const DispatchWorkbench: React.FC<DispatchWorkbenchProps> = ({
  tickets,
  technicians,
  canManageTeam = true,
  onOpenDispatch,
  onSelfClaimTicket,
  onSelectTicket,
  onOpenTransfer,
  onOpenEditTech,
  onOpenCreateTech,
  onManageTeam,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<ServiceRegion | 'all'>('all');

  // Filter tickets by region if selected
  const regionFilteredTickets = tickets.filter((t) => {
    if (selectedRegion === 'all') return true;
    return (t.region || '市區') === selectedRegion;
  });

  const pendingTickets = regionFilteredTickets.filter((t) => t.status === 'pending_dispatch');
  const awaitingPickupTickets = regionFilteredTickets.filter((t) => t.status === 'dispatched');
  const inProgressTickets = regionFilteredTickets.filter((t) => t.status === 'in_progress' || t.status === 'waiting_parts');

  return (
    <div className="space-y-6">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
              待指派派工工單
            </div>
            <div className="text-2xl font-bold font-mono text-amber-900 mt-1">
              {pendingTickets.length} <span className="text-xs font-normal text-amber-700">件急需安排</span>
            </div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>

        <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
              已派工 · 待技師接單
            </div>
            <div className="text-2xl font-bold font-mono text-blue-900 mt-1">
              {awaitingPickupTickets.length} <span className="text-xs font-normal text-blue-700">件等待確認</span>
            </div>
          </div>
          <Clock className="w-8 h-8 text-blue-500" />
        </div>

        <div className="bg-cyan-500/10 border border-cyan-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-cyan-800 uppercase tracking-wide">
              現場維修施工中
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-900 mt-1">
              {inProgressTickets.length} <span className="text-xs font-normal text-cyan-700">件正在檢修</span>
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-cyan-500" />
        </div>
      </div>

      {/* Main Grid: Pending Tickets (Left) & Technicians Roster (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Dispatch Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              待派工佇列 ({pendingTickets.length})
            </h3>

            {/* Region Filter in Dispatch Workbench */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setSelectedRegion('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedRegion === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                全區
              </button>
              {SERVICE_REGIONS.map((reg) => {
                const cfg = REGION_CONFIG[reg];
                const isSelected = selectedRegion === reg;
                return (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                      isSelected
                        ? `${cfg.badgeBg} ${cfg.badgeText} font-bold border ${cfg.badgeBorder} shadow-2xs`
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cfg.iconEmoji}</span>
                    <span>{cfg.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {pendingTickets.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <div className="font-semibold text-slate-700 text-sm">
                {selectedRegion === 'all' ? '所有叫修均已完成派工' : `【${selectedRegion}】目前無滯留的待派工單`}
              </div>
              <div className="text-xs text-slate-400 mt-1">目前無任何滯留中的待派工單</div>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTickets.map((ticket) => {
                const reg = ticket.region || '市區';
                const regCfg = REGION_CONFIG[reg];

                return (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {ticket.id}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${regCfg.badgeBg} ${regCfg.badgeText} ${regCfg.badgeBorder} flex items-center gap-1`}>
                            <span>{regCfg.iconEmoji}</span>
                            <span>{reg}</span>
                          </span>
                          {(() => {
                            const catCfg = EQUIPMENT_CATEGORY_CONFIG[ticket.equipmentCategory];
                            return (
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                catCfg ? `${catCfg.badgeBg} ${catCfg.badgeText} ${catCfg.badgeBorder}` : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                <span>{catCfg?.iconEmoji}</span>
                                <span>{ticket.equipmentCategory}</span>
                              </span>
                            );
                          })()}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">
                          {ticket.customerName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onSelfClaimTicket(ticket)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          title="技師自選接單"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          自選接單
                        </button>
                        <button
                          onClick={() => onOpenDispatch(ticket)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          指派技師
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700">
                      <div>
                        <strong>設備：</strong>{ticket.equipmentName} ({ticket.equipmentCode})
                      </div>
                      <div className="text-slate-600">
                        <strong>故障描述：</strong>{ticket.faultDescription}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 truncate max-w-[280px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{ticket.address}</span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-600 font-medium whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        <span>期望時段: {ticket.requestedVisitTime}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Secondary section: Dispatched waiting acceptance */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              已派工等待技師接單中 ({awaitingPickupTickets.length})
            </h3>
            {awaitingPickupTickets.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-400 text-center">
                無等待技師接單的工單
              </div>
            ) : (
              <div className="space-y-2">
                {awaitingPickupTickets.map((t) => {
                  const reg = t.region || '市區';
                  const regCfg = REGION_CONFIG[reg];

                  return (
                    <div
                      key={t.id}
                      className="p-3 bg-white rounded-lg border border-blue-200 flex items-center justify-between gap-3 text-xs shadow-xs"
                    >
                      <div className="truncate flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{t.id}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${regCfg.badgeBg} ${regCfg.badgeText} ${regCfg.badgeBorder}`}>
                          {reg}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-800 truncate">{t.customerName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 truncate">{t.equipmentName}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                          已派：{t.assignedTechnicianName}
                        </span>
                        <button
                          onClick={() => onSelectTicket(t)}
                          className="text-slate-500 hover:text-blue-600 text-xs flex items-center gap-0.5"
                        >
                          查看
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Technicians Roster */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                維護工程師出勤狀態名冊 ({technicians.length})
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                即時掌握全區技師目前在勤件數與專長
              </p>
            </div>

            <div className="flex items-center gap-2">
              {canManageTeam && onOpenCreateTech && (
                <button
                  onClick={onOpenCreateTech}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                  title="新增人員（管理員或使用者）"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增人員
                </button>
              )}
              {onManageTeam && (
                <button
                  onClick={onManageTeam}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                >
                  管理名冊
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {technicians.map((tech) => {
              const isAvailable = tech.status === 'available';
              const isBusy = tech.status === 'busy';

              return (
                <div
                  key={tech.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                        {tech.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{tech.name}</h4>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : isBusy
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isAvailable ? '可接新單' : isBusy ? '出勤檢修中' : '休息待命中'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{tech.title}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canManageTeam && onOpenEditTech && (
                        <button
                          onClick={() => onOpenEditTech(tech)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors"
                          title="編輯工程師資料"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <a
                        href={`tel:${tech.phone}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title={`致電給 ${tech.name} (${tech.phone})`}
                      >
                        <PhoneCall className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {tech.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px]">進行中工單</div>
                      <div className="font-bold font-mono text-slate-800 mt-0.5">
                        {tech.activeTicketsCount} 件
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">已累計完工</div>
                      <div className="font-bold font-mono text-slate-800 mt-0.5">
                        {tech.completedCount} 件
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">客戶評價</div>
                      <div className="font-bold font-mono text-amber-600 mt-0.5">
                        ⭐ {tech.rating}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
