import React, { useContext, useState } from "react";
import { IPharmacyDrugByPharmacy } from "../interfaces/Drug";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { HandleDelete } from "../util/API";
import { Link } from "react-router-dom";

type modalDeleteProps = {
  onClose: (type: string) => void;
  data: IPharmacyDrugByPharmacy | undefined;
  onfetchDataDrugs: ()=>void
};

const ModalDeleteDrugManager = ({
  onClose,
  data,
  onfetchDataDrugs
}: modalDeleteProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleDelete(event: React.FormEvent) {
    event.preventDefault();
    const url = import.meta.env.VITE_HTTP_BASE_URL +  `/managers/pharmacies/drugs/${data?.pharmacy_drug_id}`;
    setIsLoading(true);
    HandleDelete(url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Delete drugs in pharmacy success", 5);
        onfetchDataDrugs()
        handleClose()
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const handleClose = () => {
    onClose("delete");
  };

  return (
    <>
      <div
        onKeyDown={() => {}}
        onClick={() => onClose("delete")}
        role="button"
        tabIndex={0}
        className="cursor-default w-[100vw] h-[100vh] fixed top-0 left-0 z-[150] rounded-xl bg-white opacity-65"
      ></div>
      <div className="w-[30vw] h-[70vh] fixed z-[150] top-[10vh] left-[30vw] justify-between items-center flex flex-col rounded-xl bg-[#DFF1FD] p-[30px]">
        <h1 className="text-lg font-bold text-red-700">Are you sure Delete this item?</h1>
        <div className="bg-white shadow-md rounded-lg max-w-sm dark:bg-gray-800 dark:border-gray-700">
              <Link to={`/product/${data?.drug.id}`}>
                <img
                  className="rounded-t-lg p-8"
                  src={data?.drug.image}
                  alt="product image"
                />
              </Link>
              <div className="px-5 pb-5 flex flex-col gap-3">
                <Link to={`/product/${data?.drug.id}`}>
                  <h3 className="text-gray-900 font-semibold text-xl tracking-tight dark:text-white">
                    {data?.drug.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Rp. {data?.price}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Stock {data?.stock}
                  </span>
                </div>
              </div>
            </div>
        {isLoading ? (
          <svg
            aria-hidden="true"
            className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 mx-auto my-[50%] justify-center items-center"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        ) : (
          <div className="flex gap-3 pt-4">
            <button
              className={`bg-red-500 hover:bg-red-800 hover:scale-105 text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-non `}
              type="submit"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              className="text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-non bg-green-500 hover:bg-green-800 hover:scale-105"
              type="button"
              onClick={() => onClose("edit")}
            >
              cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ModalDeleteDrugManager;
