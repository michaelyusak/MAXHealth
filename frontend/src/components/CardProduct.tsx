import React, { useContext } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { IPharmacyDrugResponse } from "../interfaces/Drug";
import { IconContext } from "react-icons";
import { BsCartPlusFill } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import { sendCartPostData, sendCartUpdateData } from "../slices/CartActions";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { cartActions } from "../slices/CartSlice";

type cardProductProps = {
  pharmacyDrug: IPharmacyDrugResponse;
  showAddToCartButton: boolean;
};

const CardProduct = ({
  pharmacyDrug,
  showAddToCartButton,
}: cardProductProps): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);

  const addToCartHandler = (Id: number, quantity: number) => {
    dispatch(
      sendCartPostData({
        pharmacyDrugId: Id,
        quantity: quantity,
      })
    )
      .then(() => {
        HandleShowToast(setToast, true, "Successfully add to your cart", 5);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  };

  function handleSetItemQty(key: number, diff: number) {
    let cartItemId = -1;
    let quantity = -1;
    let price = -1;
    for (let i = 0; i < cart.pharmacyItems.length; i++) {
      const items = cart.pharmacyItems[i].items;
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        if (item.pharmacy_drugs.pharmacy_drug_id === key) {
          cartItemId = item.cart_item_id;
          quantity = item.quantity;
          price = item.price;
        }
      }
    }

    dispatch(
      sendCartUpdateData({
        cart_item_id: cartItemId,
        quantity: quantity + diff,
      })
    );

    dispatch(
      cartActions.addQuantityCart({
        cartItemId: cartItemId,
        quantity: quantity + diff,
        price: parseInt(String(price)),
      })
    );
  }  

  const findQuantity = (pharmacyDrugId: number): number => {
    for (let i = 0; i < cart.pharmacyItems.length; i++) {
      const items = cart.pharmacyItems[i].items;
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        if (item.pharmacy_drugs.pharmacy_drug_id === pharmacyDrugId) {
          return item.quantity;
        }
      }
    }
    return -1;
  };

  return (
    <>
      <div className="md:w-[240px] md:h-[350px] flex flex-col p-[10px] gap-[10px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.3)] rounded-xl">
        <div className="relative cursor-pointer">
          <img
            className="rounded-xl aspect-square m-auto object-cover w-[220px]"
            src={pharmacyDrug?.image_url}
            alt=""
          />
          {showAddToCartButton && (
            <>
              {findQuantity(pharmacyDrug.pharmacy_drug_id) > 0 ? (
                <div className="absolute z-[5] p-[3px] right-[10px] shadow-[0px_0px_20px_5px_rgba(0,0,0,0.3)] rounded-[30px] bg-gray-100 bottom-[10px] flex gap-4 items-center">
                  <button
                    type="button"
                    className="border-2 rounded-[50%] p-2 bg-white hover:scale-105 disabled:opacity-[0.3]"
                    onClick={(e) => {
                      e.preventDefault();

                      handleSetItemQty(pharmacyDrug.pharmacy_drug_id, -1);
                    }}
                    disabled={findQuantity(pharmacyDrug.pharmacy_drug_id) <= 1}
                  >
                    <FaMinus />
                  </button>
                  <p className="text-xl">
                    {findQuantity(pharmacyDrug.pharmacy_drug_id)}
                  </p>
                  <button
                    type="button"
                    className="border-2 rounded-[50%] p-2  bg-white hover:scale-105 disabled:opacity-[0.3]"
                    onClick={(e) => {
                      e.preventDefault();

                      handleSetItemQty(pharmacyDrug.pharmacy_drug_id, 1);
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();

                    addToCartHandler(pharmacyDrug.pharmacy_drug_id, 1);
                  }}
                  className="absolute z-[5] p-2 right-[10px] bottom-[10px] shadow-[0px_0px_20px_5px_rgba(0,0,0,0.3)] rounded-[100%] bg-gray-100 text-[25px] w-fit h-fit hover:scale-105 ease-out duration-100"
                >
                  <IconContext.Provider value={{ color: "#000D44" }}>
                    <BsCartPlusFill />
                  </IconContext.Provider>
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-xl text-left font-bold line-clamp-2 h-[60px] w-[170px]">
              {pharmacyDrug?.drug_name}
            </h3>
            <p className="text-[#162a5c] font-bold">
              {CurrencyFormatter.format(+pharmacyDrug?.min_price)} -{" "}
              {CurrencyFormatter.format(+pharmacyDrug?.max_price)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardProduct;
