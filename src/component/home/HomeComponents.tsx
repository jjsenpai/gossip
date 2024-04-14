import { FC, useState } from "react";
import {
    useCollectionQuery,
    useLastMessage,
    useUsersInfo,
} from "../hooks/allHooks";
import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { Spin } from "react-cssfx-loading";
import Skeleton from "../Skeleton";
import { signOut } from "firebase/auth";
import { ConversationInfo } from "../../types";
import { DEFAULT_AVATAR, THEMES } from "../../constants";
import ClickAwayListener from "../ClickAwayListener";

interface CreateConversationProps {
    setIsOpened: (value: boolean) => void;
}

export const CreateConversation: FC<CreateConversationProps> = ({
    setIsOpened,
}) => {
    const { data, error, loading } = useCollectionQuery(
        "all-users",
        collection(db, "users")
    );

    const [isCreating, setIsCreating] = useState(false);

    const currentUser = useStore((state) => state.currentUser);

    const [selected, setSelected] = useState<string[]>([]);

    const navigate = useNavigate();

    const handleToggle = (uid: string) => {
        if (selected.includes(uid)) {
            setSelected(selected.filter((item) => item !== uid));
        } else {
            setSelected([...selected, uid]);
        }
    };

    const handleCreateConversation = async () => {
        setIsCreating(true);

        const sorted = [...selected, currentUser?.uid].sort();

        const q = query(
            collection(db, "conversations"),
            where("users", "==", sorted)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const created = await addDoc(collection(db, "conversations"), {
                users: sorted,
                group:
                    sorted.length > 2
                        ? {
                              admins: [currentUser?.uid],
                              groupName: null,
                              groupImage: null,
                          }
                        : {},
                updatedAt: serverTimestamp(),
                seen: {},
                theme: THEMES[0],
            });

            setIsCreating(false);

            setIsOpened(false);

            navigate(`/${created.id}`);
        } else {
            setIsOpened(false);

            navigate(`/${querySnapshot.docs[0].id}`);

            setIsCreating(false);
        }
    };

    return (
        <div
            onClick={() => setIsOpened(false)}
            className="fixed top-0 left-0 z-20 flex h-full w-full items-center justify-center bg-[#00000080]"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-dark mx-3 w-full max-w-[500px] overflow-hidden rounded-lg"
            >
                <div className="border-dark-lighten flex items-center justify-between border-b py-3 px-3">
                    <div className="flex-1"></div>
                    <div className="flex flex-1 items-center justify-center">
                        <h1 className="whitespace-nowrap text-center text-2xl">
                            New conversation
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
                {loading ? (
                    <div className="flex h-96 items-center justify-center">
                        <Spin color="#0D90F3" />
                    </div>
                ) : error ? (
                    <div className="flex h-96 items-center justify-center">
                        <p className="text-center">Something went wrong</p>
                    </div>
                ) : (
                    <>
                        {isCreating && (
                            <div className="absolute top-0 left-0 z-20 flex h-full w-full items-center justify-center bg-[#00000080]">
                                <Spin color="#0D90F3" />
                            </div>
                        )}
                        <div className="flex h-96 flex-col items-stretch gap-2 overflow-y-auto py-2">
                            {data?.docs
                                .filter(
                                    (doc) => doc.data().uid !== currentUser?.uid
                                )
                                .map((doc) => (
                                    <div
                                        key={doc.data().uid}
                                        onClick={() =>
                                            handleToggle(doc.data().uid)
                                        }
                                        className="hover:bg-dark-lighten flex cursor-pointer items-center gap-2 px-5 py-2 transition"
                                    >
                                        <input
                                            className="flex-shrink-0 cursor-pointer"
                                            type="checkbox"
                                            checked={selected.includes(
                                                doc.data().uid
                                            )}
                                            readOnly
                                        />
                                        <img
                                            className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                            src={doc.data().photoURL}
                                            alt=""
                                        />
                                        <p>{doc.data().displayName}</p>
                                    </div>
                                ))}
                        </div>
                        <div className="border-dark-lighten flex justify-end border-t p-3">
                            <button
                                disabled={selected.length === 0}
                                onClick={handleCreateConversation}
                                className="bg-dark-lighten rounded-lg py-2 px-3 transition duration-300 hover:brightness-125 disabled:!brightness-[80%]"
                            >
                                Start conversation
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

interface SelectConversationProps {
    conversation: ConversationInfo;
    conversationId: string;
}

export const SelectConversation: FC<SelectConversationProps> = ({
    conversation,
    conversationId,
}) => {
    const { data: users, loading } = useUsersInfo(conversation.users);
    const currentUser = useStore((state) => state.currentUser);

    const filtered = users?.filter((user) => user.id !== currentUser?.uid);

    const { id } = useParams();

    const {
        data: lastMessage,
        loading: lastMessageLoading,
        error: lastMessageError,
    } = useLastMessage(conversationId);

    if (loading)
        return (
            <div className="flex items-stretch gap-2 py-2 px-5">
                <Skeleton className="h-14 w-14 flex-shrink-0 rounded-full" />
                <div className="flex flex-grow flex-col items-start gap-2 py-2">
                    <Skeleton className="w-1/2 flex-grow" />
                    <Skeleton className="w-2/3 flex-grow" />
                </div>
            </div>
        );

    if (conversation.users.length === 2)
        return (
            <Link
                to={`/${conversationId}`}
                className={`hover:bg-dark-lighten relative flex items-stretch gap-2 py-2 px-5 transition duration-300 ${
                    conversationId === id ? "!bg-[#263342]" : ""
                }`}
            >
                <img
                    className="h-14 w-14 flex-shrink-0 rounded-full object-cover"
                    src={filtered?.[0]?.data()?.photoURL}
                    alt=""
                />
                <div className="flex flex-grow flex-col items-start gap-1 py-1">
                    <p className="max-w-[240px] flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                        {filtered?.[0].data()?.displayName}
                    </p>
                    {lastMessageLoading ? (
                        <Skeleton className="w-2/3 flex-grow" />
                    ) : (
                        <p className="max-w-[240px] flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-400">
                            {lastMessage?.message}
                        </p>
                    )}
                </div>
                {!lastMessageLoading && (
                    <>
                        {lastMessage?.lastMessageId !== null &&
                            lastMessage?.lastMessageId !==
                                conversation.seen[
                                    currentUser?.uid as string
                                ] && (
                                <div className="bg-primary absolute top-1/2 right-4 h-[10px] w-[10px] -translate-y-1/2 rounded-full"></div>
                            )}
                    </>
                )}
            </Link>
        );

    return (
        <Link
            to={`/${conversationId}`}
            className={`hover:bg-dark-lighten group relative flex items-stretch gap-2 py-2 px-5 transition duration-300 ${
                conversationId === id ? "!bg-[#252F3C]" : ""
            }`}
        >
            {conversation?.group?.groupImage ? (
                <img
                    className="h-14 w-14 flex-shrink-0 rounded-full object-cover"
                    src={conversation.group.groupImage}
                    alt=""
                />
            ) : (
                <div className="relative h-14 w-14">
                    <img
                        className="absolute top-0 right-0 h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        src={filtered?.[0]?.data()?.photoURL}
                        alt=""
                    />
                    <img
                        className={`border-dark group-hover:border-dark-lighten absolute bottom-0 left-0 z-[1] h-10 w-10 flex-shrink-0 rounded-full border-[3px] object-cover transition duration-300 ${
                            conversationId === id ? "!border-[#252F3C]" : ""
                        }`}
                        src={filtered?.[1]?.data()?.photoURL}
                        alt=""
                    />
                </div>
            )}
            <div className="flex flex-grow flex-col items-start gap-1 py-1">
                <p className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {conversation?.group?.groupName ||
                        filtered
                            ?.map((user) => user.data()?.displayName)
                            .slice(0, 3)
                            .join(", ")}
                </p>
                {lastMessageLoading ? (
                    <Skeleton className="w-2/3 flex-grow" />
                ) : (
                    <p className="max-w-[240px] flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-400">
                        {lastMessage?.message}
                    </p>
                )}
            </div>
            {!lastMessageLoading && (
                <>
                    {lastMessage?.lastMessageId !== null &&
                        lastMessage?.lastMessageId !==
                            conversation.seen[currentUser?.uid as string] && (
                            <div className="bg-primary absolute top-1/2 right-4 h-[10px] w-[10px] -translate-y-1/2 rounded-full"></div>
                        )}
                </>
            )}
        </Link>
    );
};

export const SideBar: FC = () => {
    const currentUser = useStore((state) => state.currentUser);

    const [isDropdownOpened, setIsDropdownOpened] = useState(false);
    const [createConversationOpened, setCreateConversationOpened] =
        useState(false);
    const [isUserInfoOpened, setIsUserInfoOpened] = useState(false);

    const { data, error, loading } = useCollectionQuery(
        "conversations",
        query(
            collection(db, "conversations"),
            orderBy("updatedAt", "desc"),
            where("users", "array-contains", currentUser?.uid)
        )
    );

    const location = useLocation();

    return (
        <>
            <div
                className={`border-dark-lighten h-screen flex-shrink-0 overflow-y-auto overflow-x-hidden border-r ${
                    location.pathname !== "/"
                        ? "hidden w-[350px] md:!block"
                        : "w-full md:!w-[350px]"
                }`}
            >
                <div className="border-dark-lighten flex h-20 items-center justify-between border-b px-6">
                    <Link to="/" className="flex items-center gap-1">
                        <img className="h-8 w-8" src="/gossip.svg" alt="" />
                        <h1 className="text-xl">ossip</h1>
                    </Link>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCreateConversationOpened(true)}
                            className="bg-dark-lighten h-8 w-8 rounded-full"
                        >
                            <i className="bx bxs-edit text-xl"></i>
                        </button>

                        <ClickAwayListener
                            onClickAway={() => setIsDropdownOpened(false)}
                        >
                            {(ref) => (
                                <div ref={ref} className="relative z-10">
                                    <img
                                        onClick={() =>
                                            setIsDropdownOpened((prev) => !prev)
                                        }
                                        className="h-8 w-8 cursor-pointer rounded-full object-cover"
                                        src={
                                            currentUser?.photoURL
                                                ? currentUser.photoURL
                                                : DEFAULT_AVATAR
                                        }
                                        alt=""
                                    />

                                    <div
                                        className={`border-dark-lighten bg-dark absolute top-full right-0 flex w-max origin-top-right flex-col items-stretch overflow-hidden rounded-md border py-1 shadow-lg transition-all duration-200 ${
                                            isDropdownOpened
                                                ? "visible scale-100 opacity-100"
                                                : "invisible scale-0 opacity-0"
                                        }`}
                                    >
                                        <button
                                            onClick={() => {
                                                setIsUserInfoOpened(true);
                                                setIsDropdownOpened(false);
                                            }}
                                            className="hover:bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300"
                                        >
                                            <i className="bx bxs-user text-xl"></i>
                                            <span className="whitespace-nowrap">
                                                Profile
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => signOut(auth)}
                                            className="hover:bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300"
                                        >
                                            <i className="bx bx-log-out text-xl"></i>
                                            <span className="whitespace-nowrap">
                                                Sign Out
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </ClickAwayListener>
                    </div>
                </div>

                {loading ? (
                    <div className="my-6 flex justify-center">
                        <Spin />
                    </div>
                ) : error ? (
                    <div className="my-6 flex justify-center">
                        <p className="text-center">Something went wrong</p>
                    </div>
                ) : data?.empty ? (
                    <div className="my-6 flex flex-col items-center justify-center">
                        <p className="text-center">No conversation found</p>
                        <button
                            onClick={() => setCreateConversationOpened(true)}
                            className="text-primary text-center"
                        >
                            Create one
                        </button>
                    </div>
                ) : (
                    <div>
                        {data?.docs.map((item) => (
                            <SelectConversation
                                key={item.id}
                                conversation={item.data() as ConversationInfo}
                                conversationId={item.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {createConversationOpened && (
                <CreateConversation setIsOpened={setCreateConversationOpened} />
            )}

            <UserInfo
                isOpened={isUserInfoOpened}
                setIsOpened={setIsUserInfoOpened}
            />
        </>
    );
};

interface UserInfoProps {
    isOpened: boolean;
    setIsOpened: (value: boolean) => void;
}

export const UserInfo: FC<UserInfoProps> = ({ isOpened, setIsOpened }) => {
    const currentUser = useStore((state) => state.currentUser);

    return (
        <div
            onClick={() => setIsOpened(false)}
            className={`fixed top-0 left-0 z-20 flex h-full w-full items-center justify-center bg-[#00000080] transition-all duration-300 ${
                isOpened ? "visible opacity-100" : "invisible opacity-0"
            }`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-dark mx-2 w-full max-w-[400px] rounded-lg"
            >
                <div className="border-dark-lighten flex items-center justify-between border-b py-3 px-3">
                    <div className="flex-1"></div>
                    <div className="flex flex-1 items-center justify-center">
                        <h1 className="whitespace-nowrap text-center text-2xl">
                            Your Profile
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
                <div className="p-6">
                    <div className="flex gap-4">
                        <img
                            className="h-16 w-16 rounded-full object-cover"
                            src={currentUser?.photoURL as string}
                            alt=""
                        />
                        <div>
                            <h1 className="text-xl">
                                {currentUser?.displayName}
                            </h1>
                            <p>ID: {currentUser?.uid}</p>
                            <p>Email: {currentUser?.email || "None"}</p>
                            <p>
                                Phone Number:{" "}
                                {currentUser?.phoneNumber || "None"}
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-gray-400">
                        Change your google / facebook avatar or username to
                        update it here
                    </p>
                </div>
            </div>
        </div>
    );
};
