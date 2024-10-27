import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  HandleAddFormData,
  HandleAddRaw,
  HandleGet,
  HandlePatchBodyRaw,
} from "../util/API";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { FormatTimeChat } from "../util/DateFormatter";
import { BsFillSendFill } from "react-icons/bs";
import { FaPills } from "react-icons/fa";
import CreatePrescriptionModal from "./CreatePrescriptionModal";
import PrescriptionModal from "./PrescriptionModal";
import { IoClose } from "react-icons/io5";
import Modal from "./Modal";
import EndChatConfirmationModal from "./EndChatConfirmationModal";
import { GrDocumentPdf } from "react-icons/gr";
import { CgAttachment } from "react-icons/cg";
import { GetRemaining, IsExpired } from "../util/CheckIsExpired";
import { IChatRoomDetail, IChatRoomPreviewV2 } from "../interfaces/ChatRoom";
import { IWsToken } from "../interfaces/WsToken";
import { IChatWsData, IWsMessage } from "../interfaces/WsMessage";
import {
  IAttachment,
  IChat,
  IPrescriptionDrug,
} from "../interfaces/Telemedicine";
import { FaArrowLeft } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { IoMdMore } from "react-icons/io";

type chatRoomV2Props = {
  accountId: number;
  role: "doctor" | "user";
  setModal: (element: React.ReactElement | undefined) => void;
  room: IChatRoomPreviewV2;
  height: string;
  closeChatRoom: () => void;
};

