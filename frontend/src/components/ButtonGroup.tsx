import React from "react";

type filterButtonGroupProps = {
  items: { id: number; name: string }[];
  onClick: (id: number) => void;
  buttonClassname: (id: number) => string;
};

const ButtonGroup = ({
  items,
  onClick,
  buttonClassname,
}: filterButtonGroupProps): React.ReactElement => {
  return (
    <>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onClick(item.id)}
          className={`${buttonClassname(item.id)}`}
        >
          {item.name}
        </button>
      ))}
    </>
  );
};

export default ButtonGroup;
