export type TicketStatus = 
  | 'pending_dispatch' // 待派工
  | 'dispatched'       // 已派工 (待接單)
  | 'accepted'         // 已接單 (前往中/已排程)
  | 'in_progress'      // 維修中 (現場檢修)
  | 'waiting_parts'    // 待料中 (等待備品備件)
  | 'completed'        // 已完工 (待客戶驗收)
  | 'closed'           // 已結案 (客戶已簽認)
  | 'cancelled';       // 已取消 (管理員取消)

export type ServiceRegion = '市區' | '大武區' | '關山區' | '成功區';

export const SERVICE_REGIONS: ServiceRegion[] = ['市區', '大武區', '關山區', '成功區'];

export const REGION_CONFIG: Record<
  ServiceRegion, 
  { 
    label: string; 
    short: string; 
    townships: string; 
    iconEmoji: string; 
    themeColor: string; 
    badgeBg: string; 
    badgeText: string; 
    badgeBorder: string; 
    cardBg: string;
    cardBorder: string;
    accentBar: string;
    description: string;
  }
> = {
  市區: {
    label: '市區 (台東市/卑南/綠島蘭嶼)',
    short: '市區',
    townships: '台東市、卑南鄉、綠島、蘭嶼',
    iconEmoji: '🏢',
    themeColor: 'blue',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    cardBg: 'bg-blue-50/30',
    cardBorder: 'border-blue-200',
    accentBar: 'bg-blue-600',
    description: '市政商圈、豐樂工業區、醫療院所與大專院校核心責任區',
  },
  大武區: {
    label: '大武區 (太麻里/金峰/大武/達仁)',
    short: '大武區',
    townships: '太麻里鄉、金峰鄉、大武鄉、達仁鄉',
    iconEmoji: '⛰️',
    themeColor: 'amber',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    cardBg: 'bg-amber-50/30',
    cardBorder: 'border-amber-200',
    accentBar: 'bg-amber-600',
    description: '南迴公路幹線沿線、農林能源與備援動力重電責任區',
  },
  關山區: {
    label: '關山區 (鹿野/延平/關山/海端/池上)',
    short: '關山區',
    townships: '鹿野鄉、延平鄉、關山鎮、海端鄉、池上鄉',
    iconEmoji: '🌾',
    themeColor: 'emerald',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    cardBg: 'bg-emerald-50/30',
    cardBorder: 'border-emerald-200',
    accentBar: 'bg-emerald-600',
    description: '花東縱谷農業加工、碾米生技與觀光休閒農特產機電責任區',
  },
  成功區: {
    label: '成功區 (東河/成功/長濱)',
    short: '成功區',
    townships: '東河鄉、成功鎮、長濱鄉',
    iconEmoji: '🌊',
    themeColor: 'cyan',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-200',
    cardBg: 'bg-cyan-50/30',
    cardBorder: 'border-cyan-200',
    accentBar: 'bg-cyan-600',
    description: '東部海岸線新港漁港低溫急速冷凍、水產加工與給排水責任區',
  },
};

export type EquipmentCategory = 
  | '商用列表機' 
  | '家用列表機' 
  | '辦公儀器' 
  | '影音設備' 
  | '工程儀器';

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  '商用列表機',
  '家用列表機',
  '辦公儀器',
  '影音設備',
  '工程儀器',
];

export const EQUIPMENT_CATEGORY_CONFIG: Record<
  EquipmentCategory,
  {
    label: string;
    iconEmoji: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    description: string;
  }
> = {
  商用列表機: {
    label: '商用列表機',
    iconEmoji: '🖨️',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    description: '高速彩色/黑白數位複合機、大型事務機、租賃機台維護',
  },
  家用列表機: {
    label: '家用列表機',
    iconEmoji: '📠',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200',
    description: '連續供墨噴墨印表機、家用相片複合機、小型傳真機',
  },
  辦公儀器: {
    label: '辦公儀器',
    iconEmoji: '🗄️',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    description: '重型工業碎紙機、電動裝訂膠裝機、驗鈔點鈔機、考勤打卡鐘',
  },
  影音設備: {
    label: '影音設備',
    iconEmoji: '📽️',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    description: '4K高流明雷射投影機、會議視訊視聽系統、數位擴大機喇叭',
  },
  工程儀器: {
    label: '工程儀器',
    iconEmoji: '📐',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: '全測站光波電子經緯儀、大圖工程繪圖機、雷射測距水準儀',
  },
};

export interface PartItem {
  id: string;
  name: string;
  spec: string;
  quantity: number;
  unitPrice: number;
}

export interface TicketActivity {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: 
    | 'created' 
    | 'dispatched' 
    | 'accepted' 
    | 'self_claimed'
    | 'transferred' 
    | 'started' 
    | 'waiting_parts' 
    | 'resumed' 
    | 'completed' 
    | 'closed' 
    | 'cancelled'
    | 'note_added';
  title: string;
  notes?: string;
  meta?: {
    fromTech?: string;
    toTech?: string;
    reason?: string;
    partsCount?: number;
    rating?: number;
  };
}

export interface Ticket {
  id: string; // e.g., TK-20261018-001
  region: ServiceRegion; // 服務分區: 市區, 大武區, 關山區, 成功區
  customerName: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  equipmentName: string;
  equipmentCode: string;
  equipmentCategory: EquipmentCategory;
  serialNumber: string;
  locationRoom: string; // 廠區位置或機房位置
  faultCategory?: string;
  faultDescription: string;
  requestedVisitTime: string; // 期望到場時段
  createdAt: string;

  status: TicketStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  dispatchNotes?: string;
  dispatchedAt?: string;

  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  closedAt?: string;

  // Cancellation fields
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;

  faultDiagnosis?: string; // 技師現場故障診斷
  repairActionTaken?: string; // 排除措施
  waitingPartsReason?: string; // 待料原因
  partsUsed: PartItem[]; // 使用零件耗材

  customerSignName?: string;
  customerRating?: number; // 1-5
  customerFeedback?: string;

  timeline: TicketActivity[];
}

export interface Technician {
  id: string;
  name: string;
  title: string;
  phone: string;
  specialties: string[];
  activeTicketsCount: number;
  completedCount: number;
  rating: number;
  status: 'available' | 'busy' | 'off_duty';
  permissionLevel?: PermissionLevel; // 'admin' | 'user'
  username?: string; // 關聯之登入帳號
}

export type PermissionLevel = 'admin' | 'user';

export interface AccountPermissions {
  canManageTeam: boolean;      // 管理員: true, 使用者: false
  canDeleteTicket: boolean;    // 管理員: true, 使用者: false (刪除工單權限)
  canCancelTicket?: boolean;   // 相容性保留
  canDispatch: boolean;
  canSelfClaim: boolean;
  canExecuteRepair: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string; // 密碼控管
  name: string;
  roleTitle: string;
  department: string;
  phone: string;
  permissionLevel: PermissionLevel;
  associatedTechId?: string;
  permissions: AccountPermissions;
}

export type UserRole = 
  | 'dispatcher'   // 調度客服主管 (張督導)
  | 'technician_1' // 資深空調工程師 (林志豪)
  | 'technician_2' // 電控自動化工程師 (吳建宇)
  | 'technician_3' // 精密機械工程師 (張家銘)
  | 'supervisor';  // 運維處處長 (陳處長)
