import React, { useCallback, useContext, useEffect, useState } from "react";
import { ToastContext } from "../contexts/ToastData";
import { CategoryData } from "../interfaces/Category";
import { HandleGet } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { FaPlus } from "react-icons/fa";

const AddProductForm = (): React.ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setToast } = useContext(ToastContext);
  const [categoryOptions, setCategoryOptions] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleChangeCategory = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  const fetchDataCategory = useCallback(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL +  `/categories/`;
    setIsLoading(true);

    HandleGet<CategoryData[]>(url, true)
      .then((data) => {
        setCategoryOptions(data);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setToast]);

  useEffect(() => {
    fetchDataCategory();
  }, [fetchDataCategory]);

  {
    isLoading && <p>Loading ...</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg bg-white flex flex-col p-2 gap-2">
        <h1 className="text-lg pb-1 font-semibold">Informasi Dasar</h1>
        <div className="flex flex-col">
          <p>Nama Produk</p>
          <input type="text" className="p-2 border-2 rounded-md" />
        </div>
        <div className="flex flex-col">
          <p>Kategori</p>
          <select
            className="w-full bg-[#f6f7fb] border-[1px] border-[#f6f7fb] outline-none text-[#000D44] rounded-[10px] px-[1.25rem] py-[1rem]"
            value={selectedCategory}
            onChange={handleChangeCategory}
          >
            <option value="">Select Category</option>
            {categoryOptions.map((opt) => (
              <option key={opt.category_id} value={opt.category_id}>
                {opt.category_name}
              </option>
            ))}
          </select>
        </div>
        {selectedCategory && (
          <div className="flex flex-col gap-2">
            <p>Upload Foto Produk</p>
            <div className="flex gap-3">
              <label className="bg-gray-200 outline-none p-2 w-[100px] h-[100px] cursor-pointer flex items-center justify-center border-dashed border-2 border-gray-600">
                <FaPlus />
                <input className="hidden" type="file" />
              </label>
              <label className="bg-gray-200 outline-none p-2 w-[100px] h-[100px] cursor-pointer flex items-center justify-center border-dashed border-2 border-gray-600">
                <FaPlus />
                <input className="hidden" type="file" />
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-lg bg-white flex flex-col p-2 gap-2">
        <h1 className="text-lg pb-1 font-semibold">Spesifikasi Produk</h1>
        <div className="flex flex-col">
          <p>Content</p>
          <input type="text" className="p-2 border-2 rounded-md" />
        </div>
        <div className="flex flex-col">
          <p>Content</p>
          <input type="text" className="p-2 border-2 rounded-md" />
        </div>
        <div className="flex flex-col">
          <p>Manufacture</p>
          <input type="text" className="p-2 border-2 rounded-md" />
        </div>
        <div className="flex flex-col">
          <p>Classification</p>
          <select
            className="w-full bg-[#f6f7fb] border-[1px] border-[#f6f7fb] outline-none text-[#000D44] rounded-[10px] px-[1.25rem] py-[1rem]"
            value={selectedCategory}
            onChange={handleChangeCategory}
          >
            <option value="">Select Category</option>
            {categoryOptions.map((opt) => (
              <option key={opt.category_id} value={opt.category_id}>
                {opt.category_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <p>Form</p>
          <select
            className="w-full bg-[#f6f7fb] border-[1px] border-[#f6f7fb] outline-none text-[#000D44] rounded-[10px] px-[1.25rem] py-[1rem]"
            value={selectedCategory}
            onChange={handleChangeCategory}
          >
            <option value="">Select Category</option>
            {categoryOptions.map((opt) => (
              <option key={opt.category_id} value={opt.category_id}>
                {opt.category_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <p>Unit in pack</p>
          <input className="p-2 border-2 rounded-md"/>
        </div>
        <div className="flex flex-col">
          <p>Selling unit</p>
          <input className="p-2 border-2 rounded-md"/>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
