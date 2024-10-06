import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FaRegUser } from "react-icons/fa";
import { LuClipboardList } from "react-icons/lu";
import * as image from "../assets/img";
import Button from "./Button";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import { BsCart4 } from "react-icons/bs";
import { IconContext } from "react-icons";
import { AiOutlineShop } from "react-icons/ai";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { fetchCartData } from "../slices/CartActions";
import { RiFilePaper2Line } from "react-icons/ri";
import { HiMenuAlt2, HiMenuAlt3 } from "react-icons/hi";

const Header = (): React.ReactElement => {
  const cart = useAppSelector((state) => state.cart);
  const token = Cookies.get("accessToken");

  useEffect(() => {
    const data = Cookies.get("data");
    const token = Cookies.get("accessToken");

    if (token && data) {
      const dataParsed = JSON.parse(data);

      const roleName = dataParsed["role"];

      if (roleName == "user") {
        setIsValid(true);
      }
    }
  }, []);

  const [isValid, setIsValid] = useState<boolean>(false);

  const navigate = useNavigate();

  const { setToast } = useContext(ToastContext);

  const dispatch = useAppDispatch();
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleShowMenu = () => {
    setShowMenu(!showMenu);
  };
  return (
    <div className="w-[100%] h-[100px] bg-[#dff1fd] flex items-center">
      <div className="w-[1440px] m-[auto] px-3 md:px-0 justify-between md:py-3 flex flex-row items-center">
        <NavLink to="/" className={"z-[100]"}>
          <img src={image.logoV2} className="w-[150px] " />
        </NavLink>
        <div className=" flex gap-[15px] items-center text-[#000d43]">
          <button
            onClick={handleShowMenu}
            className={`ease-in duration-200 z-[100] ${
              showMenu ? "text-[#000000]" : "#000d44"
            }`}
          >
            <IconContext.Provider
              value={{
                size: "50px",
                className: "border-2 border-black p-2 rounded-md",
              }}
            >
              {showMenu ? <HiMenuAlt2 /> : <HiMenuAlt3 />}
            </IconContext.Provider>
          </button>
          {showMenu && (
            <>
              <div
                className="w-[100vw] h-[100vh] px-2 md:px-0 fixed top-0 left-0 z-[80] opacity-55 bg-black ease-in duration-200 flex justify-end"
                onClick={handleShowMenu}
                onKeyDown={() => {}}
                role="button"
              ></div>
              <div className="bg-gray-50 w-[100vw] md:w-[20vw] h-[100vh] fixed opacity-[80] z-[80] bottom-0 right-0 ">
                <ul className="flex flex-col h-[100%] w-[100%] justify-center text-[20px]">
                  <li>
                    <NavLink
                      to="/product"
                      onClick={() => setShowMenu(false)}
                      className={(isActive) =>
                        `${
                          isActive.isActive ? "bg-[#DFF1FD]" : "bg-transparent"
                        } items-center flex gap-2`
                      }
                    >
                      <Button
                        type="button"
                        buttonStyle="icon-header"
                        additionalClassName="w-[70px]"
                      >
                        <IconContext.Provider
                          value={{ size: "25px", color: "#000d44" }}
                        >
                          <AiOutlineShop />
                        </IconContext.Provider>
                      </Button>
                      <p>Product</p>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/users/profile"
                      onClick={() => setShowMenu(false)}
                      className={(isActive) =>
                        `${
                          isActive.isActive ? "bg-[#DFF1FD]" : "bg-transparent"
                        } items-center flex gap-2`
                      }
                    >
                      <Button
                        type="button"
                        buttonStyle="icon-header"
                        additionalClassName="w-[70px]"
                      >
                        <IconContext.Provider
                          value={{ size: "23px", color: "#000d44" }}
                        >
                          <FaRegUser />
                        </IconContext.Provider>
                      </Button>
                      <p>Profile</p>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/telemedicine/"
                      onClick={() => setShowMenu(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-[#DFF1FD] items-center flex gap-2"
                          : "items-center flex gap-2"
                      }
                    >
                      <Button
                        type="button"
                        buttonStyle="icon-header"
                        additionalClassName="w-[70px]"
                      >
                        <img
                          alt=""
                          src={image.telemedicineIcon}
                          className="h-[27px]"
                        ></img>
                      </Button>
                      <p>Chat to doctor</p>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/prescriptions/"
                      onClick={() => setShowMenu(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-[#DFF1FD] items-center flex gap-2"
                          : "items-center flex gap-2"
                      }
                    >
                      <Button
                        type="button"
                        buttonStyle="icon-header"
                        additionalClassName="w-[70px]"
                      >
                        <IconContext.Provider
                          value={{ size: "25px", color: "#000d44" }}
                        >
                          <RiFilePaper2Line />
                        </IconContext.Provider>
                      </Button>
                      <p>Prescriptions</p>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/orders"
                      onClick={() => setShowMenu(false)}
                      className={(isActive) =>
                        `${
                          isActive.isActive ? "bg-[#DFF1FD]" : "bg-transparent"
                        } items-center flex gap-2`
                      }
                    >
                      <Button
                        type="button"
                        buttonStyle="icon-header"
                        additionalClassName="w-[70px]"
                      >
                        <IconContext.Provider
                          value={{ size: "25px", color: "#000d44" }}
                        >
                          <LuClipboardList />
                        </IconContext.Provider>
                      </Button>
                      <p>Order</p>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/cart"
                      onClick={() => setShowMenu(false)}
                      className={(isActive) =>
                        `${
                          isActive.isActive ? "bg-[#DFF1FD]" : "bg-transparent"
                        } items-center flex gap-2`
                      }
                    >
                      <Button
                        type="button"
                        buttonStyle="icon-header"
                        additionalClassName="w-[70px]"
                      >
                        <IconContext.Provider
                          value={{ size: "25px", color: "#000d44" }}
                        >
                          {<BsCart4 />}
                        </IconContext.Provider>
                        {token &&
                          (cart.totalQuantity < 1 ? "" : cart.totalQuantity)}
                      </Button>
                      <p>Cart</p>
                    </NavLink>
                  </li>
                  <li className="pt-5 px-2 md:px-0">
                    <Button
                      additionalClassName="ml-[10px] py-2 px-3 rounded-xl"
                      onClick={() => {
                        if (isValid) {
                          Cookies.remove("data");
                          Cookies.remove("accessToken");
                          Cookies.remove("refreshToken");
                          setShowMenu(false);
                          navigate("/");

                          dispatch(fetchCartData());
                          HandleShowToast(
                            setToast,
                            true,
                            "Successfully Logout",
                            5
                          );
                          setIsValid(false);
                          return;
                        }
                        navigate("/auth/login");
                      }}
                      type="button"
                      buttonStyle={isValid ? "red" : "blue"}
                    >
                      {isValid ? "Logout" : "Login"}
                    </Button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
