import React, { useCallback, useEffect, useState } from "react";
import * as image from "../assets/img";
import { IDoctor, DoctorData } from "../interfaces/Doctor";
import Button from "./Button";
import { Link } from "react-router-dom";
import DoctorLandingPageCard from "./DoctorLandingPageCard";
import { IconButton } from "@material-tailwind/react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { HandleGet } from "../util/API";
import DoctorLandingPageLoadingCard from "./DoctorLandingPageLoadingCard";
import { VscDebugDisconnect } from "react-icons/vsc";

const Doctor = (): React.ReactElement => {
  const [doctorData, setDoctorData] = useState<{
    [page: number]: { data: IDoctor[] };
  }>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [doctorPerPage, setDoctorPerPage] = useState<number>(
    window.innerWidth <= 768 ? 2 : 4
  );
  const [page, setPage] = useState<number>(1);
  const [carouselPage, setCarouselPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);

  const handleGetDoctors = useCallback(() => {
    const url =
      import.meta.env.VITE_HTTP_BASE_URL +
      `/doctors?page=${page}&limit=${doctorPerPage}&sort=desc&sortBy=experience`;

    setLoading(true);

    HandleGet<DoctorData>(url)
      .then((data) => {
        setDoctorData((prevVal) => ({
          ...prevVal,
          [page]: { data: data.doctors },
        }));

        setCarouselPage(page);
        setMaxPage(data.page_info.page_count);
      })
      .catch((error: Error) => {
        console.log(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, doctorPerPage]);

  useEffect(() => {
    if (doctorData && doctorData[page]) {
      setCarouselPage(page);
      return;
    }

    handleGetDoctors();
  }, [handleGetDoctors, doctorData, page]);

  useEffect(() => {
    const handleResize = () => {
      setDoctorPerPage(window.innerWidth <= 768 ? 2 : 4);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <div className="w-[100%] py-[20px] flex flex-row my-[50px] px-[20px] xl:px-[50px] relative items-center bg-[#2b5bed]">
        <div className="flex flex-col md:w-[40vw] gap-3">
          <h2 className="text-white md:text-[35px] font-bold leading-10 text-[30px]">
            We’re welcoming new patients and can’t wait to meet you!
          </h2>
          <p className="text-white md:text-[16px] font-normal text-sm">
            A brief statement outlining the purpose and mission of the clinic.
            This can include the commitment to patient care, community health,
            and any specific goals or values. Specify the types of medical
            services provided
          </p>
          <Link to="/telemedicine/">
            <Button
              type="button"
              buttonStyle="green"
              additionalClassName={"rounded-lg py-2 px-3 text-white"}
            >
              Book Appointment
            </Button>
          </Link>
        </div>
        <div className="absolute top-[-110px] right-20 hidden md:block">
          <img src={image.doctor5} className="h-[400px] w-[450px] object-fit" />
        </div>
      </div>

      <h1 className="font-extrabold md:text-[50px] text-[#000D44] capitalize text-[30px]">
        Discover our doctors
      </h1>

      {doctorData && doctorData[carouselPage] ? (
        <div className="flex justify-center gap-[10px] w-full px-[10px] md:px-[20px] xl:px-[50px] items-center">
          <IconButton
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            size="md"
            disabled={page == 1}
            onClick={() => setPage((prevVal) => prevVal - 1)}
          >
            <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
              <FaArrowLeft></FaArrowLeft>
            </IconContext.Provider>
          </IconButton>

          <div className="grid grid-cols-2 xl:grid-cols-4 w-full justify-items-center">
            {doctorData[carouselPage].data.map((doctor, i) => (
              <DoctorLandingPageCard
                doctor={doctor}
                key={i}
              ></DoctorLandingPageCard>
            ))}
          </div>

          <IconButton
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            size="md"
            disabled={page == maxPage}
            onClick={() => setPage((prevVal) => prevVal + 1)}
          >
            <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
              <FaArrowRight></FaArrowRight>
            </IconContext.Provider>
          </IconButton>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center gap-[10px] w-full px-[10px] md:px-[20px] xl:px-[50px] items-center">
          <IconButton
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            size="md"
            disabled
            onClick={() => setPage((prevVal) => prevVal - 1)}
          >
            <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
              <FaArrowLeft></FaArrowLeft>
            </IconContext.Provider>
          </IconButton>

          <div className="grid grid-cols-2 xl:grid-cols-4 w-full justify-items-center">
            {Array.from({ length: doctorPerPage }).map((_, i) => (
              <DoctorLandingPageLoadingCard
                key={i}
              ></DoctorLandingPageLoadingCard>
            ))}
          </div>

          <IconButton
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            size="md"
            disabled
            onClick={() => setPage((prevVal) => prevVal + 1)}
          >
            <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
              <FaArrowRight></FaArrowRight>
            </IconContext.Provider>
          </IconButton>
        </div>
      ) : (
        <div className="flex justify-center h-[400px] w-full items-center">
          <div className="flex flex-col gap-[10px] items-center border-[1px] border-[#000E44] px-[20px] py-[5px] rounded-xl md:rounded-2xl xl:rounded-3xl">
            <IconContext.Provider value={{ size: "250px", color: "#000E44" }}>
              <VscDebugDisconnect></VscDebugDisconnect>
            </IconContext.Provider>

            <p className="text-center text-[20px] md:text-[24px] font-[600] capitalize">
              something went wrong on our side
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Doctor;
