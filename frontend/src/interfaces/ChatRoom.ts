import { IChat } from "./Telemedicine";

export interface IChatRoomList {
  pending: IChatRoomPreviewV2[];
  on_going: IChatRoomPreviewV2[];
  expired: IChatRoomPreviewV2[];
}

export interface IChatRoomPreviewV2 {
  id: number;
  hash: string;
  participant_name: string;
  participant_picture_url: string;
  expired_at: string;
  last_chat: IChat;
}

export interface IChatRoomDetail {
    id: number;
    room_hash: string;
    doctor_account_id: number;
    user_account_id: number;
    doctor_certificate_url: string;
    expired_at: string;
    chats: IChat[];
}