import { RouterProvider } from "react-router-dom";
import "./App.css";
import router from "./router";
import { ToastContext } from "./contexts/ToastData";
import { useState } from "react";
import { IToastData } from "./interfaces/ToastData";
import Toast from "./components/Toast";

function App() {
  const [toastData, setToast] = useState<IToastData>({
    isSuccess: undefined,
    message: "",
    withLoginRedirection: false,
  });

  return (
    <>
      <ToastContext.Provider value={{ toastData, setToast }}>
        <RouterProvider router={router}></RouterProvider>
        {toastData.isVisible && (
          <Toast
            message={toastData.message}
            isSuccess={toastData.isSuccess ?? false}
            withLoginButton={toastData.withLoginRedirection}
          ></Toast>
        )}
      </ToastContext.Provider>
    </>
  );
}

export default App;
