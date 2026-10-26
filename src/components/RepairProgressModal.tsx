import React, { useState } from 'react';
import { PartItem, Ticket } from '../types/ticket';
import { Plus, Trash2, CheckCircle2, AlertTriangle, Play, X } from 'lucide-react';

interface RepairProgressModalProps {
  ticket: Ticket;
  mode: 'start' | 'waiting_parts' | 'resume' | 'complete';
  currentActorName: string;
  onClose: () => void;
  onSubmit: (data: {
    status: Ticket['status'];
    actionTitle: string;
    notes?: string;
    faultDiagnosis?: string;
    repairActionTaken?: string;
    waitingPartsReason?: string;
    partsUsed?: PartItem[];
  }) => void;
}

export const RepairProgressModal: React.FC<RepairProgressModalProps> = ({
  ticket,
  mode,
  currentActorName: _currentActorName,
  onClose,
  onSubmit,
}) => {
  // Fields for completion
  const [faultDiagnosis, setFaultDiagnosis] = useState<string>(
    ticket.faultDiagnosis || '經儀器量測與拆檢，確認為主電源接點氧化阻抗過大，且軸承滑動面乾澀有金屬微粒。'
  );
  const [repairActionTaken, setRepairActionTaken] = useState<string>(
    ticket.repairActionTaken || '已清潔接點並更換破損線端子，重新注入專用全合成潤滑脂，經 30 分鐘負載運轉測試各項電壓、溫度參數正常。'
  );
  const [notes, setNotes] = useState<string>('');

  // Waiting parts reason
  const [waitingReason, setWaitingReason] = useState<string>(
    '現場檢查確認損壞元件需原廠特定規格零件（預計向總公司備品倉申請調料，預估 1-2 工作日抵達）。'
  );

  // Parts list
  const [parts, setParts] = useState<PartItem[]>(
    ticket.partsUsed.length > 0
      ? [...ticket.partsUsed]
      : []
  );

  const [newPartName, setNewPartName] = useState('');
  const [newPartSpec, setNewPartSpec] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartPrice, setNewPartPrice] = useState(500);

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    const newItem: PartItem = {
      id: `p-${Date.now()}`,
      name: newPartName.trim(),
      spec: newPartSpec.trim() || '標準件',
      quantity: Math.max(1, newPartQty),
      unitPrice: Math.max(0, newPartPrice),
    };
    setParts([...parts, newItem]);
    setNewPartName('');
    setNewPartSpec('');
    setNewPartQty(1);
    setNewPartPrice(500);
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'start') {
      onSubmit({
        status: 'in_progress',
        actionTitle: '工程師抵達現場，開始實地維修檢測',
        notes: notes || '已著裝安全裝備並與廠務窗口會合，開始拆檢排查。',
      });
    } else if (mode === 'waiting_parts') {
      onSubmit({
        status: 'waiting_parts',
        actionTitle: '維修狀態變更為【待料中】',
        waitingPartsReason: waitingReason,
        notes: notes || waitingReason,
      });
    } else if (mode === 'resume') {
      onSubmit({
        status: 'in_progress',
        actionTitle: '零件備妥，恢復現場檢修作業',
        notes: notes || '備料已到齊，續行更換與調試作業。',
      });
    } else if (mode === 'complete') {
      onSubmit({
        status: 'completed',
        actionTitle: '現場維修完工，提交完工總結報告',
        faultDiagnosis,
        repairActionTaken,
        partsUsed: parts,
        notes: notes || '修復完成並通過試機測試，待客戶驗收簽章。',
      });
    }
  };

  const totalPartsCost = parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
              工單進度維護 · {ticket.id}
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {mode === 'start' && (
                <>
                  <Play className="w-5 h-5 text-cyan-600" /> 到達現場 / 開始檢修
                </>
              )}
              {mode === 'waiting_parts' && (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600" /> 標記為【待料中】
                </>
              )}
              {mode === 'resume' && (
                <>
                  <Play className="w-5 h-5 text-emerald-600" /> 零件到料 / 恢復施工
                </>
              )}
              {mode === 'complete' && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 維修完工回報
                </>
              )}
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
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
            <span>設備：<strong className="text-slate-800">{ticket.equipmentName}</strong></span>
            <span>客戶：<strong className="text-slate-800">{ticket.customerName}</strong></span>
          </div>

          {/* Mode-specific forms */}
          {mode === 'start' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                確認已抵達客戶現場並開始進行設備診斷與檢修。系統將會更新工單進度為<strong>「維修中」</strong>，並記錄到場時間。
              </p>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  現場進場備註 (選填)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例如：已完成工安危害告知簽認、已戴安全帽與絕緣手套入場..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {mode === 'waiting_parts' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  待料說明與缺件品名 (必填)
                </label>
                <textarea
                  rows={3}
                  value={waitingReason}
                  onChange={(e) => setWaitingReason(e.target.value)}
                  required
                  placeholder="請詳述需調用之備件規格、型號及預估到貨日..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  暫置或安全措施備註
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例如：機台已掛停機檢修牌、電源斷路器已上鎖標定(LOTO)..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {mode === 'resume' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                零件已到貨，確認恢復現場檢修作業。工單狀態將由「待料中」重置為「維修中」。
              </p>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  復工備註
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例如：料件已由物流送達廠務，即刻展開換裝..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {mode === 'complete' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  故障真實原因與診斷分析 (必填)
                </label>
                <textarea
                  rows={2}
                  value={faultDiagnosis}
                  onChange={(e) => setFaultDiagnosis(e.target.value)}
                  required
                  placeholder="現場排查發現的具體物理或電氣問題..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  維修排除作業與調校測試說明 (必填)
                </label>
                <textarea
                  rows={2}
                  value={repairActionTaken}
                  onChange={(e) => setRepairActionTaken(e.target.value)}
                  required
                  placeholder="具體更換措施、校正數值及測試結果..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Parts Section */}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-800">
                    使用零件耗材明細 ({parts.length} 項)
                  </label>
                  <span className="text-xs font-mono text-slate-600">
                    零件合計: <span className="font-bold text-slate-900">${totalPartsCost.toLocaleString()}</span> 元
                  </span>
                </div>

                {/* Existing parts list */}
                {parts.length > 0 && (
                  <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto pr-1">
                    {parts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="truncate flex-1">
                          <span className="font-medium text-slate-800">{p.name}</span>
                          <span className="text-slate-500 ml-2">[{p.spec}]</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-slate-600">
                            {p.quantity} 個 × ${p.unitPrice} = ${(p.quantity * p.unitPrice).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(p.id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new part row */}
                <div className="grid grid-cols-12 gap-2 p-2.5 bg-slate-100/70 rounded-lg text-xs">
                  <input
                    type="text"
                    placeholder="零件品名 (例: 氟橡膠密封環)"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    className="col-span-4 px-2 py-1.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="型號/規格"
                    value={newPartSpec}
                    onChange={(e) => setNewPartSpec(e.target.value)}
                    className="col-span-3 px-2 py-1.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="數量"
                    value={newPartQty}
                    onChange={(e) => setNewPartQty(parseInt(e.target.value) || 1)}
                    className="col-span-2 px-2 py-1.5 bg-white border border-slate-300 rounded text-center"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="單價"
                    value={newPartPrice}
                    onChange={(e) => setNewPartPrice(parseInt(e.target.value) || 0)}
                    className="col-span-2 px-2 py-1.5 bg-white border border-slate-300 rounded text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="col-span-1 flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white rounded font-bold"
                    title="添加零件"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

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
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${
                mode === 'complete'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : mode === 'waiting_parts'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {mode === 'complete' && '送出完工報告'}
              {mode === 'waiting_parts' && '確認標記待料'}
              {mode === 'start' && '確認已到場開始'}
              {mode === 'resume' && '確認復工'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
