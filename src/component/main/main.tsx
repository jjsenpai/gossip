import { List } from "./list/list";

export const Main = () => {
  return (
    <div className="bg-[#f9fafc] w-full mr-[10px] h-[98%] rounded-3xl overflow-clip flex">
      <div className="w-[35%] md:w-[350px]  h-full overflow-clip">
        <List />
      </div>
      <div className="w-full h-full border">Chat</div>
    </div>
  );
};
