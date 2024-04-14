import {
    ChangeEvent,
    FC,
    FormEvent,
    useRef,
    useState,
    useEffect,
    Fragment,
} from "react";
import {
    query,
    collection,
    arrayRemove,
    doc,
    updateDoc,
    limitToLast,
    orderBy,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useStore } from "../../store";
import { useCollectionQuery, useUsersInfo } from "../hooks/allHooks";
import { Skeleton } from "../main/list/chatskeleton";
import { ViewMedia } from "./Media";
import InfiniteScroll from "react-infinite-scroll-component";
import Spin from "react-cssfx-loading/src/Spin";
import { formatFileName } from "../utils";

interface ChatHeaderProps {
    conversation: ConversationInfo;
}

interface ChatViewProps {
    conversation: ConversationInfo;
    inputSectionOffset: number;
    replyInfo: any;
    setReplyInfo: (value: any) => void;
}

interface ConversationConfigProps {
    conversation: ConversationInfo;
    setIsOpened: (value: boolean) => void;
    setMediaViewOpened: (value: boolean) => void;
}

interface AvatarFromIdProps {
    uid: string;
    size?: number;
}

interface ReplyBadgeProps {
    messageId: string;
}

export const ChatHeader: FC<ChatHeaderProps> = ({ conversation }) => {
    const { data: users, loading } = useUsersInfo(conversation.users);
    const currentUser = useStore((state) => state.currentUser);

    const filtered = users?.filter((user) => user.id !== currentUser?.uid);

    const [isConversationSettingsOpened, setIsConversationSettingsOpened] =
        useState(false);
    const [isGroupMembersOpened, setIsGroupMembersOpened] = useState(false);
    const [isViewMediaOpened, setIsViewMediaOpened] = useState(false);

    return (
        <>
            <div className="border-dark-lighten flex h-20 items-center justify-between border-b px-5">
                <div className="flex flex-grow items-center gap-3">
                    <Link to="/" className="md:hidden">
                        <i className="bx bxs-chevron-left text-primary text-3xl"></i>
                    </Link>
                    {loading ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
                    ) : (
                        <>
                            {conversation.users.length === 2 ? (
                                <img
                                    className="h-10 w-10 rounded-full"
                                    src={IMAGE_PROXY(
                                        filtered?.[0]?.data()?.photoURL
                                    )}
                                    alt=""
                                />
                            ) : (
                                <>
                                    {conversation?.group?.groupImage ? (
                                        <img
                                            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                            src={conversation.group.groupImage}
                                            alt=""
                                        />
                                    ) : (
                                        <div className="relative h-10 w-10 flex-shrink-0">
                                            <img
                                                className="absolute top-0 right-0 h-7 w-7 flex-shrink-0 rounded-full object-cover"
                                                src={IMAGE_PROXY(
                                                    filtered?.[0]?.data()
                                                        ?.photoURL
                                                )}
                                                alt=""
                                            />
                                            <img
                                                className={`border-dark absolute bottom-0 left-0 z-[1] h-7 w-7 flex-shrink-0 rounded-full border-2 object-cover transition duration-300`}
                                                src={IMAGE_PROXY(
                                                    filtered?.[1]?.data()
                                                        ?.photoURL
                                                )}
                                                alt=""
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {loading ? (
                        <Skeleton className="h-6 w-1/4" />
                    ) : (
                        <p>
                            {conversation.users.length > 2 &&
                            conversation?.group?.groupName
                                ? conversation.group.groupName
                                : filtered
                                      ?.map((user) => user.data()?.displayName)
                                      .slice(0, 3)
                                      .join(", ")}
                        </p>
                    )}
                </div>

                {!loading && (
                    <>
                        {conversation.users.length > 2 && (
                            <button
                                onClick={() => setIsGroupMembersOpened(true)}
                            >
                                <i className="bx bxs-group text-primary text-2xl"></i>
                            </button>
                        )}

                        <button
                            onClick={() =>
                                setIsConversationSettingsOpened(true)
                            }
                        >
                            <i className="bx bxs-info-circle text-primary text-2xl"></i>
                        </button>
                    </>
                )}
            </div>

            {isConversationSettingsOpened && (
                <ConversationSettings
                    setIsOpened={setIsConversationSettingsOpened}
                    conversation={conversation}
                    setMediaViewOpened={setIsViewMediaOpened}
                />
            )}

            {isGroupMembersOpened && (
                <ViewGroup
                    setIsOpened={setIsGroupMembersOpened}
                    conversation={conversation}
                />
            )}
            {isViewMediaOpened && (
                <ViewMedia setIsOpened={setIsViewMediaOpened} />
            )}
        </>
    );
};

export const ChatView: FC<ChatViewProps> = ({
    conversation,
    inputSectionOffset,
    replyInfo,
    setReplyInfo,
}) => {
    const { id: conversationId } = useParams();

    const currentUser = useStore((state) => state.currentUser);

    const scrollBottomRef = useRef<HTMLDivElement>(null);

    const [limitCount, setLimitCount] = useState(10);

    const { data, loading, error } = useCollectionQuery(
        `conversation-data-${conversationId}-${limitCount}`,
        query(
            collection(
                db,
                "conversations",
                conversationId as string,
                "messages"
            ),
            orderBy("createdAt"),
            limitToLast(limitCount)
        )
    );

    const dataRef = useRef(data);
    const conversationIdRef = useRef(conversationId);
    const isWindowFocus = useRef(true);

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    useEffect(() => {
        if (isWindowFocus.current) updateSeenStatus();

        scrollBottomRef.current?.scrollIntoView();

        setTimeout(() => {
            scrollBottomRef.current?.scrollIntoView();
        }, 100);
    }, [data?.docs?.slice(-1)?.[0]?.id || ""]);

    const updateSeenStatus = () => {
        if (dataRef.current?.empty) return;

        const lastDoc = dataRef.current?.docs?.slice(-1)?.[0];

        if (!lastDoc) return;

        updateDoc(
            doc(db, "conversations", conversationIdRef.current as string),
            {
                [`seen.${currentUser?.uid}`]: lastDoc.id,
            }
        );
    };

    useEffect(() => {
        const focusHandler = () => {
            isWindowFocus.current = true;

            updateSeenStatus();
        };

        const blurHandler = () => {
            isWindowFocus.current = false;
        };

        addEventListener("focus", focusHandler);
        addEventListener("blur", blurHandler);

        return () => {
            removeEventListener("focus", focusHandler);
            removeEventListener("blur", blurHandler);
        };
    }, []);

    if (loading)
        return (
            <div className="flex flex-grow items-center justify-center">
                <Spin />
            </div>
        );

    if (error)
        return (
            <div className="flex-grow">
                <p className="mt-4 text-center text-gray-400">
                    Something went wrong
                </p>
            </div>
        );

    if (data?.empty)
        return (
            <div className="flex-grow">
                <p className="mt-4 text-center text-gray-400">
                    No message recently. Start chatting now.
                </p>
            </div>
        );

    return (
        <InfiniteScroll
            dataLength={data?.size as number}
            next={() => setLimitCount((prev) => prev + 10)}
            inverse
            hasMore={(data?.size as number) >= limitCount}
            loader={
                <div className="flex justify-center py-3">
                    <Spin />
                </div>
            }
            style={{ display: "flex", flexDirection: "column-reverse" }}
            height={`calc(100vh - ${144 + inputSectionOffset}px)`}
        >
            <div className="flex flex-col items-stretch gap-3 pt-10 pb-1">
                {data?.docs
                    .map(
                        (doc) => ({ id: doc.id, ...doc.data() } as MessageItem)
                    )
                    .map((item, index) => (
                        <Fragment key={item.id}>
                            {item.sender === currentUser?.uid ? (
                                <RightMessage
                                    replyInfo={replyInfo}
                                    setReplyInfo={setReplyInfo}
                                    message={item}
                                />
                            ) : (
                                <LeftMessage
                                    replyInfo={replyInfo}
                                    setReplyInfo={setReplyInfo}
                                    message={item}
                                    index={index}
                                    docs={data?.docs}
                                    conversation={conversation}
                                />
                            )}
                            {Object.entries(conversation.seen).filter(
                                ([key, value]) =>
                                    key !== currentUser?.uid &&
                                    value === item.id
                            ).length > 0 && (
                                <div className="flex justify-end gap-[1px] px-8">
                                    {Object.entries(conversation.seen)
                                        .filter(
                                            ([key, value]) =>
                                                key !== currentUser?.uid &&
                                                value === item.id
                                        )
                                        .map(([key, value]) => (
                                            <AvatarFromId
                                                key={key}
                                                uid={key}
                                                size={14}
                                            />
                                        ))}
                                </div>
                            )}
                        </Fragment>
                    ))}
                <div ref={scrollBottomRef}></div>
            </div>
        </InfiniteScroll>
    );
};

export const ConversationSettings: FC<ConversationConfigProps> = ({
    conversation,
    setIsOpened,
    setMediaViewOpened,
}) => {
    const { id: conversationId } = useParams();

    const currentUser = useStore((state) => state.currentUser);

    const navigate = useNavigate();

    const [isChangeChatNameOpened, setIsChangeChatNameOpened] = useState(false);
    const [chatNameInputValue, setChatNameInputValue] = useState(
        conversation?.group?.groupName || ""
    );

    const [isChangeThemeOpened, setIsChangeThemeOpened] = useState(false);

    const [isAlertOpened, setIsAlertOpened] = useState(false);
    const [alertText, setAlertText] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!chatNameInputValue.trim()) return;
        setIsOpened(false);
        updateDoc(doc(db, "conversations", conversationId as string), {
            "group.groupName": chatNameInputValue.trim(),
        });
    };

    const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image")) {
            setAlertText("File is not an image");
            setIsAlertOpened(true);
            return;
        }

        const FIVE_MB = 1024 * 1024 * 5;

        if (file.size > FIVE_MB) {
            setAlertText("Max image size is 20MB");
            setIsAlertOpened(true);
            return;
        }

        setIsOpened(false);

        const fileReference = ref(storage, formatFileName(file.name));

        await uploadBytes(fileReference, file);

        const downloadURL = await getDownloadURL(fileReference);

        updateDoc(doc(db, "conversations", conversationId as string), {
            "group.groupImage": downloadURL,
        });
    };

    const changeTheme = (value: string) => {
        updateDoc(doc(db, "conversations", conversationId as string), {
            theme: value,
        });
    };

    const leaveGroup = () => {
        updateDoc(doc(db, "conversations", conversationId as string), {
            users: arrayRemove(currentUser?.uid as string),
            "group.admins": arrayRemove(currentUser?.uid as string),
            "group.groupImage": conversation.group?.groupImage,
            "group.groupName": conversation.group?.groupName,
        });

        navigate("/");
    };

    return (
        <div
            onClick={() => setIsOpened(false)}
            className={`animate-fade-in fixed top-0 left-0 z-20 flex h-full w-full items-center justify-center bg-[#00000080] transition-all duration-300`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-dark mx-2 w-full max-w-[500px] rounded-lg"
            >
                <div className="border-dark-lighten flex items-center justify-between border-b py-3 px-3">
                    <div className="flex-1"></div>
                    <div className="flex flex-1 items-center justify-center">
                        <h1 className="whitespace-nowrap text-center text-2xl">
                            Conversation settings
                        </h1>
                    </div>
                    <div className="flex flex-1 items-center justify-end">
                        <button
                            onClick={() => setIsOpened(false)}
                            className="bg-dark-lighten flex h-8 w-8 items-center justify-center rounded-full"
                        >
                            <i className="bx bx-x text-2xl"></i>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-stretch p-3">
                    {conversation.users.length > 2 && (
                        <>
                            <button
                                onClick={() =>
                                    setIsChangeChatNameOpened((prev) => !prev)
                                }
                                className="bg-dark flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition duration-300 hover:brightness-125"
                            >
                                <div className="flex items-center gap-3">
                                    <i className="bx bx-edit-alt text-2xl"></i>
                                    <span>Change chat name</span>
                                </div>

                                <i
                                    className={`bx bx-chevron-down text-3xl ${
                                        isChangeChatNameOpened
                                            ? "rotate-180"
                                            : ""
                                    }`}
                                ></i>
                            </button>
                            {isChangeChatNameOpened && (
                                <form
                                    onSubmit={handleFormSubmit}
                                    className="my-2 flex gap-3"
                                >
                                    <div className="flex-grow">
                                        <input
                                            value={chatNameInputValue}
                                            onChange={(e) =>
                                                setChatNameInputValue(
                                                    e.target.value
                                                )
                                            }
                                            className="border-dark-lighten bg-dark h-full w-full rounded-lg border p-2 outline-none transition duration-300 focus:border-gray-500"
                                            type="text"
                                            placeholder="Chat name"
                                        />
                                    </div>
                                    <button className="bg-primary flex-shrink-0 rounded px-3 transition duration-300 hover:brightness-110">
                                        Change
                                    </button>
                                </form>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-dark flex items-center gap-3 rounded-lg px-3 py-2 transition duration-300 hover:brightness-125"
                            >
                                <i className="bx bx-image-alt text-2xl"></i>
                                <span>Change group photo</span>
                            </button>

                            <input
                                hidden
                                className="hidden"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileInputChange}
                            />

                            <Alert
                                isOpened={isAlertOpened}
                                setIsOpened={setIsAlertOpened}
                                text={alertText}
                                isError
                            />
                        </>
                    )}
                    <button
                        onClick={() => setIsChangeThemeOpened((prev) => !prev)}
                        className="bg-dark flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition duration-300 hover:brightness-125"
                    >
                        <div className="flex items-center gap-3">
                            <i className="bx bx-palette text-2xl"></i>
                            <span>Change theme</span>
                        </div>

                        <i
                            className={`bx bx-chevron-down text-3xl ${
                                isChangeThemeOpened ? "rotate-180" : ""
                            }`}
                        ></i>
                    </button>

                    {isChangeThemeOpened && (
                        <div className="flex flex-wrap gap-3 p-4">
                            {THEMES.map((theme) => (
                                <div
                                    key={theme}
                                    style={{ background: theme }}
                                    onClick={() => changeTheme(theme)}
                                    className={`h-14 w-14 cursor-pointer rounded-full ${
                                        conversation.theme === theme
                                            ? "check-overlay"
                                            : ""
                                    }`}
                                ></div>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setIsOpened(false);
                            setMediaViewOpened(true);
                        }}
                        className="bg-dark flex items-center gap-3 rounded-lg px-3 py-2 transition duration-300 hover:brightness-125"
                    >
                        <i className="bx bxs-file text-2xl"></i>
                        <span>View images & files</span>
                    </button>

                    {conversation.users.length > 2 && (
                        <button
                            onClick={() => leaveGroup()}
                            className="bg-dark flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition duration-300 hover:brightness-125"
                        >
                            <div className="flex items-center gap-3">
                                <i className="bx bx-log-out text-2xl"></i>
                                <span>Leave group</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AvatarFromId: FC<AvatarFromIdProps> = ({ uid, size = 30 }) => {
    const { data, loading, error } = useUsersInfo([uid]);

    if (loading)
        return (
            <Skeleton
                className="rounded-full"
                style={{ width: size, height: size }}
            ></Skeleton>
        );

    if (error)
        return (
            <img
                src={DEFAULT_AVATAR}
                className="rounded-full"
                style={{ width: size, height: size }}
            />
        );

    return (
        <img
            title={data?.[0].data()?.displayName}
            style={{ width: size, height: size }}
            className="rounded-full object-cover"
            src={IMAGE_PROXY(data?.[0].data()?.photoURL)}
        ></img>
    );
};

export const ReplyBadge: FC<ReplyBadgeProps> = ({ messageId }) => {
    const { id: conversationId } = useParams();

    const [isAlertOpened, setIsAlertOpened] = useState(false);

    const { data, loading, error } = useDocumentQuery(
        `message-${messageId}`,
        doc(
            db,
            "conversations",
            conversationId as string,
            "messages",
            messageId
        )
    );

    if (loading || error)
        return <div className="h-10 w-20 rounded-lg bg-[#4E4F50]"></div>;

    return (
        <>
            <div
                onClick={() => {
                    const el = document.querySelector(`#message-${messageId}`);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    else setIsAlertOpened(true);
                }}
                className="cursor-pointer rounded-lg bg-[#4E4F50] p-2 opacity-60"
            >
                {data?.data()?.type === "text" ? (
                    <p>{data?.data()?.content}</p>
                ) : data?.data()?.type === "image" ? (
                    "An image"
                ) : data?.data()?.type === "file" ? (
                    "A file"
                ) : data?.data()?.type === "sticker" ? (
                    "A sticker"
                ) : (
                    "Message has been removed"
                )}
            </div>
            <Alert
                isOpened={isAlertOpened}
                setIsOpened={setIsAlertOpened}
                text="Cannot find your message. Try to scroll up to load more"
            />
        </>
    );
};
