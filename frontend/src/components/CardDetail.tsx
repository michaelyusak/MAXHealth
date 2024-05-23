import React from "react";
import { Link } from "react-router-dom";
import * as image from "../assets/img";
import { FiCheckCircle } from "react-icons/fi";

const CardDetail = (): React.ReactElement => {
  return (
    <Link
      to="#"
      className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-6xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <img
        className="object-cover w-full rounded-t-lg h-40 md:h-[100%] md:w-[450px] md:rounded-none md:rounded-s-lg"
        src={image.categoryDetail}
        alt=""
      />
      <div className="flex flex-col justify-between p-4 leading-normal">
        <h5 className="mb-2 text-3xl font-bold tracking-tight text-[#000D44] dark:text-white">
          Pediatric Consultations
        </h5>
        <p className="mb-3 font-normal text-[#788094] dark:text-gray-400">
          Well-child checkups , also known as well-child visits or pediatric
          checkups, are regular medical examinations for the childrens to
          monitors their growth, development, and overall al age health for
          human.
        </p>
        <ul>
          <li className="flex items-center gap-1">
            <FiCheckCircle />
            <p className="text-[#788094]">Compassionate & Expert Care</p>
          </li>
          <li className="flex items-center gap-1">
            <FiCheckCircle />
            <p className="text-[#788094]">Patient-Centered Approach</p>
          </li>
          <li className="flex items-center gap-1">
            <FiCheckCircle />
            <p className="text-[#788094]">Personalized Treatment Plans</p>
          </li>
          <li className="flex items-center gap-1">
            <FiCheckCircle />
            <p className="text-[#788094]">Privacy & Policy</p>
          </li>
        </ul>
      </div>
    </Link>
  );
};

export default CardDetail;
