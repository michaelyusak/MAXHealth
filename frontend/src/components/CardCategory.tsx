import React from "react";
import { CategoryData } from "../interfaces/Category";

type cardProps = {
  categoryData: CategoryData;
};

const CardCategory = ({ categoryData }: cardProps): React.ReactElement => {
  return (
    <div className="h-[180px] w-[250px] flex flex-col items-center justify-center gap-[5px] hover:translate-y-px hover:translate-x-px cursor-pointer hover:bg-gray-200 border-2 py-7 px-3 rounded-lg bg-slate-50">
      <img
        alt=""
        src={categoryData.category_url}
        className="w-[65px] aspect-square object-cover p-2 bg-slate-300 border-1 rounded-md"
      ></img>
      <p className="text-[18px] h-[60px] font-semibold text-center">
        {categoryData.category_name}
      </p>
    </div>
  );
};

export default CardCategory;
