import React, {
  ChangeEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { HandleAddFormData, HandleGet, HandlePatchBodyRaw } from "../util/API";
import { IChat } from "../interfaces/Telemedicine";
import { HandleShowToast } from "../util/ShowToast";
import { ToastContext } from "../contexts/ToastData";
import { FormatTimeChat } from "../util/DateFormatter";
import { BiSolidMessageSquareError } from "react-icons/bi";
import { BsFillSendFill } from "react-icons/bs";
import {
  MsgRoomIsNowExpired,
  MsgRefreshTokenNotFound,
} from "../appconstants/appconstants";
import { useNavigate } from "react-router-dom";
import { FaPills } from "react-icons/fa";
import CreatePrescriptionModal from "./CreatePrescriptionModal";
import PrescriptionModal from "./PrescriptionModal";
import { IoClose } from "react-icons/io5";
import Modal from "./Modal";
import EndChatConfirmationModal from "./EndChatConfirmationModal";
import { GrDocumentPdf } from "react-icons/gr";
import { CgAttachment } from "react-icons/cg";
import { GetRemaining } from "../util/CheckIsExpired";

type chatRoomProps = {
  roomId: number;
  accountId: number;
  doctorCertifcateUrl?: string;
  chats: IChat[];
  appendChat: (chat: IChat) => void;
  isRoomExpired?: boolean;
  expiredAt?: string;
  setRoomIsExpired: () => void;
  role: "doctor" | "user";
  setModal: (element: React.ReactElement | undefined) => void;
  onNewMessage: (value: { [key: number]: { chat: IChat } }) => void;
};

const ChatRoom = ({
  roomId,
  accountId,
  chats,
  doctorCertifcateUrl,
  appendChat,
  isRoomExpired,
  expiredAt,
  setRoomIsExpired,
  role,
  setModal,
  onNewMessage,
}: chatRoomProps): React.ReactElement => {
  const { setToast } = useContext(ToastContext);
  const navigate = useNavigate();

  useEffect(() => {
    const url =
      import.meta.env.VITE_DEPLOYMENT_URL + `/chat-rooms/chats/${roomId}`;

    if (isRoomExpired != undefined && !isRoomExpired) {
      HandleGet<IChat>(url, true)
        .then((responseData) => {
          if (responseData) {
            appendChat(responseData);
            onNewMessage({ [roomId]: { chat: responseData } });
          }
        })
        .catch((error: Error) => {
          if (error.message == MsgRefreshTokenNotFound) {
            navigate("/auth/login");

            setRoomIsExpired();

            HandleShowToast(setToast, false, error.message, 5);
          }
        });
    }
  }, [
    navigate,
    setToast,
    appendChat,
    chats,
    isRoomExpired,
    roomId,
    onNewMessage,
    setRoomIsExpired,
  ]);

  const [message, setMessage] = useState<string>("");

  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);

  useEffect(() => {
    setIsFirstRender(true);
  }, [roomId]);

  useEffect(() => {
    const scrollable = document.getElementById("scrollable-div");
    const lastChat = document.getElementById("last-chat");

    if (!scrollable || !lastChat) {
      return;
    }

    if (isFirstRender) {
      scrollable.scrollTo({
        top: lastChat.offsetTop,
        behavior: "instant",
      });
      setIsFirstRender(false);
    }
  }, [chats, isFirstRender]);

  useEffect(() => {
    const scrollable = document.getElementById("scrollable-div");
    const lastChat = document.getElementById("last-chat");

    if (!scrollable || !lastChat) {
      return;
    }

    if (!isFirstRender) {
      scrollable?.scrollTo({
        top: lastChat?.offsetTop,
        behavior: "smooth",
      });
    }
  }, [isFirstRender, chats]);

  function handleSendMessage() {
    const url = import.meta.env.VITE_DEPLOYMENT_URL + "/chat-rooms/chats";

    const formData = new FormData();

    const prescriptionDrugs: {
      drug: {
        id: number;
        name: string;
        image: string;
      };
      quantity: number;
      note: string;
    }[] = [];

    if (keys && values) {
      if (keys.length > 0) {
        keys.forEach((key) => {
          prescriptionDrugs.push({
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

    const data = {
      room_id: roomId,
      message: message,
      prescription_drugs: prescriptionDrugs,
    };

    formData.append("data", JSON.stringify(data));

    if (fileValue) {
      formData.append("file", fileValue);
    }

    if (message != "") {
      setDisabledSend(true);
      HandleAddFormData<IChat>(formData, url, true)
        .then((responseData) => {
          if (responseData) {
            onNewMessage({ [roomId]: { chat: responseData } });
            appendChat(responseData);
          }
        })
        .catch((error: Error) => {
          if (error.message == MsgRoomIsNowExpired) {
            setRoomIsExpired();
          }

          HandleShowToast(setToast, false, error.message, 5);
        })
        .finally(() => {
          setDisabledSend(false);
          setMessage("");
          handleRemoveAttachment();
          setKeys(undefined);
          setValues(undefined);
          setAttachment(undefined);
        });
    }
  }

  const [keys, setKeys] = useState<string[]>();
  const [values, setValues] = useState<{
    [key: number]: {
      name: string;
      image: string;
      quantity: number;
      note: string;
    };
  }>();

  const attachmentFile = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<{
    url: string;
    format: string;
  }>();
  const [fileValue, setFileValue] = useState<File>();

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
      import.meta.env.VITE_DEPLOYMENT_URL + `/chat-rooms/${roomId}/close-room`;

    setRoomIsExpired();

    HandlePatchBodyRaw("", url, true)
      .then(() => {
        HandleShowToast(setToast, true, "Consultation Has Ended", 5);
        setRoomIsExpired();
        setModal(undefined);
      })
      .catch((error: Error) => {
        HandleShowToast(setToast, false, error.message, 5);
      });
  }

  const [remainingTime, setRemainingTime] = useState<string>();
  const [disabledSend, setDisabledSend] = useState<boolean>(false);

  useEffect(() => {
    if (isRoomExpired) {
      return;
    }

    const remaining = GetRemaining(expiredAt);

    if (remaining === "00:00") {
      setRoomIsExpired();
      return;
    }

    if (!isRoomExpired) {
      const interval = setInterval(() => {
        setRemainingTime(GetRemaining(expiredAt));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [expiredAt, isRoomExpired, setRoomIsExpired]);

  return (
    <>
      {accountId ? (
        <>
          <div
            className={`lg:h-[800px] h-[750px] justify-between relative  w-full lg:w-[69%] bg-gray-200 flex rounded-r-3xl flex-col`}
          >
            <div className="w-full h-[100px] bg-gradient-to-t from-[#E5E7EB] to-[#DFF1FD]"></div>
            {expiredAt != undefined && !isRoomExpired && (
              <div className="flex flex-col lg:flex-row gap-[20px] absolute top-[8px] right-[20px] justify-center lg:left-[50%] lg:translate-x-[-50%] items-center">
                <p className="text-[20px] font-[600] text-gray-600">
                  Remaining
                </p>
                <p className="font-[400] text-[#E01A52] text-[24px]">
                  {remainingTime}
                </p>
              </div>
            )}
            {role == "user" && (
              <div>
                {roomId && (
                  <button
                    onClick={() => {
                      if (doctorCertifcateUrl) {
                        window.open(doctorCertifcateUrl);
                        return;
                      }
                    }}
                    className="absolute lg:top-[8px] z-[20] lg:w-fit w-[200px] shadow-[0px_0px_20px_10px_rgba(0,0,0,0.3)] opacity-70 hover:opacity-100 lg:left-[20px] bg-gray-600 px-[20px] py-[8px] rounded-[8px] text-white font-[600]"
                  >
                    See Doctor Certificate
                  </button>
                )}
                {isRoomExpired != undefined && !isRoomExpired && (
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
                    className="absolute top-[65px] z-20 w-[200px] lg:top-[8px] shadow-[0px_0px_20px_10px_rgba(0,0,0,0.3)] opacity-70 hover:opacity-100 lg:right-[20px] bg-[#E01A52] lg:w-fit px-[20px] py-[8px] rounded-[8px] text-white font-[600]"
                  >
                    End Consultation
                  </button>
                )}
              </div>
            )}

            <div className="h-full flex pt-[100px] lg:pt-0 justify-between flex-col relative">
              <>
                {chats && (
                  <div
                    id="scrollable-div"
                    className="flex flex-col pt-[20px] px-[20px] pb-[20px] gap-[10px] h-[655px] overflow-y-auto"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {chats.map((chat, i) => (
                      <div
                        id={i == chats.length - 1 ? "last-chat" : undefined}
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
                {expiredAt == undefined && role == "doctor" ? (
                  <div className="w-full bg-[#000D44] text-center absolute bottom-0 rounded-r-3xl py-[10px]">
                    <p className="text-[20px] font-[600] text-white">
                      Chat can only be started after you click the accept
                      button.
                    </p>
                  </div>
                ) : isRoomExpired ? (
                  <div className="w-full bg-[#000D44] text-center absolute bottom-0 rounded-r-3xl py-[10px]">
                    <p className="text-[20px] text-white font-[600]">
                      Room is expired.{" "}
                      <a href="/telemedicine/" className="text-white">
                        Start a new session
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#000D44] mt-auto w-full flex flex-col gap-[20px] rounded-r-3xl px-[20px] py-[20px]">
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
      ) : (
        <>
          <div className="h-[800px] justify-between w-full lg:w-[70%] bg-gray-200 rounded-r-3xl flex flex-col pt-[65px]">
            <div className="bg-black opacity-85 absolute z-20 w-[100vw] h-[100vh] top-0 left-0"></div>
            <div className="bg-white w-[30vw] h-[50vh] flex flex-col justify-center gap-[50px] items-center py-[100px] px-[50px] rounded-3xl z-[21] top-[50%] left-[50%] absolute translate-x-[-50%] translate-y-[-50%]">
              <BiSolidMessageSquareError className="text-[150px]" />
              <div className="text-center">
                <p className="text-[18px] font-[600]">
                  We are having trouble to get your credential
                </p>
                <p className="text-[18px] font-[600]">
                  Please try to{" "}
                  <a href="/auth/login" className="underline">
                    login
                  </a>{" "}
                  again
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatRoom;
