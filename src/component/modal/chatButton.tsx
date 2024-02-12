export const NewChatButton = ({showModal}) => {
  return (
      <button onClick={showModal} className=" bg-green-500 abo px-5 py-2 text-center rounded-md absolute right-2 bottom-1">
        chat
      </button>
  );
};