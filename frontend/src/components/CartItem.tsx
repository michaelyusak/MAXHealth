import React, { useCallback, useEffect, useState } from "react";
import { FaMinus, FaPlus, FaTrash, FaCheck } from "react-icons/fa";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import { cartActions } from "../slices/CartSlice";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import {
  fetchCartDataWithPagination,
  sendCartDeleteData,
  sendCartUpdateData,
} from "../slices/CartActions";
import { IconContext } from "react-icons";
import PaginationInfo from "./PaginationInfo";

const CartItem = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const cartsData = useAppSelector((state) => state.cart);

  const addQuantityHandler = async (
    cartId: number,
    quantity: number,
    price: string
  ) => {
    await dispatch(
      cartActions.addQuantityCart({
        cartItemId: cartId,
        quantity: quantity + 1,
        price: parseInt(price),
      })
    );

    await dispatch(
      sendCartUpdateData({
        cart_item_id: cartId,
        quantity: quantity + 1,
      })
    );
  };

  const removeQuantityHandler = (quantity: number, cartId: number) => {
    dispatch(cartActions.subsQuantityCart(cartId));
    if (quantity === 1) {
      dispatch(
        sendCartDeleteData({
          cart_item_id: cartId,
        })
      );
      return;
    }
    dispatch(
      sendCartUpdateData({
        cart_item_id: cartId,
        quantity: quantity - 1,
      })
    );
  };

  const removeCartItemHandler = (cartId: number) => {
    dispatch(cartActions.removeItemFromCart(cartId));
    dispatch(
      sendCartDeleteData({
        cart_item_id: cartId,
      })
    );
  };

  const [selectedFilter, setSelectedFilter] = useState<{
    page: number;
    orderId: number;
    itemPerPage: number;
  }>({
    page: 1,
    orderId: 0,
    itemPerPage: 12,
  });

  const handleFilterChange = (key: string, value: number | string) => {
    setSelectedFilter((prev) => {
      const updatedValue = {
        ...prev,
        [key]: value,
      };

      return updatedValue;
    });
  };

  const getCartItems = useCallback(() => {
    dispatch(
      fetchCartDataWithPagination({
        limit: selectedFilter.itemPerPage,
        page: selectedFilter.page,
      })
    );
  }, [selectedFilter.itemPerPage, selectedFilter.page, dispatch]);

  useEffect(() => {
    getCartItems();
  }, [getCartItems]);

  return (
    <>
      {cartsData.pharmacyItems.length > 0 ? (
        <>
          <table className="w-[100%] border-[1px]">
            <thead className="hidden md:table-header-group">
              <tr className="bg-lightGrey py-4 ">
                <th></th>
                <th className="py-4">Image</th>
                <th className="py-4">Product Name</th>
                <th className="py-4">Price</th>
                <th className="py-4">Quantity</th>
                <th className="py-4">Total</th>
                <th className="py-4">Remove</th>
              </tr>
            </thead>
            <tbody className="hidden md:table-header-group">
              {cartsData.pharmacyItems.map((pharmacy) => (
                <>
                  {pharmacy.items.length > 0 && (
                    <>
                      <tr>
                        <td colSpan={6} className="pl-8 pt-8">
                          <p className="text-navy font-bold text-[17px]">
                            {pharmacy.pharmacyName}
                          </p>
                        </td>
                      </tr>
                      {pharmacy.items.map((cartItem) => (
                        <tr
                          key={cartItem.cart_item_id}
                          className="border-b-[1px]"
                        >
                          <td className="pl-8">
                            <div
                              className="cursor-pointer w-[18px] h-[18px] border-[2px] border-[#7b7c7c] flex flex-col justify-center items-center"
                              onClick={() =>
                                dispatch(
                                  cartActions.setItemSelected({
                                    cartItemId: cartItem.cart_item_id,
                                  })
                                )
                              }
                            >
                              {cartItem.isSelected && (
                                <IconContext.Provider
                                  value={{ size: "12px", color: "#7b7c7c" }}
                                >
                                  <FaCheck />
                                </IconContext.Provider>
                              )}
                            </div>
                          </td>
                          <td className="py-2">
                            <div className="flex justify-center">
                              <img
                                className="w-[150px]"
                                src={cartItem?.pharmacy_drugs.image}
                                alt=""
                              />
                            </div>
                          </td>
                          <td>
                            <div className="flex justify-center text-[#7b7c7c] text-lg ">
                              {cartItem.pharmacy_drugs.drug_name}
                            </div>
                          </td>
                          <td>
                            <div className="flex justify-center text-[#7b7c7c] text-lg">
                              {CurrencyFormatter.format(
                                parseInt(cartItem.pharmacy_drugs.price)
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-4 items-center justify-center">
                              <button
                                type="button"
                                className="border-[1px] rounded-[10%] p-2 bg-white hover:scale-105"
                                onClick={() => {
                                  removeQuantityHandler(
                                    cartItem.quantity,
                                    cartItem.cart_item_id
                                  );
                                }}
                              >
                                <FaMinus />
                              </button>
                              <p className="text-xl border-[1px] rounded-md px-6 text-[#7b7c7c] ">
                                {cartItem.quantity}
                              </p>
                              <button
                                type="button"
                                className="border-[1px] rounded-[10%] p-2  bg-white hover:scale-105 disabled:text-gray-300"
                                disabled={
                                  cartItem.quantity >=
                                  cartItem.pharmacy_drugs.stock
                                }
                                onClick={() => {
                                  addQuantityHandler(
                                    cartItem.cart_item_id,
                                    cartItem.quantity,
                                    cartItem.pharmacy_drugs.price
                                  );
                                }}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="flex justify-center text-[#7b7c7c] text-lg">
                              {CurrencyFormatter.format(
                                cartItem.quantity *
                                  parseInt(cartItem.pharmacy_drugs.price)
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex justify-center text-[#7b7c7c] text-lg">
                              <button
                                className="hover:scale-105"
                                onClick={() =>
                                  removeCartItemHandler(cartItem.cart_item_id)
                                }
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </>
              ))}
            </tbody>
      {cartsData.pharmacyItems.map((pharmacy) => (
        <div className="w-80 bg-white shadow rounded md:hidden m-auto">
          {pharmacy.items.length > 0 && (
            <>
              <tr>
                <td colSpan={6} className="pl-8 pt-8">
                  <p className="text-navy font-bold text-[17px]">
                    {pharmacy.pharmacyName}
                  </p>
                </td>
              </tr>
              {pharmacy.items.map((cartItem) => (
                <>
                  <div
                    key={cartItem.cart_item_id}
                    className="h-48 w-full bg-gray-200 flex flex-col justify-between p-4 bg-cover bg-center cursor-pointer"
                    style={{
                      backgroundImage: `url(${cartItem.pharmacy_drugs.image}`,
                    }}
                    onClick={() =>
                      dispatch(
                        cartActions.setItemSelected({
                          cartItemId: cartItem.cart_item_id,
                        })
                      )
                    }
                  >
                    <div className="cursor-pointer w-[18px] h-[18px] border-[2px] border-[#7b7c7c] ">
                      {cartItem.isSelected && (
                        <IconContext.Provider
                          value={{
                            size: "14px",
                            color: "#0c0d0d",
                            className: "border-2",
                          }}
                        >
                          <FaCheck />
                        </IconContext.Provider>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col items-center">
                    <p className="text-gray-400 font-light text-xs text-center">
                      {CurrencyFormatter.format(
                        parseInt(cartItem.pharmacy_drugs.price)
                      )}
                    </p>
                    <h1 className="text-gray-800 text-center mt-1">
                      {cartItem.pharmacy_drugs.drug_name}
                    </h1>
                    <p className="text-center text-gray-800 mt-1">
                      {CurrencyFormatter.format(
                        cartItem.quantity *
                          parseInt(cartItem.pharmacy_drugs.price)
                      )}
                    </p>
                    <div className="inline-flex items-center mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          removeQuantityHandler(
                            cartItem.quantity,
                            cartItem.cart_item_id
                          );
                        }}
                        className="bg-white rounded-l border text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 inline-flex items-center px-2 py-1 border-r border-gray-200"
                      >
                        <FaMinus />
                      </button>
                      <div className="bg-gray-100 border-t border-b border-gray-100 text-gray-600 hover:bg-gray-100 inline-flex items-center px-4 py-1 select-none">
                        {cartItem.quantity}
                      </div>
                      <button
                        disabled={
                          cartItem.quantity >= cartItem.pharmacy_drugs.stock
                        }
                        onClick={() => {
                          addQuantityHandler(
                            cartItem.cart_item_id,
                            cartItem.quantity,
                            cartItem.pharmacy_drugs.price
                          );
                        }}
                        className="bg-white rounded-r border text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 inline-flex items-center px-2 py-1 border-r border-gray-200"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className="flex justify-center text-[#ab3131] text-lg mt-2 border-2 py-2 px-5">
                        <button
                          className="hover:scale-105"
                          onClick={() =>
                            removeCartItemHandler(cartItem.cart_item_id)
                          }
                        >
                          <FaTrash />
                        </button>
                      </div>
                  </div>
                </>
              ))}
            </>
          )}
        </div>
      ))}
          </table>
          <PaginationInfo
            totalPage={
              cartsData.pageCount === 1 && cartsData.totalItems > 12
                ? Math.ceil(cartsData.totalItems / 12)
                : cartsData.pageCount
                ? cartsData.pageCount
                : 1
            }
            activePage={selectedFilter.page}
            setPage={(value) => handleFilterChange("page", value)}
            minItemPerPage={1}
            maxItemPerPage={12}
            stepItemPerPage={1}
            itemPerPage={selectedFilter.itemPerPage}
            setItemPerPage={(value) =>
              handleFilterChange("itemPerPage", +value)
            }
            withItemPerPage={true}
          />
        </>
      ) : (
        <p className="font-bold text-navy text-[17px] text-center">
          No cart items
        </p>
      )}
    </>
  );
};

export default CartItem;
