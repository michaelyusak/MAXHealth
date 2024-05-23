export interface pharmacyManagers{
    partners:[
        {
            id: number,
            email: string,
            name: string,
            profile_picture: string
        }
    ]
}

export interface pageInfo{
    page_count: number,
    item_count: number,
    page: number
}

export interface pharmacyDataResponse{
    page_info : pageInfo,
    pharmacies : pharmacyData[],
}

export interface pharmacyData{
    id: number,
    manager_id: number,
    pharmacy_name: string,
    pharmacist_name: string,
    pharamcist_license_name: string,
    pharmacist_phone_number: string,
    city: string,
    address: string,
    latitude: string,
    longitude: string,
}