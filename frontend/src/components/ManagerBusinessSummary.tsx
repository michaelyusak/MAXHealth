import React from "react";
import { IBusinessSummaryItem } from "../interfaces/BusinessSummaryItem";
import ManagerBusinessSummaryItem from "./ManagerBusinessSummaryItem";

type managerBusinessSumaryProps = {
  businessSumarryItems: IBusinessSummaryItem[];
};

const ManagerBusinessSummary = ({
  businessSumarryItems,
}: managerBusinessSumaryProps): React.ReactElement => {
  return (
    <div className="w-[100%] h-[100%] bg-white rounded-[8px] p-[10px]">
      <h1 className="mb-[20px] text-[18px] font-[600] border-b-2">
        Business Summary
      </h1>

      <div className="flex justify-between gap-[10px]">
        {businessSumarryItems.map((businessSummaryItem, i) => (
          <ManagerBusinessSummaryItem
            key={i}
            category={businessSummaryItem.category}
            value={businessSummaryItem.value}
            onClick={() => businessSummaryItem.onClick()}
          ></ManagerBusinessSummaryItem>
        ))}
      </div>
    </div>
  );
};

export default ManagerBusinessSummary;
