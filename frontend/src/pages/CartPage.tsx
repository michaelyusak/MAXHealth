import React from "react";
import CartItem from "../components/CartItem";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import { proceedCheckout } from "../slices/OrderSlice";
import { useNavigate } from "react-router-dom";
import { path } from "../router/path";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import Button from "../components/Button";

const CartPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pharmacyItems, totalAmount, disabledCheckout } = useAppSelector(
    (state) => state.cart
  );

  const token = Cookies.get("accessToken");

  return (
    <div className="flex flex-col gap-[2rem] min-h-[calc(100vh-500px)]">
      {token ? (
        <CartItem />
      ) : (
        <div className="p-[25px]">
          <h1 className="text-2xl text-center">
            Please Login to add product to your cart
          </h1>
        </div>
      )}
      {pharmacyItems.length > 0 && (
        <div className="flex flex-col md:items-end items-start pl-3 md:pl-0">
          <div className="w-[40%] flex flex-col gap-[2rem] mb-5 md:mb-0">
            <p className="text-navy text-[20px] font-bold">Cart Subtotal</p>
            <table className="w-fit border-[1px] text-navy text-[17px] font-bold">
              <tbody>
                <tr>
                  <td className="border-[1px] p-4 w-[300px] bg-lightGrey">
                    <div className="flex justify-start font-bold">Subtotal</div>
                  </td>
                  <td className="border-[1px] p-4 w-[300px]">
                    <div className="flex justify-start text-[#7b7c7c]">
                      {CurrencyFormatter.format(totalAmount)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex">
              <Button
                type="button"
                buttonStyle="green"
                onClick={() => {
                  dispatch(proceedCheckout(pharmacyItems));
                  navigate(path.checkout);
                }}
                disabled={disabledCheckout}
              additionalClassName="rounded-lg text-[14px]"
              >
                Proceed to checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
