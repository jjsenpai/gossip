import { List } from "./list/list";
import Modal from "../modal/modal";
import { User } from "../user/user";
import { useEffect, useState } from "react";
import { Chats } from "./chats/Chats";
import { db } from "../../firebase";
import { useStore,messageType, roomDetailsType, messageContent } from "../../store";
import { collection, getDocs } from "firebase/firestore";

export const Main = () => {
  const { roomDetails,setRoomDetails } = useStore();
  const [index,setIndex]=useState<number>(0);
  const [messages,setMessages] = useState<messageType[]>([]);
  const [show,setShow] =useState(false);
  
   const toggalModal = () => {
    setShow(!show);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const changeRoom = (newIndex:number)=> setIndex(newIndex);

  useEffect(() => {
     if(roomDetails.length > index){
         const firstRoom = roomDetails[index];
         setMessages(firstRoom.messages || []);
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, roomDetails]);
  
    useEffect(() => {
      const fetchRooms = async () => {
        try {
            const roomCollection = await getDocs(collection(db, 'rooms'));
            const rooms: roomDetailsType[] = [];
    
            for (const doc of roomCollection.docs) {
                const roomData = doc.data() as roomDetailsType;
                const roomId = doc.id;
                

                const messageCollection = await getDocs(collection(db, 'rooms', roomId, 'messageList'));
                const messages:messageType[] = messageCollection.docs.map((messageDoc) => ({
                     messageId: messageDoc.id,
                    ...messageDoc.data() as messageContent
                }));
    
                const roomWithMessages: roomDetailsType = {
                    roomId,
                    ...roomData,
                    messages
                };
    
                rooms.push(roomWithMessages);
            }
            
            setRoomDetails(rooms);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };
    
    fetchRooms();
  
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  return (
    <>
    <div className="bg-[#f9fafc] w-full mr-[10px] h-[98%] rounded-3xl overflow-clip flex">
      <div className="w-[35%] md:w-[350px]  h-full overflow-clip">
          <List showModal={toggalModal} />
      </div>
      <div className="w-full h-full border"><Chats messages={messages}/></div>
    </div>
     {show && <Modal onClose={toggalModal}><User/></Modal>}
    </>
  );
};
