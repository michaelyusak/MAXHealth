import React from "react";
import { CategoryData } from "../interfaces/Category";

type cardProps = {
  categoryData: CategoryData;
};

const CardCategory = ({ categoryData }: cardProps): React.ReactElement => {
  return (
    <div className="h-[190px] xl:h-[180px] w-[140px] md:w-[200px] xl:w-[300px] flex flex-col items-center justify-center gap-[5px] hover:translate-y-px hover:translate-x-px cursor-pointer hover:bg-gray-200 border-2 p-[5px] xl:py-[10px] xl:px-3 rounded-lg bg-slate-50">
      <img
        alt=""
        src={categoryData.category_url}
        className="w-[100px] xl:w-[90px] aspect-square object-cover p-2 bg-slate-300 border-1 rounded-md"
      ></img>
      <p className="text-[14px] xl:text-[18px] h-[80px] xl:h-[60px] font-semibold text-center">
        {categoryData.category_name}
      </p>
    </div>
  );
};

export default CardCategory;
