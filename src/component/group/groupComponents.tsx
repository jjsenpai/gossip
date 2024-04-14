import { FC, useState } from "react";
import { ConversationInfo, SavedUser } from "../../types";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { useCollectionQuery, useUsersInfo } from "../hooks/allHooks";
import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Spin } from "react-cssfx-loading";
import Alert from "../Alert";

interface AddMembersProps {
    conversations: ConversationInfo;
}

export const AddMembers: FC<AddMembersProps> = ({ conversations }) => {
    const { id: conversationId } = useParams();

    const { data, loading, error } = useCollectionQuery(
        `all-users-except-${JSON.stringify(conversations.users)}`,
        query(
            collection(db, "users"),
            where("uid", "not-in", conversations.users.slice(0, 10))
        )
    );

    const handleAddMember = (uid: string) => {
        updateDoc(doc(db, "conversations", conversationId as string), {
            users: arrayUnion(uid),
        });
    };

    if (loading || error)
        return (
            <div className="flex h-80 items-center justify-center">
                <Spin />
            </div>
        );

    return (
        <div className="flex h-80 flex-col items-stretch gap-4 overflow-y-auto overflow-x-hidden py-4">
            {data?.docs
                ?.map((item) => item.data() as SavedUser)
                .map((user) => (
                    <div
                        key={user.uid}
                        className="flex items-center gap-3 px-4"
                    >
                        <img
                            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                            src={user.photoURL}
                            alt=""
                        />
                        <div className="flex-grow">
                            <h1>{user.displayName}</h1>
                        </div>
                        <button onClick={() => handleAddMember(user.uid)}>
                            <i className="bx bx-plus text-2xl"></i>
                        </button>
                    </div>
                ))}
            {data?.empty && <p className="text-center">No more user to add</p>}
        </div>
    );
};

interface AdminProps {
    conversation: ConversationInfo;
}

