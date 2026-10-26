import React from 'react';
import { Technician, Ticket, REGION_CONFIG } from '../types/ticket';
import { 
  Check, 
  Share2, 
  Play, 
  PauseCircle, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Printer,
  Sparkles,
  Inbox
} from 'lucide-react';
import { STATUS_MAP } from '../utils/formatters';

interface TechnicianBoardProps {
  currentTech: Technician;
  tickets: Ticket[];
  onAcceptTicket: (ticket: Ticket) => void;
  onSelfClaimTicket: (ticket: Ticket, tech: Technician) => void;
  onOpenTransfer: (ticket: Ticket) => void;
  onOpenProgress: (ticket: Ticket, mode: 'start' | 'waiting_parts' | 'resume' | 'complete') => void;
  onSelectTicket: (ticket: Ticket) => void;
  onOpenPrint: (ticket: Ticket) => void;
}

export const TechnicianBoard: React.FC<TechnicianBoardProps> = ({
  currentTech,
  tickets,
  onAcceptTicket,
  onSelfClaimTicket,
  onOpenTransfer,
  onOpenProgress,
  onSelectTicket,
  onOpenPrint,
}) => {
  // Public unassigned pool (pending_dispatch) - ANY technician can claim!
  const unassignedPool = tickets.filter((t) => t.status === 'pending_dispatch');

  // Tickets assigned directly to this technician
  const myTickets = tickets.filter(
    (t) => t.assignedTechnicianId === currentTech.id || t.assignedTechnicianName === currentTech.name
  );

  const pendingAccept = myTickets.filter((t) => t.status === 'dispatched');
  const activeJobs = myTickets.filter(
    (t) => t.status === 'accepted' || t.status === 'in_progress' || t.status === 'waiting_parts'
  );
  const completedJobs = myTickets.filter((t) => t.status === 'completed' || t.status === 'closed');

  return (
    <div className="space-y-6">
      {/* Technician Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {currentTech.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentTech.name} 工程師</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {currentTech.title}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{currentTech.phone}</span>
              <span>·</span>
              <span>專長：{currentTech.specialties.join('、')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 text-xs">
          <div>
            <div className="text-slate-400">待接單 / 進行中</div>
            <div className="text-xl font-bold font-mono text-blue-600 mt-0.5">
              {pendingAccept.length + activeJobs.length} <span className="text-xs font-normal text-slate-500">件</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400">工單池待接取</div>
            <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">
              {unassignedPool.length} <span className="text-xs font-normal text-slate-500">件可搶</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400">累計完工</div>
            <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">
              {completedJobs.length} <span className="text-xs font-normal text-slate-500">件</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400">服務評價</div>
            <div className="text-xl font-bold font-mono text-amber-500 mt-0.5">
              {currentTech.rating} ★
            </div>
          </div>
        </div>
      </div>

      {/* Zone 1: Public Unassigned Work Order Pool (Self-Claim) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h3 className="text-sm font-bold text-slate-900">
              待派工公共工單池 · 技師可直接自主接單 ({unassignedPool.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">未指定工程師，您可依專業領域直接領取</span>
        </div>

        {unassignedPool.length === 0 ? (
          <div className="p-5 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            目前公共工單池中無待接取工單，所有電話叫修均已被領取或指派。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unassignedPool.map((ticket) => {
              const isMatch = currentTech.specialties.some(
                (s) => ticket.equipmentCategory.includes(s) || s.includes(ticket.equipmentCategory)
              );
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl border-2 border-amber-300 hover:border-amber-400 p-5 shadow-xs space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {ticket.id}
                        </span>
                        {(() => {
                          const reg = ticket.region || '市區';
                          const rcfg = REGION_CONFIG[reg];
                          return (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${rcfg.badgeBg} ${rcfg.badgeText} ${rcfg.badgeBorder} flex items-center gap-1`}>
                              <span>{rcfg.iconEmoji}</span>
                              <span>{reg}</span>
                            </span>
                          );
                        })()}
                        <span className="text-xs text-amber-800 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          待接取
                        </span>
                        {isMatch && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            符合您專長
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        {ticket.customerName}
                      </h4>
                    </div>

                    <span className="text-xs font-mono text-slate-500">
                      {ticket.createdAt}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-700">
                    <div><strong>設備：</strong>{ticket.equipmentName} ({ticket.equipmentCode})</div>
                    <div><strong>類別：</strong>{ticket.equipmentCategory} · {ticket.faultCategory}</div>
                    <div className="text-slate-600 line-clamp-2"><strong>報修現象：</strong>{ticket.faultDescription}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ticket.address}</span>
                    </div>
                    <span className="text-blue-700 shrink-0 font-medium">
                      約定：{ticket.requestedVisitTime}
                    </span>
                  </div>

                  {/* Self-Claim Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectTicket(ticket)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      查看詳細
                    </button>

                    <button
                      onClick={() => onSelfClaimTicket(ticket, currentTech)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      由我自主接取此工單
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zone 2: Pending Acceptance Tickets (Directly Dispatched) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-blue-600" />
            專屬指派給我的工單 · 待確認 ({pendingAccept.length})
          </h3>
          <span className="text-xs text-slate-500">由派工主管指定指派</span>
        </div>

        {pendingAccept.length === 0 ? (
          <div className="p-5 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            目前無專屬指派的待確認工單。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAccept.map((ticket) => {
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl border-2 border-blue-400/80 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {ticket.id}
                        </span>
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                          {ticket.equipmentCategory}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        {ticket.customerName}
                      </h4>
                    </div>

                    <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                      指派時間: {ticket.dispatchedAt?.slice(11)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-700">
                    <div><strong>設備：</strong>{ticket.equipmentName} ({ticket.equipmentCode})</div>
                    <div className="text-slate-600"><strong>現象：</strong>{ticket.faultDescription}</div>
                    {ticket.dispatchNotes && (
                      <div className="text-blue-900 bg-blue-50/70 p-2 rounded border border-blue-100">
                        <strong>調度員指示：</strong>{ticket.dispatchNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="line-clamp-1">{ticket.address}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenTransfer(ticket)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      轉發給同仁
                    </button>

                    <button
                      onClick={() => onAcceptTicket(ticket)}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      確認接單並前往
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zone 2: Active Ongoing Jobs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-600" />
            現場維修處理中 ({activeJobs.length})
          </h3>
          <span className="text-xs text-slate-500">到場檢測、待料回報與完工登錄</span>
        </div>

        {activeJobs.length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            目前沒有進行中的維修任務。
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((ticket) => {
              const status = STATUS_MAP[ticket.status];
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {ticket.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm ml-1">
                        {ticket.customerName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenPrint(ticket)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded border border-slate-200"
                        title="列印工單"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectTicket(ticket)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        查看詳情 &rarr;
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
                    <div className="space-y-1">
                      <div><strong>設備名稱：</strong>{ticket.equipmentName} ({ticket.equipmentCode})</div>
                      <div><strong>故障狀況：</strong>{ticket.faultDescription}</div>
                      <div><strong>裝機位置：</strong>{ticket.locationRoom} · {ticket.address}</div>
                    </div>
                    <div className="space-y-1">
                      <div><strong>窗口電話：</strong>{ticket.contactPerson} ({ticket.contactPhone})</div>
                      {ticket.faultDiagnosis && (
                        <div><strong>現場診斷：</strong>{ticket.faultDiagnosis}</div>
                      )}
                      {ticket.waitingPartsReason && (
                        <div className="text-amber-700 font-medium">
                          <strong>待料原因：</strong>{ticket.waitingPartsReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Field actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    {/* Transfer Work Order */}
                    <button
                      onClick={() => onOpenTransfer(ticket)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 font-medium transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      轉發工單至其他技師
                    </button>

                    {/* Start repair if accepted */}
                    {ticket.status === 'accepted' && (
                      <button
                        onClick={() => onOpenProgress(ticket, 'start')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        抵達現場 / 開始檢修
                      </button>
                    )}

                    {/* Waiting parts */}
                    {ticket.status === 'in_progress' && (
                      <button
                        onClick={() => onOpenProgress(ticket, 'waiting_parts')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        標記待料
                      </button>
                    )}

                    {/* Resume if waiting parts */}
                    {ticket.status === 'waiting_parts' && (
                      <button
                        onClick={() => onOpenProgress(ticket, 'resume')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        料件已到 / 恢復施工
                      </button>
                    )}

                    {/* Complete repair */}
                    {ticket.status === 'in_progress' && (
                      <button
                        onClick={() => onOpenProgress(ticket, 'complete')}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        填報完工報告與耗材
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zone 3: Completed Tickets */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          我已完工的工單紀錄 ({completedJobs.length})
        </h3>

        {completedJobs.length === 0 ? (
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            暫無已完工紀錄
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
            {completedJobs.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t)}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{t.id}</span>
                    <span className="font-semibold text-slate-900">{t.customerName}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{t.equipmentName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    完工時間：{t.completedAt || '-'} · 零件品項：{t.partsUsed.length} 項
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {t.customerRating && (
                    <span className="font-semibold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Sparkles className="w-3 h-3" />
                      {t.customerRating} 星好評
                    </span>
                  )}
                  <span className="text-slate-400">&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
