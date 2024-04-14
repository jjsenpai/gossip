/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef, useState, useEffect, Fragment } from "react";
import {
    query,
    collection,
    doc,
    updateDoc,
    limitToLast,
    orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../../store";
import { useCollectionQuery, useUsersInfo } from "../hooks/allHooks";
import InfiniteScroll from "react-infinite-scroll-component";
import Spin from "react-cssfx-loading/src/Spin";
import { ConversationInfo, MessageItem } from "../../types";
import { DEFAULT_AVATAR } from "../../constants";
import { ViewGroup } from "../group/groupComponents";
import { LeftMessage, RightMessage } from "../message/messageComponents";
import Skeleton from "../Skeleton";

interface ChatHeaderProps {
    conversation: ConversationInfo;
}

interface ChatViewProps {
    conversation: ConversationInfo;
    inputSectionOffset: number;
}

interface AvatarFromIdProps {
    uid: string;
    size?: number;
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
                                    src={filtered?.[0]?.data()?.photoURL}
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
                                                src={
                                                    filtered?.[0]?.data()
                                                        ?.photoURL
                                                }
                                                alt=""
                                            />
                                            <img
                                                className={`border-dark absolute bottom-0 left-0 z-[1] h-7 w-7 flex-shrink-0 rounded-full border-2 object-cover transition duration-300`}
                                                src={
                                                    filtered?.[1]?.data()
                                                        ?.photoURL
                                                }
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
                    </>
                )}
            </div>
            {isGroupMembersOpened && (
                <ViewGroup
                    setIsOpened={setIsGroupMembersOpened}
                    conversation={conversation}
                />
            )}
        </>
    );
};

export const ChatView: FC<ChatViewProps> = ({
    conversation,
    inputSectionOffset,
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
                                <RightMessage message={item} />
                            ) : (
                                <LeftMessage
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
            src={data?.[0].data()?.photoURL}
        ></img>
    );
};
