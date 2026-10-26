import React, { useState } from 'react';
import { 
  Technician, 
  Ticket, 
  TicketActivity, 
  ServiceRegion, 
  SERVICE_REGIONS, 
  REGION_CONFIG,
  EquipmentCategory,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CATEGORY_CONFIG
} from '../types/ticket';
import { X, Sparkles, UserCheck, MapPin, PlusCircle, Building2 } from 'lucide-react';
import { getCurrentTimeString } from '../utils/formatters';

interface NewTicketModalProps {
  technicians?: Technician[];
  onClose: () => void;
  onSubmit: (newTicket: Ticket) => void;
}

const TEMPLATES: Array<{
  title: string;
  region: ServiceRegion;
  customerName: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  equipmentName: string;
  equipmentCode: string;
  equipmentCategory: EquipmentCategory;
  serialNumber: string;
  locationRoom: string;
  faultDescription: string;
  requestedVisitTime: string;
}> = [
  {
    title: '【市區】馬偕醫院 高速商用複合機',
    region: '市區',
    customerName: '台東馬偕紀念醫院 醫療行政棟',
    contactPerson: '王組長 (行政病歷課)',
    contactPhone: '0918-888-234',
    address: '台東縣台東市更生路 890 號 醫療棟 2F',
    equipmentName: 'Fuji Xerox ApeosPort C3570 高速彩色數位複合機',
    equipmentCode: 'PRT-COP-01',
    equipmentCategory: '商用列表機',
    serialNumber: 'FX-AP-C3570-8812',
    locationRoom: '2F 行政病歷檔案中心',
    faultDescription: '雙面進紙掃描模組主板跳出「Error 010-327 定影加熱組件異常」，急診醫令處方籤列印停擺。',
    requestedVisitTime: '今天 1.5 小時內到場 (特急件)',
  },
  {
    title: '【關山區】池上多力米 全測站經緯儀',
    region: '關山區',
    customerName: '池上多力米生物科技農業園區 營建工務課',
    contactPerson: '廖專員 (測量工程組)',
    contactPhone: '0952-778-901',
    address: '台東縣池上鄉新興村文化電信路 8 號 工務棟',
    equipmentName: 'Topcon GM-100 全測站高精度光波電子經緯儀',
    equipmentCode: 'ENG-SRV-01',
    equipmentCategory: '工程儀器',
    serialNumber: 'TP-GM105-4421',
    locationRoom: '工務棟 1F 儀器室',
    faultDescription: '雙軸傾斜補償感測器校正偏差「Tilt Sensor Error 04」，雷射測距光學測頭無法鎖定稜鏡反光。',
    requestedVisitTime: '今日下午 14:00 前',
  },
  {
    title: '【大武區】漁港物流 事務機轉印組件',
    region: '大武區',
    customerName: '大武漁港冷鏈物流中心 辦公室',
    contactPerson: '朱主任 (物流調度組)',
    contactPhone: '0928-112-334',
    address: '台東縣大武鄉尚武村環港路 35 號 物流調度中心 1F',
    equipmentName: 'Canon imageRUNNER ADVANCE DX C3835i 多功能事務機',
    equipmentCode: 'PRT-COP-02',
    equipmentCategory: '商用列表機',
    serialNumber: 'CN-IR-DX3835-901',
    locationRoom: '1F 調度室辦公前台',
    faultDescription: '黑色顯像碳粉匣刮刀老化，列印出貨單時右側出現縱向黑線帶。',
    requestedVisitTime: '明天上午 10:00',
  },
  {
    title: '【成功區】新港漁會 4K工程雷射投影機',
    region: '成功區',
    customerName: '新港區漁會 國際漁業拍賣多功能視聽大禮堂',
    contactPerson: '許廠長 (漁會行政課)',
    contactPhone: '0970-334-556',
    address: '台東縣成功鎮中山東路 1 號 漁業大樓 3F',
    equipmentName: 'Epson EB-PU2213B 13000流明 4K雷射工程投影機',
    equipmentCode: 'AV-PRJ-01',
    equipmentCategory: '影音設備',
    serialNumber: 'EP-EB-PU2213-772',
    locationRoom: '3F 大禮堂懸吊投影機座',
    faultDescription: '散熱風道跳警報「Filter / Fan Speed Error」，雷射光源自動保護切斷降頻。',
    requestedVisitTime: '今天 16:30 前',
  },
];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ 
  technicians = [],
  onClose, 
  onSubmit 
}) => {
  // Region default
  const [region, setRegion] = useState<ServiceRegion>('市區');

  // ONLY REQUIRED FIELD: customerName
  const [customerName, setCustomerName] = useState('');

  // ALL OTHER FIELDS ARE OPTIONAL
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');

  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentCode, setEquipmentCode] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState<EquipmentCategory>('商用列表機');
  const [serialNumber, setSerialNumber] = useState('');
  const [locationRoom, setLocationRoom] = useState('');

  const [requestedVisitTime, setRequestedVisitTime] = useState('');
  const [faultDescription, setFaultDescription] = useState('');
  const [assignedTechId, setAssignedTechId] = useState<string>(''); // Default empty = unassigned

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setRegion(tpl.region);
    setCustomerName(tpl.customerName);
    setContactPerson(tpl.contactPerson);
    setContactPhone(tpl.contactPhone);
    setAddress(tpl.address);
    setEquipmentName(tpl.equipmentName);
    setEquipmentCode(tpl.equipmentCode);
    setEquipmentCategory(tpl.equipmentCategory);
    setSerialNumber(tpl.serialNumber);
    setLocationRoom(tpl.locationRoom);
    setRequestedVisitTime(tpl.requestedVisitTime);
    setFaultDescription(tpl.faultDescription);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only customerName is required!
    if (!customerName.trim()) {
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const ticketId = `TK-${dateStr}-${randomSeq}`;
    const nowTime = getCurrentTimeString();

    const selectedTech = technicians.find((t) => t.id === assignedTechId);

    const initialActivities: TicketActivity[] = [
      {
        id: `act-${Date.now()}`,
        timestamp: nowTime,
        actor: '服務台受理人員',
        actorRole: '工單建檔',
        action: 'created',
        title: `新增維修工單【${region}】${customerName.trim()}`,
        notes: `分區：【${region}】${contactPerson.trim() ? ` · 聯絡人：${contactPerson.trim()}` : ''}${faultDescription.trim() ? ` · 報修備註：${faultDescription.trim().slice(0, 60)}` : ''}`,
      },
    ];

    if (selectedTech) {
      initialActivities.push({
        id: `act-${Date.now() + 1}`,
        timestamp: nowTime,
        actor: '派工中心',
        actorRole: '調度員',
        action: 'dispatched' as const,
        title: `建單同時指派至 ${selectedTech.name} (${selectedTech.title})`,
        notes: '由受理人員直接指派專案技師。',
      });
    }

    const newTicket: Ticket = {
      id: ticketId,
      region,
      customerName: customerName.trim(),
      contactPerson: contactPerson.trim() || '未填寫',
      contactPhone: contactPhone.trim() || '未填寫',
      address: address.trim() || '未載明地址',
      equipmentName: equipmentName.trim() || '現場指定設備',
      equipmentCode: equipmentCode.trim() || `EQ-${Date.now().toString().slice(-4)}`,
      equipmentCategory,
      serialNumber: serialNumber.trim() || '未載明',
      locationRoom: locationRoom.trim() || '現場',
      faultDescription: faultDescription.trim() || '未特別備註，待現場檢視',
      requestedVisitTime: requestedVisitTime.trim() || '依排程盡快到場',
      createdAt: nowTime,
      status: selectedTech ? 'dispatched' : 'pending_dispatch',
      assignedTechnicianId: selectedTech?.id,
      assignedTechnicianName: selectedTech?.name,
      dispatchedAt: selectedTech ? nowTime : undefined,
      dispatchNotes: selectedTech ? '建單直接指派' : undefined,
      partsUsed: [],
      timeline: initialActivities,
    };

    onSubmit(newTicket);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
              工單管理系統 · 快速設備報修建檔
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              新增維修工單
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick template bar */}
        <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center gap-2 text-xs overflow-x-auto">
          <span className="text-blue-700 font-semibold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 快速填寫分區範本：
          </span>
          {TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="px-2.5 py-1 bg-white hover:bg-blue-100/70 text-slate-700 hover:text-blue-800 rounded border border-blue-200 shrink-0 font-medium transition-colors whitespace-nowrap text-[11px]"
            >
              {tpl.title}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 0: Service Region Selection */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              工單所屬責任分區 (選填，預設市區)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {SERVICE_REGIONS.map((reg) => {
                const cfg = REGION_CONFIG[reg];
                const isSelected = region === reg;
                return (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setRegion(reg)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? `bg-white border-blue-600 ring-2 ring-blue-500/30 shadow-2xs`
                        : 'bg-white/80 border-slate-200 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-slate-900">
                      <span>{cfg.iconEmoji}</span>
                      <span>{reg}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5" title={cfg.townships}>
                      {cfg.townships}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 1: Customer details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                客戶資料
              </h3>
              <span className="text-[11px] text-slate-500">
                僅 <strong className="text-rose-600">客戶公司/機構廠區名稱</strong> 為必填
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  客戶公司 / 機構廠區名稱
                  <span className="text-rose-600 font-bold">* (唯一必填)</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="例如：台東馬偕醫院 或 豐樂精密工業（必填）"
                  className="w-full px-3 py-2 border-2 border-blue-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  現場聯絡人 / 職稱 (選填)
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="例如：王經理 (廠務課)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  聯絡電話 / 手機 (選填)
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="例如：0912-345-678"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  裝機地址 / 廠區位置 (選填)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例如：台東市更生路 890 號"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Equipment details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              設備明細規格 (全為選填)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  設備品名 / 型號 (選填)
                </label>
                <input
                  type="text"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="例如：Fuji Xerox C3570 複合機（選填）"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  設備專業類別 (選填)
                </label>
                <select
                  value={equipmentCategory}
                  onChange={(e) => setEquipmentCategory(e.target.value as EquipmentCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {EQUIPMENT_CATEGORIES.map((cat) => {
                    const cfg = EQUIPMENT_CATEGORY_CONFIG[cat];
                    return (
                      <option key={cat} value={cat}>
                        {cfg?.iconEmoji} {cat}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  設備編號 / Code (選填)
                </label>
                <input
                  type="text"
                  value={equipmentCode}
                  onChange={(e) => setEquipmentCode(e.target.value)}
                  placeholder="例如：PRT-COP-03"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  原廠序號 (S/N) (選填)
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="例如：SN-YK-9982"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  安裝位置 / 機房樓層 (選填)
                </label>
                <input
                  type="text"
                  value={locationRoom}
                  onChange={(e) => setLocationRoom(e.target.value)}
                  placeholder="例如：2F 辦公室前台"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Fault description & urgency */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              叫修描述與約定時段 (全為選填)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  期望到場時段 / 急迫度 (選填)
                </label>
                <input
                  type="text"
                  value={requestedVisitTime}
                  onChange={(e) => setRequestedVisitTime(e.target.value)}
                  placeholder="例如：今天下午、明天上午或配合排程（選填）"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  故障現象描述 / 備註說明 (選填)
                </label>
                <textarea
                  rows={3}
                  value={faultDescription}
                  onChange={(e) => setFaultDescription(e.target.value)}
                  placeholder="記錄客戶通報之故障現象、報警代碼、備註說明...（選填）"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Optional immediate dispatch */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>直接指定派工工程師 (選填，留空則進入待派工清單供調度或技師自主接單)</span>
            </div>
            <select
              value={assignedTechId}
              onChange={(e) => setAssignedTechId(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            >
              <option value="">-- 不指定（保留為待派工，由調度員或技師自主接單）--</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} - {tech.title} (手頭進行中: {tech.activeTicketsCount} 件 | {tech.status === 'available' ? '可接單' : '出勤中'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              確認新增維修工單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
