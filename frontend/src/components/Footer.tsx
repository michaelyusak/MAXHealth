import React from "react";
import Button from "./Button";
import {
  FaFacebook,
  FaLinkedin,
  FaTwitter,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { FaCircleDot, FaLocationDot } from "react-icons/fa6";
import { IoIosSend } from "react-icons/io";
import * as image from "../assets/img";
import { IconContext } from "react-icons";

const Footer = (): React.ReactElement => {
  return (
    <>
      <div className="md:min-w-[1440px] w-[100vw] bg-[#000D44] text-white">
        <div className="w-[100%] md:w-[1440px] m-[auto] justify-between flex flex-col md:flex-row md:py-7 p-2 md:px-0">
          <div className="flex flex-col gap-3 text-sm md:text-[16px]">
            <img
              src={image.logoV2White}
              className="text-white md:w-[200px] w-[150px]"
            />
            <p className="text-sm md:text-[16px]">
              Subscribe to out newsletter today to receive latest news
              administrate cost effective for tactical data.
            </p>
            <div className="flex gap-2 items-center">
              <i>
                <FaLocationDot />
              </i>
              <p>
                St. Mega Kuningan Barat III, Jakarta selatan, Daerah Khusus
                Ibukota Jakarta
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <i>
                <FaEnvelope />
              </i>
              <p>info@maxhealth.com</p>
            </div>
            <div className="flex gap-2 items-center">
              <i>
                <FaPhone />
              </i>
              <p>info@maxhealth.com</p>
            </div>
          </div>
          <div className="text-sm md:text-[16px]">
            <h2 className="text-2xl font-bold mb-3">Quick Links</h2>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2 md:text-[18px] text-sm">
                <FaCircleDot />
                About Us
              </li>
              <li className="flex items-center gap-2 md:text-[18px] text-sm">
                <FaCircleDot />
                Terms of Use
              </li>
              <li className="flex items-center gap-2 md:text-[18px] text-sm">
                <FaCircleDot />
                Privacy & Policy
              </li>
              <li className="flex items-center gap-2 md:text-[18px] text-sm">
                <FaCircleDot />
                Contact Us
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold mb-3">Let’s Stay In Touch</h2>
            <p>Subscribe for newsletter</p>
            <form className="flex flex-col gap-2">
              <div className="flex items-center justify-between bg-white rounded-[8px] py-[2px] px-[7px]">
                <input
                  placeholder="Enter Email"
                  className="text-black py-2 w-[100%] px-3 bg-transparent focus:outline-0"
                />
                <button type="submit" className="text-2xl ">
                  <IconContext.Provider value={{ color: "#000D44" }}>
                    <IoIosSend />
                  </IconContext.Provider>
                </button>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  value="Agree"
                />
                <label htmlFor="newsletter">
                  {" "}
                  I Agree With Terms And Condition
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="md:min-w-[1440px] w-[100vw] bg-[#0D1A27]">
        <div className="w-[100%] md:w-[1440px] flex justify-between items-center m-[auto] md:py-4 p-2 md:px-0">
          <p className="text-white text-sm md:text-[16px]">
            Copyright 2024 Mediax. All Rights Reserved.
          </p>
          <div className="flex gap-[10px]">
            <Button
              type="button"
              buttonStyle="icon-footer"
              additionalClassName="w-[30px] h-[30px]"
            >
              <FaTwitter />
            </Button>
            <Button
              type="button"
              buttonStyle="icon-footer"
              additionalClassName="w-[30px] h-[30px]"
            >
              <FaFacebook />
            </Button>
            <Button
              type="button"
              buttonStyle="icon-footer"
              additionalClassName="w-[30px] h-[30px]"
            >
              <FaLinkedin />
            </Button>
            <Button
              type="button"
              buttonStyle="icon-footer"
              additionalClassName="w-[30px] h-[30px]"
            >
              <FaWhatsapp />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
