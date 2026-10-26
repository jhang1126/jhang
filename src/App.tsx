import { useState, useEffect } from 'react';
import { Ticket, Technician, UserRole, UserAccount, PartItem, PermissionLevel, AccountPermissions } from './types/ticket';
import { 
  loadTickets, 
  saveTickets, 
  loadTechnicians, 
  saveTechnicians, 
  loadAccounts,
  saveAccounts,
  loadCurrentAccountId,
  saveCurrentAccountId,
  clearCurrentAccountId,
  resetAllData, 
  exportTicketsToCSV, 
  exportAllDataJSON 
} from './utils/storage';
import { getCurrentTimeString } from './utils/formatters';
import { Navbar, ActiveTab } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { TicketList } from './components/TicketList';
import { DispatchWorkbench } from './components/DispatchWorkbench';
import { TechnicianBoard } from './components/TechnicianBoard';
import { AnalyticsView } from './components/AnalyticsView';
import { TicketDetailModal } from './components/TicketDetailModal';
import { DispatchModal } from './components/DispatchModal';
import { TransferTicketModal } from './components/TransferTicketModal';
import { RepairProgressModal } from './components/RepairProgressModal';
import { CustomerSignoffModal } from './components/CustomerSignoffModal';
import { NewTicketModal } from './components/NewTicketModal';
import { TeamManagementView, UnifiedPersonnelItem } from './components/TeamManagementView';
import { TechnicianEditModal } from './components/TechnicianEditModal';
import { PrintTicketModal } from './components/PrintTicketModal';
import { DeleteTicketModal } from './components/DeleteTicketModal';
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { INITIAL_TICKETS, INITIAL_TECHNICIANS, INITIAL_ACCOUNTS } from './data/initialData';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  auth, 
  tryAutoAuth, 
  loginWithGoogle, 
  logoutFirebase, 
  subscribeToTickets, 
  subscribeToTechnicians, 
  subscribeToAccounts, 
  setFirestoreTicket, 
  deleteFirestoreTicket, 
  setFirestoreTechnician, 
  deleteFirestoreTechnician, 
  setFirestoreAccount, 
  deleteFirestoreAccount, 
  seedFirestoreIfEmpty 
} from './services/firebase';
import { 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  PhoneCall,
  UserCheck,
  ShieldCheck,
  User,
  KeyRound,
  Ban,
  Lock
} from 'lucide-react';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(() => {
    const loadedAccs = loadAccounts();
    const currentId = loadCurrentAccountId();
    if (!currentId) return null;
    return loadedAccs.find((a) => a.id === currentId) || null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('tickets');
  const [userRole, setUserRole] = useState<UserRole>('dispatcher');

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [dispatchTicket, setDispatchTicket] = useState<Ticket | null>(null);
  const [transferTicket, setTransferTicket] = useState<Ticket | null>(null);
  const [progressModal, setProgressModal] = useState<{
    ticket: Ticket;
    mode: 'start' | 'waiting_parts' | 'resume' | 'complete';
  } | null>(null);
  const [signoffTicket, setSignoffTicket] = useState<Ticket | null>(null);
  const [printTicket, setPrintTicket] = useState<Ticket | null>(null);
  const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | 'new' | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Firebase Cloud Sync & Multi-user states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Notification banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 1. Initial local load
  useEffect(() => {
    const loadedTickets = loadTickets();
    const loadedTechs = loadTechnicians();
    const loadedAccs = loadAccounts();
    const currentId = loadCurrentAccountId();
    const activeAcc = currentId ? loadedAccs.find((a) => a.id === currentId) || null : null;

    setTickets(loadedTickets);
    setTechnicians(loadedTechs);
    setAccounts(loadedAccs);
    setCurrentAccount(activeAcc);

    // Initial check and seed Firestore if database is empty
    seedFirestoreIfEmpty(INITIAL_TICKETS, INITIAL_TECHNICIANS, INITIAL_ACCOUNTS);
  }, []);

  // 2. Firebase Auth state listener and auto auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });

    tryAutoAuth();
    return () => unsubscribe();
  }, []);

  // 3. Real-time multi-user synchronization with Firestore
  useEffect(() => {
    setIsCloudSyncing(true);
    let isInitialLoad = true;

    const unsubTickets = subscribeToTickets(
      (cloudTickets) => {
        // If cloud tickets exist or after initial load, sync to state
        if (cloudTickets.length > 0 || !isInitialLoad) {
          setTickets(cloudTickets);
          saveTickets(cloudTickets);
        } else if (isInitialLoad && cloudTickets.length === 0) {
          // If first connection and cloud is totally empty, trigger seed
          seedFirestoreIfEmpty(INITIAL_TICKETS, INITIAL_TECHNICIANS, INITIAL_ACCOUNTS);
        }
        isInitialLoad = false;
        setIsCloudSyncing(false);
      },
      (err) => {
        console.warn('Real-time tickets sync note:', err);
        setIsCloudSyncing(false);
      }
    );

    const unsubTechs = subscribeToTechnicians(
      (cloudTechs) => {
        if (cloudTechs.length > 0) {
          setTechnicians(cloudTechs);
          saveTechnicians(cloudTechs);
        }
      },
      (err) => console.warn('Real-time techs sync note:', err)
    );

    const unsubAccounts = subscribeToAccounts(
      (cloudAccounts) => {
        if (cloudAccounts.length > 0) {
          setAccounts(cloudAccounts);
          saveAccounts(cloudAccounts);
        }
      },
      (err) => console.warn('Real-time accounts sync note:', err)
    );

    return () => {
      unsubTickets();
      unsubTechs();
      unsubAccounts();
    };
  }, []);

  // Google Sign-In & Sign-Out handlers for Firebase
  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      setFirebaseUser(user);
      showToast(`已成功登入 Google 雲端帳戶：${user.email || user.displayName || '已連線'}，多人即時同步已啟動！`);
    } catch (err: unknown) {
      console.error(err);
      showToast('Google 登入未完成或已取消', 'info');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutFirebase();
      setFirebaseUser(null);
      showToast('已登出 Google 雲端連線，目前為本機離線模式', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Sync state to local storage
  const updateTicketsState = (newTickets: Ticket[]) => {
    setTickets(newTickets);
    saveTickets(newTickets);

    // Also update current selectedTicket reference if open
    if (selectedTicket) {
      const updated = newTickets.find((t) => t.id === selectedTicket.id);
      if (updated) {
        setSelectedTicket(updated);
      } else {
        setSelectedTicket(null);
      }
    }
  };

  const updateTechniciansState = (newTechs: Technician[]) => {
    setTechnicians(newTechs);
    saveTechnicians(newTechs);
  };

  const handleSelectAccount = (account: UserAccount) => {
    setCurrentAccount(account);
    saveCurrentAccountId(account.id);

    // Link appropriate perspective if account maps to a technician
    if (account.associatedTechId === 'tech-1') {
      setUserRole('technician_1');
    } else if (account.associatedTechId === 'tech-2') {
      setUserRole('technician_2');
    } else if (account.associatedTechId === 'tech-3') {
      setUserRole('technician_3');
    } else if (account.permissionLevel === 'admin') {
      if (account.username === 'admin_chen') {
        setUserRole('supervisor');
      } else {
        setUserRole('dispatcher');
      }
    }

    const levelText = account.permissionLevel === 'admin' ? '系統管理員 (擁有團隊管理與工單取消權限)' : '一般使用者 (無團隊管理與取消權限)';
    showToast(`已成功登入帳戶：${account.name} · ${levelText}`);
  };

  const handleCreateAccount = (newAcc: UserAccount) => {
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    saveAccounts(updated);
    setFirestoreAccount(newAcc).catch((err) => console.warn('Cloud sync note:', err));
  };

  const handleUpdateAccountPassword = (accountId: string, newPassword: string) => {
    const target = accounts.find((a) => a.id === accountId);
    if (target) {
      setFirestoreAccount({ ...target, password: newPassword }).catch((err) => console.warn('Cloud sync note:', err));
    }
    const updated = accounts.map((acc) => {
      if (acc.id === accountId) {
        return { ...acc, password: newPassword };
      }
      return acc;
    });
    setAccounts(updated);
    saveAccounts(updated);
    if (currentAccount?.id === accountId) {
      setCurrentAccount({ ...currentAccount, password: newPassword });
    }
    showToast('個人密碼已成功更新！');
  };

  const handleLogout = () => {
    clearCurrentAccountId();
    setCurrentAccount(null);
    setShowAccountModal(false);
    showToast('已登出個人帳號，請輸入帳號密碼登入系統', 'info');
  };

  const handleLoginFromScreen = (account: UserAccount) => {
    setCurrentAccount(account);
    saveCurrentAccountId(account.id);

    if (account.associatedTechId === 'tech-1') {
      setUserRole('technician_1');
    } else if (account.associatedTechId === 'tech-2') {
      setUserRole('technician_2');
    } else if (account.associatedTechId === 'tech-3') {
      setUserRole('technician_3');
    } else if (account.permissionLevel === 'admin') {
      if (account.username === 'admin_chen') {
        setUserRole('supervisor');
      } else {
        setUserRole('dispatcher');
      }
    }

    const levelText = account.permissionLevel === 'admin' ? '系統管理員 (擁有團隊管理與工單取消權限)' : '一般使用者 (無團隊管理與取消權限)';
    showToast(`歡迎登入：${account.name} · 身分：${levelText}`);
  };

  // Current active technician based on role or account
  const currentTechnician = technicians.find((t) => {
    if (currentAccount?.associatedTechId) return t.id === currentAccount.associatedTechId;
    if (userRole === 'technician_1') return t.id === 'tech-1';
    if (userRole === 'technician_2') return t.id === 'tech-2';
    if (userRole === 'technician_3') return t.id === 'tech-3';
    return false;
  }) || technicians[0];

  const currentActorName = currentAccount ? `${currentAccount.name} (${currentAccount.roleTitle})` : '';

  // 1. Create New Ticket (from customer phone call)
  const handleCreateTicket = (newTicket: Ticket) => {
    const updated = [newTicket, ...tickets];
    updateTicketsState(updated);
    setFirestoreTicket(newTicket).catch((err) => console.warn('Cloud sync note:', err));
    setShowNewTicketModal(false);
    if (newTicket.assignedTechnicianName) {
      showToast(`維修工單 [${newTicket.id}] 新增成功，已直接指派給 ${newTicket.assignedTechnicianName}！`);
    } else {
      showToast(`維修工單 [${newTicket.id}] 新增成功，已納入待派工池，開放工程師自主接單！`);
    }
  };

  // 2. Dispatch Ticket (by dispatcher / admin)
  const handleDispatch = (ticketId: string, technicianId: string, notes: string) => {
    const targetTech = technicians.find((t) => t.id === technicianId);
    if (!targetTech) return;

    const nowTime = getCurrentTimeString();
    let dispatchedTicket: Ticket | undefined;
    const updatedTickets = tickets.map((t) => {
      if (t.id === ticketId) {
        dispatchedTicket = {
          ...t,
          status: 'dispatched' as const,
          assignedTechnicianId: targetTech.id,
          assignedTechnicianName: targetTech.name,
          dispatchedAt: nowTime,
          dispatchNotes: notes,
          timeline: [
            ...t.timeline,
            {
              id: `act-${Date.now()}`,
              timestamp: nowTime,
              actor: currentActorName,
              actorRole: currentAccount ? currentAccount.roleTitle : '調度員',
              action: 'dispatched' as const,
              title: `指派工單至 ${targetTech.name} (${targetTech.title})`,
              notes: notes || undefined,
            },
          ],
        };
        return dispatchedTicket;
      }
      return t;
    });

    // Update technician load
    let updatedTargetTech: Technician | undefined;
    const updatedTechs = technicians.map((tech) => {
      if (tech.id === technicianId) {
        updatedTargetTech = { ...tech, activeTicketsCount: tech.activeTicketsCount + 1, status: 'busy' as const };
        return updatedTargetTech;
      }
      return tech;
    });

    updateTicketsState(updatedTickets);
    updateTechniciansState(updatedTechs);
    if (dispatchedTicket) setFirestoreTicket(dispatchedTicket).catch(() => {});
    if (updatedTargetTech) setFirestoreTechnician(updatedTargetTech).catch(() => {});
    setDispatchTicket(null);
    showToast(`已成功分派工單至 ${targetTech.name} 工程師！`);
  };

  // 3. Self-Claim Ticket (工程師自行至待派工單接取工作)
  const handleSelfClaimTicket = (ticket: Ticket, tech?: Technician) => {
    const targetTech = tech || currentTechnician;
    const nowTime = getCurrentTimeString();

    let claimedTicket: Ticket | undefined;
    const updatedTickets = tickets.map((t) => {
      if (t.id === ticket.id) {
        claimedTicket = {
          ...t,
          status: 'accepted' as const, // Directly accepted into engineer's queue
          assignedTechnicianId: targetTech.id,
          assignedTechnicianName: targetTech.name,
          dispatchedAt: nowTime,
          acceptedAt: nowTime,
          timeline: [
            ...t.timeline,
            {
              id: `act-${Date.now()}`,
              timestamp: nowTime,
              actor: `${targetTech.name} (${targetTech.title})`,
              actorRole: '維修工程師',
              action: 'self_claimed' as const,
              title: `${targetTech.name} 自待派工單池主動接取此工單`,
              notes: '工程師依專業領域主動接單，已排定行程準備前往現場檢修。',
            },
          ],
        };
        return claimedTicket;
      }
      return t;
    });

    // Update technician active load
    let updatedTargetTech: Technician | undefined;
    const updatedTechs = technicians.map((t) => {
      if (t.id === targetTech.id) {
        updatedTargetTech = { ...t, activeTicketsCount: t.activeTicketsCount + 1, status: 'busy' as const };
        return updatedTargetTech;
      }
      return t;
    });

    updateTicketsState(updatedTickets);
    updateTechniciansState(updatedTechs);
    if (claimedTicket) setFirestoreTicket(claimedTicket).catch(() => {});
    if (updatedTargetTech) setFirestoreTechnician(updatedTargetTech).catch(() => {});
    showToast(`工程師 ${targetTech.name} 已成功自主接取工單 [${ticket.id}]！`);
  };

  // 4. Accept Ticket (技師確認由主管指派的工單)
  const handleAcceptTicket = (ticket: Ticket) => {
    const nowTime = getCurrentTimeString();
    const actor = ticket.assignedTechnicianName || currentActorName;

    let acceptedTicket: Ticket | undefined;
    const updatedTickets = tickets.map((t) => {
      if (t.id === ticket.id) {
        acceptedTicket = {
          ...t,
          status: 'accepted' as const,
          acceptedAt: nowTime,
          timeline: [
            ...t.timeline,
            {
              id: `act-${Date.now()}`,
              timestamp: nowTime,
              actor,
              actorRole: '維修技師',
              action: 'accepted' as const,
              title: `${actor} 確認接單，已排程準備前往現場檢修`,
            },
          ],
        };
        return acceptedTicket;
      }
      return t;
    });

    updateTicketsState(updatedTickets);
    if (acceptedTicket) setFirestoreTicket(acceptedTicket).catch(() => {});
    showToast(`工單 [${ticket.id}] 技師已完成確認接單！`);
  };

  // 5. Transfer Ticket (工單轉發至其他工程師)
  const handleTransfer = (
    ticketId: string,
    targetTechnicianId: string,
    reason: string,
    handoverNotes: string
  ) => {
    const targetTech = technicians.find((t) => t.id === targetTechnicianId);
    if (!targetTech) return;

    const targetTicket = tickets.find((t) => t.id === ticketId);
    const oldTechId = targetTicket?.assignedTechnicianId;
    const oldTechName = targetTicket?.assignedTechnicianName || '原工程師';

    const nowTime = getCurrentTimeString();
    let transferredTicket: Ticket | undefined;
    const updatedTickets = tickets.map((t) => {
      if (t.id === ticketId) {
        transferredTicket = {
          ...t,
          status: 'dispatched' as const, // Back to dispatched, waiting for new technician acceptance
          assignedTechnicianId: targetTech.id,
          assignedTechnicianName: targetTech.name,
          dispatchedAt: nowTime,
          dispatchNotes: `由 ${oldTechName} 轉發至 ${targetTech.name}。轉單原因：${reason}。交接說明：${handoverNotes}`,
          timeline: [
            ...t.timeline,
            {
              id: `act-${Date.now()}`,
              timestamp: nowTime,
              actor: currentActorName,
              actorRole: '維修工程師/調度員',
              action: 'transferred' as const,
              title: `工單轉發：由 ${oldTechName} 轉發移交給 ${targetTech.name}`,
              notes: `轉發原因：${reason}。\n交接與注意事項：${handoverNotes}`,
              meta: {
                fromTech: oldTechName,
                toTech: targetTech.name,
                reason,
              },
            },
          ],
        };
        return transferredTicket;
      }
      return t;
    });

    // Update technician loads
    let oldTechDoc: Technician | undefined;
    let newTechDoc: Technician | undefined;
    const updatedTechs = technicians.map((tech) => {
      if (tech.id === oldTechId) {
        oldTechDoc = { ...tech, activeTicketsCount: Math.max(0, tech.activeTicketsCount - 1) };
        return oldTechDoc;
      }
      if (tech.id === targetTechnicianId) {
        newTechDoc = { ...tech, activeTicketsCount: tech.activeTicketsCount + 1 };
        return newTechDoc;
      }
      return tech;
    });

    updateTicketsState(updatedTickets);
    updateTechniciansState(updatedTechs);
    if (transferredTicket) setFirestoreTicket(transferredTicket).catch(() => {});
    if (oldTechDoc) setFirestoreTechnician(oldTechDoc).catch(() => {});
    if (newTechDoc) setFirestoreTechnician(newTechDoc).catch(() => {});
    setTransferTicket(null);
    showToast(`工單 [${ticketId}] 已成功轉發至 ${targetTech.name} (${targetTech.title})！`);
  };

  // 6. Repair Progress Action (到達現場、回報待料、恢復施工、申報完工)
  const handleProgressSubmit = (data: {
    status: Ticket['status'];
    actionTitle: string;
    notes?: string;
    faultDiagnosis?: string;
    repairActionTaken?: string;
    waitingPartsReason?: string;
    partsUsed?: PartItem[];
  }) => {
    if (!progressModal) return;
    const { ticket, mode } = progressModal;
    const nowTime = getCurrentTimeString();

    let updatedProgressTicket: Ticket | undefined;
    const updatedTickets = tickets.map((t) => {
      if (t.id === ticket.id) {
        let actType: Ticket['timeline'][0]['action'] = 'note_added';
        if (mode === 'start') actType = 'started';
        else if (mode === 'waiting_parts') actType = 'waiting_parts';
        else if (mode === 'resume') actType = 'resumed';
        else if (mode === 'complete') actType = 'completed';

        updatedProgressTicket = {
          ...t,
          status: data.status,
          startedAt: mode === 'start' ? nowTime : t.startedAt,
          completedAt: mode === 'complete' ? nowTime : t.completedAt,
          faultDiagnosis: data.faultDiagnosis || t.faultDiagnosis,
          repairActionTaken: data.repairActionTaken || t.repairActionTaken,
          waitingPartsReason: data.waitingPartsReason || (mode === 'resume' ? undefined : t.waitingPartsReason),
          partsUsed: data.partsUsed !== undefined ? data.partsUsed : t.partsUsed,
          timeline: [
            ...t.timeline,
            {
              id: `act-${Date.now()}`,
              timestamp: nowTime,
              actor: currentActorName,
              actorRole: '維修技師',
              action: actType,
              title: data.actionTitle,
              notes: data.notes || data.faultDiagnosis || data.repairActionTaken || data.waitingPartsReason || undefined,
            },
          ],
        };
        return updatedProgressTicket;
      }
      return t;
    });

    updateTicketsState(updatedTickets);
    if (updatedProgressTicket) setFirestoreTicket(updatedProgressTicket).catch(() => {});
    setProgressModal(null);
    showToast(`工單 [${ticket.id}] 進度狀態已更新！`);
  };

  // 7. Customer Signoff (客戶驗收簽名結案)
  const handleSignoff = (
    ticketId: string,
    signName: string,
    rating: number,
    feedback: string
  ) => {
    const nowTime = getCurrentTimeString();

    let signedTicket: Ticket | undefined;
    const updatedTickets = tickets.map((t) => {
      if (t.id === ticketId) {
        signedTicket = {
          ...t,
          status: 'closed' as const,
          closedAt: nowTime,
          customerSignName: signName,
          customerRating: rating,
          customerFeedback: feedback,
          timeline: [
            ...t.timeline,
            {
              id: `act-${Date.now()}`,
              timestamp: nowTime,
              actor: signName,
              actorRole: '客戶現場窗口',
              action: 'closed' as const,
              title: `客戶現場簽認完成，服務評分 ${rating} 星`,
              notes: feedback ? `客戶回饋評語：${feedback}` : '客戶已於現場會同簽名確認驗收無誤。',
              meta: { rating },
            },
          ],
        };
        return signedTicket;
      }
      return t;
    });

    // Update technician completed count
    const targetTicket = tickets.find((t) => t.id === ticketId);
    let updatedAssignedTech: Technician | undefined;
    if (targetTicket?.assignedTechnicianId) {
      const updatedTechs = technicians.map((tech) => {
        if (tech.id === targetTicket.assignedTechnicianId) {
          updatedAssignedTech = {
            ...tech,
            activeTicketsCount: Math.max(0, tech.activeTicketsCount - 1),
            completedCount: tech.completedCount + 1,
          };
          return updatedAssignedTech;
        }
        return tech;
      });
      updateTechniciansState(updatedTechs);
    }

    updateTicketsState(updatedTickets);
    if (signedTicket) setFirestoreTicket(signedTicket).catch(() => {});
    if (updatedAssignedTech) setFirestoreTechnician(updatedAssignedTech).catch(() => {});
    setSignoffTicket(null);
    showToast(`工單 [${ticketId}] 已完成現場驗收簽核結案！`);
  };

  // 8. Delete Ticket (系統管理員專屬權限：完全刪除工單不留紀錄)
  const handleDeleteTicket = (ticketId: string) => {
    if (
      !currentAccount ||
      (currentAccount.permissionLevel !== 'admin' &&
        !currentAccount.permissions.canDeleteTicket &&
        !currentAccount.permissions.canCancelTicket)
    ) {
      showToast('權限不足：僅系統管理員具有刪除工單權限！', 'error');
      return;
    }

    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    // If the ticket was assigned to an engineer and was in active status, decrease active tickets count
    if (
      targetTicket.assignedTechnicianId &&
      (targetTicket.status === 'dispatched' ||
        targetTicket.status === 'accepted' ||
        targetTicket.status === 'in_progress' ||
        targetTicket.status === 'waiting_parts')
    ) {
      let updatedAssignedTech: Technician | undefined;
      const updatedTechs = technicians.map((tech) => {
        if (tech.id === targetTicket.assignedTechnicianId) {
          updatedAssignedTech = {
            ...tech,
            activeTicketsCount: Math.max(0, tech.activeTicketsCount - 1),
          };
          return updatedAssignedTech;
        }
        return tech;
      });
      updateTechniciansState(updatedTechs);
      if (updatedAssignedTech) setFirestoreTechnician(updatedAssignedTech).catch(() => {});
    }

    // Completely remove the ticket from Firestore, storage & state without leaving any record
    deleteFirestoreTicket(ticketId).catch((err) => console.warn('Cloud delete ticket note:', err));
    const updatedTickets = tickets.filter((t) => t.id !== ticketId);
    updateTicketsState(updatedTickets);

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
    setDeleteTicket(null);
    showToast(`工單 [${ticketId}] 已完全刪除，不留任何紀錄！`);
  };

  // 9. Save/Add Technician (管理員編輯/新增團隊工程師)
  const handleSaveTechnician = (
    tech: Technician,
    accountData?: {
      permissionLevel: PermissionLevel;
      username: string;
      password?: string;
    }
  ) => {
    if (!currentAccount || !currentAccount.permissions.canManageTeam) {
      showToast('權限不足：僅系統管理員擁有團隊人員新增與編輯權限！', 'error');
      return;
    }

    const exists = technicians.some((t) => t.id === tech.id);
    let updatedTechs: Technician[];
    if (exists) {
      updatedTechs = technicians.map((t) => (t.id === tech.id ? tech : t));
      showToast(`人員 [${tech.name}] 資料已成功更新！`);
    } else {
      updatedTechs = [...technicians, tech];
      showToast(`已成功新增人員 [${tech.name}]！`);
    }
    updateTechniciansState(updatedTechs);
    setFirestoreTechnician(tech).catch((err) => console.warn('Cloud save tech note:', err));

    // Sync or create associated UserAccount
    if (accountData) {
      const existingAccIndex = accounts.findIndex(
        (a) => a.id === tech.id || a.associatedTechId === tech.id || a.name === tech.name || a.username.toLowerCase() === accountData.username.toLowerCase()
      );

      const targetPermissions: AccountPermissions = {
        canManageTeam: accountData.permissionLevel === 'admin',
        canDeleteTicket: accountData.permissionLevel === 'admin',
        canCancelTicket: accountData.permissionLevel === 'admin',
        canDispatch: true,
        canSelfClaim: true,
        canExecuteRepair: true,
      };

      let updatedAccounts: UserAccount[];
      let savedAcc: UserAccount;

      if (existingAccIndex >= 0) {
        const existingAcc = accounts[existingAccIndex];
        savedAcc = {
          ...existingAcc,
          name: tech.name,
          username: accountData.username,
          password: accountData.password || existingAcc.password,
          roleTitle: tech.title,
          phone: tech.phone,
          permissionLevel: accountData.permissionLevel,
          associatedTechId: tech.id,
          permissions: targetPermissions,
        };
        updatedAccounts = [...accounts];
        updatedAccounts[existingAccIndex] = savedAcc;

        if (currentAccount && currentAccount.id === existingAcc.id) {
          setCurrentAccount(savedAcc);
        }
      } else {
        savedAcc = {
          id: `acc-tech-${Date.now()}`,
          username: accountData.username,
          password: accountData.password || (accountData.permissionLevel === 'admin' ? 'admin123' : 'user123'),
          name: tech.name,
          roleTitle: tech.title,
          department: accountData.permissionLevel === 'admin' ? '運維管理處' : '維護技術工程組',
          phone: tech.phone,
          permissionLevel: accountData.permissionLevel,
          associatedTechId: tech.id,
          permissions: targetPermissions,
        };
        updatedAccounts = [...accounts, savedAcc];
      }

      setAccounts(updatedAccounts);
      saveAccounts(updatedAccounts);
      setFirestoreAccount(savedAcc).catch((err) => console.warn('Cloud save account note:', err));
    }

    setEditingTechnician(null);
  };

  // 10. Delete Personnel Account (不管任何層級，只要登入者有管理員權限即可刪除任何人的帳號)
  const handleDeletePerson = (person: UnifiedPersonnelItem) => {
    if (!currentAccount || currentAccount.permissionLevel !== 'admin') {
      showToast('權限不足：僅系統管理員具有刪除人員帳號的權限！', 'error');
      return;
    }

    const isSelf =
      currentAccount.id === person.accountId ||
      currentAccount.id === person.id ||
      currentAccount.username.toLowerCase() === person.username.toLowerCase();
    const isAdmin = person.permissionLevel === 'admin';
    const roleDesc = isAdmin ? '系統管理員' : '一般使用者';

    // Check if this person currently has active assigned tickets
    const activeTickets = tickets.filter(
      (t) =>
        (t.assignedTechnicianId === person.techId ||
          t.assignedTechnicianId === person.id ||
          t.assignedTechnicianName === person.name) &&
        (t.status === 'dispatched' ||
          t.status === 'accepted' ||
          t.status === 'in_progress' ||
          t.status === 'waiting_parts')
    );

    let confirmMsg = `確定要刪除人員帳號【${person.name}】(${roleDesc} · 帳號 @${person.username}) 嗎？\n此動作將一併清除該人員的系統登入帳號與名冊資料。`;
    if (activeTickets.length > 0) {
      confirmMsg += `\n\n⚠️ 注意：該人員目前尚有 ${activeTickets.length} 件未完修工單。\n刪除後，系統將自動將這些工單退回「待派工」佇列，供其他人員自主接單或調度重新安排。`;
    }
    if (isSelf) {
      confirmMsg += `\n\n🚨 特別提醒：您目前正以此帳號登入系統！\n刪除此帳號後，您將會立即被登出並返回登入畫面。`;
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    // 1. Reassign active tickets back to pending_dispatch if any
    if (activeTickets.length > 0) {
      const nowTime = getCurrentTimeString();
      const updatedTickets = tickets.map((t) => {
        const isTarget =
          (t.assignedTechnicianId === person.techId ||
            t.assignedTechnicianId === person.id ||
            t.assignedTechnicianName === person.name) &&
          (t.status === 'dispatched' ||
            t.status === 'accepted' ||
            t.status === 'in_progress' ||
            t.status === 'waiting_parts');

        if (isTarget) {
          return {
            ...t,
            status: 'pending_dispatch' as const,
            assignedTechnicianId: undefined,
            assignedTechnicianName: undefined,
            dispatchedAt: undefined,
            timeline: [
              ...t.timeline,
              {
                id: `act-${Date.now()}-${t.id}`,
                timestamp: nowTime,
                actor: currentAccount.name,
                actorRole: '系統管理員',
                action: 'transferred' as const,
                title: `原負責人員 [${person.name}] 帳號已被刪除，工單退回待派工池`,
                notes: '該人員帳號已自系統名冊中移除，工單重新釋出開放指派或自主接單。',
              },
            ],
          };
        }
        return t;
      });
      updateTicketsState(updatedTickets);
    }

    // 2. Remove from accounts
    const updatedAccounts = accounts.filter(
      (a) =>
        a.id !== person.accountId &&
        a.id !== person.id &&
        a.username.toLowerCase() !== person.username.toLowerCase() &&
        a.name !== person.name
    );
    setAccounts(updatedAccounts);
    saveAccounts(updatedAccounts);
    if (person.accountId) {
      deleteFirestoreAccount(person.accountId).catch((err) => console.warn('Cloud delete account note:', err));
    }

    // 3. Remove from technicians
    const updatedTechs = technicians.filter(
      (t) =>
        t.id !== person.techId &&
        t.id !== person.id &&
        t.username?.toLowerCase() !== person.username.toLowerCase() &&
        t.name !== person.name
    );
    updateTechniciansState(updatedTechs);
    if (person.techId) {
      deleteFirestoreTechnician(person.techId).catch((err) => console.warn('Cloud delete tech note:', err));
    }

    // 4. If deleted self, immediately log out
    if (isSelf) {
      clearCurrentAccountId();
      setCurrentAccount(null);
      showToast(`已刪除目前登入帳號 [${person.name}]，系統已自動登出。`, 'info');
      return;
    }

    showToast(`已成功刪除人員帳號【${person.name}】(${roleDesc})！`);
  };

  const handleDeleteAccount = (acc: UserAccount) => {
    const matchedTech = technicians.find(
      (t) =>
        t.id === acc.associatedTechId ||
        t.id === acc.id ||
        t.name === acc.name ||
        t.username === acc.username
    );
    handleDeletePerson({
      id: acc.id,
      techId: matchedTech?.id || acc.associatedTechId,
      accountId: acc.id,
      name: acc.name,
      username: acc.username,
      roleTitle: acc.roleTitle,
      department: acc.department || '運維管理處',
      phone: acc.phone,
      permissionLevel: acc.permissionLevel,
      status: matchedTech ? matchedTech.status : 'available',
      specialties: matchedTech ? matchedTech.specialties : [],
      activeTicketsCount: matchedTech ? matchedTech.activeTicketsCount : 0,
      completedCount: matchedTech ? matchedTech.completedCount : 0,
      rating: matchedTech ? matchedTech.rating : 5.0,
      isDispatchable: !!matchedTech,
    });
  };

  // 11. Quick Toggle Technician Duty Status
  const handleToggleTechStatus = (techId: string, newStatus: Technician['status']) => {
    if (!currentAccount || !currentAccount.permissions.canManageTeam) {
      showToast('權限不足：僅系統管理員可切換工程師出勤狀態！', 'error');
      return;
    }

    let toggledTech: Technician | undefined;
    const updated = technicians.map((t) => {
      if (t.id === techId) {
        toggledTech = { ...t, status: newStatus };
        return toggledTech;
      }
      return t;
    });
    updateTechniciansState(updated);
    if (toggledTech) setFirestoreTechnician(toggledTech).catch(() => {});
    const label = newStatus === 'available' ? '待命中 (可即刻派工)' : newStatus === 'busy' ? '檢修施工中' : '休假停派';
    showToast(`工程師在勤狀態已更新為：${label}`);
  };

  // Reset to default mock data
  const handleResetData = () => {
    if (window.confirm('確定要恢復預設的示範設備維修叫修與帳戶資料嗎？')) {
      const fresh = resetAllData();
      setTickets(fresh.tickets);
      setTechnicians(fresh.technicians);
      setAccounts(fresh.accounts);
      setCurrentAccount(fresh.accounts[0]);
      setSelectedTicket(null);
      showToast('已重置為系統初始示範資料！');
    }
  };

  const pendingDispatchCount = tickets.filter((t) => t.status === 'pending_dispatch').length;
  const pendingAcceptCount = tickets.filter(
    (t) =>
      t.status === 'dispatched' &&
      (userRole === 'dispatcher' ||
        t.assignedTechnicianId === currentTechnician.id ||
        t.assignedTechnicianName === currentTechnician.name)
  ).length;

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans antialiased">
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'info' && <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        )}
        <LoginView
          accounts={accounts}
          onLogin={handleLoginFromScreen}
          firebaseUser={firebaseUser}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          isSyncing={isCloudSyncing}
        />
      </div>
    );
  }

  const isAdmin = currentAccount.permissionLevel === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTicket={() => setShowNewTicketModal(true)}
        userRole={userRole}
        onRoleChange={setUserRole}
        currentAccount={currentAccount}
        onOpenAccountModal={() => setShowAccountModal(true)}
        onLogout={handleLogout}
        pendingDispatchCount={pendingDispatchCount}
        pendingAcceptCount={pendingAcceptCount}
        firebaseUser={firebaseUser}
        onGoogleSignIn={handleGoogleSignIn}
        isSyncing={isCloudSyncing}
      />

      {/* Account Login & Permissions Quick-Switch Toolbar */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-600 whitespace-nowrap flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              個人帳戶與權限快速切換：
            </span>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg flex-wrap">
              {accounts.map((acc) => {
                const isSelected = acc.id === currentAccount.id;
                const isAccAdmin = acc.permissionLevel === 'admin';

                return (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? isAccAdmin
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-slate-800 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title={`帳號：${acc.username} | 權限：${isAccAdmin ? '管理員 (團隊管理+刪除工單)' : '使用者 (無團隊管理、無刪除工單)'}`}
                  >
                    {isAccAdmin ? (
                      <ShieldCheck className={`w-3 h-3 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`} />
                    ) : (
                      <User className={`w-3 h-3 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`} />
                    )}
                    <span>{acc.name}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isAccAdmin
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isAccAdmin ? '管理員' : '使用者'}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowAccountModal(true)}
                className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md font-semibold text-[11px] transition-colors"
                title="開啟帳戶登入與權限管理視窗"
              >
                + 帳戶中心
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto text-slate-500">
            {/* Active Account Permission Indicator Badge */}
            <span
              className={`hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
                isAdmin
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <strong>管理員權限生效中</strong>：✔ 團隊人員管理 ✔ 刪除工單
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-600" />
                  <strong>使用者權限限制中</strong>：✖ 無團隊管理 ✖ 無刪除工單
                </>
              )}
            </span>

            <button
              onClick={handleResetData}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium transition-colors"
              title="恢復預設示範工單與帳戶資料"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置示範資料
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'tickets' && (
          <TicketList
            tickets={tickets}
            userRole={userRole}
            currentAccount={currentAccount}
            onSelectTicket={setSelectedTicket}
            onOpenDispatch={setDispatchTicket}
            onOpenTransfer={setTransferTicket}
            onAcceptTicket={handleAcceptTicket}
            onSelfClaimTicket={(ticket) => handleSelfClaimTicket(ticket, currentTechnician)}
            onOpenProgress={(ticket, mode) => setProgressModal({ ticket, mode })}
            onOpenSignoff={setSignoffTicket}
            onOpenPrint={setPrintTicket}
            onExportCSV={() => exportTicketsToCSV(tickets)}
            onOpenDelete={(ticket) => setDeleteTicket(ticket)}
          />
        )}

        {activeTab === 'dispatch' && (
          <DispatchWorkbench
            tickets={tickets}
            technicians={technicians}
            canManageTeam={isAdmin}
            onOpenDispatch={setDispatchTicket}
            onSelfClaimTicket={(ticket) => handleSelfClaimTicket(ticket, currentTechnician)}
            onSelectTicket={setSelectedTicket}
            onOpenTransfer={setTransferTicket}
            onOpenEditTech={(tech) => setEditingTechnician(tech)}
            onOpenCreateTech={() => setEditingTechnician('new')}
            onManageTeam={() => setActiveTab('team')}
          />
        )}

        {activeTab === 'technician' && (
          <TechnicianBoard
            currentTech={currentTechnician}
            tickets={tickets}
            onAcceptTicket={handleAcceptTicket}
            onSelfClaimTicket={handleSelfClaimTicket}
            onOpenTransfer={setTransferTicket}
            onOpenProgress={(ticket, mode) => setProgressModal({ ticket, mode })}
            onSelectTicket={setSelectedTicket}
            onOpenPrint={setPrintTicket}
          />
        )}

        {activeTab === 'team' && (
          <TeamManagementView
            technicians={technicians}
            accounts={accounts}
            currentAccount={currentAccount}
            onOpenCreate={() => setEditingTechnician('new')}
            onOpenEdit={(tech) => setEditingTechnician(tech)}
            onDeletePerson={handleDeletePerson}
            onToggleStatus={handleToggleTechStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            tickets={tickets}
            technicians={technicians}
            onExportCSV={() => exportTicketsToCSV(tickets)}
            onExportJSON={() => exportAllDataJSON(tickets, technicians, accounts)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PRO-MAINT 設備維修叫修紀錄與派工系統 · 個人帳戶權限分級 · 管理員團隊人員管理與刪除工單 · 自主接單</span>
          <span className="font-mono text-slate-400">目前帳戶：{currentAccount.name} ({isAdmin ? '管理員' : '一般使用者'})</span>
        </div>
      </footer>

      {/* Modals */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          userRole={userRole}
          currentAccount={currentAccount}
          onClose={() => setSelectedTicket(null)}
          onOpenDispatch={() => {
            setDispatchTicket(selectedTicket);
          }}
          onOpenTransfer={() => {
            setTransferTicket(selectedTicket);
          }}
          onAcceptTicket={() => {
            handleAcceptTicket(selectedTicket);
          }}
          onSelfClaimTicket={() => {
            handleSelfClaimTicket(selectedTicket, currentTechnician);
          }}
          onOpenProgress={(mode) => {
            setProgressModal({ ticket: selectedTicket, mode });
          }}
          onOpenSignoff={() => {
            setSignoffTicket(selectedTicket);
          }}
          onOpenPrint={() => {
            setPrintTicket(selectedTicket);
          }}
          onOpenDelete={() => {
            setDeleteTicket(selectedTicket);
          }}
        />
      )}

      {/* Delete Ticket Modal */}
      {deleteTicket && (
        <DeleteTicketModal
          ticket={deleteTicket}
          currentAccount={currentAccount}
          onClose={() => setDeleteTicket(null)}
          onConfirmDelete={handleDeleteTicket}
        />
      )}

      {/* Account Login & Switcher Modal */}
      {showAccountModal && (
        <AccountSwitcherModal
          accounts={accounts}
          currentAccount={currentAccount}
          onClose={() => setShowAccountModal(false)}
          onSelectAccount={handleSelectAccount}
          onUpdateAccountPassword={handleUpdateAccountPassword}
          onCreateAccount={handleCreateAccount}
          onDeleteAccount={handleDeleteAccount}
          onLogout={handleLogout}
        />
      )}

      {dispatchTicket && (
        <DispatchModal
          ticket={dispatchTicket}
          technicians={technicians}
          onClose={() => setDispatchTicket(null)}
          onDispatch={handleDispatch}
        />
      )}

      {transferTicket && (
        <TransferTicketModal
          ticket={transferTicket}
          technicians={technicians}
          currentActorName={currentActorName}
          onClose={() => setTransferTicket(null)}
          onTransfer={handleTransfer}
        />
      )}

      {progressModal && (
        <RepairProgressModal
          ticket={progressModal.ticket}
          mode={progressModal.mode}
          currentActorName={currentActorName}
          onClose={() => setProgressModal(null)}
          onSubmit={handleProgressSubmit}
        />
      )}

      {signoffTicket && (
        <CustomerSignoffModal
          ticket={signoffTicket}
          defaultSigner={signoffTicket.contactPerson || '現場主管'}
          onClose={() => setSignoffTicket(null)}
          onSignoff={handleSignoff}
        />
      )}

      {showNewTicketModal && (
        <NewTicketModal
          technicians={technicians}
          onClose={() => setShowNewTicketModal(false)}
          onSubmit={handleCreateTicket}
        />
      )}

      {printTicket && (
        <PrintTicketModal
          ticket={printTicket}
          onClose={() => setPrintTicket(null)}
        />
      )}

      {editingTechnician && (
        <TechnicianEditModal
          technician={editingTechnician}
          accounts={accounts}
          onClose={() => setEditingTechnician(null)}
          onSave={handleSaveTechnician}
        />
      )}
    </div>
  );
}
