import { Technician, Ticket, UserAccount, ServiceRegion, EquipmentCategory } from '../types/ticket';
import { INITIAL_TECHNICIANS, INITIAL_TICKETS, INITIAL_ACCOUNTS } from '../data/initialData';

const TICKETS_KEY = 'maint_tickets_v5';
const TECHNICIANS_KEY = 'maint_technicians_v5';
const ACCOUNTS_KEY = 'maint_accounts_v4';
const CURRENT_ACCOUNT_KEY = 'maint_current_account_id_v4';

function ensureTicketRegionAndCategory(ticket: Ticket): Ticket {
  let region: ServiceRegion = ticket.region;
  if (!region) {
    const addr = ticket.address || '';
    region = '市區';
    if (addr.includes('大武') || addr.includes('太麻里') || addr.includes('金峰') || addr.includes('達仁')) {
      region = '大武區';
    } else if (addr.includes('關山') || addr.includes('池上') || addr.includes('鹿野') || addr.includes('海端') || addr.includes('延平')) {
      region = '關山區';
    } else if (addr.includes('成功') || addr.includes('東河') || addr.includes('長濱')) {
      region = '成功區';
    }
  }

  let equipmentCategory = ticket.equipmentCategory;
  const validCategories: EquipmentCategory[] = ['商用列表機', '家用列表機', '辦公儀器', '影音設備', '工程儀器'];
  if (!validCategories.includes(equipmentCategory)) {
    const legacyMap: Record<string, EquipmentCategory> = {
      '空調冷凍': '商用列表機',
      '精密加工': '工程儀器',
      '電力能源': '辦公儀器',
      '環境給排水': '影音設備',
      '自動化電控': '商用列表機',
      '其他設備': '家用列表機',
    };
    equipmentCategory = legacyMap[equipmentCategory as unknown as string] || '商用列表機';
  }

  return { ...ticket, region, equipmentCategory };
}

export function loadTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) {
      saveTickets(INITIAL_TICKETS);
      return INITIAL_TICKETS;
    }
    const parsed: Ticket[] = JSON.parse(raw);
    return parsed.map(ensureTicketRegionAndCategory);
  } catch (e) {
    console.error('Failed to load tickets from localStorage', e);
    return INITIAL_TICKETS;
  }
}

export function saveTickets(tickets: Ticket[]) {
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save tickets to localStorage', e);
  }
}

export function loadTechnicians(): Technician[] {
  try {
    const raw = localStorage.getItem(TECHNICIANS_KEY);
    if (!raw) {
      saveTechnicians(INITIAL_TECHNICIANS);
      return INITIAL_TECHNICIANS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load technicians from localStorage', e);
    return INITIAL_TECHNICIANS;
  }
}

export function saveTechnicians(technicians: Technician[]) {
  try {
    localStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
  } catch (e) {
    console.error('Failed to save technicians to localStorage', e);
  }
}

export function loadAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      saveAccounts(INITIAL_ACCOUNTS);
      return INITIAL_ACCOUNTS;
    }
    const accounts: UserAccount[] = JSON.parse(raw);
    // Ensure every account has default password if missing
    return accounts.map((acc) => {
      if (!acc.password) {
        const defaultPwd = acc.permissionLevel === 'admin' ? 'admin123' : 'user123';
        return { ...acc, password: defaultPwd };
      }
      return acc;
    });
  } catch (e) {
    console.error('Failed to load accounts from localStorage', e);
    return INITIAL_ACCOUNTS;
  }
}

export function saveAccounts(accounts: UserAccount[]) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to localStorage', e);
  }
}

export function loadCurrentAccountId(): string | null {
  try {
    const current = localStorage.getItem(CURRENT_ACCOUNT_KEY);
    return current || null;
  } catch {
    return null;
  }
}

export function saveCurrentAccountId(id: string) {
  try {
    localStorage.setItem(CURRENT_ACCOUNT_KEY, id);
  } catch (e) {
    console.error('Failed to save current account id to localStorage', e);
  }
}

export function clearCurrentAccountId() {
  try {
    localStorage.removeItem(CURRENT_ACCOUNT_KEY);
  } catch (e) {
    console.error('Failed to clear current account id', e);
  }
}

export function resetAllData(): { tickets: Ticket[]; technicians: Technician[]; accounts: UserAccount[] } {
  localStorage.removeItem(TICKETS_KEY);
  localStorage.removeItem(TECHNICIANS_KEY);
  localStorage.removeItem(ACCOUNTS_KEY);
  localStorage.removeItem(CURRENT_ACCOUNT_KEY);
  saveTickets(INITIAL_TICKETS);
  saveTechnicians(INITIAL_TECHNICIANS);
  saveAccounts(INITIAL_ACCOUNTS);
  saveCurrentAccountId(INITIAL_ACCOUNTS[0].id);
  return { tickets: INITIAL_TICKETS, technicians: INITIAL_TECHNICIANS, accounts: INITIAL_ACCOUNTS };
}

export function exportTicketsToCSV(tickets: Ticket[]) {
  const headers = [
    '工單編號',
    '服務責任分區',
    '狀態',
    '客戶名稱',
    '聯絡人',
    '聯絡電話',
    '裝機地點',
    '設備名稱',
    '設備編號',
    '設備類別',
    '故障類型',
    '故障描述',
    '指派技師',
    '叫修時間',
    '完工時間',
    '零件費總計',
    '客戶滿意度評分',
    '取消時間',
    '取消操作人',
    '取消原因',
  ];

  const rows = tickets.map((t) => {
    const partsTotal = t.partsUsed?.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0) || 0;
    return [
      t.id,
      t.region || '市區',
      t.status,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      `"${(t.contactPerson || '').replace(/"/g, '""')}"`,
      t.contactPhone || '',
      `"${(t.address || '').replace(/"/g, '""')}"`,
      `"${(t.equipmentName || '').replace(/"/g, '""')}"`,
      t.equipmentCode || '',
      t.equipmentCategory || '',
      t.faultCategory || '',
      `"${(t.faultDescription || '').replace(/"/g, '""')}"`,
      t.assignedTechnicianName || '未派工',
      t.createdAt || '',
      t.completedAt || '',
      partsTotal,
      t.customerRating ? `${t.customerRating} 星` : '未評分',
      t.cancelledAt || '',
      t.cancelledBy || '',
      `"${(t.cancelReason || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `維修叫修工單分區清冊_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAllDataJSON(tickets: Ticket[], technicians: Technician[], accounts?: UserAccount[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '2.1',
    regions: ['市區', '大武區', '關山區', '成功區'],
    tickets,
    technicians,
    accounts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `設備維護系統資料備份_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
