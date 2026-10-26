import React, { useState } from 'react';
import { Ticket, UserAccount } from '../types/ticket';
import { X, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DeleteTicketModalProps {
  ticket: Ticket;
  currentAccount: UserAccount;
  onClose: () => void;
  onConfirmDelete: (ticketId: string) => void;
}

export const DeleteTicketModal: React.FC<DeleteTicketModalProps> = ({
  ticket,
  currentAccount,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [error, setError] = useState('');

  const isAdmin =
    currentAccount.permissionLevel === 'admin' ||
    currentAccount.permissions?.canDeleteTicket ||
    currentAccount.permissions?.canCancelTicket;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('權限不足：僅系統管理員具有刪除工單權限！');
      return;
    }
    if (!confirmedCheck) {
      setError('請勾選確認聲明以執行刪除操作');
      return;
    }
    onConfirmDelete(ticket.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/70">
          <div className="flex items-center gap-2.5 text-rose-800">
            <div className="p-1.5 bg-rose-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">刪除維修工單確認</h3>
              <p className="text-[11px] text-rose-700">此操作將自系統中永久完全刪除此筆工單，不留任何紀錄</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Ticket Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                {ticket.id}
              </span>
              <span className="text-[11px] text-slate-500">
                叫修時間：{ticket.createdAt}
              </span>
            </div>
            <div className="text-slate-700">
              <div className="font-semibold text-slate-900">{ticket.customerName}</div>
              <div className="text-slate-600">{ticket.equipmentName} ({ticket.equipmentCode})</div>
            </div>
            <div className="text-slate-500 text-[11px] bg-white p-2 rounded border border-slate-100">
              故障問題：{ticket.faultDescription}
            </div>
            {ticket.assignedTechnicianName && (
              <div className="text-[11px] text-blue-700 font-medium">
                目前指派工程師：{ticket.assignedTechnicianName}
              </div>
            )}
          </div>

          {/* Current Operator Permission Card */}
          <div className="flex items-center justify-between bg-blue-50/60 border border-blue-200 rounded-lg p-2.5 text-[11px]">
            <div className="flex items-center gap-1.5 text-blue-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>操作人員身分核驗：</span>
              <span className="font-bold text-slate-900">{currentAccount.name}</span>
              <span className="text-blue-700">({currentAccount.roleTitle})</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">
              管理員授權通過
            </span>
          </div>

          {/* Warning Banner */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-rose-950">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>高風險警示：完全刪除不留任何紀錄</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              您即將徹底清除此筆工單。確認刪除後，該工單及其關聯的故障說明、派工調度紀錄、檢修歷程與用料資料將<strong>從系統資料庫中永久清除，不留存任何歷史紀錄</strong>。
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2">
            <input
              type="checkbox"
              id="confirmDeleteCheck"
              checked={confirmedCheck}
              onChange={(e) => {
                setConfirmedCheck(e.target.checked);
                if (e.target.checked) setError('');
              }}
              className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5 cursor-pointer"
            />
            <label htmlFor="confirmDeleteCheck" className="cursor-pointer text-[11px] leading-tight select-none font-medium">
              我確認完全不需保留此筆工單，同意自系統永久刪除且不留任何紀錄。
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              取消 (保留工單)
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              確定完全刪除工單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
