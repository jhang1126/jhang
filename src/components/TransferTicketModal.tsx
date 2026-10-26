import React, { useState } from 'react';
import { Technician, Ticket } from '../types/ticket';
import { Share2, X, ArrowRight } from 'lucide-react';

interface TransferTicketModalProps {
  ticket: Ticket;
  technicians: Technician[];
  currentActorName: string;
  onClose: () => void;
  onTransfer: (ticketId: string, targetTechId: string, reason: string, handoverNotes: string) => void;
}

const TRANSFER_REASONS = [
  '現場涉及高壓/特定證照，需轉交專責技師支援',
  '初步診斷為電控/PLC軟體異常，轉交自動化專責組',
  '初步診斷為機械主軸/液壓結構問題，轉交機構維修組',
  '目前現場另一急修尚未結束，無法於時限內抵達',
  '需大型吊裝/特殊量測儀器，由具備重裝備技師接手',
  '跨廠區區域調度 (就近工程師支援)',
  '排班輪調與值班交接',
  '其他特殊狀況',
];

export const TransferTicketModal: React.FC<TransferTicketModalProps> = ({
  ticket,
  technicians,
  currentActorName,
  onClose,
  onTransfer,
}) => {
  // Exclude current assigned technician from target list
  const availableTargets = technicians.filter((t) => t.id !== ticket.assignedTechnicianId);
  const [targetTechId, setTargetTechId] = useState<string>(availableTargets[0]?.id || '');
  const [reason, setReason] = useState<string>(TRANSFER_REASONS[0]);
  const [handoverNotes, setHandoverNotes] = useState<string>(
    '已完成初步外觀檢視與電源量測，詳細故障請參考工單描述，接手後請先行致電客戶確認。'
  );

  const currentTechName = ticket.assignedTechnicianName || currentActorName;
  const targetTech = technicians.find((t) => t.id === targetTechId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTechId) return;
    onTransfer(ticket.id, targetTechId, reason, handoverNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
              工單轉派作業 · {ticket.id}
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-600" />
              轉發 / 轉派工單給其他工程師
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Transfer Visual Route */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-xs text-slate-500">原承辦技師</div>
              <div className="font-semibold text-slate-800 text-sm mt-0.5">
                {currentTechName}
              </div>
            </div>
            <div className="px-3 flex items-center justify-center text-indigo-500">
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-center flex-1">
              <div className="text-xs text-indigo-600 font-medium">新接手技師</div>
              <div className="font-bold text-indigo-950 text-sm mt-0.5">
                {targetTech?.name || '請選擇'}
              </div>
            </div>
          </div>

          {/* Ticket context reminder */}
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
            <span>客戶：<strong className="text-slate-800">{ticket.customerName}</strong></span>
            <span>設備：<strong className="text-slate-800">{ticket.equipmentName}</strong></span>
          </div>

          {/* Target Technician Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              選擇接收轉發的工程師
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableTargets.map((tech) => {
                const isSelected = tech.id === targetTechId;
                return (
                  <div
                    key={tech.id}
                    onClick={() => setTargetTechId(tech.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{tech.name}</span>
                        <span className="text-xs text-slate-500">{tech.title}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        專長：{tech.specialties.join('、')}
                      </div>
                    </div>
                    <div className="text-right text-xs shrink-0 pl-3">
                      <span className="font-mono text-slate-700">當前負載: {tech.activeTicketsCount} 件</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transfer Reason */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              轉單原因 (必選)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {TRANSFER_REASONS.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Handover Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              工作交接說明與現況備註
            </label>
            <textarea
              rows={3}
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="說明目前排查進度、建議攜帶之零件或工具、與客戶溝通之要點..."
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!targetTechId}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              確認轉發工單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
