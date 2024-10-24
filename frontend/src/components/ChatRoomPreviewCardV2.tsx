import React, { useContext, useState } from "react";
import { IChat, IChatRoomPreview } from "../interfaces/Telemedicine";
import { FormatTimeChat } from "../util/DateFormatter";
import { HandlePatchBodyRaw } from "../util/API";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { IsExpired } from "../util/CheckIsExpired";

type chatRoomPreviewCardV2Props = {
  chatRoomPreview: IChatRoomPreview;
  handleRoomChatOnClick: (isExpired: boolean) => void;
  status: "expired" | "pending" | "on-going";
  selectedRoomChat?: number;
  refetchRoomList: () => void;
  forRole: "user" | "doctor";
  lastChat?: IChat;
};

const ChatRoomPreviewCardV2 = ({
  chatRoomPreview,
  handleRoomChatOnClick,
  selectedRoomChat,
  status,
  forRole,
  refetchRoomList,
  lastChat
}: chatRoomPreviewCardV2Props): React.ReactElement => {
  const { setToast } = useContext(ToastContext);

  function handleAcceptChatRequest() {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/v2/chat-room/"+chatRoomPreview.id.toString()+"/join";
    HandlePatchBodyRaw("", url, true)
      .then(() => {
        setSelectedRoomId(selectedRoomId);
        setShowDoctorConfirmationModal(false);
        refetchRoomList();
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          HandleShowToast(setToast, false, error.message, 7, true);
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  const [showDoctorConfirmationModal, setShowDoctorConfirmationModal] =
    useState<boolean>(false);

  const [selectedRoomId, setSelectedRoomId] = useState<number>(0);

  function handleOpenChatConfirmationModal(roomId: number) {
    setShowDoctorConfirmationModal(true);

    setSelectedRoomId(roomId);

    document.body.style.overflow = "hidden";
  }

  function handleCloseChatConfirmationModal() {
    setShowDoctorConfirmationModal(false);

    document.body.style.overflow = "auto";
  }

  return (
    <>
      {forRole == "doctor" && showDoctorConfirmationModal && (
        <>
          <div className="w-[100%] h-[100%] absolute z-[50] top-0 left-0 bg-black gradi opacity-[0.75]"></div>
          <div className="w-full md:w-[60%] xl:w-[50%] p-[1rem] md:p-[2rem] xl:p-[3rem] gap-[0.5rem] absolute z-[50] top-[50%] left-[50%] justify-between items-center flex flex-col translate-x-[-50%] rounded-xl translate-y-[-50%] bg-white">
            <p className="text-[20px] word-break text-justify">
              Are you sure want to proceed? You are about to give{" "}
              <b className="font-[600]">30 minutes</b>. medical consultation
              session,{" "}
              <b className="font-[600] text-[#FF0000]">
                you can not accept other request during this period of time
              </b>
            </p>
            <div className="flex w-[100%] justify-center gap-[1rem]">
              <button
                onClick={() => handleCloseChatConfirmationModal()}
                className="px-[20px] py-[3px] rounded-[8px] text-[20px] font-[600] text-white bg-[#FF0000]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAcceptChatRequest()}
                className="px-[20px] py-[3px] rounded-[8px] text-[20px] font-[600] text-white bg-[#1F5FFF]"
              >
                Proceed
              </button>
            </div>
          </div>
        </>
      )}

      {forRole == "user" && (
        <div
          onClick={() => {
            if (chatRoomPreview.id == selectedRoomChat) {
              return;
            }

            if (!chatRoomPreview.expired_at) {
              handleRoomChatOnClick(false);
            }

            handleRoomChatOnClick(IsExpired(chatRoomPreview.expired_at));
          }}
          className={`${
            selectedRoomChat == chatRoomPreview.id
              ? status == "pending"
                ? "bg-[#DFF1FD]"
                : status == "expired"
                ? "bg-[#fac4c4]"
                : "bg-[#D3FEEB]"
              : "bg-gray-200"
          } border-[1px] w-full cursor-pointer justify-start gap-[10px] border-gray-400 px-[20px] py-[15px] flex`}
        >
          <img
            alt=""
            src={chatRoomPreview.participant_picture_url}
            className="h-[100px] object-cover aspect-square rounded-[100%]"
          ></img>
          <div className="flex-1">
            <div className="flex justify-between">
              <p className="text-[20px] font-[600]">
                {chatRoomPreview.participant_name}
              </p>

              <p className="font-[600] text-gray-600">
                {FormatTimeChat(
                  lastChat
                    ? lastChat.created_at
                    : chatRoomPreview.last_chat.created_at
                )}
              </p>
            </div>
            <p className="line-clamp-2 text-[18px] text-black">
              {lastChat ? lastChat.message : chatRoomPreview.last_chat.message}
            </p>
          </div>
        </div>
      )}
      {forRole == "doctor" && (
        <div
          onClick={() => {
            if (chatRoomPreview.id == selectedRoomChat) {
              return;
            }

            if (!chatRoomPreview.expired_at) {
              handleRoomChatOnClick(false);
            }

            handleRoomChatOnClick(IsExpired(chatRoomPreview.expired_at));
          }}
          className={`${
            selectedRoomChat == chatRoomPreview.id
              ? status == "pending"
                ? "bg-[#DFF1FD]"
                : status == "expired"
                ? "bg-[#fac4c4]"
                : "bg-[#D3FEEB]"
              : "bg-gray-200"
          } border-[1px] w-full items-center cursor-pointer justify-start gap-[10px] border-gray-400 px-[20px] py-[15px] flex`}
        >
          <img
            alt=""
            src={chatRoomPreview.participant_picture_url}
            className="h-[100px] object-cover aspect-square rounded-[100%]"
          ></img>
          <div className="flex-1 flex flex-col justify-between h-full gap-[5px]">
            <div className="flex justify-between">
              <p className="text-[20px] font-[600]">
                {chatRoomPreview.participant_name}
              </p>

              <p className="font-[600] text-gray-600">
                {FormatTimeChat(chatRoomPreview.last_chat.created_at)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="line-clamp-2 text-[18px] text-black">
                {chatRoomPreview.last_chat.message}
              </p>
              {forRole == "doctor" && !chatRoomPreview.expired_at && (
                <div
                  onClick={() =>
                    handleOpenChatConfirmationModal(chatRoomPreview.id)
                  }
                  className="flex justify-end"
                >
                  <button
                    onClick={() =>
                      handleOpenChatConfirmationModal(chatRoomPreview.id)
                    }
                    className="bg-[#14C57B] px-[20px] py-[10px] rounded-xl text-[18px] text-white"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatRoomPreviewCardV2;
