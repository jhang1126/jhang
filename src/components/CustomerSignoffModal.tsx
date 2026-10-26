import React, { useState } from 'react';
import { Ticket } from '../types/ticket';
import { Star, CheckCircle, X } from 'lucide-react';

interface CustomerSignoffModalProps {
  ticket: Ticket;
  defaultSigner: string;
  onClose: () => void;
  onSignoff: (ticketId: string, signName: string, rating: number, feedback: string) => void;
}

export const CustomerSignoffModal: React.FC<CustomerSignoffModalProps> = ({
  ticket,
  defaultSigner,
  onClose,
  onSignoff,
}) => {
  const [signName, setSignName] = useState(defaultSigner || ticket.contactPerson || '');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('維修迅速專業，設備已恢復正常平穩運轉，各項數據確認無誤。');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signName.trim()) return;
    onSignoff(ticket.id, signName.trim(), rating, feedback.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
              客戶驗收簽章 · {ticket.id}
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              確認維修成果與滿意度評分
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="text-slate-500">維修設備：<strong className="text-slate-800">{ticket.equipmentName} ({ticket.equipmentCode})</strong></div>
            <div className="text-slate-500">承辦技師：<strong className="text-slate-800">{ticket.assignedTechnicianName || '工程師'}</strong></div>
            {ticket.repairActionTaken && (
              <div className="text-slate-600 pt-1 border-t border-slate-200">
                排除措施：{ticket.repairActionTaken}
              </div>
            )}
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              維修滿意度評價
            </label>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                </button>
              ))}
              <span className="text-sm font-medium text-slate-700 ml-2">
                {rating === 5 ? '非常滿意 (5星)' : rating === 4 ? '滿意 (4星)' : rating === 3 ? '普通 (3星)' : `${rating} 星`}
              </span>
            </div>
          </div>

          {/* Signer Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              驗收人簽名 / 姓名 (必填)
            </label>
            <input
              type="text"
              value={signName}
              onChange={(e) => setSignName(e.target.value)}
              required
              placeholder="請輸入驗收簽認主管或現場簽署人員姓名"
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              驗收意見與服務反饋
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="維修品質、技師專業度或後續觀察注意事項..."
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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
              disabled={!signName.trim()}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              確認驗收並結案
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
