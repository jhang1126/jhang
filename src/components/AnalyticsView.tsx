import React from 'react';
import { Technician, Ticket, SERVICE_REGIONS, REGION_CONFIG } from '../types/ticket';
import { 
  FileSpreadsheet, 
  Download,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsViewProps {
  tickets: Ticket[];
  technicians: Technician[];
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tickets,
  technicians,
  onExportCSV,
  onExportJSON,
}) => {
  const totalCount = tickets.length;
  const completedCount = tickets.filter((t) => t.status === 'completed' || t.status === 'closed').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const pendingDispatchCount = tickets.filter((t) => t.status === 'pending_dispatch').length;

  const totalPartsCost = tickets.reduce((sum, t) => {
    return sum + t.partsUsed.reduce((pSum, p) => pSum + p.quantity * p.unitPrice, 0);
  }, 0);

  // Group by category
  const categoryCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    categoryCounts[t.equipmentCategory] = (categoryCounts[t.equipmentCategory] || 0) + 1;
  });

  // Group by fault type
  const faultCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    const fc = t.faultCategory || '一般報修';
    faultCounts[fc] = (faultCounts[fc] || 0) + 1;
  });

  // Status distribution
  const statusCounts = {
    pending_dispatch: tickets.filter((t) => t.status === 'pending_dispatch').length,
    dispatched: tickets.filter((t) => t.status === 'dispatched').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    waiting_parts: tickets.filter((t) => t.status === 'waiting_parts').length,
    completed: tickets.filter((t) => t.status === 'completed').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
    cancelled: tickets.filter((t) => t.status === 'cancelled').length,
  };

  const avgRating = (
    tickets.filter((t) => t.customerRating).reduce((acc, t) => acc + (t.customerRating || 5), 0) /
    (tickets.filter((t) => t.customerRating).length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">維修運維效能與分區派工數據分析</h2>
          <p className="text-xs text-slate-500 mt-0.5">即時統計四大責任分區分佈、零件消耗、SLA到場履約率與技師出勤能量</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            匯出分區工單 CSV
          </button>
          <button
            onClick={onExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            系統資料備份 (JSON)
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">叫修總工單數</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalCount} <span className="text-xs font-normal text-slate-500">件</span>
          </div>
          <div className="text-[11px] text-slate-400">
            待派工: <span className="text-amber-600 font-bold">{pendingDispatchCount}</span> · 檢修中: <span className="text-blue-600 font-bold">{inProgressCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">完工結案達成率</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-400">
            已完工驗收: <span className="text-emerald-700 font-bold">{completedCount}</span> 件
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">客戶服務綜合評分</span>
          <div className="text-2xl font-bold font-mono text-amber-500">
            ⭐ {avgRating}
          </div>
          <div className="text-[11px] text-slate-400">
            基於結案驗收真實評價
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">備品更換料件費用</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            NT$ {totalPartsCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            包含軸承、油封、導壓管、濾芯等
          </div>
        </div>
      </div>

      {/* Regional Workload Section (四大責任分區運維概況) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-100 text-blue-700 font-bold text-xs">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">四大服務責任分區運維效能指標</h3>
          </div>
          <span className="text-xs text-slate-500">市區 · 大武區 · 關山區 · 成功區</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SERVICE_REGIONS.map((reg) => {
            const cfg = REGION_CONFIG[reg];
            const regTickets = tickets.filter((t) => (t.region || '市區') === reg);
            const count = regTickets.length;
            const pending = regTickets.filter((t) => t.status === 'pending_dispatch').length;
            const inProg = regTickets.filter((t) => t.status === 'in_progress' || t.status === 'waiting_parts').length;
            const comp = regTickets.filter((t) => t.status === 'completed' || t.status === 'closed').length;
            const cancel = regTickets.filter((t) => t.status === 'cancelled').length;

            return (
              <div
                key={reg}
                className={`p-4 rounded-xl border ${cfg.cardBorder} ${cfg.cardBg} space-y-2.5 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cfg.iconEmoji}</span>
                    <span className="font-bold text-slate-900 text-sm">{reg}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder}`}>
                    {count} 件
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 truncate" title={cfg.townships}>
                  {cfg.townships}
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200/80 text-[11px] text-center">
                  <div className="bg-white p-1 rounded border border-slate-200/60">
                    <div className="text-slate-400 text-[10px]">待派</div>
                    <div className="font-mono font-bold text-amber-700">{pending}</div>
                  </div>
                  <div className="bg-white p-1 rounded border border-slate-200/60">
                    <div className="text-slate-400 text-[10px]">修復中</div>
                    <div className="font-mono font-bold text-cyan-800">{inProg}</div>
                  </div>
                  <div className="bg-white p-1 rounded border border-slate-200/60">
                    <div className="text-slate-400 text-[10px]">完工</div>
                    <div className="font-mono font-bold text-emerald-700">{comp}</div>
                  </div>
                </div>
                {cancel > 0 && (
                  <div className="text-[10px] text-rose-600 text-right">
                    含已撤銷工單 {cancel} 件
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Equipment Category Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            設備領域類別叫修分佈
          </h3>
          <div className="space-y-2.5 text-xs">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-medium">{cat}</span>
                    <span className="font-mono text-slate-500">{count} 件 ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fault Symptom Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            故障徵兆原因分佈
          </h3>
          <div className="space-y-2.5 text-xs">
            {Object.entries(faultCounts).map(([f, count]) => {
              const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={f} className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-medium">{f}</span>
                    <span className="font-mono text-slate-500">{count} 件 ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            工單各進度狀態分佈
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-200">
              <span className="font-medium text-amber-800">待派工</span>
              <span className="font-mono font-bold text-amber-900">{statusCounts.pending_dispatch} 件</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-blue-50 border border-blue-200">
              <span className="font-medium text-blue-800">已派工 (待接單)</span>
              <span className="font-mono font-bold text-blue-900">{statusCounts.dispatched} 件</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-cyan-50 border border-cyan-200">
              <span className="font-medium text-cyan-800">現場檢修中</span>
              <span className="font-mono font-bold text-cyan-900">{statusCounts.in_progress} 件</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-orange-50 border border-orange-200">
              <span className="font-medium text-orange-800">待料中</span>
              <span className="font-mono font-bold text-orange-900">{statusCounts.waiting_parts} 件</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-200">
              <span className="font-medium text-emerald-800">已完工 (待驗收)</span>
              <span className="font-mono font-bold text-emerald-900">{statusCounts.completed} 件</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-100 border border-slate-200">
              <span className="font-medium text-slate-700">已驗收結案</span>
              <span className="font-mono font-bold text-slate-800">{statusCounts.closed} 件</span>
            </div>
            {statusCounts.cancelled > 0 && (
              <div className="flex items-center justify-between p-2 rounded bg-rose-50 border border-rose-200">
                <span className="font-medium text-rose-800">已取消</span>
                <span className="font-mono font-bold text-rose-900">{statusCounts.cancelled} 件</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technician Performance Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          全體維修工程師派遣與負載狀態總覽
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">工程師姓名</th>
                <th className="py-2.5 px-3">職稱</th>
                <th className="py-2.5 px-3">專長核心領域</th>
                <th className="py-2.5 px-3">聯絡電話</th>
                <th className="py-2.5 px-3 text-center">當前負載工單</th>
                <th className="py-2.5 px-3 text-center">歷史累計完工</th>
                <th className="py-2.5 px-3 text-center">客戶滿意度</th>
                <th className="py-2.5 px-3 text-center">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {technicians.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{t.name}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{t.title}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{t.specialties.join('、')}</td>
                  <td className="py-2.5 px-3 text-slate-500">{t.phone}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-blue-600">{t.activeTicketsCount}</td>
                  <td className="py-2.5 px-3 text-center text-slate-800">{t.completedCount}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-amber-500">{t.rating} ★</td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        t.status === 'available'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {t.status === 'available' ? '待命派工' : '現場處理中'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
