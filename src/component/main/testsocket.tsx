import { FormEvent, useMemo, useState } from "react"
import { io } from "socket.io-client";

export default function TestSocket() {
  const socket = useMemo(
    () =>
      io("http://localhost:8000"),
    []
  );
  const [message,setMessage]=useState('');
  const [room,setRoom]=useState('');
  const handleSubmit = (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("send-message", { message, room });
    setMessage("");
    setRoom("");
  };
  return (
    <div className='min-h-screen'>
       <form className='mx-auto my-24 px-12 py-5' onSubmit={handleSubmit}>
          <input type="text my-2 mx-1" value={message} placeholder="enter message" onChange={(e)=>setMessage(e.target.value)}/>
          <input type="textmy-2 mx-1" value={room} placeholder="enter room" onChange={(e)=>setRoom(e.target.value)} />
          <button className='me-3' type="submit">send</button>
       </form>
    </div>
  )
}
