import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { CgArrowsExchange } from "react-icons/cg";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { AlphaNumericRegex, NameRegex, SpecialNameRegex } from "../util/Regex";
import ItemSelector from "./ItemSelector";
import {
  HandleAddFormData,
  HandleDelete,
  HandleGet,
  HandlePutFormData,
} from "../util/API";
import { IDrugClassification, IDrugForm } from "../interfaces/Drug";
import { CategoryData } from "../interfaces/Category";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";

type adminDrugFormProps = {
  purpose: "add" | "update";
  refetch: () => void;
  inputValues: {
    [key: string]: {
      value: string | number;
      error: string;
      isTrue?: boolean;
      file?: File;
    };
  };
  setInputValues: React.Dispatch<
    React.SetStateAction<
      | {
          [key: string]: {
            value: string | number;
            error: string;
            isTrue?: boolean | undefined;
            file?: File | undefined;
          };
        }
      | undefined
    >
  >;
  handleClose: () => void;
};

const AdminDrugForm = ({
  purpose,
  refetch,
  inputValues,
  setInputValues,
  handleClose,
}: adminDrugFormProps) => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  function getIdByName(
    name: string,
    key: "category" | "drugForm" | "drugClassification"
  ): number {
    let id: number = 0;

    switch (key) {
      case "category":
        categories?.forEach((category) => {
          if (category.category_name == name) {
            id = category.category_id;
          }
        });
        break;
      case "drugForm":
        drugForms?.forEach((drugForm) => {
          if (drugForm.name == name) {
            id = drugForm.id;
          }
        });
        break;
      case "drugClassification":
        drugClassifications?.forEach((drugClassification) => {
          if (drugClassification.name == name) {
            id = drugClassification.id;
          }
        });
        break;
    }

    return id;
  }

  function getNameById(
    id: number,
    key: "category" | "drugForm" | "drugClassification"
  ): string {
    let name: string = "";

    switch (key) {
      case "category":
        categories?.forEach((category) => {
          if (category.category_id == id) {
            name = category.category_name;
          }
        });
        break;
      case "drugForm":
        drugForms?.forEach((drugForm) => {
          if (drugForm.id == id) {
            name = drugForm.name;
          }
        });
        break;
      case "drugClassification":
        drugClassifications?.forEach((drugClassification) => {
          if (drugClassification.id == id) {
            name = drugClassification.name;
          }
        });
        break;
    }

    return name;
  }

  const [categoryIsLoading, setCategoryIsLoading] = useState<boolean>(false);
  const [drugFormIsLoading, setDrugFormIsLoading] = useState<boolean>(false);
  const [drugClassificationIsLoading, setDrugClassificationIsLoading] =
    useState<boolean>(false);

  useEffect(() => {
    setCategoryIsLoading(true);
    setDrugFormIsLoading(true);
    setDrugClassificationIsLoading(true);

    Promise.all([
      HandleGet<CategoryData[]>(
        import.meta.env.VITE_HTTP_BASE_URL + "/categories/"
      ),
      HandleGet<IDrugForm[]>(
        import.meta.env.VITE_HTTP_BASE_URL + "/drugs/forms"
      ),
      HandleGet<IDrugClassification[]>(
        import.meta.env.VITE_HTTP_BASE_URL + "/drugs/classifications"
      ),
    ])
      .then((data) => {
        const [categoriesData, drugFormData, drugClassificationData] = data;

        setCategories(categoriesData);

        const categoryNameList: string[] = [];
        categoriesData.forEach((category: CategoryData) => {
          categoryNameList.push(category.category_name);
        });
        setCategoryNames(categoryNameList);

        setDrugForms(drugFormData);

        const drugFormNameList: string[] = [];
        drugFormData.forEach((drugForm: IDrugForm) => {
          drugFormNameList.push(drugForm.name);
        });
        setDrugFormNames(drugFormNameList);

        setDrugClassifications(drugClassificationData);
        const drugClassificationNameList: string[] = [];
        drugClassificationData.forEach(
          (drugClassification: IDrugClassification) => {
            drugClassificationNameList.push(drugClassification.name);
          }
        );
        setDrugClassificationNames(drugClassificationNameList);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setCategoryIsLoading(false);
        setDrugFormIsLoading(false);
        setDrugClassificationIsLoading(false);
      });
  }, [setToast]);

  const [categories, setCategories] = useState<CategoryData[]>();
  const [categoryNames, setCategoryNames] = useState<string[]>([]);

  const [drugForms, setDrugForms] = useState<IDrugForm[]>();
  const [drugFormNames, setDrugFormNames] = useState<string[]>([]);

  const [drugClassifications, setDrugClassifications] =
    useState<IDrugClassification[]>();
  const [drugClassificationNames, setDrugClassificationNames] = useState<
    string[]
  >([]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];

    const fileName = file.name;
    const fileSize = file.size;

    let errorMsg = "";

    const fileFormat = fileName.split(".").pop();

    if (fileFormat && fileFormat != "png") {
      errorMsg = `File must be in png format`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    if (fileSize > 500000) {
      errorMsg = `File must not be greater than 500kB`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    setInputValues((prevVal) => ({
      ...prevVal,
      ["image"]: { value: URL.createObjectURL(file), error: "", file: file },
    }));
  }

  function handleSpecialNameChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string
  ) {
    let errorMsg = "";
    let subject = "";

    switch (key) {
      case "name":
        subject = "Name";
        break;
      case "manufacture":
        subject = "Manufacture Name";
        break;
      case "content":
        subject = "Content";
        break;
      case "description":
        subject = "Description";
        break;
      case "unitInPack":
        subject = "Unit In Pack";
        break;
    }

    if (!SpecialNameRegex.test(e.target.value)) {
      errorMsg = `${subject} is invalid`;
    }

    if (e.target.value == "") {
      errorMsg = `${subject} is required`;
    }

    setInputValues((prevVal) => ({
      ...prevVal,
      [key]: { value: e.target.value, error: errorMsg },
    }));
  }

  function handleSellingUnitChange(e: ChangeEvent<HTMLInputElement>) {
    let errorMsg = "";

    if (!AlphaNumericRegex.test(e.target.value)) {
      errorMsg = "Selling Unit is invalid";
    }

    if (e.target.value == "") {
      errorMsg = "Selling Unit is required";
    }

    setInputValues((prevVal) => ({
      ...prevVal,
      ["sellingUnit"]: { value: e.target.value, error: errorMsg },
    }));
  }

  function handleGenericNameChange(e: ChangeEvent<HTMLInputElement>) {
    let errorMsg = "";

    if (!NameRegex.test(e.target.value)) {
      errorMsg = "Generic Name is invalid";
    }

    if (e.target.value == "") {
      errorMsg = "Generic Name is required";
    }

    setInputValues((prevVal) => ({
      ...prevVal,
      ["genericName"]: { value: e.target.value, error: errorMsg },
    }));
  }

  function handleNumericChange(e: ChangeEvent<HTMLInputElement>, key: string) {
    let subject = "";

    switch (key) {
      case "weight":
        subject = "Weight";
        break;
      case "height":
        subject = "Height";
        break;
      case "length":
        subject = "Length";
        break;
      case "width":
        subject = "Width";
        break;
    }

    if (isNaN(+e.target.value)) {
      setInputValues((prevVal) => ({
        ...prevVal,
        [key]: {
          value: inputValues ? inputValues[key].value : "0",
          error: `${subject} must be a number`,
        },
      }));
      return;
    }

    if (e.target.value == "") {
      setInputValues((prevVal) => ({
        ...prevVal,
        [key]: {
          value: e.target.value,
          error: `${subject} is required`,
        },
      }));
      return;
    }

    setInputValues((prevVal) => ({
      ...prevVal,
      [key]: {
        value: e.target.value,
        error: "",
      },
    }));
  }

  function handleBooleanChange(e: ChangeEvent<HTMLInputElement>, key: string) {
    setInputValues((prevVal) => ({
      ...prevVal,
      [key]: { value: "", error: "", isTrue: e.target.checked },
    }));
  }

  function handleUpdateDrug() {
    const url =
      import.meta.env.VITE_HTTP_BASE_URL +
      `/admin/drugs/${inputValues["id"].value}`;
    setDrugFormIsLoading(true);
    const formData = new FormData();

    const data = {
      name: inputValues["name"].value,
      generic_name:
        inputValues["genericName"].value == ""
          ? "-"
          : inputValues["genericName"].value,
      content: inputValues["manufacture"].value,
      description: inputValues["description"].value,
      classification_id: inputValues["classificationId"].value,
      form_id: inputValues["formId"].value,
      manufacture: inputValues["manufacture"].value,
      category_id: inputValues["categoryId"].value,
      unit_in_pack: inputValues["unitInPack"].value,
      selling_unit: inputValues["sellingUnit"].value,
      weight: inputValues["weight"].value,
      height: inputValues["height"].value,
      length: inputValues["length"].value,
      width: inputValues["width"].value,
      is_active: inputValues["isActive"].isTrue,
      is_prescription_required: inputValues["isPrescriptionRequired"].isTrue,
    };

    const file = inputValues["image"].file;

    formData.append("data", JSON.stringify(data));

    if (file) {
      formData.append("file", file);
    }

    HandlePutFormData(formData, url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Update Success", 5);
        setDrugFormIsLoading(false);
        handleClose();
        refetch();
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  function handleAddDrug() {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/admin/drugs";
    setDrugFormIsLoading(true);
    const formData = new FormData();

    const data = {
      name: inputValues["name"].value,
      generic_name:
        inputValues["genericName"].value == ""
          ? "-"
          : inputValues["genericName"].value,
      content: inputValues["manufacture"].value,
      description: inputValues["description"].value,
      classification_id: inputValues["classificationId"].value,
      form_id: inputValues["formId"].value,
      category_id: inputValues["categoryId"].value,
      manufacture: inputValues["manufacture"].value,
      unit_in_pack: inputValues["unitInPack"].value,
      selling_unit: inputValues["sellingUnit"].value,
      weight: +inputValues["weight"].value,
      height: +inputValues["height"].value,
      length: +inputValues["length"].value,
      width: +inputValues["width"].value,
      is_active: inputValues["isActive"].isTrue,
      is_prescription_required: inputValues["isPrescriptionRequired"].isTrue,
    };

    const file = inputValues["image"].file;

    formData.append("data", JSON.stringify(data));
    formData.append("file", file ?? "");

    HandleAddFormData(formData, url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Add drug success", 5);
        handleClose();
        setDrugFormIsLoading(false);
        refetch();
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  function handleDeleteDrug() {
    HandleDelete(
      import.meta.env.VITE_HTTP_BASE_URL +
        `/admin/drugs/${inputValues["id"].value}`
    )
      .then(() => {
        HandleShowToast(setToast, true, "Drug delete success", 5);
        handleClose();
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  const [showCancelConfirmation, setShowCancelConfirmation] =
    useState<boolean>(false);

  return (
    <div className="absolute z-40 top-0 left-0 h-[100vh] w-[100vw]">
      <div className="w-full h-full bg-black bg-opacity-[0.6]"></div>

      {showDeleteConfirmation && (
        <>
          <div className="w-[80%] h-[92%] absolute z-[50] top-[50%] left-[50%] translate-x-[-50%] rounded-xl translate-y-[-50%] bg-white opacity-[0.75]"></div>
          <div className="w-[20%] h-[18%] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-[#DFF1FD] p-[30px]">
            <p className="text-[18px] text-center font-[600]">
              Are you sure want to delete this drug?
            </p>
            <div className="flex w-full justify-between">
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#FF0000]"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                No
              </button>
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#1F5FFF]"
                onClick={() => handleDeleteDrug()}
              >
                Yes
              </button>
            </div>
          </div>
        </>
      )}

      {showCancelConfirmation && (
        <>
          <div className="w-[80%] h-[92%] absolute z-[50] top-[50%] left-[50%] translate-x-[-50%] rounded-xl translate-y-[-50%] bg-white opacity-[0.75]"></div>
          <div className="w-[20%] h-[18%] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-[#DFF1FD] p-[30px]">
            <p className="text-[18px] text-center font-[600]">
              Are you sure want to cancel? All changes will be discarded.
            </p>
            <div className="flex w-full justify-between">
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#FF0000]"
                onClick={() => setShowCancelConfirmation(false)}
              >
                No
              </button>
              <button
                className="px-[20px] py-[3px] rounded-[8px] font-[600] text-white bg-[#1F5FFF]"
                onClick={() => handleClose()}
              >
                Yes
              </button>
            </div>
          </div>
        </>
      )}

      <div className="w-[80%] absolute z-40 h-[92%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl opacity-100 top-[50%] left-[50%] bg-opacity-100">
        <div className="w-full relative p-[20px] rounded-xl h-full justify-center flex flex-col gap-[20px]">
          <h1 className="text-[28px] font-[600]">
            {purpose == "update" ? "Edit" : purpose == "add" ? "New" : ""} Drug
          </h1>

          <div className="flex flex-col">
            <div className="flex h-full items-center justify-between">
              <div className="flex w-[30%] items-center flex-col justify-between h-full">
                <div className="relative h-fit shadow-[0px_0px_15px_0px_rgba(0,0,0,0.3)] w-fit p-[5px] rounded-xl">
                  <img
                    alt=""
                    src={inputValues["image"]?.value.toString()}
                    className="w-[400px] h-[400px] object-cover rounded-xl"
                  ></img>
                  <input
                    type="file"
                    id="drug-picture-input"
                    className="hidden"
                    onChange={(e) => handleFileChange(e)}
                  ></input>
                  <label
                    htmlFor="drug-picture-input"
                    className="bg-[#DFF1FD] cursor-pointer flex items-center justify-center absolute rounded-[100%] top-[370px] left-[370px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconContext.Provider
                      value={{ size: "30px", color: "black" }}
                    >
                      <CgArrowsExchange></CgArrowsExchange>
                    </IconContext.Provider>
                  </label>
                </div>

                <div className="flex flex-col gap-[10px] w-full">
                  <div className="flex gap-[5px] items-center justify-between">
                    <div className="flex flex-col justify-between items-start h-[55px]">
                      <h1 className="text-[20px] font-[600]">Weight</h1>
                      <p className="font-[600] text-[#E01A52]">
                        {inputValues["weight"].error}
                      </p>
                    </div>

                    <div className="flex gap-[19px] items-center">
                      <input
                        className="h-fit text-[20px] text-center px-[10px] w-[150px] py-[5px] rounded-xl border-2 border-slate-600"
                        type="text"
                        value={inputValues["weight"].value}
                        onChange={(e) => handleNumericChange(e, "weight")}
                      ></input>
                      <p className="text-[20px]">gram</p>
                    </div>
                  </div>

                  <div className="flex gap-[5px] items-center justify-between">
                    <div className="flex flex-col justify-between items-start h-[55px]">
                      <h1 className="text-[20px] font-[600]">Height</h1>
                      <p className="font-[600] text-[#E01A52]">
                        {inputValues["height"].error}
                      </p>
                    </div>

                    <div className="flex gap-[12px] items-center">
                      <input
                        className="h-fit text-[20px] text-center px-[10px] w-[150px] py-[5px] rounded-xl border-2 border-slate-600"
                        type="text"
                        value={inputValues["height"].value}
                        onChange={(e) => handleNumericChange(e, "height")}
                      ></input>
                      <p className="text-[20px]">meter</p>
                    </div>
                  </div>

                  <div className="flex gap-[5px] items-center justify-between">
                    <div className="flex flex-col justify-between items-start h-[55px]">
                      <h1 className="text-[20px] font-[600]">Length</h1>
                      <p className="font-[600] text-[#E01A52]">
                        {inputValues["length"].error}
                      </p>
                    </div>

                    <div className="flex gap-[12px] items-center">
                      <input
                        className="h-fit text-[20px] text-center px-[10px] w-[150px] py-[5px] rounded-xl border-2 border-slate-600"
                        type="text"
                        value={inputValues["length"].value}
                        onChange={(e) => handleNumericChange(e, "length")}
                      ></input>
                      <p className="text-[20px]">meter</p>
                    </div>
                  </div>

                  <div className="flex gap-[5px] items-center justify-between">
                    <div className="flex flex-col justify-between items-start h-[55px]">
                      <h1 className="text-[20px] font-[600]">Width</h1>
                      <p className="font-[600] text-[#E01A52]">
                        {inputValues["width"].error}
                      </p>
                    </div>

                    <div className="flex gap-[12px] items-center">
                      <input
                        className="h-fit text-[20px] text-center px-[10px] w-[150px] py-[5px] rounded-xl border-2 border-slate-600"
                        type="text"
                        value={inputValues["width"].value}
                        onChange={(e) => handleNumericChange(e, "width")}
                      ></input>
                      <p className="text-[20px]">meter</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-[68%] gap-[10px]">
                <div className="flex flex-col gap-[5px]">
                  <div className="flex justify-between items-center">
                    <h1 className="text-[20px] font-[600]">Name</h1>
                    <p className="font-[600] text-[#E01A52]">
                      {inputValues["name"].error}
                    </p>
                  </div>
                  <input
                    className="h-fit text-[20px] px-[10px] py-[5px] rounded-xl border-2 border-slate-600"
                    type="text"
                    onChange={(e) => handleSpecialNameChange(e, "name")}
                    value={inputValues["name"].value.toString()}
                  ></input>
                </div>

                <div className="flex justify-between w-[100%]">
                  <div className="flex flex-col gap-[5px] w-[49%]">
                    <div className="flex justify-between items-center">
                      <h1 className="text-[20px] font-[600]">Generic Name</h1>
                      <p className="font-[600] text-[#E01A52]">
                        {inputValues["genericName"].error}
                      </p>
                    </div>
                    <input
                      className="h-fit text-[20px] px-[10px] py-[5px] rounded-xl border-2 border-slate-600"
                      type="text"
                      value={inputValues["genericName"].value.toString()}
                      onChange={(e) => handleGenericNameChange(e)}
                    ></input>
                  </div>

                  <div className="flex flex-col gap-[5px] w-[49%]">
                    <div className="flex justify-between items-center">
                      <h1 className="text-[20px] font-[600]">Manufacture</h1>
                      <p className="font-[600] text-[#E01A52]">
                        {inputValues["manufacture"].error}
                      </p>
                    </div>
                    <input
                      className="h-fit text-[20px] px-[10px] py-[5px] rounded-xl border-2 border-slate-600"
                      type="text"
                      value={inputValues["manufacture"].value.toString()}
                      onChange={(e) =>
                        handleSpecialNameChange(e, "manufacture")
                      }
                    ></input>
                  </div>
                </div>
                <div className="flex flex-col gap-[5px]">
                  <div className="flex justify-between items-center">
                    <h1 className="text-[20px] font-[600]">Content</h1>
                    <p className="font-[600] text-[#E01A52]">
                      {inputValues["content"].error}
                    </p>
                  </div>
                  <textarea
                    className="h-fit text-[20px] px-[10px] py-[5px] rounded-xl border-2 border-slate-600 break-all"
                    value={inputValues["content"].value.toString()}
                    onChange={(e) => handleSpecialNameChange(e, "content")}
                  ></textarea>
                </div>
                <div className="flex flex-col gap-[5px]">
                  <div className="flex justify-between items-center">
                    <h1 className="text-[20px] font-[600]">Description</h1>
                    <p className="font-[600] text-[#E01A52]">
                      {inputValues["description"].error}
                    </p>
                  </div>
                  <textarea
                    className="h-fit text-[20px] px-[10px] py-[5px] rounded-xl border-2 border-slate-600 break-all"
                    rows={5}
                    value={inputValues["description"].value.toString()}
                    onChange={(e) => handleSpecialNameChange(e, "description")}
                  ></textarea>
                </div>
                <div className="flex justify-between w-[100%]">
                  <div className="flex flex-col gap-[5px] w-[49%]">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-[5px] items-end">
                        <h1 className="text-[20px] font-[600]">Selling Unit</h1>
                        <p className="text-[16px] font-[500]">
                          e.g., per Strip
                        </p>
                      </div>
                      <p className="font-[600] text-[#E01A52]">
                        {inputValues["sellingUnit"].error}
                      </p>
                    </div>
                    <input
                      className="h-fit text-[20px] px-[10px] py-[5px] rounded-xl border-2 border-slate-600"
                      type="text"
                      value={inputValues["sellingUnit"].value}
                      onChange={(e) => handleSellingUnitChange(e)}
                    ></input>
                  </div>

                  <div className="flex flex-col gap-[5px] w-[49%]">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-[5px] items-end">
                        <h1 className="text-[20px] font-[600]">Unit in Pack</h1>
                        <p className="text-[16px] font-[500]">
                          e.g., 1 strip @ 10 tablet
                        </p>
                      </div>
                      <p className="font-[600] text-[#E01A52]">
                        {inputValues["unitInPack"].error}
                      </p>
                    </div>
                    <input
                      className="h-fit text-[20px] px-[10px] py-[5px] rounded-xl border-2 border-slate-600"
                      type="text"
                      value={inputValues["unitInPack"].value.toString()}
                      onChange={(e) => handleSpecialNameChange(e, "unitInPack")}
                    ></input>
                  </div>
                </div>
                <div className="flex w-[100%] justify-between">
                  <div className="flex flex-col gap-[5px] w-[20%]">
                    <h1 className="text-[20px] font-[600]">Form</h1>
                    {drugFormIsLoading ? (
                      <div className="h-[40px] top-[35px] rounded-[8px] w-full bg-gray-400 animate-pulse">
                        <svg
                          aria-hidden="true"
                          className="absolute top-[50%] left-[50%] z-20 w-14 h-14 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 "
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
                      </div>
                    ) : (
                      <ItemSelector
                        items={drugFormNames}
                        value={getNameById(
                          +inputValues["formId"].value,
                          "drugForm"
                        )}
                        setValue={(value) =>
                          setInputValues((prevVal) => ({
                            ...prevVal,
                            ["formId"]: {
                              value: getIdByName(value, "drugForm"),
                              error: "",
                            },
                          }))
                        }
                        placeholder=""
                        expandTop={true}
                        height="40px"
                        textStyle="text-[20px]"
                      ></ItemSelector>
                    )}
                  </div>

                  <div className="flex flex-col gap-[5px] w-[30%]">
                    <h1 className="text-[20px] font-[600]">Classification</h1>
                    {drugClassificationIsLoading ? (
                      <div className="h-[40px] top-[35px] rounded-[8px] w-full bg-gray-400 animate-pulse">
                        <svg
                          aria-hidden="true"
                          className="absolute top-[50%] left-[50%] z-20 w-14 h-14 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 "
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
                      </div>
                    ) : (
                      <ItemSelector
                        items={drugClassificationNames}
                        value={getNameById(
                          +inputValues["classificationId"].value,
                          "drugClassification"
                        )}
                        setValue={(value) =>
                          setInputValues((prevVal) => ({
                            ...prevVal,
                            ["classificationId"]: {
                              value: getIdByName(value, "drugClassification"),
                              error: "",
                            },
                          }))
                        }
                        placeholder=""
                        height="40px"
                        optionsAdditionalClassname="top-[45px]"
                        textStyle="text-[20px]"
                      ></ItemSelector>
                    )}
                  </div>

                  <div className="flex flex-col gap-[5px] w-[47%]">
                    <h1 className="text-[20px] font-[600]">Category</h1>
                    {categoryIsLoading ? (
                      <div className="h-[40px] top-[35px] rounded-[8px] w-full bg-gray-400 animate-pulse"></div>
                    ) : (
                      <ItemSelector
                        items={categoryNames}
                        value={getNameById(
                          +inputValues["categoryId"].value,
                          "category"
                        )}
                        setValue={(value) =>
                          setInputValues((prevVal) => ({
                            ...prevVal,
                            ["categoryId"]: {
                              value: getIdByName(value, "category"),
                              error: "",
                            },
                          }))
                        }
                        placeholder=""
                        expandTop={true}
                        height="40px"
                        textStyle="text-[20px]"
                      ></ItemSelector>
                    )}
                  </div>
                </div>

                <div className="flex">
                  <div className="flex flex-col gap-[5px] w-[50%] items-center">
                    <h1 className="text-[20px] font-[600]">Active</h1>
                    <div className="relative flex">
                      <input
                        className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-[#1a71ff] checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                        type="checkbox"
                        role="switch"
                        id="isActiveToggleSwitch"
                        onChange={(e) => handleBooleanChange(e, "isActive")}
                        checked={inputValues["isActive"].isTrue}
                      />

                      <label
                        className="inline-block pl-[0.15rem] hover:cursor-pointer"
                        htmlFor="isActiveToggleSwitch"
                      ></label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[5px] w-[50%] items-center">
                    <h1 className="text-[20px] font-[600]">
                      Required Prescription
                    </h1>
                    <div className="relative flex">
                      <input
                        className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-[#1a71ff] checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                        type="checkbox"
                        role="switch"
                        onChange={(e) =>
                          handleBooleanChange(e, "isPrescriptionRequired")
                        }
                        id="isActiveToggleSwitch"
                        checked={inputValues["isPrescriptionRequired"].isTrue}
                      />

                      <label
                        className="inline-block pl-[0.15rem] hover:cursor-pointer"
                        htmlFor="isActiveToggleSwitch"
                      ></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-[10px]">
            {purpose == "update" && (
              <button
                onClick={() => handleUpdateDrug()}
                className="px-[15px] py-[5px] rounded-[8px] text-[16px] font-[600] bg-[#1F5FFF] text-white"
              >
                SAVE
              </button>
            )}

            {purpose == "add" && (
              <button
                onClick={() => handleAddDrug()}
                className="px-[15px] py-[5px] rounded-[8px] text-[16px] font-[600] bg-[#1F5FFF] text-white"
              >
                ADD
              </button>
            )}

            <button
              onClick={() => setShowCancelConfirmation(true)}
              className="px-[15px] py-[5px] rounded-[8px] text-[16px] font-[600] bg-slate-600 text-white"
            >
              CANCEL
            </button>
            {purpose == "update" && (
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="px-[15px] py-[5px] rounded-[8px] text-[16px] font-[600] bg-[#E01A52] text-white"
              >
                DELETE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDrugForm;
