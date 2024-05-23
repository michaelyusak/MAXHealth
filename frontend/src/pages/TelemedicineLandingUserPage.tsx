import React, { useCallback, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import ItemSelector from "../components/ItemSelector";
import { DoctorData, DoctorSpecialization } from "../interfaces/Doctor";
import { HandleAddRaw, HandleGet } from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { CurrencyFormatter } from "../util/CurrencyFormatter";
import {
  IoArrowForwardOutline,
  IoChatboxEllipsesOutline,
} from "react-icons/io5";
import PaginationInfo from "../components/PaginationInfo";
import { useNavigate } from "react-router-dom";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import TelemedicineLandingUserPageLoading from "../components/TelemedicineLandingUserPageLoading";

const TelemedicineLandingUserPage = (): React.ReactElement => {
  const navigate = useNavigate();

  const { setToast } = useContext(ToastContext);

  const [specializationList, setSpecializationList] = useState<
    DoctorSpecialization[]
  >([]);
  const [specializationNameList, setSpecializationNameList] = useState<
    string[]
  >([]);
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("");

  const sortOptions = [
    "Years of Experience - From Low to High",
    "Years of Experience - From High to Low",
    "Fee - From Low to High",
    "Fee - From High to Low",
  ];
  const [selectedSortOption, setSelectedSortOption] = useState<string>("");

  const [doctorList, setDoctorList] = useState<DoctorData>();

  const getSpecializationIdByName = useCallback(
    (name: string): number => {
      let id = 0;

      specializationList.forEach((specialization) => {
        if (specialization.name == name) {
          id = specialization.id;
        }
      });

      return id;
    },
    [specializationList]
  );

  const [page, setPage] = useState<number>(1);
  const [itemPerPage, setItemPerPage] = useState<string>("12");

  useEffect(() => {
    const sortParams = selectedSortOption.split(" - ");

    let sort = "";
    let sortBy = "";

    if (sortParams.length == 2) {
      sort =
        sortParams[1].toLowerCase() == "from low to high"
          ? "asc"
          : sortParams[1].toLowerCase() == "from high to low"
          ? "desc"
          : "";
      sortBy =
        sortParams[0].toLowerCase() == "fee"
          ? "fee_per_patient"
          : sortParams[0].toLowerCase() == "years of experience"
          ? "experience"
          : "";
    }

    const url =
      import.meta.env.VITE_DEPLOYMENT_URL +
      `/doctors/?${
        getSpecializationIdByName(selectedSpecialization) == 0
          ? ""
          : `specialization=${getSpecializationIdByName(
              selectedSpecialization
            )}`
      }${sort != "" && sortBy != "" ? `&sort=${sort}` : ""}${
        sort != "" && sortBy != "" ? `&sortBy=${sortBy}` : ""
      }&page=${page}&limit=${itemPerPage}`;

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    HandleGet<DoctorData>(url)
      .then((responseData) => {
        setDoctorList(responseData);
        scrollToTop();
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [
    getSpecializationIdByName,
    selectedSpecialization,
    setToast,
    selectedSortOption,
    page,
    itemPerPage,
  ]);

  useEffect(() => {
    const url =
      import.meta.env.VITE_DEPLOYMENT_URL + "/doctors/specializations";

    HandleGet<DoctorSpecialization[]>(url)
      .then((responseData) => {
        setSpecializationList(responseData);

        const newList: string[] = [];
        responseData.forEach((specialization) => {
          newList.push(specialization.name);
        });
        setSpecializationNameList(newList);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast]);

  const [showChatConfirmationModal, setShowChatConfirmationModal] =
    useState<boolean>(false);

  function handleOpenChatConfirmationModal(doctorId: number) {
    setSelectedDoctorAccountId(doctorId);

    setShowChatConfirmationModal(true);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

    document.body.style.overflow = "hidden";
  }

  function handleCloseChatConfirmationModal() {
    setShowChatConfirmationModal(false);

    document.body.style.overflow = "auto";
  }

  function handleCreateChatRoom() {
    document.body.style.overflow = "auto";

    const url = import.meta.env.VITE_DEPLOYMENT_URL + "/chat-rooms";
    const bodyRaw = JSON.stringify({
      doctor_account_id: selectedDoctorAccountId,
    });

    HandleAddRaw(url, bodyRaw, true)
      .then(() => {
        navigate("/telemedicine/chats");
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          HandleShowToast(setToast, false, error.message, 7, true);
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  const [selectedDoctorAccountId, setSelectedDoctorAccountId] =
    useState<number>(0);

  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    const data = Cookies.get("data");

    if (!data) {
      setIsValid(false);
      return;
    }

    const dataParsed = JSON.parse(data);

    const roleName = dataParsed["role"];

    if (!roleName) {
      setIsValid(false);
      return;
    }

    if (roleName == "user") {
      setIsValid(true);
    }
  }, []);

  return (
    <>
      {showChatConfirmationModal && (
        <>
          <div className="w-[100vw] h-[100vh] absolute z-[50] top-0 left-0 bg-black opacity-[0.75]"></div>
          <div className="lg:w-[30%] w-[80%] h-[30%] lg:h-[30%] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-white p-[30px]">
            <p className="text-[20px] word-break text-center">
              Are you sure want to proceed? You will be given a session of
              medical consultation worth of{" "}
              <b className="font-[600]">30 minutes</b>. The timer will start
              once doctor join the room chat.
            </p>
            <div className="flex w-[70%] lg:w-[50%] justify-between">
              <button
                onClick={() => handleCloseChatConfirmationModal()}
                className="px-[20px] py-[3px] rounded-[8px] text-[20px] font-[600] text-white bg-[#FF0000]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateChatRoom()}
                className="px-[20px] py-[3px] rounded-[8px] text-[20px] font-[600] text-white bg-[#1F5FFF]"
              >
                Proceed
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-[20px]">
        <div className="w-[100%] h-[50px] rounded-2xl bg-gradient-to-r from-[#1F5FFF] to-[#DFF1FD] flex items-center justify-end px-[20px] lg:px-[50px]">
          <button
            disabled={!isValid}
            onClick={() => navigate("/telemedicine/chats/")}
            className="bg-[#000D44] disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)] text-white text-[18px] rounded-xl font-[600] px-[20px] py-[5px] flex gap-[20px] items-center"
          >
            View Chat Rooms
            <IoArrowForwardOutline />
          </button>
        </div>
        <div className="min-h-[83.5vh] w-full flex flex-col gap-[20px]">
          <div className="flex lg:flex-row gap-[10px] lg:gap-0 flex-col w-full justify-between">
            <div className="flex items-center">
              <p>
                Displaying {doctorList?.doctors.length} out of{" "}
                {doctorList?.page_info.item_count}
              </p>
            </div>
            <div className="flex gap-[10px] lg:flex-row flex-col pr-[20px] lg:pr-0">
              <button
                onClick={() => {
                  setSelectedSortOption("");
                  setSelectedSpecialization("");
                }}
                className="border-2 text-[16px] lg:text-[18px] border-slate-600 rounded-[8px] h-[50px] px-[15px]"
              >
                Clear Filter
              </button>
              <ItemSelector
                value={selectedSpecialization}
                setValue={(value) => setSelectedSpecialization(value)}
                items={specializationNameList}
                placeholder="Doctor specialization"
                buttonAdditionalClassname="lg:w-[400px] w-full"
                optionsAdditionalClassname="w-full top-[55px] z-[50]"
                height="50px"
                textStyle="text-[18px]"
              ></ItemSelector>
              <ItemSelector
                value={selectedSortOption}
                setValue={(value) => setSelectedSortOption(value)}
                items={sortOptions}
                placeholder="Sort by"
                buttonAdditionalClassname="lg:w-[400px] w-full"
                optionsAdditionalClassname="w-full top-[55px] z-[50]"
                height="50px"
                textStyle="text-[18px]"
              ></ItemSelector>
            </div>
          </div>
          <div className="grid min-h-[700px] lg:grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] gap-y-[10px] gap-x-[5px] grid-cols-[repeat(auto-fill,_minmax(220px,_1fr))] lg:place-content-start place-content-center lg:justify-items-start justify-items-center">
            {doctorList && doctorList.doctors ? (
              doctorList.doctors.map((doctor) => (
                <div className="w-[220px] lg:w-[350px] h-[400px] rounded-xl flex shadow-[0px_0px_15px_0px_rgba(0,0,0,0.3)] flex-col items-center justify-between px-[20px] py-[10px]">
                  <img
                    className="w-[175px] h-[175px] object-cover rounded-[100%]"
                    alt=""
                    src={doctor.profile_picture}
                  ></img>
                  <div className="text-center">
                    <p className="text-[24px] font-[600]">{doctor.name}</p>
                    <p className="font-[600] text-gray-600">
                      {doctor.specialization}
                    </p>
                    <p className="flex gap-[3px] items-center justify-center">
                      {CurrencyFormatter.format(+doctor.fee_per_patient)}{" "}
                      <p className="font-[800]">/</p> per Session
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenChatConfirmationModal(doctor.account_id)
                    }
                    disabled={!isValid}
                    className="flex disabled:opacity-50 disabled:cursor-not-allowed items-center px-[20px] py-[10px] rounded-xl border-[1px] border-gray-400 justify-center gap-[15px]"
                  >
                    <IoChatboxEllipsesOutline className="text-[25px]" />
                    <p>Start Chat</p>
                  </button>
                </div>
              ))
            ) : (
              <>
                <TelemedicineLandingUserPageLoading />
                <TelemedicineLandingUserPageLoading />
                <TelemedicineLandingUserPageLoading />
                <TelemedicineLandingUserPageLoading />
                <TelemedicineLandingUserPageLoading />
                <TelemedicineLandingUserPageLoading />
                <TelemedicineLandingUserPageLoading />
                <TelemedicineLandingUserPageLoading />
              </>
            )}
          </div>
          {doctorList?.page_info && (
            <PaginationInfo
              totalPage={doctorList.page_info.page_count}
              activePage={page}
              setPage={(page) => setPage(page)}
              withItemPerPage={true}
              stepItemPerPage={4}
              minItemPerPage={8}
              maxItemPerPage={40}
              itemPerPage={+itemPerPage}
              setItemPerPage={(itemPerPage) => setItemPerPage(itemPerPage)}
            ></PaginationInfo>
          )}
        </div>
      </div>
    </>
  );
};

export default TelemedicineLandingUserPage;
