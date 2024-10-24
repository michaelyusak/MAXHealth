import React, { useCallback, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { HandleGet } from "../util/API";
import { IChatRoomList, IChatRoomPreviewV2 } from "../interfaces/ChatRoom";
import ChatRoomPreviewListV2 from "../components/ChatRoomPreviewListV2";
import ChatRoomV2 from "../components/ChatRoomV2";

const WsChatPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);
  const [role, setRole] = useState<"user" | "doctor">();
  const [accountId, setAccountId] = useState<number>();
  const [pendingRooms, setPendingRooms] = useState<IChatRoomPreviewV2[]>([]);
  const [onGoingRooms, setOnGoingRooms] = useState<IChatRoomPreviewV2[]>([]);
  const [expiredRooms, setExpiredRooms] = useState<IChatRoomPreviewV2[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<IChatRoomPreviewV2>();
  const [modal, setModal] = useState<React.ReactElement>();
  const [screenHeight, setScreenHeight] = useState<number>(window.innerHeight);

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
    const updateHeight = () => {
      setScreenHeight(window.innerHeight);
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  useEffect(() => {
    const data = Cookies.get("data");

    if (!data) {
      navigate("/auth/login");

      HandleShowToast(setToast, false, MsgRefreshTokenNotFound, 5);
    } else {
      const dataParsed = JSON.parse(data);

      setAccountId(dataParsed.user_id);
      setRole(dataParsed.role);
    }
  }, [navigate, setAccountId, setToast]);

  useEffect(() => {
    handleGetRoomList();
  }, [handleGetRoomList]);

  return (
    <>
      {modal && modal}
      <div className="hidden lg:flex w-full h-[100vh] items-start pt-[5%] px-[3%] justify-center drop-shadow-[0px_0px_10px_rgba(0,0,0,0.25)]">
        <ChatRoomPreviewListV2
          onGoingChatRoomPreviewList={onGoingRooms}
          expiredChatRoomPreviewList={expiredRooms}
          requestedChatRoomPreviewList={pendingRooms}
          selectedRoomId={selectedRoom?.id}
          setSelectedRoom={(room) => setSelectedRoom(room)}
          refetchRoomList={() => handleGetRoomList()}
          height={
            screenHeight > 800
              ? "h-[600px]"
              : screenHeight > 700
              ? "h-[500px]"
              : "h-[400px]"
          }
        ></ChatRoomPreviewListV2>

        {selectedRoom && accountId && role ? (
          <ChatRoomV2
            setModal={(element) => setModal(element)}
            room={selectedRoom}
            accountId={accountId}
            role={role}
            height={
              screenHeight > 800
                ? "h-[600px]"
                : screenHeight > 700
                ? "h-[500px]"
                : "h-[400px]"
            }
          ></ChatRoomV2>
        ) : (
          <div
            className={`${
              screenHeight > 800
                ? "h-[600px]"
                : screenHeight > 700
                ? "h-[500px]"
                : "h-[400px]"
            } bg-gray-200 w-[70%]`}
          ></div>
        )}
      </div>
      {/* <div className="lg:hidden relative">
        {showRoomList && (
          <button
            onClick={() => {
              if (role == "user") navigate("/telemedicine/");

              if (role == "doctor") navigate("/doctors/telemedicine");
            }}
            className="h-fit p-[10px]"
          >
            <FaArrowLeft className="text-[28px]" />
          </button>
        )}
        {showChatRoom && (
          <button
            onClick={() => {
              setShowRoomList(true);
              setShowChatRoom(false);
              setSelectedRoomId(undefined);
            }}
            className="h-fit p-[10px]"
          >
            <FaArrowLeft className="text-[28px]" />
          </button>
        )}

        {showRoomList && (
          <ChatRoomPreview
            refetchRoomList={() => fetchRoomList()}
            onGoingChatRoomPreviewList={onGoingchatRoomPreviewList}
            expiredChatRoomPreviewList={expiredchatRoomPreviewList}
            requestedChatRoomPreviewList={requestedchatRoomPreviewList}
            selectedRoomId={selectedRoomId}
            setSelectedRoomId={(isExpired, roomId) => {
              setIsRoomExpired(isExpired);
              setShowChatRoom(true);
              setShowRoomList(false);
              setSelectedRoomId(roomId);
            }}
            newMessage={newMessage}
          ></ChatRoomPreview>
        )}
        {showChatRoom && selectedRoomId && id && role && (
          <ChatRoom
            onNewMessage={(value) => setNewMessage(value)}
            chats={chats}
            expiredAt={roomExpiredAt}
            setModal={(element) => setModal(element)}
            doctorCertifcateUrl={
              role == "user" ? doctorCertificateUrl : undefined
            }
            appendChat={(chat) =>
              setChats((prevVal) => {
                if (prevVal) {
                  return [...prevVal, chat];
                }

                return [chat];
              })
            }
            isRoomExpired={isRoomExpired}
            roomId={selectedRoomId}
            accountId={id}
            setRoomIsExpired={() => {
              setIsRoomExpired(true);
              fetchRoomList();
            }}
            role={role}
          ></ChatRoom>
        )}
      </div> */}
    </>
  );
};

export default WsChatPage;
