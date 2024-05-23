import React from "react";
import Footer from "../components/Footer";
import NotFoundHeader from "../components/NotFoundHeader";
import { TbHandStop } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const NotFoundPage = (): React.ReactElement => {
  const navigate = useNavigate();
  return (
    <section className="">
      <NotFoundHeader />
      <div className="w-[80%] lg:w-[1440px] h-[84vh] m-auto flex justify-center items-center my-[30px]">
        <div className="flex justify-center flex-col items-center">
          <TbHandStop className="text-[500px]" />
          <p className="text-[40px]">This page are not available</p>
          <button
            onClick={() => navigate("/")}
            className="text-[36px] font-[600] bg-[#000D44] text-white px-[100px] py-[20px] rounded-2xl"
          >
            Go back to Homepage
          </button>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default NotFoundPage;
