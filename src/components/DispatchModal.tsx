import React, { useState } from 'react';
import { Technician, Ticket } from '../types/ticket';
import { UserCheck, X } from 'lucide-react';

interface DispatchModalProps {
  ticket: Ticket;
  technicians: Technician[];
  onClose: () => void;
  onDispatch: (ticketId: string, technicianId: string, notes: string) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  ticket,
  technicians,
  onClose,
  onDispatch,
}) => {
  const [selectedTechId, setSelectedTechId] = useState<string>(
    technicians.find((t) => t.specialties.some((s) => ticket.equipmentCategory.includes(s) || s.includes(ticket.equipmentCategory)))?.id || technicians[0]?.id || ''
  );
  const [notes, setNotes] = useState<string>(
    `請優先排查【${ticket.faultCategory}】，客戶期望到場時段：${ticket.requestedVisitTime}`
  );

  const selectedTech = technicians.find((t) => t.id === selectedTechId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;
    onDispatch(ticket.id, selectedTechId, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
              工單派工作業 · {ticket.id}
            </span>
            <h2 className="text-lg font-bold text-slate-900">分派工單至維修工程師</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Ticket Brief Info */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">客戶名稱</span>
              <span className="font-semibold text-slate-900">{ticket.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">報修設備</span>
              <span className="font-semibold text-slate-900">
                {ticket.equipmentName} ({ticket.equipmentCode})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">設備分類 / 故障類別</span>
              <span className="text-slate-700">
                {ticket.equipmentCategory} · {ticket.faultCategory}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 text-slate-600 text-xs">
              <span className="font-medium text-slate-700">故障現象：</span>
              {ticket.faultDescription}
            </div>
          </div>

          {/* Technician Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              選擇指派維修技師 ({technicians.length} 位在線)
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {technicians.map((tech) => {
                const isSelected = tech.id === selectedTechId;
                const isMatch = tech.specialties.some(
                  (s) => ticket.equipmentCategory.includes(s) || s.includes(ticket.equipmentCategory)
                );
                return (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTechId(tech.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{tech.name}</span>
                        <span className="text-xs text-slate-500">{tech.title}</span>
                        {isMatch && (
                          <span className="text-[11px] font-medium text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                            專長相符
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        電話：{tech.phone} · 專長：{tech.specialties.join('、')}
                      </div>
                    </div>

                    <div className="text-right text-xs shrink-0 pl-3">
                      <div className="font-medium text-slate-700">
                        進行中工單：<span className="font-mono text-blue-600">{tech.activeTicketsCount}</span> 件
                      </div>
                      <div className="text-slate-400">已完工 {tech.completedCount} 件</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dispatch Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              派工指示與備註說明
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="請填寫給技師的注意事項、需攜帶之儀器備品或交通聯絡方式..."
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              disabled={!selectedTechId}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              確認派工給 {selectedTech?.name || '工程師'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
