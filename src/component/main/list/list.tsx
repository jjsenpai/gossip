import SearchIcon from "../../../assets/main/search.svg";
export const List = () => {
  return (
    <div className="h-full w-full border py-[30px] px-[30px] relative">
      <div className="relative">
        <input
          placeholder="Search"
          className="w-full pl-[35px] h-[40px] rounded-xl bg-[#dbdcff] placeholder:text-black placeholder:text-[14px] "
        />
        <img
          src={SearchIcon}
          alt="search icon"
          className="absolute top-1/2 transform -translate-y-1/2 left-2 w-5 h-5 text-gray-500"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};