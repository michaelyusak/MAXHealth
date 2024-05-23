import React from "react";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import { updatePharmacyShipping } from "../slices/OrderSlice";

const CheckoutItem = (): React.ReactElement => {
  const dispatch = useAppDispatch();

  const { pharmacyItems, address } = useAppSelector((state) => state.order);

  return (
    <>
      {pharmacyItems.map((item) => (
        <div key={item.pharmacyId} className="flex flex-col gap-[1rem]">
          <p
            className={`${
              item.courierOptions.length === 0 &&
              address.id !== undefined &&
              address.id > 0
                ? "text-[#7b7c7c]"
                : "text-navy"
            } text-[20px] font-bold`}
          >
            {item.pharmacyName}
          </p>
          <table className="md:w-[100%] border-[1px] relative">
            <tr className="bg-lightGrey py-4">
              <th className="py-4 md:text-lg text-sm">Image</th>
              <th className="py-4 md:text-lg text-sm">Product Name</th>
              <th className="py-4 md:text-lg text-sm">Price</th>
              <th className="py-4 md:text-lg text-sm">Quantity</th>
              <th className="py-4 md:text-lg text-sm">Total</th>
            </tr>
            <tbody>
              {item.items.map((it) => (
                <>
                  <tr key={it.cart_item_id} className="border-[1px]">
                    <td className="px-2 md:px-4 py-2 md:w-[300px]">
                      <div className="flex flex-col justify-center items-center gap-[1rem]">
                        {it.isSufficient && (
                          <p className="font-bold">Insufficient stock</p>
                        )}
                        <img
                          className="md:w-[150px] object-contain"
                          src={it?.pharmacy_drugs.image}
                          alt=""
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-[#7b7c7c] md:text-lg text-sm">
                        {it.pharmacy_drugs.drug_name}
                      </div>
                    </td>
                    <td>
                      <div className="text-center text-[#7b7c7c] md:text-lg text-sm">
                        {CurrencyFormatter.format(
                          parseInt(it.pharmacy_drugs.price)
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-center text-[#7b7c7c] md:text-lg text-sm">
                        {it.quantity}
                      </div>
                    </td>
                    <td>
                      <div className="text-center text-[#7b7c7c] md:text-lg text-sm">
                        {CurrencyFormatter.format(
                          it.quantity * parseInt(it.pharmacy_drugs.price)
                        )}
                      </div>
                    </td>
                  </tr>
                  {it.isSufficient && (
                    <div className="absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-lightGrey opacity-40" />
                  )}
                </>
              ))}
              <tr className="border-[1px]">
                <td className="border-[1px] p-4">
                  <div
                    className={`flex justify-start ${
                      item.courierOptions.length === 0 &&
                      address.id !== undefined &&
                      address.id > 0
                        ? "text-[#7b7c7c]"
                        : "text-navy"
                    } text-[17px] font-bold`}
                  >
                    Subtotal
                  </div>
                </td>
                <td colSpan={4} className="border-[1px] p-4">
                  <div className="flex justify-start text-[#7b7c7c] text-[17px] font-bold">
                    {CurrencyFormatter.format(item.subtotal)}
                  </div>
                </td>
              </tr>
              <tr className="border-[1px]">
                <td className="border-[1px] p-4">
                  <div
                    className={`${
                      item.courierOptions.length === 0 &&
                      address.id !== undefined &&
                      address.id > 0
                        ? "text-[#7b7c7c]"
                        : "text-navy"
                    } text-[17px] font-bold`}
                  >
                    Shipping
                  </div>
                </td>
                <td colSpan={4} className="border-[1px] p-4">
                  <div className="flex flex-col items-start gap-[1rem] text-[17px] font-bold">
                    {item.distance > 25 ? (
                      <p className="text-[#7b7c7c] text-[17px] font-bold">
                        Not available in selected shipping address
                      </p>
                    ) : address.id === 0 ? (
                      <p className="text-[#7b7c7c]">Choose address first</p>
                    ) : (
                      <table>
                        {item.courierOptions.map((courier) => (
                          <tr key={courier.courier_name}>
                            <td className="p-[0.5rem] flex">
                              <p
                                className={`md:text-lg text-sm uppercase ${
                                  item.courierOptions.length === 0 &&
                                  address.id !== undefined &&
                                  address.id > 0
                                    ? "text-[#7b7c7c]"
                                    : "text-navy"
                                }`}
                              >
                                {courier.courier_name}
                              </p>
                            </td>
                            <td className="p-[0.5rem]">
                              <div className="flex flex-col gap-[0.5rem]">
                                {courier.options.map(
                                  (
                                    opt: {
                                      price: number;
                                      estimated_time_of_delivery: string;
                                    },
                                    i
                                  ) => (
                                    <div
                                      key={i}
                                      className="flex row gap-[1rem] items-center cursor-pointer"
                                      onClick={() => {
                                        dispatch(
                                          updatePharmacyShipping({
                                            pharmacyId: item.pharmacyId,
                                            pharmacyCourierId:
                                              courier.pharmacy_courier_id,
                                            optionIndex: i,
                                            deliveryFee: opt.price,
                                          })
                                        );
                                      }}
                                    >
                                      <div
                                        className={`h-[19px] w-[19px] p-[1.8px] border-[2px] ${
                                          item.pharmacyCourier[0] ===
                                            courier.pharmacy_courier_id &&
                                          item.pharmacyCourier[1] === i
                                            ? "border-brightBlue"
                                            : "border-[#7b7c7c]"
                                        } rounded-full`}
                                      >
                                        <div
                                          className={`h-[11px] w-[11px] ${
                                            item.pharmacyCourier[0] ===
                                              courier.pharmacy_courier_id &&
                                            item.pharmacyCourier[1] === i
                                              ? "bg-brightBlue"
                                              : ""
                                          } rounded-full`}
                                        ></div>
                                      </div>
                                      <div className="flex flex-col">
                                        <p className="text-[#7b7c7c] md:text-lg text-sm">
                                          {CurrencyFormatter.format(opt.price)}{" "}
                                          <span className="lowercase">
                                            ({opt.estimated_time_of_delivery})
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </table>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
            {item.courierOptions.length === 0 &&
              address.id !== undefined &&
              address.id > 0 && (
                <div className="absolute z-10 w-full h-full top-0 left-0 right-0 bottom-0 bg-lightGrey opacity-40" />
              )}
          </table>
        </div>
      ))}
    </>
  );
};

export default CheckoutItem;
