import React, { useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { IChat } from "../interfaces/Telemedicine";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import ChatRoomPreviewCardV2 from "./ChatRoomPreviewCardV2";
import { IChatRoomPreviewV2 } from "../interfaces/ChatRoom";

type chatRoomPreviewListV2Props = {
  selectedRoomId?: number;
  setSelectedRoom: (room: IChatRoomPreviewV2) => void;
  newMessage?: { [key: number]: { chat: IChat } };
  onGoingChatRoomPreviewList: IChatRoomPreviewV2[];
  expiredChatRoomPreviewList: IChatRoomPreviewV2[];
  requestedChatRoomPreviewList: IChatRoomPreviewV2[];
  refetchRoomList: () => void;
};

const ChatRoomPreviewListV2 = ({
  selectedRoomId,
  setSelectedRoom,
  onGoingChatRoomPreviewList,
  expiredChatRoomPreviewList,
  requestedChatRoomPreviewList,
  refetchRoomList
}: chatRoomPreviewListV2Props): React.ReactElement => {
  const navigate = useNavigate();

  const pathname = useLocation().pathname;

  const [showRequestedChatRoom, setShowRequestedChatRoom] =
    useState<boolean>(true);
  const [showOnGoingChatRoom, setShowOnGoingChatRoom] = useState<boolean>(true);
  const [showExpiredChatRoom, setShowExpiredChatRoom] =
    useState<boolean>(false);

  return (
    <div
      className={`lg:h-[800px] h-[750px] lg:w-[30%] flex flex-col border-r-[1px] border-black`}
    >
      <div className="w-[100%] h-[70px] bg-[#000d44] px-[20px] hidden lg:flex items-center justify-start">
        <button
          onClick={() => {
            if (pathname.includes("doctors")) {
              navigate("/doctors/");
              return;
            }

            navigate("/telemedicine/");
          }}
          className="p-[5px]"
        >
          <IoArrowBackOutline className="text-white text-[30px]" />
        </button>
      </div>
      <div
        dir="rtl"
        className="h-[800px] overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex flex-col h-full bg-gray-200" dir="ltr">
          {
            <>
              <div
                onClick={() => setShowRequestedChatRoom(!showRequestedChatRoom)}
                className="flex py-[10px] justify-between px-[50px] border-b-[1px] border-slate-600 bg-slate-300 items-center cursor-pointer"
              >
                <div className="w-[30px] aspect-square rounded-[100%] flex justify-center items-center bg-[#000D44]">
                  <p className="font-[700] text-white">
                    {requestedChatRoomPreviewList.length}
                  </p>
                </div>
                <p className="text-[18px] font-[600] text-[#000D44]">
                  {pathname.includes("doctors") ? "Request" : "Pending"}
                </p>
                {showRequestedChatRoom ? (
                  <MdOutlineKeyboardArrowUp className="text-[25px]" />
                ) : (
                  <MdOutlineKeyboardArrowDown className="text-[25px]" />
                )}
              </div>
              {showRequestedChatRoom &&
                requestedChatRoomPreviewList.map((room) => (
                  <ChatRoomPreviewCardV2
                    status="pending"
                    chatRoomPreview={room}
                    selectedRoomChat={selectedRoomId}
                    handleRoomChatOnClick={() => setSelectedRoom(room)}
                    forRole={pathname.includes("doctors") ? "doctor" : "user"}
                    lastChat={room.last_chat}
                    refetchRoomList={() => refetchRoomList()}
                  ></ChatRoomPreviewCardV2>
                ))}
            </>
          }
          {
            <>
              <div
                onClick={() => setShowOnGoingChatRoom(!showOnGoingChatRoom)}
                className="flex py-[10px] justify-between bg-slate-300 border-b-[1px] border-slate-600 px-[50px] items-center cursor-pointer"
              >
                <div className="w-[30px] aspect-square rounded-[100%] flex justify-center items-center bg-[#000D44]">
                  <p className="font-[700] text-white">
                    {onGoingChatRoomPreviewList.length}
                  </p>
                </div>
                <p className="text-[18px] font-[600] text-[#000D44]">
                  On going
                </p>
                {showOnGoingChatRoom ? (
                  <MdOutlineKeyboardArrowUp className="text-[25px]" />
                ) : (
                  <MdOutlineKeyboardArrowDown className="text-[25px]" />
                )}
              </div>
              <>
                {showOnGoingChatRoom &&
                  onGoingChatRoomPreviewList.map((room) => (
                    <ChatRoomPreviewCardV2
                      status="on-going"
                      selectedRoomChat={selectedRoomId}
                      handleRoomChatOnClick={() => setSelectedRoom(room)}
                      chatRoomPreview={room}
                      forRole={pathname.includes("doctors") ? "doctor" : "user"}
                      lastChat={room.last_chat}
                      refetchRoomList={() => refetchRoomList()}
                    ></ChatRoomPreviewCardV2>
                  ))}
              </>
            </>
          }
          {
            <>
              <div
                onClick={() => setShowExpiredChatRoom(!showExpiredChatRoom)}
                className="flex py-[10px] justify-between bg-slate-300 border-b-[1px] border-slate-600 px-[50px] items-center cursor-pointer"
              >
                <div className="w-[30px] aspect-square rounded-[100%] flex justify-center items-center bg-[#000D44]">
                  <p className="font-[700] text-white">
                    {expiredChatRoomPreviewList.length}
                  </p>
                </div>
                <p className="text-[18px] font-[600] text-[#000D44]">Expired</p>
                {showExpiredChatRoom ? (
                  <MdOutlineKeyboardArrowUp className="text-[25px]" />
                ) : (
                  <MdOutlineKeyboardArrowDown className="text-[25px]" />
                )}
              </div>
              {showExpiredChatRoom &&
                expiredChatRoomPreviewList.map((room) => (
                  <ChatRoomPreviewCardV2
                    status="expired"
                    selectedRoomChat={selectedRoomId}
                    handleRoomChatOnClick={() => setSelectedRoom(room)}
                    chatRoomPreview={room}
                    forRole={pathname.includes("doctors") ? "doctor" : "user"}
                    lastChat={room.last_chat}
                    refetchRoomList={() => refetchRoomList()}
                  ></ChatRoomPreviewCardV2>
                ))}
            </>
          }
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPreviewListV2;
