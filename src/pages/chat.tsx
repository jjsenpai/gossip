import { FC, useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useStore } from "../store";
import { useDocumentQuery } from "../component/hooks/allHooks";
import { db } from "../firebase";
import { ChatHeader, ChatView } from "../component/chats/ChatsComponent";
import InputSection from "../component/Input/InputSection";
import { SideBar } from "../component/home/HomeComponents";
import { ConversationInfo } from "../types";

const Chat: FC = () => {
    const { id } = useParams();

    const { data, loading, error } = useDocumentQuery(
        `conversation-${id}`,
        doc(db, "conversations", id as string)
    );

    const conversation = data?.data() as ConversationInfo;

    const currentUser = useStore((state) => state.currentUser);

    const [inputSectionOffset, setInputSectionOffset] = useState(0);

    useEffect(() => {
        if (conversation?.theme)
            document.body.style.setProperty(
                "--primary-color",
                conversation.theme
            );
    }, [conversation?.theme || ""]);

    return (
        <div className="flex">
            <SideBar />

            <div className="flex h-screen flex-grow flex-col items-stretch">
                {loading ? (
                    <>
                        <div className="border-dark-lighten h-20 border-b"></div>
                        <div className="flex-grow"></div>
                        <InputSection disabled />
                    </>
                ) : !conversation ||
                  error ||
                  !conversation.users.includes(currentUser?.uid as string) ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
                        <img
                            className="h-32 w-32 object-cover"
                            src="/error.svg"
                            alt=""
                        />
                        <p className="text-center text-lg">
                            Conversation does not exists
                        </p>
                    </div>
                ) : (
                    <>
                        <ChatHeader conversation={conversation} />
                        <ChatView
                            inputSectionOffset={inputSectionOffset}
                            conversation={conversation}
                        />
                        <InputSection
                            setInputSectionOffset={setInputSectionOffset}
                            disabled={false}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;
