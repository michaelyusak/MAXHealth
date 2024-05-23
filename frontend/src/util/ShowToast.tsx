import { IToastData } from "../interfaces/ToastData";

export function HandleShowToast(
  setToast: (value: React.SetStateAction<IToastData>) => void,
  isSuccess: boolean,
  message: string,
  duration: number,
  withLoginRedirection?: boolean
) {
  setToast((prevToast) => ({
    ...prevToast,
    isSuccess: isSuccess,
    message: message,
    isVisible: true,
    withLoginRedirection: withLoginRedirection,
  }));

  setTimeout(
    () =>
      setToast((prevToast) => ({
        ...prevToast,
        isSuccess: undefined,
        message: "",
        isVisible: false,
        withLoginRedirection: false,
      })),
    duration * 1000
  );
}
