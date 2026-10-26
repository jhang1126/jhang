import React from 'react';
import { DeleteTicketModal } from './DeleteTicketModal';
import { Ticket, UserAccount } from '../types/ticket';

export { DeleteTicketModal };

export const CancelTicketModal: React.FC<{
  ticket: Ticket;
  currentAccount: UserAccount;
  onClose: () => void;
  onConfirmCancel?: (ticketId: string, reason?: string) => void;
  onConfirmDelete?: (ticketId: string) => void;
}> = (props) => {
  return (
    <DeleteTicketModal
      ticket={props.ticket}
      currentAccount={props.currentAccount}
      onClose={props.onClose}
      onConfirmDelete={(id) => {
        if (props.onConfirmDelete) props.onConfirmDelete(id);
        else if (props.onConfirmCancel) props.onConfirmCancel(id);
      }}
    />
  );
};
