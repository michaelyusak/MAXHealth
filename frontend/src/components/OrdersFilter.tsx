import React, { useEffect, useState } from "react";
import ButtonGroup from "./ButtonGroup";

interface OrdersFilterProps {
  initialSelectedOption: number;
  onSelectOption: (id: number) => void;
  onSearch: (value: string) => void;
  orderStatusFilterOptions: { id: number; name: string }[];
}
const OrdersFilter = ({
  initialSelectedOption,
  onSelectOption,
  onSearch,
  orderStatusFilterOptions,
}: OrdersFilterProps): React.ReactElement => {
  const [filterBy, setFilterBy] = useState<number>(initialSelectedOption);
  const [pharmacyName, setPharmacyName] = useState<string>("");

  useEffect(() => {
    setFilterBy(initialSelectedOption);
  }, [initialSelectedOption]);

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex gap-[10px]">
        <ButtonGroup
          items={orderStatusFilterOptions}
          onClick={(value) => {
            setFilterBy(value);
            onSelectOption(value);
          }}
          buttonClassname={(itemId) => {
            return `text-center h-[40px] min-w-[150px] ${
              itemId == filterBy
                ? "bg-slate-500 text-white"
                : "border-2 border-slate-500"
            } rounded-[8px] px-[1rem]`;
          }}
        ></ButtonGroup>
      </div>
      <div>
        <input
          type="text"
          placeholder="Pharmacy Name"
          className="border-2 border-slate-400 px-[10px] py-[5px] w-[350px] rounded-[8px] focus:outline-0"
          value={pharmacyName}
          onChange={(e) => setPharmacyName(e.target.value)}
          onKeyDown={(e) => e.key == "Enter" && onSearch(pharmacyName)}
        ></input>
      </div>
    </div>
  );
};

export default OrdersFilter;
