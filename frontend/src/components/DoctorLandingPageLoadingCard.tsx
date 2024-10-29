import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import React from "react";

const DoctorLandingPageLoadingCard = (): React.ReactElement => {
  return (
    <>
      <Card
        placeholder={""}
        onPointerEnterCapture={() => {}}
        onPointerLeaveCapture={() => {}}
        className="w-[130px] md:w-[250px] xl:w-[280px] h-[200px] xl:h-[400px]"
      >
        <CardHeader
          placeholder={""}
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          className="rounded-t-xl h-[50%] xl:h-[60%]"
        >
          <div className="rounded-t-xl w-full h-full bg-gray-400 animate-pulse"></div>
        </CardHeader>

        <CardBody
          placeholder={""}
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          className="text-center p-[10px] flex flex-col gap-[5px]"
        >
          <Typography
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            variant="h4"
            color="blue-gray"
            className="text-[14px] h-[30px] xl:text-[20px] capitalize"
          >
            <div className="bg-gray-300 animate-pulse w-[50%] mx-auto h-[30px]"></div>
          </Typography>
          <Typography
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            variant="h5"
            color="blue-gray"
            className="text-[12px] h-[30px] xl:text-[18px] capitalize line-clamp-4"
            textGradient
          >
            <div className="bg-gray-300 animate-pulse w-[80%] mx-auto h-[30px]"></div>
          </Typography>
        </CardBody>
      </Card>
    </>
  );
};

export default DoctorLandingPageLoadingCard;
