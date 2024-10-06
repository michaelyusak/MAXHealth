import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Button from "./Button";
import { DoctorData } from "../interfaces/Doctor";
import { IconContext } from "react-icons";

interface CarouselProps {
  doctorData: DoctorData;
  imageWidth: number;
  imageHeight: number;
}

const CarouselComp: React.FC<CarouselProps> = ({
  doctorData,
  imageWidth,
  imageHeight,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const doctorCount = doctorData.doctors.length;

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % doctorCount);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? doctorCount - 1 : prevIndex - 1
    );
  };

  const prevImageIndex =
    currentImageIndex === 0 ? doctorCount - 1 : currentImageIndex - 1;
  const nextImageIndex = (currentImageIndex + 1) % doctorCount;
  const nextNextImageIndex = (currentImageIndex + 2) % doctorCount;

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center">
      <Button buttonStyle="carousel" type="button" onClick={prevImage} additionalClassName="hidden md:block">
        <IconContext.Provider value={{ color: "#000D44" }}>
          <FaArrowLeft />
        </IconContext.Provider>
      </Button>
      
      <div className="relative cursor-pointer">
        <img
          className="object-cover rounded-[150px]"
          src={doctorData.doctors[prevImageIndex].profile_picture}
          alt={`Image ${prevImageIndex + 1}`}
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        />
        <div className="bottom-[80px] left-[50%] px-[10px]  w-full translate-x-[-50%] justify-end flex flex-col items-center gap-[10px] absolute">
          <p className="text-white font-bold text-xl bg-blue-400 rounded-lg p-[5px] capitalize">
            dr. {doctorData.doctors[prevImageIndex].name}
          </p>
          <p className="capitalize text-black text-[14px] text-center max-w-[90%] bg-slate-50 rounded-lg font-normal text-base p-[2px]">
            {doctorData.doctors[currentImageIndex].specialization}
          </p>
        </div>
      </div>

      <div className="relative cursor-pointer">
        <img
          className="rounded-[150px] object-cover"
          src={doctorData.doctors[currentImageIndex].profile_picture}
          alt={`Image ${currentImageIndex + 1}`}
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        />
        <div className="bottom-[80px] left-[50%] px-[10px]  w-full translate-x-[-50%] justify-end flex flex-col items-center gap-[10px] absolute">
          <p className="text-white font-bold text-xl bg-blue-400 rounded-lg p-[5px] capitalize">
            dr. {doctorData.doctors[prevImageIndex].name}
          </p>
          <p className="capitalize text-black text-[14px] text-center max-w-[90%] bg-slate-50 rounded-lg font-normal text-base p-[2px]">
            {doctorData.doctors[currentImageIndex].specialization}
          </p>
        </div>
      </div>

      <div className="relative cursor-pointer">
        <img
          className="rounded-[150px] object-cover"
          src={doctorData.doctors[nextImageIndex].profile_picture}
          alt={`Image ${nextImageIndex + 1}`}
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        />
        <div className="bottom-[80px] left-[50%] px-[10px]  w-full translate-x-[-50%] justify-end flex flex-col items-center gap-[10px] absolute">
          <p className="text-white font-bold text-xl bg-blue-400 rounded-lg p-[5px] capitalize">
            dr. {doctorData.doctors[prevImageIndex].name}
          </p>
          <p className="capitalize text-black text-[14px] text-center max-w-[90%] bg-slate-50 rounded-lg font-normal text-base p-[2px]">
            {doctorData.doctors[currentImageIndex].specialization}
          </p>
        </div>
      </div>

      <div className="relative cursor-pointer">
        <img
          className="rounded-[150px] object-cover"
          src={doctorData.doctors[nextNextImageIndex].profile_picture}
          alt={`Image ${nextNextImageIndex}`}
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        />
        <div className="bottom-[80px] left-[50%] px-[10px]  w-full translate-x-[-50%] justify-end flex flex-col items-center gap-[10px] absolute">
          <p className="text-white font-bold text-xl bg-blue-400 rounded-lg p-[5px] capitalize">
            dr. {doctorData.doctors[prevImageIndex].name}
          </p>
          <p className="capitalize text-black text-[14px] text-center max-w-[90%] bg-slate-50 rounded-lg font-normal text-base p-[2px]">
            {doctorData.doctors[currentImageIndex].specialization}
          </p>
        </div>
      </div>

      <div className="flex justify-between w-[100%] md:w-[auto]">
        <Button
          buttonStyle="carousel"
          type="button"
          onClick={prevImage}
          additionalClassName="md:hidden"
        >
          <IconContext.Provider value={{ color: "#000D44" }}>
            <FaArrowLeft />
          </IconContext.Provider>
        </Button>
        <Button buttonStyle="carousel" type="button" onClick={nextImage}>
          <FaArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default CarouselComp;
