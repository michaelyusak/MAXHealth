import React, { useContext, useState } from "react";
import * as image from "../assets/img";
import { IoIosArrowDropdown, IoIosArrowDropup } from "react-icons/io";
import { IconContext } from "react-icons";
import { pharmacyData } from "../interfaces/pharmacyManagers";
import { HandleGeocodeSearch, HandlePutRaw } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import {
  GeocodeReverseResponseToAddressRequest,
  IAddressRequest,
  INominatimOpenStreetMapResponse,
} from "../interfaces/Address";
import { FaSearch } from "react-icons/fa";

type modalProps = {
  onClose: () => void;
  dataPharmacy: pharmacyData | undefined;
  onFetch: () => void;
};

interface OperationalHours {
  checked: boolean;
  startTime: string;
  endTime: string;
}

interface Courier {
  checked: boolean;
  id: number;
  courier: string;
}

interface operationalRequest {
  operational_day: string;
  open_hour: string;
  close_hour: string;
  is_open: boolean;
}

interface courierRequest {
  courier_id: number;
  is_active: boolean;
}

const ModalEditPharmacy = ({
  onClose,
  dataPharmacy,
  onFetch,
}: modalProps): React.ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToast } = useContext(ToastContext);
  const [openMenu, setOpenMenu] = useState({
    operational: false,
    courier: false,
  });
  const [operationalHours, setOperationalHours] = useState<{
    [key: string]: OperationalHours;
  }>({
    monday: { checked: false, startTime: "09:00", endTime: "18:00" },
    tuesday: { checked: false, startTime: "09:00", endTime: "18:00" },
    wednesday: { checked: false, startTime: "09:00", endTime: "18:00" },
    thursday: { checked: false, startTime: "09:00", endTime: "18:00" },
    friday: { checked: false, startTime: "09:00", endTime: "18:00" },
    saturday: { checked: false, startTime: "09:00", endTime: "18:00" },
    sunday: { checked: false, startTime: "09:00", endTime: "18:00" },
  });
  const [input, setInput] = useState({
    pharmacy_id: dataPharmacy?.id ?? 0,
    manager_id: dataPharmacy?.manager_id ?? 0,
    pharmacy_name: dataPharmacy?.pharmacy_name ?? "",
    pharmacist_name: dataPharmacy?.pharmacist_name ?? "",
    pharmacist_license_number: dataPharmacy?.pharamcist_license_name ?? "",
    pharmacist_phone_number: dataPharmacy?.pharmacist_phone_number ?? "",
    city: dataPharmacy?.city ?? "",
    address: dataPharmacy?.address ?? "",
    latitude: dataPharmacy?.latitude ?? "",
    longitude: dataPharmacy?.longitude ?? "",
  });
  const [didEdit, setDidEdit] = useState({
    pharmacy_id: false,
    manager_id: false,
    pharmacy_nasetAddressOptionsme: false,
    pharmacist_name: false,
    pharmacist_license_number: false,
    pharmacist_phone_number: false,
    city: false,
    address: false,
  });
  const [showAddressOptions, setShowAddressOptions] = useState<boolean>(false);
  const [addressOptions, setAddressOptions] = useState<IAddressRequest[]>([]);

  const initialCouriers: Courier[] = [
    { checked: false, id: 1, courier: "Official Instant" },
    { checked: false, id: 2, courier: "Official Same day" },
    { checked: false, id: 3, courier: "Jnt" },
    { checked: false, id: 4, courier: "Pos Indonesia" },
  ];

  const [selectedCouriers, setSelectedCouriers] =
    useState<Courier[]>(initialCouriers);

  const handleCourierCheckboxChange =
    (id: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const updatedCouriers = selectedCouriers.map((courier) =>
        courier.id === id
          ? { ...courier, checked: event.target.checked }
          : courier
      );
      setSelectedCouriers(updatedCouriers);
    };

  const handleCheckboxChange =
    (day: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setOperationalHours({
        ...operationalHours,
        [day]: { ...operationalHours[day], checked: event.target.checked },
      });
    };

  const handleTimeChange =
    (day: string, type: "startTime" | "endTime") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setOperationalHours({
        ...operationalHours,
        [day]: { ...operationalHours[day], [type]: event.target.value },
      });
    };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setDidEdit({ ...didEdit, [name]: true });

    if (input) {
      setInput({ ...input, [name]: value });
    }
  };

  function handleInputBlur(event: React.ChangeEvent<HTMLInputElement>) {
    const { name } = event.target;
    setDidEdit((prevEdit) => ({
      ...prevEdit,
      [name]: true,
    }));
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const url =
      import.meta.env.VITE_DEPLOYMENT_URL + `/pharmacies/${dataPharmacy?.id}`;

    const operationalData: operationalRequest[] = Object.entries(
      operationalHours
    ).map(([day, hours]) => ({
      operational_day: day,
      open_hour: hours.startTime,
      close_hour: hours.endTime,
      is_open: hours.checked,
    }));

    const couriersData: courierRequest[] = selectedCouriers.map((courier) => ({
      courier_id: courier.id,
      is_active: courier.checked,
    }));

    const body = {
      pharmacy_name: input.pharmacy_name,
      pharmacist_name: input.pharmacist_name,
      pharmacist_license_number: input.pharmacist_license_number,
      pharmacist_phone_number: input.pharmacist_phone_number,
      city: input.city,
      address: input.address,
      latitude: input.latitude.toString(),
      longitude: input.longitude.toString(),
      operationals: operationalData,
      couriers: couriersData,
    };

    setIsLoading(true);
    HandlePutRaw(JSON.stringify(body), url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Edit pharmacy success", 5);
        handleClose();
        onFetch();
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleClose = () => {
    setInput({
      pharmacy_id: 0,
      manager_id: 0,
      pharmacy_name: "",
      pharmacist_name: "",
      pharmacist_license_number: "",
      pharmacist_phone_number: "",
      city: "",
      address: "",
      latitude: "",
      longitude: "",
    });
    onClose();
  };

  const handleOpenMenu = (type: string) => {
    if (type == "operational") {
      setOpenMenu({
        ...openMenu,
        operational: !openMenu.operational,
      });
    } else {
      setOpenMenu({
        ...openMenu,
        courier: !openMenu.courier,
      });
    }
  };

  function handleSearchAddress(
    callback: (data: INominatimOpenStreetMapResponse[]) => void
  ) {
    if (input.address && input.city) {
      HandleGeocodeSearch(input.address)
        .then((data) => {
          callback(data);
        })
        .catch((error: Error) => {
          HandleShowToast(setToast, false, error.message, 5);
        });
    }
  }

  {
    isLoading && <p>Loading.... </p>;
  }
  return (
    <>
      <div
        onKeyDown={() => {}}
        onClick={() => onClose()}
        role="button"
        tabIndex={0}
        className="cursor-default w-[100vw] h-[100vh] fixed top-0 left-0 z-[150] rounded-xl bg-white opacity-65"
      ></div>
      <div className="w-[80vw] h-[auto] fixed z-[150] top-[0] left-[10%] items-center flex flex-row rounded-xl bg-[#f1f5f6] py-[0]">
        <div className="h-[100vh] w-[40%] bg-[#bcc0c0] flex items-center rounded-l-xl">
          <img
            src={image.addPharmacy}
            className="object-cover h-[80vh] w-[100%]"
          />
        </div>
        <div className=" w-[60%] py-[10px] h-[90vh] overflow-auto">
          <form className="flex flex-col gap-1 px-3" onSubmit={handleSubmit}>
            <h2 className="text-[20px] font-bold text-center">
              Create Your Pharmacy
            </h2>
            <div className="flex -flex-row justify-between gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="name" className="text-[18px] font-semibold">
                  Pharmacy Name
                </label>
                <input
                  className="border-2 p-3 rounded-lg bg-[#ffffff] text-[#5c5c5c] placeholder:text-[#5c5c5c]"
                  value={input.pharmacy_name}
                  placeholder="name"
                  type="text"
                  name="pharmacy_name"
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
                <div className="text-red-400">
                  {/* {nameIsInvalid && <p>Please Enter Your Valid Name !</p>} */}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="file" className="text-[18px] font-semibold">
                  City
                </label>
                <input
                  value={input.city}
                  className="border-2 p-3 rounded-lg bg-[#ffffff] text-[#5c5c5c] placeholder:text-[#5c5c5c]"
                  placeholder="Enter your file"
                  type="text"
                  name="city"
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 relative">
              <label htmlFor="email" className="text-[18px] font-semibold">
                Address
              </label>
              <input
                className="border-2 p-3 rounded-lg bg-[#ffffff] text-[#5c5c5c] placeholder:text-[#5c5c5c] pr-[60px]"
                value={input.address}
                placeholder="Address"
                type="text"
                name="address"
                onChange={handleInputChange}
                onBlur={handleInputBlur}
              />
              <div className="absolute flex flex-col divide-y top-[80px] w-full bg-[#f6f7fb] border-[1px] border-[#D8DDE1] rounded-[8px] px-[1rem] max-h-[300px] overflow-y-auto">
                {showAddressOptions &&
                  (addressOptions.length > 0 ? (
                    addressOptions.map((opt, i) => (
                      <div
                        key={i}
                        className="py-[1rem] cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          setInput((prevVal) => ({
                            ...prevVal,
                            address: opt.address ? opt.address : "",
                            city: opt.city ? opt.city : "",
                            latitude: opt.latitude ? opt.latitude : "",
                            longitude: opt.longitude ? opt.longitude : "",
                          }));
                          setAddressOptions([]);
                          setShowAddressOptions(false);
                        }}
                      >
                        {opt.address}
                      </div>
                    ))
                  ) : (
                    <div className="py-[1rem]">Address not found</div>
                  ))}
              </div>
              <button
                className="absolute right-[10px] top-[40px] p-2  text-[20px]"
                onClick={(e) => {
                  e.preventDefault();
                  handleSearchAddress((data) => {
                    const res: IAddressRequest[] = [];
                    for (let index = 0; index < data.length; index++) {
                      const item = data[index];
                      res.push(GeocodeReverseResponseToAddressRequest(item));
                    }
                    setAddressOptions(res);
                    setShowAddressOptions(true);
                  });
                }}
              >
                <FaSearch />
              </button>
              <div className="text-red-400">
                {/* {emailIsInvalid && <p>Invalid Email Format !</p>} */}
              </div>
            </div>
            <div className="flex flex-row justify-between gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="name" className="text-[18px] font-semibold">
                  Pharmacist Name
                </label>
                <input
                  className="border-2 p-3 rounded-lg bg-[#ffffff] text-[#5c5c5c] placeholder:text-[#5c5c5c]"
                  value={input.pharmacist_name}
                  placeholder="Pharmacist name"
                  type="text"
                  name="pharmacist_name"
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="name" className="text-[18px] font-semibold">
                  Pharmacist License Number
                </label>
                <input
                  className="border-2 p-3 rounded-lg bg-[#ffffff] text-[#5c5c5c] placeholder:text-[#5c5c5c]"
                  value={input.pharmacist_license_number}
                  placeholder="Pharmacist license number"
                  type="text"
                  name="pharmacist_license_number"
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="pharmacist_phone_number"
                className="text-[18px] font-semibold"
              >
                Pharmacist Phone Number
              </label>
              <input
                className="border-2 p-3 rounded-lg bg-[#ffffff] text-[#5c5c5c] placeholder:text-[#5c5c5c]"
                value={input.pharmacist_phone_number}
                placeholder="Pharmacist phone number"
                type="text"
                name="pharmacist_phone_number"
                onChange={handleInputChange}
                onBlur={handleInputBlur}
              />
            </div>
            <div className="flex flex-row pt-2 pb-1 gap-1 justify-between border-b-2 items-center">
              <label
                htmlFor="operational"
                className="text-[18px] font-semibold"
              >
                Operational
              </label>
              <button
                onClick={() => handleOpenMenu("operational")}
                type="button"
              >
                <IconContext.Provider value={{ size: "30px" }}>
                  {openMenu.operational ? (
                    <IoIosArrowDropup />
                  ) : (
                    <IoIosArrowDropdown />
                  )}
                </IconContext.Provider>
              </button>
            </div>
            {openMenu.operational && (
              <div className="flex flex-col">
                <div className="flex-row flex items-center gap-1 text-gray-500 text-[16px]">
                  <div className="flex flex-row gap-1 w-[13vw]">
                    <input
                      checked={operationalHours.monday.checked}
                      onChange={handleCheckboxChange("monday")}
                      type="checkbox"
                      id="monday"
                      className="h-[20px] w-[20px] rounded-md border border-gray-300 hover:border-gray-400 transition-all duration-150"
                    />
                    <label htmlFor="monday" className="cursor-pointer">
                      Monday
                    </label>
                  </div>
                  <h2>Operational Hour :</h2>
                  <div className="flex flex-row items-center ">
                    <label
                      htmlFor="start-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Start time:
                    </label>
                    <input
                      value={operationalHours.monday.startTime}
                      onChange={handleTimeChange("monday", "startTime")}
                      type="time"
                      id="start-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                  <div className="flex">
                    <label
                      htmlFor="end-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      End time:
                    </label>
                    <input
                      value={operationalHours.monday.endTime}
                      onChange={handleTimeChange("monday", "endTime")}
                      type="time"
                      id="end-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                </div>
                <div className="flex-row flex items-center gap-1 text-gray-500 text-[16px]">
                  <div className="flex flex-row gap-1 w-[13vw]">
                    <input
                      checked={operationalHours.tuesday.checked}
                      onChange={handleCheckboxChange("tuesday")}
                      type="checkbox"
                      id="tuesday"
                      className="h-[20px] w-[20px] rounded-md border border-gray-300 hover:border-gray-400 transition-all duration-150"
                    />
                    <label htmlFor="tuesday" className="cursor-pointer">
                      Selasa
                    </label>
                  </div>
                  <h2>Operational Hour :</h2>
                  <div className="flex flex-row items-center ">
                    <label
                      htmlFor="start-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Start time:
                    </label>
                    <input
                      value={operationalHours.tuesday.startTime}
                      onChange={handleTimeChange("tuesday", "startTime")}
                      type="time"
                      id="start-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                  <div className="flex">
                    <label
                      htmlFor="end-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      End time:
                    </label>
                    <input
                      value={operationalHours.tuesday.endTime}
                      onChange={handleTimeChange("tuesday", "endTime")}
                      type="time"
                      id="end-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                </div>
                <div className="flex-row flex items-center gap-1 text-gray-500 text-[16px]">
                  <div className="flex flex-row gap-1 w-[13vw]">
                    <input
                      checked={operationalHours.wednesday.checked}
                      onChange={handleCheckboxChange("wednesday")}
                      type="checkbox"
                      id="wednesday"
                      className="h-[20px] w-[20px] rounded-md border border-gray-300 hover:border-gray-400 transition-all duration-150"
                    />
                    <label htmlFor="wednesday" className="cursor-pointer">
                      Rabu
                    </label>
                  </div>
                  <h2>Operational Hour :</h2>
                  <div className="flex flex-row items-center ">
                    <label
                      htmlFor="start-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Start time:
                    </label>
                    <input
                      value={operationalHours.wednesday.startTime}
                      onChange={handleTimeChange("wednesday", "startTime")}
                      type="time"
                      id="start-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                  <div className="flex">
                    <label
                      htmlFor="end-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      End time:
                    </label>
                    <input
                      value={operationalHours.wednesday.endTime}
                      onChange={handleTimeChange("wednesday", "endTime")}
                      type="time"
                      id="end-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                </div>
                <div className="flex-row flex items-center gap-1 text-gray-500 text-[16px]">
                  <div className="flex flex-row gap-1 w-[13vw]">
                    <input
                      checked={operationalHours.thursday.checked}
                      onChange={handleCheckboxChange("thursday")}
                      type="checkbox"
                      id="thursday"
                      className="h-[20px] w-[20px] rounded-md border border-gray-300 hover:border-gray-400 transition-all duration-150"
                    />
                    <label htmlFor="thursday" className="cursor-pointer">
                      Kamis
                    </label>
                  </div>
                  <h2>Operational Hour :</h2>
                  <div className="flex flex-row items-center ">
                    <label
                      htmlFor="start-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Start time:
                    </label>
                    <input
                      value={operationalHours.thursday.startTime}
                      onChange={handleTimeChange("thursday", "startTime")}
                      type="time"
                      id="start-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                  <div className="flex">
                    <label
                      htmlFor="end-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      End time:
                    </label>
                    <input
                      value={operationalHours.thursday.endTime}
                      onChange={handleTimeChange("thursday", "endTime")}
                      type="time"
                      id="end-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                </div>
                <div className="flex-row flex items-center gap-1 text-gray-500 text-[16px]">
                  <div className="flex flex-row gap-1 w-[13vw]">
                    <input
                      checked={operationalHours.friday.checked}
                      onChange={handleCheckboxChange("friday")}
                      type="checkbox"
                      id="friday"
                      className="h-[20px] w-[20px] rounded-md border border-gray-300 hover:border-gray-400 transition-all duration-150"
                    />
                    <label htmlFor="friday" className="cursor-pointer">
                      Jumat
                    </label>
                  </div>
                  <h2>Operational Hour :</h2>
                  <div className="flex flex-row items-center ">
                    <label
                      htmlFor="start-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Start time:
                    </label>
                    <input
                      value={operationalHours.friday.startTime}
                      onChange={handleTimeChange("friday", "startTime")}
                      type="time"
                      id="start-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                  <div className="flex">
                    <label
                      htmlFor="end-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      End time:
                    </label>
                    <input
                      value={operationalHours.friday.endTime}
                      onChange={handleTimeChange("friday", "endTime")}
                      type="time"
                      id="end-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                </div>
                <div className="flex-row flex items-center gap-1 text-gray-500 text-[16px]">
                  <div className="flex flex-row gap-1 w-[13vw]">
                    <input
                      checked={operationalHours.saturday.checked}
                      onChange={handleCheckboxChange("saturday")}
                      type="checkbox"
                      id="saturday"
                      className="h-[20px] w-[20px] rounded-md border border-gray-300 hover:border-gray-400 transition-all duration-150"
                    />
                    <label htmlFor="saturday" className="cursor-pointer">
                      Sabtu
                    </label>
                  </div>
                  <h2>Operational Hour :</h2>
                  <div className="flex flex-row items-center ">
                    <label
                      htmlFor="start-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Start time:
                    </label>
                    <input
                      value={operationalHours.saturday.startTime}
                      onChange={handleTimeChange("saturday", "startTime")}
                      type="time"
                      id="start-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                  <div className="flex">
                    <label
                      htmlFor="end-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      End time:
                    </label>
                    <input
                      value={operationalHours.saturday.endTime}
                      onChange={handleTimeChange("saturday", "endTime")}
                      type="time"
                      id="end-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                </div>
                <div className="flex-row flex items-center gap-1 text-gray-500 text-[16px]">
                  <div className="flex flex-row gap-1 w-[13vw]">
                    <input
                      checked={operationalHours.sunday.checked}
                      onChange={handleCheckboxChange("sunday")}
                      type="checkbox"
                      id="sunday"
                      className="h-[20px] w-[20px] rounded-md border border-gray-300 hover:border-gray-400 transition-all duration-150"
                    />
                    <label htmlFor="sunday" className="cursor-pointer">
                      Minggu
                    </label>
                  </div>
                  <h2>Operational Hour :</h2>
                  <div className="flex flex-row items-center ">
                    <label
                      htmlFor="start-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Start time:
                    </label>
                    <input
                      value={operationalHours.sunday.startTime}
                      onChange={handleTimeChange("sunday", "startTime")}
                      type="time"
                      id="start-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                  <div className="flex">
                    <label
                      htmlFor="end-time"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      End time:
                    </label>
                    <input
                      value={operationalHours.sunday.endTime}
                      onChange={handleTimeChange("sunday", "endTime")}
                      type="time"
                      id="end-time"
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="09:00"
                      max="18:00"
                      defaultValue="00:00"
                      required={true}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-row pt-2 pb-1 gap-1 justify-between border-b-2 items-center">
              <label htmlFor="name" className="text-[18px] font-semibold">
                Shipping Method
              </label>
              <button onClick={() => handleOpenMenu("courier")} type="button">
                <IconContext.Provider value={{ size: "30px" }}>
                  {openMenu.courier ? (
                    <IoIosArrowDropup />
                  ) : (
                    <IoIosArrowDropdown />
                  )}
                </IconContext.Provider>
              </button>
            </div>
            {openMenu.courier && (
              <div className="flex flex-col">
                {selectedCouriers.map((courier) => (
                  <div
                    key={courier.id}
                    className="flex flex-row gap-1 w-[13vw]"
                  >
                    <input
                      type="checkbox"
                      id={`courier-${courier.id}`}
                      checked={courier.checked || false}
                      onChange={handleCourierCheckboxChange(courier.id)}
                      className="h-[20px] w-[20px] rounded-md border border-gray-300 hover:border-gray-400 transition-all duration-150"
                    />
                    <label
                      htmlFor={`courier-${courier.id}`}
                      className="cursor-pointer"
                    >
                      {courier.courier}
                    </label>
                  </div>
                ))}
              </div>
            )}
            <div className="text-red-200">
              {/* {fileIsInvalid && <p>Please Enter Valid File</p>} */}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                className={`text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-non `}
                type="submit"
                // disabled={!isValidForm}
              >
                Submit
              </button>
              <button
                className="text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-non bg-red-500 hover:bg-red-800"
                type="button"
                onClick={() => onClose()}
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

export default ModalEditPharmacy;
