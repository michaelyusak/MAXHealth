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
      <div className="relative">
        <img
          className="object-cover rounded-[150px]"
          src={doctorData.doctors[prevImageIndex].profile_picture}
          alt={`Image ${prevImageIndex + 1}`}
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        />
        <div className="hover:duration-300 ease-in gap-2 rounded-[150px] cursor-pointer absolute w-[100%] h-[100%] bottom-10 left-0 justify-end flex flex-col items-center opacity-0 hover:opacity-100 pb-2">
          <h4 className="text-white font-bold text-xl bg-blue-400 rounded-lg px-2 py-1 capitalize">
            dr. {doctorData.doctors[prevImageIndex].name}
          </h4>
          <p className="text-black bg-slate-50 rounded-lg font-normal text-base px-2">
            {doctorData.doctors[currentImageIndex].specialization}
          </p>
        </div>
      </div>
      <div className="relative">
        <img
          className="rounded-[150px] object-cover"
          src={doctorData.doctors[currentImageIndex].profile_picture}
          alt={`Image ${currentImageIndex + 1}`}
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        />
        <div className="hover:duration-300 ease-in gap-2 rounded-[150px] cursor-pointer absolute w-[100%] h-[100%] bottom-10 left-0 justify-end flex flex-col items-center opacity-0 hover:opacity-100 pb-2">
          <h4 className="text-white font-bold text-xl bg-blue-400 rounded-lg px-2 py-1 capitalize">
            dr. {doctorData.doctors[currentImageIndex].name}
          </h4>
          <p className="text-black bg-slate-50 rounded-lg font-normal text-base px-2 ">
            {doctorData.doctors[currentImageIndex].specialization}
          </p>
        </div>
      </div>
      <div className="relative">
        <img
          className="rounded-[150px] object-cover"
          src={doctorData.doctors[nextImageIndex].profile_picture}
          alt={`Image ${nextImageIndex + 1}`}
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        />
        <div className="hover:duration-300 ease-in gap-2 rounded-[150px] cursor-pointer absolute w-[100%] h-[100%] bottom-10 left-0 justify-end flex flex-col items-center opacity-0 hover:opacity-100 pb-2">
          <h4 className="text-white font-bold text-xl bg-blue-400 rounded-lg px-2 py-1 capitalize">
            dr. {doctorData.doctors[nextImageIndex].name}
          </h4>
          <p className="text-black bg-slate-50 rounded-lg font-normal text-base px-2">
            {doctorData.doctors[nextImageIndex].specialization}
          </p>
        </div>
      </div>
      <div className="relative">
        <img
          className="rounded-[150px] object-cover"
          src={doctorData.doctors[nextNextImageIndex].profile_picture}
          alt={`Image ${nextNextImageIndex}`}
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        />
        <div className="hover:duration-300 ease-in gap-2 rounded-[150px] cursor-pointer absolute w-[100%] h-[100%] bottom-10 left-0 justify-end flex flex-col items-center opacity-0 hover:opacity-100 pb-2">
          <h4 className="text-white font-bold text-xl bg-blue-400 rounded-lg px-2 py-1 capitalize">
            dr. {doctorData.doctors[nextNextImageIndex].name}
          </h4>
          <p className="text-black bg-slate-50 rounded-lg font-normal text-base px-2">
            {doctorData.doctors[nextNextImageIndex].specialization}
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
