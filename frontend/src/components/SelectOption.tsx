import React from "react";

interface SelectOptionProps {
  placeholder: string;
  options: { id: number; code: string; name: string }[];
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const SelectOption = ({
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: SelectOptionProps): React.ReactElement => {
  return (
    <select
      className={`w-full bg-[#f6f7fb] border-[1px] border-[#f6f7fb] outline-none ${
        disabled ? "text-[#808183]" : "text-[#000D44]"
      } rounded-[30px] px-[1.25rem] py-[1rem]`}
      value={value}
      onChange={onChange}
      disabled={disabled ?? false}
    >
      <option value="" disabled={Number(value) > 0 && value !== ""}>
        {placeholder}
      </option>
      {options.length > 0 &&
        options.map((opt, i) => (
          <option key={i} value={opt.id}>
            {opt.name}
          </option>
        ))}
    </select>
  );
};

export default SelectOption;
