import React from "react";
import { IDoctor } from "../interfaces/Doctor";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";

type doctorLandingPageCardProps = {
  doctor: IDoctor;
};

const DoctorLandingPageCard = ({
  doctor,
}: doctorLandingPageCardProps): React.ReactElement => {
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
          <img
            src={doctor.profile_picture}
            className="rounded-t-xl w-full h-full object-cover"
          ></img>
        </CardHeader>

        <CardBody
          placeholder={""}
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          className="text-center p-[10px]"
        >
          <Typography
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            variant="h4"
            color="blue-gray"
            className="text-[14px] xl:text-[20px] capitalize"
          >
            {doctor.name}
          </Typography>
          <Typography
            placeholder={""}
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
            variant="h5"
            color="blue-gray"
            className="text-[12px] xl:text-[18px] capitalize line-clamp-4"
            textGradient
          >
            {doctor.specialization}
          </Typography>
        </CardBody>
      </Card>
    </>
  );
};

export default DoctorLandingPageCard;
