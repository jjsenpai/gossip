import { List } from "./list/list";
import Modal from "../modal/modal";
import { User } from "../user/user";
import { useState } from "react";



export const Main = () => {
/*   const [index,setIndex]=useState<number>(0);
  const [roomId,setRoomId]=useState<string>('');
  const [messages,setMessages] = useState<messageType[]>([]); */
  const [show,setShow] =useState(false);
  
   const toggalModal = () => {
    setShow(!show);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  /* const changeRoom = (newIndex:number)=> setIndex(newIndex);

  useEffect(() => {
     if(useStore.getState().roomDetails.length > index){
         const firstRoom = useStore.getState().roomDetails[index];
         setMessages(firstRoom.messages || []);
         setRoomId(firstRoom.roomId || '');
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index,  useStore.getState().roomDetails]);
   */
  return (
    <>
    <div className="bg-[#f9fafc] w-full mr-[10px] h-[98%] rounded-3xl overflow-clip flex">
      <div className="w-[35%] md:w-[350px]  h-full overflow-clip">
          <List showModal={toggalModal} />
      </div>
      {/* <div className="w-full h-full border"><ChatsComponent/></div> */}
    </div>
     {show && <Modal onClose={toggalModal}><User/></Modal>}
    </>
  );
};

