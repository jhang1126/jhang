import { Ticket, UserRole, UserAccount, REGION_CONFIG, EQUIPMENT_CATEGORY_CONFIG } from '../types/ticket';
import { 
  X, 
  Clock, 
  MapPin, 
  Phone, 
  Wrench, 
  Share2, 
  CheckCircle2, 
  Printer, 
  UserCheck, 
  Play, 
  PauseCircle, 
  History,
  Building,
  Check,
  Ban,
  Trash2,
  Lock
} from 'lucide-react';
import { STATUS_MAP, WORKFLOW_STEPS } from '../utils/formatters';

interface TicketDetailModalProps {
  ticket: Ticket;
  userRole?: UserRole;
  currentAccount: UserAccount;
  onClose: () => void;
  onOpenDispatch: () => void;
  onOpenTransfer: () => void;
  onAcceptTicket: () => void;
  onSelfClaimTicket: () => void;
  onOpenProgress: (mode: 'start' | 'waiting_parts' | 'resume' | 'complete') => void;
  onOpenSignoff: () => void;
  onOpenPrint: () => void;
  onOpenDelete?: () => void;
  onOpenCancel?: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  currentAccount,
  onClose,
  onOpenDispatch,
  onOpenTransfer,
  onAcceptTicket,
  onSelfClaimTicket,
  onOpenProgress,
  onOpenSignoff,
  onOpenPrint,
  onOpenDelete,
  onOpenCancel,
}) => {
  const statusInfo = STATUS_MAP[ticket.status] || {
    label: ticket.status,
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    border: 'border-slate-200',
    stepIndex: -1,
  };
  const partsTotal = ticket.partsUsed?.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0) || 0;
  const isCancelled = ticket.status === 'cancelled';

  // Workflow progress index
  const currentStepIdx = statusInfo.stepIndex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200">
              {ticket.id}
            </span>
            {(() => {
              const reg = ticket.region || '市區';
              const rcfg = REGION_CONFIG[reg];
              return (
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${rcfg.badgeBg} ${rcfg.badgeText} border ${rcfg.badgeBorder} flex items-center gap-1`}>
                  <span>{rcfg.iconEmoji}</span>
                  <span>{reg}</span>
                </span>
              );
            })()}
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border} flex items-center gap-1`}>
              {isCancelled && <Ban className="w-3.5 h-3.5 text-rose-600" />}
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              列印工單
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow Stepper or Cancelled Alert Banner */}
        {isCancelled ? (
          <div className="px-6 py-3.5 bg-rose-50/80 border-b border-rose-200 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-rose-900 font-bold">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>此工單已由系統管理員正式取消結案</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                取消時間：<span className="font-mono font-medium text-slate-800">{ticket.cancelledAt || '-'}</span>
                {ticket.cancelledBy && <span> · 執行操作人：<strong className="text-slate-900">{ticket.cancelledBy}</strong></span>}
              </div>
            </div>
            {ticket.cancelReason && (
              <div className="mt-2 text-xs bg-white p-2.5 rounded-lg border border-rose-200 text-slate-800">
                <span className="font-semibold text-rose-800">取消原由紀錄：</span> {ticket.cancelReason}
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 shrink-0">
            <div className="flex items-center justify-between relative">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isPast = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 text-center relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPast
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-white border border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-1 whitespace-nowrap font-medium ${
                        isCurrent ? 'text-blue-700 font-bold' : isPast ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Section 1: Customer & Equipment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Building className="w-4 h-4 text-blue-600" />
                客戶電話叫修資料
              </h4>
              <div className="grid grid-cols-3 gap-2 pt-1 text-slate-600">
                <span className="text-slate-400">客戶公司：</span>
                <span className="col-span-2 font-medium text-slate-900">{ticket.customerName}</span>

                <span className="text-slate-400">責任分區：</span>
                <span className="col-span-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${REGION_CONFIG[ticket.region || '市區'].badgeBg} ${REGION_CONFIG[ticket.region || '市區'].badgeText} border ${REGION_CONFIG[ticket.region || '市區'].badgeBorder}`}>
                    <span>{REGION_CONFIG[ticket.region || '市區'].iconEmoji}</span>
                    <span>{REGION_CONFIG[ticket.region || '市區'].label}</span>
                  </span>
                </span>

                <span className="text-slate-400">來電窗口：</span>
                <span className="col-span-2 text-slate-800">{ticket.contactPerson}</span>

                <span className="text-slate-400">聯絡電話：</span>
                <span className="col-span-2 font-mono text-blue-700 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {ticket.contactPhone}
                </span>

                <span className="text-slate-400">裝機地址：</span>
                <span className="col-span-2 text-slate-800 flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  {ticket.address}
                </span>

                <span className="text-slate-400">機房位置：</span>
                <span className="col-span-2 font-medium text-slate-800">{ticket.locationRoom || '未特別標註'}</span>

                <span className="text-slate-400">受理時間：</span>
                <span className="col-span-2 font-mono text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {ticket.createdAt}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Wrench className="w-4 h-4 text-indigo-600" />
                報修設備與故障狀況
              </h4>
              <div className="grid grid-cols-3 gap-2 pt-1 text-slate-600">
                <span className="text-slate-400">設備名稱：</span>
                <span className="col-span-2 font-semibold text-slate-900">{ticket.equipmentName}</span>

                <span className="text-slate-400">設備編號：</span>
                <span className="col-span-2 font-mono text-slate-800">{ticket.equipmentCode}</span>

                <span className="text-slate-400">設備類別：</span>
                <span className="col-span-2">
                  {(() => {
                    const catCfg = EQUIPMENT_CATEGORY_CONFIG[ticket.equipmentCategory];
                    return (
                      <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded font-medium text-xs ${
                        catCfg ? `${catCfg.badgeBg} ${catCfg.badgeText} ${catCfg.badgeBorder}` : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <span>{catCfg?.iconEmoji}</span>
                        <span>{ticket.equipmentCategory}</span>
                      </span>
                    );
                  })()}
                </span>

                <span className="text-slate-400">故障類型：</span>
                <span className="col-span-2 font-medium text-slate-800">{ticket.faultCategory || '一般報修'}</span>

                <span className="text-slate-400">期望到場：</span>
                <span className="col-span-2 text-slate-800">{ticket.requestedVisitTime || '配合工程師排程'}</span>

                <span className="text-slate-400">目前專責技師：</span>
                <span className="col-span-2 font-bold text-blue-800">
                  {ticket.assignedTechnicianName ? (
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      {ticket.assignedTechnicianName}
                    </span>
                  ) : (
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      待派工（開放技師自主接單）
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Fault Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">客戶電話報修故障現象描述</h4>
            <div className="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed">
              {ticket.faultDescription}
            </div>
            {ticket.dispatchNotes && (
              <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-blue-900 text-[11px]">
                <strong className="text-blue-800">主管派工備註事項：</strong> {ticket.dispatchNotes}
              </div>
            )}
          </div>

          {/* Section 3: On-site Repair Details (if any progress) */}
          {(ticket.faultDiagnosis || ticket.repairActionTaken || ticket.partsUsed.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                現場維修與零件更換報告
              </h4>

              {ticket.faultDiagnosis && (
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold">技師現場查勘與故障原因診斷：</span>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700">
                    {ticket.faultDiagnosis}
                  </div>
                </div>
              )}

              {ticket.repairActionTaken && (
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold">排除作業處置措施：</span>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700">
                    {ticket.repairActionTaken}
                  </div>
                </div>
              )}

              {ticket.waitingPartsReason && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
                  <strong className="text-amber-800">待料原因記錄：</strong> {ticket.waitingPartsReason}
                </div>
              )}

              {ticket.partsUsed.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-slate-400 text-[11px] font-semibold">使用更換備品零件明細：</span>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[11px] text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-1.5 px-3">品名</th>
                          <th className="py-1.5 px-3">規格</th>
                          <th className="py-1.5 px-3 text-center">數量</th>
                          <th className="py-1.5 px-3 text-right">單價</th>
                          <th className="py-1.5 px-3 text-right">小計</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {ticket.partsUsed.map((p) => (
                          <tr key={p.id}>
                            <td className="py-1.5 px-3 font-medium text-slate-900">{p.name}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-500">{p.spec}</td>
                            <td className="py-1.5 px-3 text-center">{p.quantity}</td>
                            <td className="py-1.5 px-3 text-right font-mono">NT$ {p.unitPrice.toLocaleString()}</td>
                            <td className="py-1.5 px-3 text-right font-mono font-medium text-slate-900">
                              NT$ {(p.quantity * p.unitPrice).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold text-slate-900 text-right">
                        <tr>
                          <td colSpan={4} className="py-2 px-3">材料費用總計：</td>
                          <td className="py-2 px-3 font-mono text-emerald-700">NT$ {partsTotal.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Customer Signoff Section (if completed or closed) */}
          {(ticket.customerSignName || ticket.customerFeedback) && (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                客戶驗收簽章與滿意度評分
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 text-[11px]">驗收簽名人：</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{ticket.customerSignName}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">滿意度評分：</span>
                  <div className="font-bold text-amber-600 text-sm mt-0.5">
                    {'★'.repeat(ticket.customerRating || 5)} ({ticket.customerRating || 5} 星)
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-[11px]">結案時間：</span>
                  <div className="font-mono text-slate-700 mt-0.5">{ticket.closedAt}</div>
                </div>
              </div>
              {ticket.customerFeedback && (
                <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-200 mt-2">
                  客戶意見：{ticket.customerFeedback}
                </div>
              )}
            </div>
          )}

          {/* Section 5: Timeline Activities */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <History className="w-4 h-4 text-slate-600" />
              工單生命週期操作歷程紀錄
            </h4>
            <div className="space-y-2.5">
              {ticket.timeline.map((act) => (
                <div key={act.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      {act.action === 'cancelled' && <Ban className="w-3.5 h-3.5 text-rose-600" />}
                      {act.title}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{act.timestamp}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    操作人：<span className="font-medium text-slate-700">{act.actor}</span> ({act.actorRole})
                  </div>
                  {act.notes && (
                    <div className="text-slate-600 bg-white p-2 rounded border border-slate-200 mt-1">
                      {act.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>工單狀態：</span>
            <span className={`px-2 py-0.5 rounded font-semibold ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Delete Ticket Button (Permissions enforcement: admin can delete completely, user cannot) */}
            {(onOpenDelete || onOpenCancel) && (
              <>
                {currentAccount.permissionLevel === 'admin' ||
                currentAccount.permissions.canDeleteTicket ||
                currentAccount.permissions.canCancelTicket ? (
                  <button
                    onClick={() => {
                      if (onOpenDelete) onOpenDelete();
                      else if (onOpenCancel) onOpenCancel();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                    title="系統管理員刪除工單功能 (完全清除不留紀錄)"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    刪除工單
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg border border-slate-200 cursor-not-allowed"
                    title="僅系統管理員擁有刪除工單權限 (目前身分：一般使用者)"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>刪除工單</span>
                    <span className="text-[10px] text-slate-400">(限管理員)</span>
                  </button>
                )}
              </>
            )}

            {/* If not cancelled, show standard workflow actions */}
            {!isCancelled && (
              <>
                {/* Self-claim button for pending_dispatch */}
                {ticket.status === 'pending_dispatch' && (
                  <button
                    onClick={onSelfClaimTicket}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    由我自主接取此工單
                  </button>
                )}

                {/* Dispatch / Re-dispatch button */}
                {(ticket.status === 'pending_dispatch' || ticket.status === 'dispatched') && (
                  <button
                    onClick={onOpenDispatch}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    {ticket.status === 'pending_dispatch' ? '主管指定派工' : '重新指派技師'}
                  </button>
                )}

                {/* Accept work order button */}
                {ticket.status === 'dispatched' && (
                  <button
                    onClick={onAcceptTicket}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    技師確認接單
                  </button>
                )}

                {/* Transfer work order button */}
                {(ticket.status === 'dispatched' || ticket.status === 'accepted' || ticket.status === 'in_progress' || ticket.status === 'waiting_parts') && (
                  <button
                    onClick={onOpenTransfer}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    轉發 / 轉派工單
                  </button>
                )}

                {/* Start on-site repair */}
                {ticket.status === 'accepted' && (
                  <button
                    onClick={() => onOpenProgress('start')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    到達現場 / 開始檢修
                  </button>
                )}

                {/* Waiting for parts */}
                {ticket.status === 'in_progress' && (
                  <button
                    onClick={() => onOpenProgress('waiting_parts')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    回報待料
                  </button>
                )}

                {/* Resume repair from waiting parts */}
                {ticket.status === 'waiting_parts' && (
                  <button
                    onClick={() => onOpenProgress('resume')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    料件已到 / 恢復施工
                  </button>
                )}

                {/* Complete repair */}
                {ticket.status === 'in_progress' && (
                  <button
                    onClick={() => onOpenProgress('complete')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    申報完工
                  </button>
                )}

                {/* Customer signoff */}
                {ticket.status === 'completed' && (
                  <button
                    onClick={onOpenSignoff}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    客戶驗收簽章
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
