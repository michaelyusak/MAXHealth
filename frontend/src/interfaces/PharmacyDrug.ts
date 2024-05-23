import { IDrug } from "./Drug";

export interface IPharmacyDrug {
    id: number;
    pharmacyId: number;
    drug: IDrug;
    stock: number;
    price: number;
}