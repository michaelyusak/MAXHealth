import { IPharmacyDrug } from "./PharmacyDrug";

export interface IPharmacy {
    id: number;
    managerId: number;
    pharmacyName: string;
    pharmacistName: string;
    pharmacistLicenseNumber: string;
    pharmacistPhoneNumber: string;
    city: string;
    address: string;
    longitude: string;
    latitude: string;
    drugs: IPharmacyDrug[];
}

export interface IPossibleMutation {
    pharmacy_drug_id: number;
    pharmacy_id: number;
    pharmacy_name: string;
    pharmacy_address: string;
    stock: number
}