export const Admin: FC<AdminProps> = ({ conversation }) => {
    const { id: conversationId } = useParams();

    const currentUser = useStore((state) => state.currentUser);

    const { data, loading, error } = useUsersInfo(
        conversation.group?.admins as string[]
    );

    const handleRemoveAdminPosition = (uid: string) => {
        updateDoc(doc(db, "conversations", conversationId as string), {
            "group.admins": arrayRemove(uid),
            "group.groupImage": conversation.group?.groupImage,
            "group.groupName": conversation.group?.groupName,
        });
    };

    if (loading || error)
        return (
            <div className="flex h-80 items-center justify-center">
                <Spin />
            </div>
        );

    return (
        <div className="flex h-80 flex-col items-stretch gap-4 overflow-y-auto overflow-x-hidden py-4">
            {data
                ?.map((item) => item.data() as SavedUser)
                .map((user) => (
                    <div
                        key={user.uid}
                        className="flex items-center gap-3 px-4"
                    >
                        <img
                            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                            src={user.photoURL}
                            alt=""
                        />

                        <div className="flex-grow">
                            <h1>{user.displayName}</h1>
                        </div>

                        {conversation.group?.admins?.includes(
                            currentUser?.uid as string
                        ) &&
                            user.uid !== currentUser?.uid && (
                                <div
                                    className="group relative flex-shrink-0"
                                    tabIndex={0}
                                >
                                    <button>
                                        <i className="bx bx-dots-horizontal-rounded text-2xl"></i>
                                    </button>

                                    <div className="bg-dark-lighten border-dark-lighten invisible absolute top-full right-0 z-[1] flex w-max flex-col items-stretch rounded-lg border py-1 opacity-0 transition-all duration-300 group-focus-within:!visible group-focus-within:!opacity-100">
                                        <button
                                            onClick={() =>
                                                handleRemoveAdminPosition(
                                                    user.uid
                                                )
                                            }
                                            className="bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300 hover:brightness-125"
                                        >
                                            <i className="bx bx-user-x text-2xl"></i>
                                            <span>Remove admin position</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                    </div>
                ))}
        </div>
    );
};

interface MembersProps {
    conversation: ConversationInfo;
}

export const Members: FC<MembersProps> = ({ conversation }) => {
    const { id: conversationId } = useParams();

    const currentUser = useStore((state) => state.currentUser);

    const { data, loading, error } = useUsersInfo(conversation.users);

    const navigate = useNavigate();

    const [isAlertOpened, setIsAlertOpened] = useState(false);
    const [alertText, setAlertText] = useState("");

    const handleRemoveFromGroup = (uid: string) => {
        if (
            conversation.group?.admins.length === 1 &&
            conversation.group.admins[0] === uid
        ) {
            setAlertText("You must set another one to be an admin");
            setIsAlertOpened(true);
        } else {
            updateDoc(doc(db, "conversations", conversationId as string), {
                users: arrayRemove(uid),
                "group.admins": arrayRemove(uid),
                "group.groupImage": conversation.group?.groupImage,
                "group.groupName": conversation.group?.groupName,
            });

            if (currentUser?.uid === uid) {
                navigate("/");
            }
        }
    };

    const handleMakeAdmin = (uid: string) => {
        updateDoc(doc(db, "conversations", conversationId as string), {
            "group.admins": arrayUnion(uid),
            "group.groupImage": conversation.group?.groupImage,
            "group.groupName": conversation.group?.groupName,
        });
        setIsAlertOpened(true);
        setAlertText("Done making an admin");
    };

    if (loading || error)
        return (
            <div className="flex h-80 items-center justify-center">
                <Spin />
            </div>
        );

    return (
        <>
            <div className="flex h-80 flex-col items-stretch gap-4 overflow-y-auto overflow-x-hidden py-4">
                {data
                    ?.map((item) => item.data() as SavedUser)
                    .map((user) => (
                        <div
                            key={user.uid}
                            className="flex items-center gap-3 px-4"
                        >
                            <img
                                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                src={user.photoURL}
                                alt=""
                            />

                            <div className="flex-grow">
                                <h1>{user.displayName}</h1>
                            </div>

                            {conversation.group?.admins?.includes(
                                currentUser?.uid as string
                            ) && (
                                <div
                                    className="group relative flex-shrink-0"
                                    tabIndex={0}
                                >
                                    <button>
                                        <i className="bx bx-dots-horizontal-rounded text-2xl"></i>
                                    </button>

                                    <div className="bg-dark-lighten border-dark-lighten invisible absolute top-full right-0 z-[1] flex w-max flex-col items-stretch rounded-lg border py-1 opacity-0 transition-all duration-300 group-focus-within:!visible group-focus-within:!opacity-100">
                                        {conversation.users.length > 3 && (
                                            <button
                                                onClick={() =>
                                                    handleRemoveFromGroup(
                                                        user.uid
                                                    )
                                                }
                                                className="bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300 hover:brightness-125"
                                            >
                                                <i className="bx bx-user-x text-2xl"></i>
                                                <span>
                                                    {user.uid ===
                                                    currentUser?.uid
                                                        ? "Leave group"
                                                        : "Kick from group"}
                                                </span>
                                            </button>
                                        )}
                                        {user.uid !== currentUser?.uid && (
                                            <button
                                                onClick={() =>
                                                    handleMakeAdmin(user.uid)
                                                }
                                                className="bg-dark-lighten flex items-center gap-1 px-3 py-1 transition duration-300 hover:brightness-125"
                                            >
                                                <i className="bx bx-user-check text-2xl"></i>
                                                <span>Make an admin</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
            </div>

            <Alert
                isOpened={isAlertOpened}
                setIsOpened={setIsAlertOpened}
                text={alertText}
            />
        </>
    );
};

interface ViewGroupProps {
    setIsOpened: (value: boolean) => void;
    conversation: ConversationInfo;
}

export const ViewGroup: FC<ViewGroupProps> = ({
    setIsOpened,
    conversation,
}) => {
    enum Sections {
        members,
        admins,
        addMembers,
    }
    const [selectedSection, setSelectedSection] = useState(Sections.members);

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
                            Group Members
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

                <div className="border-dark-lighten flex items-stretch border-b">
                    <button
                        onClick={() => setSelectedSection(Sections.members)}
                        className={`flex-1 py-2 text-center ${
                            selectedSection === Sections.members
                                ? "bg-dark-lighten"
                                : ""
                        }`}
                    >
                        Members
                    </button>
                    <button
                        onClick={() => setSelectedSection(Sections.admins)}
                        className={`flex-1 py-2 text-center ${
                            selectedSection === Sections.admins
                                ? "bg-dark-lighten"
                                : ""
                        }`}
                    >
                        Admins
                    </button>
                    <button
                        onClick={() => setSelectedSection(Sections.addMembers)}
                        className={`flex-1 py-2 text-center ${
                            selectedSection === Sections.addMembers
                                ? "bg-dark-lighten"
                                : ""
                        }`}
                    >
                        Add members
                    </button>
                </div>

                {selectedSection === Sections.members ? (
                    <Members conversation={conversation} />
                ) : selectedSection === Sections.admins ? (
                    <Admin conversation={conversation} />
                ) : selectedSection === Sections.addMembers ? (
                    <AddMembers conversations={conversation} />
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};
