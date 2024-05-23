export interface CartItemInter {
  cart_item_id: number;
  account_id: number;
  quantity: number;
  price: number;
  pharmacy_drugs: PharmacyDrugsInter;
  total_price: number;
  isSufficient?: boolean;
  isSelected: boolean;
}

export interface PharmacyDrugsInter {
  pharmacy_drug_id: number;
  pharmacy_id: number;
  pharmacy_name: string;
  drug_name: string;
  price: string;
  image: string;
  stock: number;
}

export interface GetCartItem {
  account_id: number;
  quantity: number;
  price: number;
  pharmacy_drugs: PharmacyDrugsInter;
  total_price: number;
}
