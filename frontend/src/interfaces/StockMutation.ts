export interface IStockMutation {
    pharmacy_name: string;
    pharmacy_address: string;
    drug_url: string;
    drug_name: string;
    final_stock: number;
    stock_change: number;
    description: string;
}