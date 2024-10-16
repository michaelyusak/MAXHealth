import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import ChatRoomPreviewList from "../components/ChatRoomPreviewList";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../contexts/ToastData";
import { HandleShowToast } from "../util/ShowToast";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import ChatRoom from "../components/ChatRoom";

const WsChatPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  const [selectedRoomId, setSelectedRoomId] = useState<number>();
  const [role, setRole] = useState<"user" | "doctor">();
  const [accountId, setAccountId] = useState<number>();

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

  return (
    <>
      <div className="hidden lg:flex w-full items-center justify-center drop-shadow-[0px_0px_10px_rgba(0,0,0,0.25)]">
        <ChatRoomPreviewList
          refetchRoomList={() => {}}
          onGoingChatRoomPreviewList={[]}
          expiredChatRoomPreviewList={[]}
          requestedChatRoomPreviewList={[]}
          selectedRoomId={1}
          setSelectedRoomId={(isExpired, roomId) => {}}
          newMessage={{}}
        ></ChatRoomPreviewList>

        {selectedRoomId && accountId && role ? (
          <ChatRoom
            onNewMessage={(value) => {}}
            chats={[]}
            setModal={(element) => {}}
            expiredAt={""}
            doctorCertifcateUrl={undefined}
            appendChat={() => {}}
            isRoomExpired={undefined}
            roomId={selectedRoomId}
            accountId={accountId}
            setRoomIsExpired={() => {}}
            role={role}
          ></ChatRoom>
        ) : (
          <div className="h-[800px] bg-gray-200 w-[70%]"></div>
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
