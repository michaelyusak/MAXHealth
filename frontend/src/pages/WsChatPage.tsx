import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { MsgTokenExpired } from "../appconstants/appconstants";
import { HandleGet } from "../util/API";
import { IChatRoomList, IChatRoomPreviewV2 } from "../interfaces/ChatRoom";
import ChatRoomPreviewListV2 from "../components/ChatRoomPreviewListV2";
import ChatRoomV2 from "../components/ChatRoomV2";

const WsChatPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);
  const [role, setRole] = useState<string>();
  const [accountId, setAccountId] = useState<number>();
  const [pendingRooms, setPendingRooms] = useState<IChatRoomPreviewV2[]>([]);
  const [onGoingRooms, setOnGoingRooms] = useState<IChatRoomPreviewV2[]>([]);
  const [expiredRooms, setExpiredRooms] = useState<IChatRoomPreviewV2[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<IChatRoomPreviewV2>();
  const [modal, setModal] = useState<React.ReactElement>();
  const [isHideChatRoomList, setIsHideChatRoomList] = useState<boolean>(false);

  const handleGetRoomList = useCallback(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/v2/chat-room";

    HandleGet<IChatRoomList>(url, true)
      .then((data) => {
        setPendingRooms(data.pending);
        setOnGoingRooms(data.on_going);
        setExpiredRooms(data.expired);
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && selectedRoom !== undefined) {
        setIsHideChatRoomList(true);
        return;
      }

      setIsHideChatRoomList(false);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedRoom]);

  useEffect(() => {
    const roleSessionStorage = sessionStorage.getItem("role");
    const accountIdSessionStorage = sessionStorage.getItem("accountId");

    if (
      !roleSessionStorage ||
      !accountIdSessionStorage ||
      isNaN(+accountIdSessionStorage)
    ) {
      HandleShowToast(setToast, false, MsgTokenExpired, 5);
      navigate("/auth/login");
      return;
    }

    setAccountId(+accountIdSessionStorage);
    setRole(roleSessionStorage);
  }, [navigate, setAccountId, setToast]);

  useEffect(() => {
    handleGetRoomList();
  }, [handleGetRoomList]);

  return (
    <>
      {modal && modal}
      <div className="flex w-full h-[80vh] items-start pt-[5%] px-[3%] justify-center drop-shadow-[0px_0px_10px_rgba(0,0,0,0.25)]">
        {!isHideChatRoomList && (
          <ChatRoomPreviewListV2
            onGoingChatRoomPreviewList={onGoingRooms}
            expiredChatRoomPreviewList={expiredRooms}
            requestedChatRoomPreviewList={pendingRooms}
            selectedRoomId={selectedRoom?.id}
            setSelectedRoom={(room) => {
              setSelectedRoom(room);
              setIsHideChatRoomList(false);
              if (window.innerWidth < 640) {
                setIsHideChatRoomList(true);
              }
            }}
            refetchRoomList={() => handleGetRoomList()}
          ></ChatRoomPreviewListV2>
        )}

        {selectedRoom && accountId && role ? (
          <ChatRoomV2
            setModal={(element) => setModal(element)}
            room={selectedRoom}
            accountId={accountId}
            role={role}
            closeChatRoom={() => {
              setSelectedRoom(undefined);
              setIsHideChatRoomList(false);
            }}
            setRoomIsExpired={() => handleGetRoomList()}
          ></ChatRoomV2>
        ) : (
          <div className={`h-full bg-gray-200 hidden sm:block w-[70%]`}></div>
        )}
      </div>
    </>
  );
};

export default WsChatPage;
