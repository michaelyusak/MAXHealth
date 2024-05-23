import React from "react";
import { IoMdAdd } from "react-icons/io";

const ManagerMyProduct = (): React.ReactElement => {
  return (
    <div className="w-[100%] h-[100%] bg-white rounded-[8px] p-[15px]">
      <h1 className="mb-[20px] text-[18px] font-[600] border-b-2">
        My Product
      </h1>

      <div className="flex flex-col gap-[10px]">
        <button className="w-[100%] py-[10px] rounded-[8px] border-2 border-slate-400 text-[18px] font-[600]">
          View Recommendation
        </button>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[16px] font-[500]">
            Add product to grow your pharmacy
          </p>
          <button className="w-[100%] py-[10px] flex justify-center gap-[10px] items-center rounded-[8px] border-2 border-slate-400">
            <IoMdAdd></IoMdAdd>
            <p className="text-[18px] font-[600]">Add Product</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerMyProduct;
