import React from "react";
import Button from "./Button";
import { ButtonStyle } from "../interfaces/Button";

interface ConfirmationDialogProps {
  text: string;
  leftButton: {
    text: string;
    onClick: () => void;
    style: ButtonStyle;
  };
  rightButton: {
    text: string;
    onClick: () => void;
    style: ButtonStyle;
  };
}
const ConfirmationDialog = ({
  text,
  leftButton,
  rightButton,
}: ConfirmationDialogProps): React.ReactElement => {
  return (
    <div className="flex flex-col justify-center items-center gap-[1rem]">
      <p>{text}</p>
      <div className="flex flex-row gap-[1rem]">
        <Button
          type="button"
          buttonStyle={leftButton.style}
          onClick={leftButton.onClick}
        >
          {leftButton.text}
        </Button>
        <Button
          type="button"
          buttonStyle={rightButton.style}
          onClick={rightButton.onClick}
        >
          {rightButton.text}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
