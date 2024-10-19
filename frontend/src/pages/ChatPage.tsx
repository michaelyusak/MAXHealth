import React, { useCallback, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import ChatRoomPreview from "../components/ChatRoomPreviewList";
import ChatRoom from "../components/ChatRoom";
import { useNavigate } from "react-router-dom";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { MsgRefreshTokenNotFound } from "../appconstants/appconstants";
import { HandleGet } from "../util/API";
import { IChat, IChatRoom, IChatRoomPreview } from "../interfaces/Telemedicine";
import { IsExpired } from "../util/CheckIsExpired";
import { FaArrowLeft } from "react-icons/fa";

const ChatPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const { setToast } = useContext(ToastContext);

  const [selectedRoomId, setSelectedRoomId] = useState<number>();

  const [id, setId] = useState<number>();

  useEffect(() => {
    const data = Cookies.get("data");

    if (!data) {
      navigate("/auth/login");

      HandleShowToast(setToast, false, MsgRefreshTokenNotFound, 5);
    } else {
      const dataParsed = JSON.parse(data);

      setId(dataParsed.user_id);
      setRole(dataParsed.role);
    }
  }, [navigate, setId, setToast]);

  const [onGoingchatRoomPreviewList, setOnGoingChatRoomPreviewList] = useState<
    IChatRoomPreview[]
  >([]);
  const [expiredchatRoomPreviewList, setExpiredChatRoomPreviewList] = useState<
    IChatRoomPreview[]
  >([]);
  const [requestedchatRoomPreviewList, setRequestedChatRoomPreviewList] =
    useState<IChatRoomPreview[]>([]);

  const [role, setRole] = useState<"user" | "doctor">();

  const fetchRoomList = useCallback(() => {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/chat-rooms";

    HandleGet<IChatRoomPreview[]>(url, true)
      .then((responseData) => {
        const requested: IChatRoomPreview[] = [];
        const onGoing: IChatRoomPreview[] = [];
        const expired: IChatRoomPreview[] = [];

        if (!responseData) {
          return;
        }

        responseData.forEach((room) => {
          if (room.expired_at == undefined) {
            requested.push(room);
          } else if (IsExpired(room.expired_at)) {
            expired.push(room);
          } else {
            onGoing.push(room);
          }
        });

        setRequestedChatRoomPreviewList(requested);
        setOnGoingChatRoomPreviewList(onGoing);
        setExpiredChatRoomPreviewList(expired);
      })
      .catch((error: Error) => {
        if (error.message == MsgRefreshTokenNotFound) {
          navigate("/auth/login");
        }

        HandleShowToast(setToast, false, error.message, 5);
      });
  }, [setToast, navigate]);

  useEffect(() => fetchRoomList(), [fetchRoomList]);

  useEffect(() => {
    const interval = setInterval(() => fetchRoomList(), 10000);
    return () => clearInterval(interval);
  }, [fetchRoomList]);

  useEffect(() => {
    if (selectedRoomId) {
      const url =
        import.meta.env.VITE_HTTP_BASE_URL + `/chat-rooms/${selectedRoomId}`;

      setIsLoading(true);
      HandleGet<IChatRoom>(url, true)
        .then((responseData) => {
          setDoctorCertificateUrl(responseData.doctor_certificate_url);

          if (responseData.expired_at) {
            setRoomExpiredAt(responseData.expired_at);
            setIsRoomExpired(IsExpired(responseData.expired_at));
          } else {
            setIsRoomExpired(false);
          }

          if (responseData.chats) {
            setChats(responseData.chats);
          } else {
            setChats([]);
          }
        })
        .catch(() => {
          HandleShowToast(setToast, false, "Failed to fetch all message", 5);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedRoomId, setToast]);

  const [chats, setChats] = useState<IChat[]>([]);
  const [doctorCertificateUrl, setDoctorCertificateUrl] = useState<string>();
  const [roomExpiredAt, setRoomExpiredAt] = useState<string>();
  const [isRoomExpired, setIsRoomExpired] = useState<boolean>();

  const [modal, setModal] = useState<React.ReactElement>();

  const [newMessage, setNewMessage] = useState<{
    [key: number]: { chat: IChat };
  }>();

  const [showRoomList, setShowRoomList] = useState<boolean>(true);
  const [showChatRoom, setShowChatRoom] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>();

  return (
    <>
      {isLoading && (
        <div className="w-[100vw] h-[100vh] absolute z-[60] top-0 left-0 rounded-xl bg-black opacity-[0.2] animate-pulse"></div>
      )}
      {modal && modal}
      <div className="hidden lg:flex w-full items-center justify-center drop-shadow-[0px_0px_10px_rgba(0,0,0,0.25)]">
        <ChatRoomPreview
          refetchRoomList={() => fetchRoomList()}
          onGoingChatRoomPreviewList={onGoingchatRoomPreviewList}
          expiredChatRoomPreviewList={expiredchatRoomPreviewList}
          requestedChatRoomPreviewList={requestedchatRoomPreviewList}
          selectedRoomId={selectedRoomId}
          setSelectedRoomId={(isExpired, roomId) => {
            setIsRoomExpired(isExpired);
            setRoomExpiredAt(undefined);
            setSelectedRoomId(roomId);
          }}
          newMessage={newMessage}
        ></ChatRoomPreview>

        {selectedRoomId && id && role ? (
          <ChatRoom
            onNewMessage={(value) => setNewMessage(value)}
            chats={chats}
            setModal={(element) => setModal(element)}
            expiredAt={roomExpiredAt}
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
              fetchRoomList();
              setIsRoomExpired(true);
            }}
            role={role}
          ></ChatRoom>
        ) : (
          <div className="h-[800px] bg-gray-200 w-[70%]"></div>
        )}
      </div>
      <div className="lg:hidden relative">
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
      </div>
    </>
  );
};

export default ChatPage;
