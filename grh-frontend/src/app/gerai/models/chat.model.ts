export interface MessageDTO {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderNom: string;
  content: string;
  type: 'TEXTE' | 'IMAGE' | 'FICHIER' | 'SYSTEME';
  attachmentUrl?: string;
  replyToId?: number;
  isDeleted?: boolean;
  sentAt: string;
  luParMoi?: boolean;
}

export interface ConversationDTO {
  conversationId: number;
  type: string;
  name: string;
  participants: ParticipantDTO[];
  dernierMessage?: string;
  lastMessageAt?: string;
  nombreNonLus: number;
  currentEmployeeId: number;
}

export interface ParticipantDTO {
  employeeId: number;
  nomComplet: string;
  role: string;
  enLigne: boolean;
}

export interface TypingResponse {
  senderId: number;
  conversationId: number;
  typing: boolean;
}
