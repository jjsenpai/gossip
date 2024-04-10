import { List } from "./list/list";
import Modal from "../modal/modal";
import { User } from "../user/user";
import { useEffect, useState } from "react";
import { Chats } from "./chats/Chats";
import { useStore,messageType } from "../../store";

export const Main = () => {
  const { roomDetails } = useStore();
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
