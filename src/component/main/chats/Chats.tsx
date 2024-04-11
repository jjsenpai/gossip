import { useAuth } from '../../../contexts/authContext';
import { messageType } from '../../../store';

type ChatsProps = {
  messages: messageType[];
}

export function Chats({ messages }: ChatsProps) {
  const { currentUser } = useAuth();
  return (
    <div>
      {currentUser && messages.length ? messages.map((message: messageType) => (
        <div key={message.messageId} className={`flex items-start mb-4 mt-5 mx-3 ${currentUser.displayName === message.sentBy ? "justify-end" : "justify-start"}`}>
          <div className={`w-[15%] rounded-lg px-4 py-3 shadow-md ${currentUser.displayName === message.sentBy ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
            <div className="text-sm font-medium">{message.sentBy}</div>
            <div className="mt-1 text-sm">{message.message}</div>
          </div>
        </div>
      )) : <div className="text-center text-gray-500">No messages available for this room.</div>}
    </div>
  );
}

