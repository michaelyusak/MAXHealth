import React, { useEffect, useState } from "react";
import * as image from "../assets/img";
import CarouselComp from "./CarouselComp";
import { DoctorData } from "../interfaces/Doctor";
import Button from "./Button";
import { Link } from "react-router-dom";

const Doctor = (): React.ReactElement => {
  const [dataDoctor, setDataDoctor] = useState<DoctorData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  const fetchDataDoctors = async () => {
    const options: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(import.meta.env.VITE_DEPLOYMENT_URL +  "/doctors/", options);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const doctorsData = await response.json();
      setDataDoctor(doctorsData.data);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataDoctors();
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!dataDoctor) return <p>No data</p>;

  return (
    <>
      <div className="w-[100%] py-20 md:pl-[11vw] pl-3 flex flex-row relative items-center md:my-20 bg-[#2b5bed] md:h-[30vh]">
        <div className="flex flex-col md:w-[40vw] gap-3">
          <h2 className="text-white md:text-[35px] font-bold leading-10 text-[30px]">We’re welcoming new patients and can’t wait to meet you!</h2>
          <p className="text-white md:text-[16px] font-normal text-sm">
            A brief statement outlining the purpose and mission of the clinic.
            This can include the commitment to patient care, community health,
            and any specific goals or values. Specify the types of medical
            services provided
          </p>
          <Link to="/telemedicine/">
            <Button type="button" buttonStyle="green" additionalClassName={"rounded-lg py-2 px-3 text-white"}>
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
      {dataDoctor && dataDoctor.doctors.length > 0 && (
        <CarouselComp
          doctorData={dataDoctor}
          imageWidth={300}
          imageHeight={450}
        />
      )}
    </>
  );
};

export default Doctor;
