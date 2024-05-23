import React from "react";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { IOrderPharmacy } from "../interfaces/Order";

interface OrderPharmacyTableProps {
  orderPharmacy: IOrderPharmacy;
}

const OrderPharmacyTable = ({
  orderPharmacy,
}: OrderPharmacyTableProps): React.ReactElement => {
  const total =
    Number(orderPharmacy.delivery_fee) + Number(orderPharmacy.subtotal_amount);
  return (
    <div className="flex flex-col gap-[1rem]">
      <p className="text-navy text-[20px] font-bold">
        {orderPharmacy.pharmacy_name}
      </p>
      <table className="w-[100%] border-[1px]">
        <thead>
          <tr className="bg-lightGrey py-4">
            <th className="py-4">Image</th>
            <th className="py-4">Product Name</th>
            <th className="py-4">Price</th>
            <th className="py-4">Quantity</th>
            <th className="py-4">Unit</th>
            <th className="py-4">Total</th>
          </tr>
        </thead>
        <tbody>
          {orderPharmacy.order_items.map((item, i) => (
            <tr key={i} className="border-[1px]">
              <td className="px-4 py-2">
                <div className="flex justify-center">
                  <img className="w-[150px]" src={item?.drug_image} alt="" />
                </div>
              </td>
              <td className="p-4">
                <div className="text-[#7b7c7c] text-lg">{item.drug_name}</div>
              </td>
              <td>
                <div className="text-center text-[#7b7c7c] text-lg">
                  {CurrencyFormatter.format(item.drug_price)}
                </div>
              </td>
              <td>
                <div className="text-center text-[#7b7c7c] text-lg">
                  {item.quantity}
                </div>
              </td>
              <td>
                <div className="text-center text-[#7b7c7c] text-lg">
                  {item.drug_unit.replace("per", "/")}
                </div>
              </td>
              <td>
                <div className="text-center text-[#7b7c7c] text-lg">
                  {CurrencyFormatter.format(item.quantity * item.drug_price)}
                </div>
              </td>
            </tr>
          ))}
          <tr className="border-[1px]">
            <td className="border-[1px] p-4">
              <div className="text-navy text-[17px] font-bold">Shipping</div>
            </td>
            <td colSpan={4} className="border-[1px] p-4">
              <div className="flex flex-row gap-[0.5rem] text-[17px] font-bold">
                <p className="uppercase text-navy">
                  {orderPharmacy.courier_name}
                </p>
                <p className="text-[#7b7c7c]">
                  {CurrencyFormatter.format(Number(orderPharmacy.delivery_fee))}
                </p>
              </div>
            </td>
          </tr>
          <tr className="border-[1px]">
            <td className="border-[1px] p-4">
              <div className="flex justify-start text-navy text-[17px] font-bold">
                Subtotal
              </div>
            </td>
            <td colSpan={4} className="border-[1px] p-4">
              <div className="flex justify-start text-[#7b7c7c] text-[17px] font-bold">
                {CurrencyFormatter.format(orderPharmacy.subtotal_amount)}
              </div>
            </td>
          </tr>
          <tr className="border-[1px]">
            <td className="border-[1px] p-4">
              <div className="flex justify-start text-navy text-[17px] font-bold">
                Total
              </div>
            </td>
            <td colSpan={4} className="border-[1px] p-4">
              <div className="flex justify-start text-[#7b7c7c] text-[17px] font-bold">
                {CurrencyFormatter.format(total)}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OrderPharmacyTable;
