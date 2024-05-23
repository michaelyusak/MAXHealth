import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

type itemSelectorProps = {
  items: string[];
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  optionsAdditionalClassname?: string;
  buttonAdditionalClassname?: string;
  expandTop?: boolean;
  height?: string;
  borderColor?: string;
  rounded?: string;
  textStyle?: string;
  px?: string;
  py?: string;
  border?: string;
};

const ItemSelector = ({
  items,
  placeholder,
  value,
  setValue,
  optionsAdditionalClassname,
  buttonAdditionalClassname,
  expandTop,
  height,
  borderColor,
  rounded,
  textStyle,
  px,
  py,
  border,
}: itemSelectorProps): React.ReactElement => {
  function handleSetDisplayItem(value: string) {
    setValue(value);
    setShowItemOptions(false);
  }

  const [showItemOptions, setShowItemOptions] = useState<boolean>(false);
  function handleSetShowItemOptions() {
    setShowItemOptions(!showItemOptions);
  }

  return (
    <div className={`relative ${buttonAdditionalClassname}`}>
      <button
        type="button"
        onClick={() => handleSetShowItemOptions()}
        className={`w-[100%] h-[${
          height ? height : "30px"
        }] flex items-center ${px || py ? `${px} ${py}` : "p-[5px]"} ${
          rounded ? rounded : "rounded-[8px]"
        } ${border ? border : "border-2"} ${
          borderColor ? `${borderColor}` : "border-slate-600"
        } justify-between ${buttonAdditionalClassname}`}
      >
        <p className={textStyle}>{value != "" ? value : placeholder}</p>
        <IoIosArrowDown
          className={`${showItemOptions ? "rotate-180" : ""}`}
        ></IoIosArrowDown>
      </button>
      {showItemOptions && (
        <div
          className={`absolute md:z-[100] w-[100%] bg-white overflow-y-auto flex ${
            expandTop != undefined && expandTop ? "top-[-210px]" : "top-[30px]"
          } shadow-[0px_5px_30px_3px_rgba(0,0,0,0.3)] rounded-b-[8px] flex-col ${
            items.length > 6 ? "h-[200px]" : ""
          }  gap-[10px] ${optionsAdditionalClassname}`}
          style={{ scrollbarWidth: "thin" }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className={`${value == item ? "bg-[#DFF1FD]" : ""} ${textStyle}`}
              onClick={() => handleSetDisplayItem(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemSelector;