const ChatRoomV2 = ({
  accountId,
  role,
  setModal,
  room,
  height,
  closeChatRoom,
}: chatRoomV2Props): React.ReactElement => {
  const { setToast } = useContext(ToastContext);

  const [message, setMessage] = useState<string>("");
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
  const [keys, setKeys] = useState<string[]>();
  const [values, setValues] = useState<{
    [key: number]: {
      name: string;
      image: string;
      quantity: number;
      note: string;
    };
  }>();
  const [remainingTime, setRemainingTime] = useState<string>();
  const [disabledSend, setDisabledSend] = useState<boolean>(false);
  const [attachment, setAttachment] = useState<{
    url: string;
    format: string;
  }>();
  const [fileValue, setFileValue] = useState<File>();
  const [roomDetail, setRoomDetail] = useState<IChatRoomDetail>();
  const [isExpired, setIsExpired] = useState<boolean>(true);
  const [isShowButtonWhenMobile, setIsShowButtonWhenMobile] =
    useState<boolean>(false);

  const attachmentFile = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  function handleRemoveAttachment() {
    if (attachmentFile.current) {
      attachmentFile.current;
      attachmentFile.current.value = "";
      attachmentFile.current.type = "text";
      attachmentFile.current.type = "file";
    }

    setAttachment(undefined);
    setFileValue(undefined);
  }

  function handleAttachmentFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];

    const fileName = file.name;
    const fileSize = file.size;

    let errorMsg = "";

    const fileFormat = fileName.split(".").pop();

    if (!fileFormat) {
      return;
    }

    if (fileFormat && !["png", "jpg", "jpeg", "pdf"].includes(fileFormat)) {
      errorMsg = `File must be in either png, jpg, or jpeg format`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    if (fileSize > 2000000) {
      errorMsg = `File must not be greater than 2Mb`;
      HandleShowToast(setToast, false, errorMsg, 5);
      return;
    }

    setAttachment({ url: URL.createObjectURL(file), format: fileFormat });
    setFileValue(file);
  }

  function handleEndChat() {
    const url =
      import.meta.env.VITE_HTTP_BASE_URL + `/v2/chat-room/${room.id}/close`;

    // setRoomIsExpired();

    HandlePatchBodyRaw("", url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Consultation Has Ended", 5);
        // setRoomIsExpired();
        setModal(undefined);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  const handleGenerateToken = useCallback(async (): Promise<
    IWsToken | undefined
  > => {
    if (!roomDetail) {
      return;
    }

    const url = import.meta.env.VITE_HTTP_BASE_URL + "/v2/chat-room/token";

    const body = JSON.stringify({
      room_hash: roomDetail.room_hash,
    });

    try {
      const token: IWsToken = await HandleAddRaw<IWsToken>(url, body, true);
      return token;
    } catch (error) {
      HandleShowToast(setToast, false, (error as Error).message, 7);
      return undefined;
    }
  }, [roomDetail, setToast]);

  function startWs() {
    const socket = new WebSocket(
      import.meta.env.VITE_WS_BASE_URL + "/chat-room"
    );
    socketRef.current = socket;
  }

  async function handlePostFile(file: File): Promise<IAttachment | undefined> {
    const url = import.meta.env.VITE_HTTP_BASE_URL + "/media/upload";

    const formData = new FormData();

    formData.append("file", file);

    try {
      const attachment = await HandleAddFormData<IAttachment>(
        formData,
        url,
        true
      );
      return attachment;
    } catch (error) {
      HandleShowToast(setToast, false, (error as Error).message, 7);
      return undefined;
    }
  }

  async function handleSendMessage() {
    if (message == "") {
      return;
    }

    if (disabledSend) {
      return;
    }

    const prescriptionDrugs: IPrescriptionDrug[] = [];

    if (keys && values) {
      if (keys.length > 0) {
        keys.forEach((key) => {
          prescriptionDrugs.push({
            id: 0,
            drug: {
              id: +key,
              name: values[+key].name,
              image: values[+key].image,
            },
            quantity: values[+key].quantity,
            note: values[+key].note,
          });
        });
      }
    }

    const data: IChatWsData = {
      channel: room.hash,
      side: role == "user" ? 1 : 2,
      message: message,
      prescription_drugs: prescriptionDrugs,
    };

    if (fileValue) {
      const attachment = await handlePostFile(fileValue);

      if (attachment) {
        data.attachment = attachment;
      }
    }

    const wsMessage: IWsMessage = {
      type: "chat",
      data: data,
    };

    const wsPayload = JSON.stringify(wsMessage);

    setDisabledSend(true);
    if (socketRef.current) {
      socketRef.current.send(wsPayload);

      setMessage("");
      handleRemoveAttachment();
    }
    setDisabledSend(false);
  }

  useEffect(() => {
    const url =
      import.meta.env.VITE_HTTP_BASE_URL +
      "/v2/chat-room/" +
      room.id.toString();

    HandleGet<IChatRoomDetail>(url, true)
      .then((data) => {
        setRoomDetail(data);
        setIsExpired(IsExpired(data.expired_at));
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 7);
      });
  }, [room, setToast]);

  const handleWebSocket = useCallback(async () => {
    const token = await handleGenerateToken();

    if (!token) {
      return;
    }

    if (!socketRef.current) {
      startWs();
    }

    const socket = socketRef.current;

    if (!socket) {
      return;
    }

    console.log("channel", token.channel);

    socket.onopen = () => {
      if (!socketRef.current) {
        return;
      }

      const message: IWsMessage = {
        type: "auth",
        data: {
          channel: token.channel,
          client_token: token.token.client_token,
          channel_token: token.token.channel_token,
        },
      };

      const authMsg = JSON.stringify(message);

      socket.send(authMsg);
    };

    socket.onmessage = (ev) => {
      const msg = ev.data;

      if (roomDetail) {
        const msgObj: IChat = JSON.parse(msg);

        setRoomDetail((prev) => {
          if (!prev) {
            return;
          }

          const updated = {
            ...prev,
            chats: prev.chats ? [...prev.chats, msgObj] : [msgObj],
          };

          return updated;
        });
      }
    };

    socket.onerror = (error) => {
      console.log("WebSocket error:", error);

      socket.close();
    };

    socket.onclose = async () => {
      console.log("WebSocket connection closed");

      const newToken = await handleGenerateToken();

      if (!newToken) {
        return;
      }

      startWs();
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [handleGenerateToken, roomDetail]);

  useEffect(() => {
    if (!roomDetail) {
      return;
    }

    handleWebSocket();
  }, [handleWebSocket, roomDetail]);

  useEffect(() => {
    setIsFirstRender(true);
  }, [room]);

  useEffect(() => {
    const scrollable = document.getElementById("scrollable-div");
    const lastChat = document.getElementById("last-chat");

    if (!scrollable || !lastChat) {
      return;
    }

    scrollable.scrollTo({
      top: lastChat.offsetTop,
      behavior: isFirstRender ? "instant" : "smooth",
    });

    if (isFirstRender) {
      setIsFirstRender(false);
    }
  }, [isFirstRender, roomDetail]);

  useEffect(() => {
    if (!roomDetail) {
      return;
    }

    if (isExpired) {
      return;
    }

    if (remainingTime === "00:00") {
      setDisabledSend(true);
      //   setRoomIsExpired();
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime(GetRemaining(roomDetail.expired_at));
    }, 1000);
    return () => clearInterval(interval);
  }, [setRemainingTime, remainingTime, isExpired, roomDetail]);

  return (
    <>
      {roomDetail && (
        <>
          <div
            className={`${height} justify-between relative w-full lg:w-[69%] bg-gray-200 flex rounded-r-3xl flex-col`}
          >
            <div className="w-full h-[100px] bg-gradient-to-t from-[#E5E7EB] to-[#DFF1FD]"></div>
            {roomDetail.expired_at !== "" && !isExpired && (
              <div className="flex flex-col lg:flex-row gap-[20px] absolute top-[8px] right-[20px] justify-center lg:left-[50%] lg:translate-x-[-50%] items-center">
                <p className="text-[20px] font-[600] text-gray-600">
                  Remaining
                </p>
                <p className="font-[400] text-[#E01A52] text-[24px]">
                  {remainingTime}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                closeChatRoom();
              }}
              disabled={false}
              className="absolute z-[100] block sm:hidden top-[8px] left-[7%] md:left-[5%] xl:left-[2%] bg-white p-[10px] rounded-[8px] shadow-lg"
            >
              <IconContext.Provider value={{ size: "20px", color: "#374151" }}>
                <FaArrowLeft></FaArrowLeft>
              </IconContext.Provider>
            </button>

            {isShowButtonWhenMobile ? (
              <div className="absolute z-[100] flex flex-col top-[8px] right-[7%] gap-[5px]">
                <div
                  onClick={() => {
                    setIsShowButtonWhenMobile(false);
                  }}
                  className="fixed inset-0 z-[-1]"
                ></div>

                <button
                  onClick={() => {
                    if (roomDetail.doctor_certificate_url) {
                      window.open(roomDetail.doctor_certificate_url);
                      return;
                    }
                  }}
                  className="w-[160px] shadow-[0px_0px_20px_10px_rgba(0,0,0,0.3)] left-[20px] bg-gray-600 py-[6px] rounded-[5px] text-[14px] text-white font-[600]"
                >
                  See Doctor Certificate
                </button>

                <button
                  onClick={() =>
                    setModal(
                      <EndChatConfirmationModal
                        onClose={() => setModal(undefined)}
                        onCancel={() => setModal(undefined)}
                        onConfirm={() => handleEndChat()}
                      ></EndChatConfirmationModal>
                    )
                  }
                  className="w-[160px] shadow-[0px_0px_20px_10px_rgba(0,0,0,0.3)] bg-[#E01A52] py-[6px] rounded-[5px] text-[14px] text-white font-[600]"
                >
                  End Consultation
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsShowButtonWhenMobile(true);
                }}
                disabled={false}
                className="absolute z-[100] block sm:hidden top-[8px] right-[7%] bg-white p-[10px] rounded-[8px] shadow-lg"
              >
                <IconContext.Provider
                  value={{ size: "20px", color: "#374151" }}
                >
                  <IoMdMore></IoMdMore>
                </IconContext.Provider>
              </button>
            )}

            {role == "user" && (
              <div className="hidden sm:block">
                {room && (
                  <button
                    onClick={() => {
                      if (roomDetail.doctor_certificate_url) {
                        window.open(roomDetail.doctor_certificate_url);
                        return;
                      }
                    }}
                    className="absolute top-[8px] z-[20] lg:w-fit w-[200px] shadow-[0px_0px_20px_10px_rgba(0,0,0,0.3)] opacity-70 hover:opacity-100 left-[20px] bg-gray-600 px-[20px] py-[8px] rounded-[8px] text-white font-[600]"
                  >
                    See Doctor Certificate
                  </button>
                )}
                {!isExpired && (
                  <button
                    onClick={() =>
                      setModal(
                        <EndChatConfirmationModal
                          onClose={() => setModal(undefined)}
                          onCancel={() => setModal(undefined)}
                          onConfirm={() => handleEndChat()}
                        ></EndChatConfirmationModal>
                      )
                    }
                    className="absolute z-20 w-[200px] top-[8px] shadow-[0px_0px_20px_10px_rgba(0,0,0,0.3)] opacity-70 hover:opacity-100 right-[20px] bg-[#E01A52] lg:w-fit px-[20px] py-[8px] rounded-[8px] text-white font-[600]"
                  >
                    End Consultation
                  </button>
                )}
              </div>
            )}

            <div className="h-full flex pt-[60px] justify-between flex-col relative">
              <>
                {roomDetail.chats && (
                  <div
                    id="scrollable-div"
                    className="flex flex-col px-[20px] pb-[10px] gap-[10px] h-[655px] overflow-y-auto"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {roomDetail.chats.map((chat, i) => (
                      <div
                        id={
                          i == roomDetail.chats.length - 1
                            ? "last-chat"
                            : undefined
                        }
                        className={`flex items-${
                          chat.sender_account_id == accountId ? "end" : "start"
                        } w-full flex-col`}
                      >
                        <div
                          className={`flex flex-col bg-[${
                            chat.sender_account_id == accountId
                              ? "#14C57B"
                              : "#14C57B"
                          }] max-w-[500px] px-[20px] py-[5px] rounded-[8px] right-0`}
                        >
                          {chat.attachment && (
                            <>
                              {["jpg", "jpeg", "png"].includes(
                                chat.attachment.format
                              ) && (
                                <img
                                  onClick={() =>
                                    setModal(
                                      <Modal
                                        picture={chat.attachment.url}
                                        onClose={() => setModal(undefined)}
                                      />
                                    )
                                  }
                                  alt=""
                                  src={chat.attachment.url}
                                  className="my-[10px] max-h-[200px] max-w-[600px] rounded-xl cursor-pointer"
                                ></img>
                              )}
                              {chat.attachment.format == "pdf" && (
                                <div
                                  onClick={() =>
                                    window.open(chat.attachment.url)
                                  }
                                  className="my-[10px] p-[15px] border-[1px] bg-gray-200 border-slate-400 rounded-xl cursor-pointer"
                                >
                                  <GrDocumentPdf className="text-[50px]" />
                                </div>
                              )}
                            </>
                          )}
                          {chat.prescription.id && (
                            <div className="relative flex flex-col gap-[5px] h-[245px] overflow-y-hidden bg-gray-200 rounded-xl p-[10px]">
                              {chat.prescription.prescription_drugs?.map(
                                (drug) => (
                                  <div className="flex items-center gap-[10px] bg-white p-[5px] rounded-xl">
                                    <img
                                      alt=""
                                      src={drug.drug.image}
                                      className="h-[100px] aspect-square object-cover"
                                    ></img>
                                    <p className="text-center w-[200px] line-clamp-3">
                                      {drug.drug.name}
                                    </p>
                                    <p className="text-center w-[100px]">
                                      {drug.quantity}
                                    </p>
                                    <p className="text-center w-[200px]">
                                      {drug.note == "" ? "-" : drug.note}
                                    </p>
                                  </div>
                                )
                              )}
                              <button
                                onClick={() =>
                                  setModal(
                                    <PrescriptionModal
                                      prescriptionId={chat.prescription.id}
                                      isUser={role == "user"}
                                      handleClose={() => setModal(undefined)}
                                      prescriptedDrugs={
                                        chat.prescription.prescription_drugs
                                      }
                                    ></PrescriptionModal>
                                  )
                                }
                                className="absolute bottom-[10px] opacity-100 hover:opacity-100 hover:shadow-[0px_0px_20px_10px_rgba(0,0,0,0.3)] right-[10px] bg-gray-600 text-white w-fit px-[10px] py-[5px] ml-auto rounded-[8px]"
                              >
                                See Detail
                              </button>
                            </div>
                          )}
                          <p className="break-words break-all text-[20px]">
                            {chat.message}
                          </p>
                        </div>
                        <p className="font-[600] text-right">
                          {FormatTimeChat(chat.created_at, true)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {roomDetail.expired_at == "" && role == "doctor" ? (
                  <div className="w-full bg-[#000D44] text-center mt-auto rounded-r-3xl py-[10px]">
                    <p className="text-[20px] font-[600] text-white">
                      Chat can only be started after you click the accept
                      button.
                    </p>
                  </div>
                ) : isExpired ? (
                  <div className="w-full bg-[#000D44] text-center mt-auto rounded-r-3xl py-[10px]">
                    <p className="text-[20px] text-white font-[600]">
                      Room is expired.{" "}
                      <a href="/telemedicine/" className="text-white">
                        Start a new session
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#000D44] mt-auto w-full flex flex-col gap-[20px] rounded-b-3xl sm:rounded-r-3xl px-[20px] py-[20px]">
                    {attachment && (
                      <div className="flex flex-col gap-[10px]">
                        <div className="flex w-full justify-between">
                          <p className="font-[600] text-white">
                            One file attached
                          </p>
                          <button
                            className="p-[5px]"
                            onClick={() => handleRemoveAttachment()}
                          >
                            <IoClose className="text-[20px] text-white" />
                          </button>
                        </div>
                        {attachment.format == "pdf" ? (
                          <iframe className="" src={attachment.url}></iframe>
                        ) : (
                          <img
                            alt=""
                            src={attachment.url}
                            className="w-[100px] aspect-square"
                          ></img>
                        )}
                      </div>
                    )}
                    {keys && values && (
                      <div className="bg-white w-fit rounded-xl px-[20px] py-[5px] text-[16px] font-[600]">
                        Send this message with a prescription. ({keys.length}{" "}
                        drugs are prescripted)
                      </div>
                    )}
                    <div className="bg-white rounded-xl flex justify-between items-center px-[10px] gap-[5px]">
                      <div className="flex items-center gap-[5px]">
                        <div className="h-fit">
                          <input
                            className="hidden"
                            id="attachment-file-input"
                            type="file"
                            ref={attachmentFile}
                            onChange={(e) => handleAttachmentFileChange(e)}
                          ></input>
                          <label
                            htmlFor="attachment-file-input"
                            className="h-fit flex items-center p-[5px] cursor-pointer"
                          >
                            <CgAttachment className="text-[25px]" />
                          </label>
                        </div>
                        {role == "doctor" && (
                          <button
                            onClick={() =>
                              setModal(
                                <CreatePrescriptionModal
                                  handleCancel={() => setModal(undefined)}
                                  handleConfirm={(values) => {
                                    const keys = Object.keys(values);
                                    setKeys(keys);
                                    setValues(values);
                                    setModal(undefined);
                                  }}
                                ></CreatePrescriptionModal>
                              )
                            }
                            className="p-[5px]"
                          >
                            <FaPills className="text-[25px]" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="w-full rounded-xl h-[40px] border-0 outline-0 focus:outline-0 focus:border-0 text-[18px]"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) =>
                          e.key == "Enter" && !disabledSend
                            ? handleSendMessage()
                            : {}
                        }
                        placeholder="Enter a message"
                      ></input>
                      <button
                        disabled={disabledSend}
                        onClick={() => handleSendMessage()}
                        className="p-[5px]"
                      >
                        <BsFillSendFill className="text-[25px]"></BsFillSendFill>
                      </button>
                    </div>
                  </div>
                )}
              </>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatRoomV2;
