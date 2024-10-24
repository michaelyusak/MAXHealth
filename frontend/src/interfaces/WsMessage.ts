import { IAttachment, IPrescriptionDrug } from "./Telemedicine";

export interface IWsMessage {
  type: string;
  data: IAuthWsData | IChatWsData;
}

export interface IAuthWsData {
  channel: string;
  channel_token: string;
  client_token: string;
}

export interface IChatWsData {
  channel: string;
  side: number;
  message: string;
  attachment?: IAttachment;
  prescription_drugs: IPrescriptionDrug[];
}
