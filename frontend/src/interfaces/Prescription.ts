import { IDrugDetailResponse } from "./Drug";
import { ICourier } from "./Order";

export interface IPrescriptionResponse {
    id: number;
    user_account_id: number;
    user_name: string;
    doctor_account_id: number;
    doctor_name: string;
    redeemed_at: string;
    ordered_at: string;
    created_at: string;
    prescription_drugs: {
        id: number;
        drug: IDrugDetailResponse;
        quantity: number;
        note: string;
    }[];
}

export interface IPrescriptionListResponse {
    prescriptions: IPrescriptionResponse[];
    page_info: {
        total_item: number;
        total_page: number;
    }
}

export interface ICheckoutPreparation {
    pharmacy_drugs: ICheckoutItem[];
}

export interface ICheckoutItem {
    pharmacy_id: number;
    pharmacy_name: string;
    pharmacy_address: string;
    distance: number;
    subtotal: number;
    couriers: ICourier[];
    drug_quantities: IDrugQuantity[];
}

export interface IDrugQuantity {
    pharmacy_drug: IDetailPharmacyDrug;
    quantity: number;
}

export interface IDetailPharmacyDrug {
    id: number;
    drug: IDrugDetailResponse;
    price: number;
}