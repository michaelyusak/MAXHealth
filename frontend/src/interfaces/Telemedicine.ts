export interface IChatRoomPreview {
  id: number;
  participant_name: string;
  participant_picture_url: string;
  expired_at: string;
  last_chat: IChat;
}

export interface IChat {
  id: number;
  room_id: number;
  sender_account_id: number;
  message: string;
  attachment: IAttachment;
  prescription: IPrescription;
  created_at: string;
}

export interface IAttachment {
  format: string;
  url: string;
}

export interface IPrescriptionDrug {
  id: number;
  drug: { id: number; name: string; image: string };
  quantity: number;
  note: string;
}

export interface IPrescription {
  id: number;
  prescription_drugs: IPrescriptionDrug[];
}

export interface IChatRoom {
  id: number;
  doctor_account_id: number;
  user_account_id: number;
  doctor_certificate_url: string;
  expired_at: string;
  chats: IChat[];
}
