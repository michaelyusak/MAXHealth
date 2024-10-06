import React, { useEffect } from "react";
import Cookies from "js-cookie";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import { useAppDispatch } from "../redux/reduxHooks";
import { fetchCartData } from "../slices/CartActions";

const LandingPageTemplate = (): React.ReactElement => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const data = Cookies.get("data");

    if (data) {
      const dataParsed = JSON.parse(data);

      if (dataParsed.role == "user") {
        dispatch(fetchCartData());
      }
    }
  }, [dispatch]);

  return (
    <>
      <Header />

      <div className="w-[100%] m-auto pb-[50px] pt-[100px]">
        <Outlet />
      </div>

      <Footer />
    </>
  );
};

export default LandingPageTemplate;
