import { pageInfo } from "./pharmacyManagers";

export interface IDrug {
    id: number;
    name: string;
    genericName: string;
    content: string;
    manufacture: string;
    description: string;
    classification: IDrugClassification;
    form: IDrugForm;
    unitInPack: string;
    sellinUnit: string;
    weight: number;
    height: number;
    length: number
    width: number;
    image: string;
    category: IDrugCategory;
    minPrice: number;
    maxPrice: number;
    isPrescriptionRequired: boolean;
    isActive: boolean;
}

export interface IDrugClassification {
    id: number;
    name: string;
}

export interface IDrugForm {
    id: number;
    name: string;
}

export interface IDrugCategory {
    id: number;
    name: string;
    url: string
}

export interface IDrugDetailResponse {
    id: number;
    name: string;
    genericName: string;
    content: string;
    manufacture: string;
    description: string;
    classification: IDrugClassification;
    form: IDrugForm;
    category: IDrugCategory;
    unit_in_pack: string;
    selling_unit: string;
    weight: number;
    height: number;
    length: number
    width: number;
    image: string;
    is_prescription_required: boolean;
    is_active: boolean;
    pharmacy_drugs: IDetailResponsePharmacyDrug[];
}

export interface IDetailResponsePharmacyDrug {
    id: number;
    pharmacy: {
        id: number;
        pharmacy_name: string;
        distance: number;
    }
    drug_id: number;
    price: string;
    stock: number;
}

export interface IPharmacyDrugResponse {
    pharmacy_drug_id: number;
    drug_id: number;
    drug_name: string;
    min_price: string;
    max_price: string;
    image_url: string;
}

export interface IDrugListResponse {
    drug_list: IPharmacyDrugResponse[]
    page_info: {
        page_count: number;
        item_count: number;
        page: number;
    }
}

export interface IGetDrugResponse {
    Id: number;
    Name: string;
    GenericName: string;
    Content: string;
    Manufacture: string;
    Description: string;
    Classification: IDrugClassification;
    Form: IGetDrugFormResponse;
    UnitInPack: string;
    SellingUnit: string;
    Weight: number;
    Height: number;
    Length: number
    Width: number;
    Image: string;
    Category: IGetDrugCategoryResponse;
    MinPrice: number;
    MaxPrice: number;
    IsPrescriptionRequired: boolean;
    IsActive: boolean;
}

export interface IGetDrugCategoryResponse {
    Id: number;
    Name: string;
    Url: string;
}

export interface IGetDrugFormResponse {
    Id: number;
    Name: string;
}

export interface IDrugPharmacyResponse{
    drugs: IPharmacyDrugByPharmacy[];
    page_info: pageInfo;
}

export interface IPharmacyDrugByPharmacy{
    pharmacy_drug_id: number;
    stock: number;
    price: number;
    drug: IDrug;
}

export interface IDrugAdminResponse{
    drugs: IDrugCapital[];
    page_info: pageInfo
}

export interface IDrugCapital {
    Id: number;
    Name: string;
    GenericName: string;
    Content: string;
    Manufacture: string;
    Description: string;
    Classification: IDrugClassificationCapital;
    Form: IDrugFormCapital;
    Category: IDrugCategoryCapital;
    UnitInPack: string;
    SellingUnit: string;
    Weight: number;
    Height: number;
    Length: number
    Width: number;
    Image: string;
    isActive: boolean;
    isPrescriptionRequired: boolean;
}

export interface IDrugClassificationCapital {
    Id: number;
    Name: string;
}

export interface IDrugCategoryCapital{
    Id: number;
    Name: string;
    Url: string;
}

export interface IDrugFormCapital{
    Id: number;
    Name:string;
}

export interface IAdminDrugsCapital{
    drugs: IDrugCapital[];
    page_info:pageInfo;
}