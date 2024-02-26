import ReactDOM from "react-dom";

export default function Modal({ children, onClose }) {
  return ReactDOM.createPortal(
    <>
      <div className='fixed top-0 left-0 right-0 bottom-0 z-40 backdrop-blur-md bg-white/30'/>
      <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#dbe0e9f5]  rounded-md p-3 z-50 h-[35%] w-[50%]'>
        <button className='absolute text-3xl top-4 right-4 text-gray-600 hover:text-ray-400' onClick={onClose}> X </button>
        {children}
      </div>
    </>,
    document.getElementById('modal-root')
  );
}