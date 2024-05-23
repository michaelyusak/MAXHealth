import { Dispatch, SetStateAction, createContext } from "react";
import { IToastData } from "../interfaces/ToastData";
import { Noop } from "../constants/Noop";

interface IToastContext {
  toastData: IToastData;
  setToast: Dispatch<SetStateAction<IToastData>>;
}

const initialToastData: IToastData = {
  isSuccess: undefined,
  message: "",
  withLoginRedirection: false,
};

export const ToastContext = createContext<IToastContext>({
  toastData: initialToastData,
  setToast: Noop,
});
