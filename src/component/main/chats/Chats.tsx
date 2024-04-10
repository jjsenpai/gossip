import { messageType } from '../../../store';

type ChatsProps = {
  messages: messageType[];
}

export function Chats({ messages }: ChatsProps) {

  return (
    <div>
      {messages.length ? messages.map((message: messageType) => (
        <div key={message.messageId} className="flex items-start mb-4 mt-5">
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{message.sentBy}</div>
            <div className="mt-1 text-sm text-gray-700">{message.message}</div>
          </div>
        </div>
      )):<div>No messages available for this room.</div>}
    </div>
  );
}

