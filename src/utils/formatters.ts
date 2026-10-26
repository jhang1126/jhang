import { TicketStatus } from '../types/ticket';

export const STATUS_MAP: Record<TicketStatus, { label: string; bg: string; text: string; border: string; stepIndex: number }> = {
  pending_dispatch: {
    label: '待派工',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    stepIndex: 0,
  },
  dispatched: {
    label: '已派工 (待接單)',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    stepIndex: 1,
  },
  accepted: {
    label: '已接單 (前往中)',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    stepIndex: 2,
  },
  in_progress: {
    label: '維修中',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    stepIndex: 3,
  },
  waiting_parts: {
    label: '待料中',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    stepIndex: 4,
  },
  completed: {
    label: '已完工 (待驗收)',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    stepIndex: 5,
  },
  closed: {
    label: '已結案',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    stepIndex: 6,
  },
  cancelled: {
    label: '已取消',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    stepIndex: -1,
  },
};

export const WORKFLOW_STEPS = [
  { key: 'pending_dispatch', label: '1. 新增維修工單' },
  { key: 'dispatched', label: '2. 派工或自主接單' },
  { key: 'accepted', label: '3. 已接單排程' },
  { key: 'in_progress', label: '4. 現場檢修' },
  { key: 'completed', label: '5. 完工填報' },
  { key: 'closed', label: '6. 會同簽認結案' },
];

export function formatDateTime(isoOrString?: string): string {
  if (!isoOrString) return '-';
  return isoOrString;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
