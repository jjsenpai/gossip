import { List } from "./list/list";
import Modal from "../modal/modal";
import { User } from "../user/user";
import { useState } from "react";
export const Main = () => {

  const [show,setShow] =useState(false);
   const toggalModal = () => {
    setShow(!show);
  }
  return (
    <>
    <div className="bg-[#f9fafc] w-full mr-[10px] h-[98%] rounded-3xl overflow-clip flex">
      <div className="w-[35%] md:w-[350px]  h-full overflow-clip">
        <List showModal={toggalModal} />
      </div>
      <div className="w-full h-full border">
         Chat
      </div>
    </div>
     {show && <Modal onClose={toggalModal}><User/></Modal>}
    </>
  );
};
