import React, { useState } from "react";
import { BsSearch } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";

type searchBarProps = {
  options: string[];
  value: string;
  placeholder?: string;
  setValue: (value: string) => void;
  handleSearch: () => void;
  width?: string;
};

const SearchBar = ({
  options,
  value,
  placeholder,
  setValue,
  handleSearch,
  width,
}: searchBarProps): React.ReactElement => {
  function handleSetValue(value: string) {
    setValue(value);
    setShowSearchParamOptions(false);
  }

  const [showSearchParamOptions, setShowSearchParamOptions] =
    useState<boolean>(false);

  function handleSetShowSearchParamOptions() {
    setShowSearchParamOptions(!showSearchParamOptions);
  }

  return (
    <div
      className={`flex relative h-[30px] gap-[5px] pr-[5px] bg-white w-[${
        width ?? "100%"
      }] rounded-[8px] border-2 border-slate-800 justify-between items-center`}
    >
      <button
        onClick={() => handleSetShowSearchParamOptions()}
        className="border-r-2 border-slate-600 px-[5px] h-[100%] w-[38%] flex items-center justify-between"
      >
        <p>{value == "" ? placeholder : value}</p>
        <IoIosArrowDown
          className={`${showSearchParamOptions ? "rotate-180" : ""}`}
        ></IoIosArrowDown>
      </button>
      {showSearchParamOptions && (
        <div className="absolute bg-white flex shadow-[0px_5px_30px_3px_rgba(0,0,0,0.3)] flex-col rounded-b-[8px] z-[99] gap-[10px] w-[30%] py-[5px] top-[110%] left-0">
          {options.map((option, i) => (
            <button
              key={i}
              className={`w-[100%] text-left px-[5px] ${
                value == option ? "bg-[#DFF1FD]" : ""
              }`}
              onClick={() => handleSetValue(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      <input
        className="w-[60%] focus:outline-0"
        type="text"
        placeholder={value == "" ? "" : `Insert ${value} ...`}
        onKeyDown={(e) => e.key == "Enter" && handleSearch()}
      ></input>
      <button onClick={() => handleSearch()} className="p-[5px]">
        <BsSearch></BsSearch>
      </button>
    </div>
  );
};

export default SearchBar;
