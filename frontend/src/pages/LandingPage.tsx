import React from "react";
import * as image from "../assets/img";
import Button from "../components/Button";
import Category from "../components/Category";
import Doctor from "../components/Doctor";

const LandingPage = (): React.ReactElement => {
  return (
    <>
      <div
        className={` flex-col bg-center bg-contain flex md:flex-row className="my-5"`}
        style={{ backgroundImage: `url(${image.backgroundHero}` }}
      >
        <div className="p-4 flex flex-col justify-center md:p-10 items-start md:items-start">
          <div className="rounded-[20px] gap-2 p-2 flex items-center justify-center md:gap-4 md:px-[10px] md:h-[70px] md:w-[320px] bg-[#14c57b] md:rounded-[40px]">
            <img src={image.logoCircle} className="md:w-[50px] w-[30px]" />
            <p className="md:text-[18px] text-sm w-full text-center font-[600] text-white">
              Little Steps, Big Strides
            </p>
          </div>
          <div>
            <h1 className="font-extrabold md:text-[50px] text-[#000D44] capitalize text-[30px]">
              Best pediatric care for your little one
            </h1>
          </div>
          <div>
            <p className="text-[#788094] text-sm md:text-[16px]">
              Ensuring the best pediatric care for your child involves the
              combinations of regular check-ups, a healthy lifestyle, and open
              communication with healthcare providers. Here are some tips for
              providing optimal pediatric care
            </p>
          </div>
          <div className="flex gap-4 mt-[20px]">
            <Button type="button" buttonStyle="blue" additionalClassName="rounded-lg py-2 px-3 text-[14px]">
              Book a visit
            </Button>
            <Button type="button" buttonStyle="green" additionalClassName="rounded-lg py-2 px-3 text-[14px]">
              Learn more
            </Button>
          </div>
        </div>
        <div className="m-auto w-[270px] md:m-0 md:w-full">
          <img src={image.heroImage} />
        </div>
      </div>
      <section className="my-5">
        <div className="flex flex-col md:flex-row justify-center gap-5 ">
          <div className="flex w-[100%] flex-col md:w-[25%] p-4 bg-[#d3feeb] text-center gap-2">
            <div className="flex m-[auto] items-center gap-2">
              <img src={image.doctors} />
              <p>Doctor</p>
            </div>
            <p className="text-[#788094]">
              Find a specialist at Dr. Carter Clinic based on their specialty,
              expertise, the disease or condition they specialize in.
            </p>
          </div>
          <div className="flex flex-col w-[100%] md:w-[25%] p-4  bg-[#f5f8fd] text-center gap-2">
            <div className="flex m-[auto] items-center gap-2">
              <img src={image.request} />
              <p>Request</p>
            </div>
            <p className="text-[#788094]">
              Thank you for submitting your appointment request through the
              online form for Dr. Carter Medical Center.
            </p>
          </div>
          <div className="flex flex-col w-[100%] md:w-[25%] p-4 bg-[#dff1fd] text-center gap-2">
            <div className="flex m-[auto] items-center gap-2">
              <img src={image.location} />
              <p>Location</p>
            </div>
            <p className="text-[#788094]">
              Discover details and directions for our campuses conveniently
              situated in your local area at The Clinic.
            </p>
          </div>
        </div>
      </section>
      <section>
        <Category />
      </section>
      <section className="flex flex-col justify-center items-center py-8 gap-5">
        <Doctor />
      </section>
    </>
  );
};

export default LandingPage;
