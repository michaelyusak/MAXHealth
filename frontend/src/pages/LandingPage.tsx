import React from "react";
import * as image from "../assets/img";
import Button from "../components/Button";
import Category from "../components/Category";
import Doctor from "../components/Doctor";

const LandingPage = (): React.ReactElement => {
  return (
    <>
      <div
        className={`h-[80vh] w-[100%] flex items-center md:flex-row object-cover px-[20px]`}
        style={{ backgroundImage: `url(${image.backgroundHero}` }}
      >
        <div className="p-4 flex flex-col justify-center md:p-10 items-start md:items-start">
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

        <div className="m-auto w-[270px] hidden md:block md:m-0 md:w-full">
          <img src={image.heroImage} />
        </div>
      </div>

      <section>
        <Category />
      </section>

      <section className="flex flex-col justify-center items-center xl:py-8 gap-5">
        <Doctor />
      </section>
    </>
  );
};

export default LandingPage;
