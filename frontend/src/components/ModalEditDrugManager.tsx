import React, { useContext, useState } from "react";
import { IPharmacyDrugByPharmacy } from "../interfaces/Drug";
import { HandlePatchBodyRaw } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { Link } from "react-router-dom";
import { CurrencyFormatter } from "../util/CurrencyFormatter";

type modalEditProps = {
  onClose: (type: string) => void;
  data: IPharmacyDrugByPharmacy | undefined;
  onfetchDataDrugs: () => void;
};

type Input = {
  stock: number;
  price: number;
};

const ModalEditDrugManager = ({
  onClose,
  onfetchDataDrugs,
  data,
}: modalEditProps): React.ReactElement => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [input, setInput] = useState<Input | undefined>(
    data && {
      stock: data?.stock,
      price: data?.price,
    }
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToast } = useContext(ToastContext);
  const [didEdit, setDidEdit] = useState({
    stock: false,
    price: false,
  });

  function handleInputBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const { name } = event.target;
    setDidEdit((prevEdit) => ({
      ...prevEdit,
      [name]: true,
    }));
  }

  const handleClose = () => {
    setInput({
      stock: 0,
      price: 0,
    });
    setIsSuccess(false);
    onClose("edit");
  };

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const url = import.meta.env.VITE_HTTP_BASE_URL +  `/managers/pharmacies/drugs/${data?.pharmacy_drug_id}`;

    if (input) {
      setIsLoading(true);
      HandlePatchBodyRaw(JSON.stringify(input), url, true)
        .then(() => {
          HandleShowToast(
            setToast,
            true,
            "Update drugs in pharmacy success",
            5
          );
          onfetchDataDrugs();
          handleClose();
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }

  const stockIsInvalid = didEdit.stock && input && isNaN(input.stock);

  const priceIsInvalid =
    (didEdit.price && input && input.price <= 500) ||
    (input && isNaN(input.price));

  const formIsValid = !stockIsInvalid && !priceIsInvalid;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setDidEdit({ ...didEdit, [name]: true });

    if (input) {
      setInput({ ...input, [name]: parseInt(value) });
    }
  };

  {
    isLoading && <p>Loading...</p>;
  }

  return (
    <>
      <div
        onKeyDown={() => {}}
        onClick={() => onClose("edit")}
        role="button"
        tabIndex={0}
        className="cursor-default w-[100vw] h-[100vh] fixed top-0 left-0 z-[150] rounded-xl bg-white opacity-65"
      ></div>
      <div className="w-[50vw] h-[auto] fixed z-[150] top-[5vh] left-[25vw] justify-between items-center flex flex-col rounded-xl bg-[#DFF1FD] p-[30px]">
        <div className=" w-[60%] ">
          <form
            className="flex flex-col gap-1 px-3 justify-center items-center"
            onSubmit={handleSubmit}
          >
            <h2 className="text-[20px] font-bold text-center">Edit Drugs</h2>
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
                    {CurrencyFormatter.format(data ? data?.price : 0)}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Stock {data?.stock}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex -flex-row justify-between gap-4">
              <div className="flex flex-col gap-1 ">
                <label className="text-[18px] font-semibold">Stock</label>
                <input
                  className="border-2 p-3 rounded-lg bg-[#ffffff] text-[#5c5c5c] placeholder:text-[#5c5c5c]"
                  placeholder="stock"
                  type="text"
                  name="stock"
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
                {stockIsInvalid && (
                  <p className="text-red-400">Enter Your valid Stock!</p>
                )}
              </div>
              <div className="flex flex-col gap-1 ">
                <label className="text-[18px] font-semibold">Price</label>
                <input
                  className="border-2 p-3 rounded-lg bg-[#ffffff] text-[#5c5c5c] placeholder:text-[#5c5c5c]"
                  placeholder="Price"
                  type="text"
                  name="price"
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
                {priceIsInvalid && (
                  <p className="text-red-400">Please Enter Your valid Price!</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                className={`text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-non ${
                  isSuccess ? "bg-green-500 hover:bg-green-800" : "bg-green-900"
                } ${
                  formIsValid
                    ? "bg-green-500 hover:bg-green-800"
                    : "bg-gray-500"
                }`}
                type="submit"
                disabled={!formIsValid}
              >
                Submit
              </button>
              <button
                className="text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-non bg-red-500 hover:bg-red-800"
                type="button"
                onClick={() => onClose("edit")}
              >
                cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ModalEditDrugManager;
