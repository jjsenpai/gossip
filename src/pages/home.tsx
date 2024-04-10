import { Main } from "../component/main/main";
import { Navbar } from "../component/navbar/navbar";

export const Home = () => {
  
  return (
    <div className="h-[100vh] w-[100vw] bg-[#202022] flex">
      <div className="w-[70px] max-w-[70px] h-full">
        <Navbar />
      </div>
      <div className="w-full h-full flex items-center ">
        <Main />
      </div>
    </div>
  );
};
