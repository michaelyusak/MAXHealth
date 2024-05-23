import React from "react";
import { MdOutlineArrowForwardIos } from "react-icons/md";

type managerBusinessSummaryItem = {
  category: string;
  value: number;
  onClick: () => void;
};

const ManagerBusinessSummaryItem = ({
  category,
  value,
  onClick,
}: managerBusinessSummaryItem): React.ReactElement => {
  return (
    <div className="flex flex-col gap-[2px] items-center">
      <p className="text-[18px] font-[600] text-[#1F5FFF]">{value}</p>
      <button
        className="text-left w-fit underline flex items-center gap-[5px] cursor-pointer"
        onClick={onClick}
      >
        {category}
        <MdOutlineArrowForwardIos className="h-[20px]"></MdOutlineArrowForwardIos>
      </button>
    </div>
  );
};

export default ManagerBusinessSummaryItem;
