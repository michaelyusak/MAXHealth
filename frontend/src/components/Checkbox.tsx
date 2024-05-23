import React, { useState } from "react";

interface CheckboxProps {
  label: string;
  onChange: (newValue: boolean) => void;
  defaultValue?: boolean;
}

const Checkbox = ({
  label,
  onChange,
  defaultValue,
}: CheckboxProps): React.ReactElement => {
  const [checked, setChecked] = useState<boolean>(defaultValue ?? false);

  return (
    <div className="w-full">
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            setChecked(!checked);
            onChange(!checked);
          }}
        />{" "}
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
