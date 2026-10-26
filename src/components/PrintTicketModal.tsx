import React from 'react';
import { Ticket } from '../types/ticket';
import { Printer, X, CheckSquare, Wrench } from 'lucide-react';
import { STATUS_MAP } from '../utils/formatters';

interface PrintTicketModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({ ticket, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const statusInfo = STATUS_MAP[ticket.status];
  const partsTotal = ticket.partsUsed.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-slate-700" />
            <span className="font-bold text-slate-800 text-sm">設備維修派工單 / 服務確認單列印預覽</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              立即列印 / 存為 PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="p-8 text-slate-900 space-y-6 bg-white font-sans text-sm max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-6 h-6 text-slate-800" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  PRO-MAINT 設備維護保養與修繕工單
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Industrial Equipment Maintenance Dispatch & Service Record
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">工單編號 (Ticket No.)</div>
              <div className="text-base font-bold font-mono tracking-wider text-slate-900">
                {ticket.id}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                叫修時間：{ticket.createdAt}
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500">當前進度：</span>
              <strong className="text-slate-900 ml-1">{statusInfo.label}</strong>
            </div>
            <div>
              <span className="text-slate-500">期望到場：</span>
              <strong className="text-slate-900 ml-1">{ticket.requestedVisitTime}</strong>
            </div>
          </div>

          {/* Section 1: Customer & Equipment Details */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-300">
              一、 客戶與設備明細資料
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 text-xs">
              <div className="p-2.5">
                <span className="text-slate-500 block">客戶名稱</span>
                <span className="font-semibold text-slate-900">{ticket.customerName}</span>
              </div>
              <div className="p-2.5">
                <span className="text-slate-500 block">責任分區</span>
                <span className="font-bold text-blue-800">{ticket.region || '市區'}</span>
              </div>
              <div className="p-2.5">
                <span className="text-slate-500 block">現場聯絡窗口 / 電話</span>
                <span className="font-semibold text-slate-900">{ticket.contactPerson} · {ticket.contactPhone}</span>
              </div>
              <div className="p-2.5">
                <span className="text-slate-500 block">設備名稱 / 編號</span>
                <span className="font-semibold text-slate-900">{ticket.equipmentName} ({ticket.equipmentCode})</span>
              </div>
              <div className="p-2.5">
                <span className="text-slate-500 block">出廠機號 / 裝機位置</span>
                <span className="font-semibold text-slate-900">{ticket.serialNumber} · {ticket.locationRoom}</span>
              </div>
              <div className="p-2.5 col-span-2">
                <span className="text-slate-500 block">服務地點</span>
                <span className="text-slate-800">{ticket.address}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Fault Description */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-300">
              二、 故障狀況與叫修描述
            </div>
            <div className="p-3 text-xs space-y-1.5">
              <div className="flex gap-4">
                <span className="text-slate-500">設備分類：<strong>{ticket.equipmentCategory}</strong></span>
                {ticket.faultCategory && (
                  <span className="text-slate-500">徵兆分類：<strong>{ticket.faultCategory}</strong></span>
                )}
                <span className="text-slate-500">約定時段：<strong>{ticket.requestedVisitTime}</strong></span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-800 leading-relaxed">
                {ticket.faultDescription}
              </div>
            </div>
          </div>

          {/* Section 3: Technician Work & Parts Report */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-300 flex justify-between">
              <span>三、 派工與維修處理紀錄</span>
              <span>承辦工程師：{ticket.assignedTechnicianName || '未派工'}</span>
            </div>
            <div className="p-3 text-xs space-y-3">
              <div>
                <span className="font-semibold text-slate-700 block mb-1">【故障診斷原因】</span>
                <p className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                  {ticket.faultDiagnosis || '檢修進行中，尚未填寫診斷原因。'}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">【排除與處置作業】</span>
                <p className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                  {ticket.repairActionTaken || '檢修進行中，尚未填寫完工處置。'}
                </p>
              </div>

              {/* Parts */}
              <div>
                <span className="font-semibold text-slate-700 block mb-1">【更換零件耗材明細】</span>
                {ticket.partsUsed.length > 0 ? (
                  <table className="w-full text-left border border-slate-200 text-xs">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-1.5 border-b border-slate-200">品名</th>
                        <th className="p-1.5 border-b border-slate-200">規格型號</th>
                        <th className="p-1.5 border-b border-slate-200 text-center">數量</th>
                        <th className="p-1.5 border-b border-slate-200 text-right">單價</th>
                        <th className="p-1.5 border-b border-slate-200 text-right">小計</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {ticket.partsUsed.map((p) => (
                        <tr key={p.id}>
                          <td className="p-1.5 font-sans">{p.name}</td>
                          <td className="p-1.5">{p.spec}</td>
                          <td className="p-1.5 text-center">{p.quantity}</td>
                          <td className="p-1.5 text-right">${p.unitPrice.toLocaleString()}</td>
                          <td className="p-1.5 text-right">${(p.quantity * p.unitPrice).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={4} className="p-1.5 text-right font-sans">耗材零件費用總計：</td>
                        <td className="p-1.5 text-right">${partsTotal.toLocaleString()} 元</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 italic p-1.5">無更換計費零件耗材</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Sign-off block */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-300 text-xs">
            <div className="space-y-4">
              <span className="font-bold text-slate-700 block">服務工程師簽署：</span>
              <div className="h-14 border-b border-dashed border-slate-400 flex items-end pb-1 font-mono">
                {ticket.assignedTechnicianName ? `${ticket.assignedTechnicianName} (技術員)` : '____________________'}
              </div>
              <div className="text-slate-500">
                完工時間：{ticket.completedAt || '尚未完工'}
              </div>
            </div>

            <div className="space-y-4">
              <span className="font-bold text-slate-700 block">客戶驗收人簽字簽認：</span>
              <div className="h-14 border-b border-dashed border-slate-400 flex items-end pb-1 font-mono">
                {ticket.customerSignName ? (
                  <span className="flex items-center gap-1.5 font-bold text-slate-900">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    {ticket.customerSignName} (已驗收確認)
                  </span>
                ) : (
                  '____________________ (客戶簽章)'
                )}
              </div>
              <div className="text-slate-500 flex justify-between">
                <span>結案時間：{ticket.closedAt || '待結案'}</span>
                {ticket.customerRating && (
                  <span className="font-semibold text-amber-600">評分：{ticket.customerRating} 星</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
