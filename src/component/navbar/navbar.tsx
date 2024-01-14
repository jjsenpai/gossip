import Logo from "../../assets/logo/logo.svg";
import LogoutButton from "../logout-button";
import Message from "../../assets/logo/message.svg";
import Group from "../../assets/logo/group.svg";
import Archive from "../../assets/logo/archive.svg";
import Profile from "../../assets/logo/profile.svg";
import Settings from "../../assets/logo/settings.svg";

export const Navbar = () => {
  const icons = [
    { src: Message, name: "Message" },
    { src: Group, name: "Group" },
    { src: Archive, name: "Archive" },
    { src: Profile, name: "Profile" },
    { src: Settings, name: "Settings" },
  ];
  function renderIcons() {
    return icons.map((Item, index) => (
      <button className="flex items-center align-middle flex-col rounded-xl hover:bg-[#ffffff80] aspect-square w-[100%]">
        <img
          key={index}
          src={Item.src}
          alt={`Icon ${index}`}
          className="w-[30px]"
        />
        <span className="text-white text-center text-xs">{Item.name}</span>
      </button>
    ));
  }

  return (
    <div className="flex flex-col h-full w-full items-center py-[1.5vh] px-[0.5vw] justify-between">
      <img src={Logo} alt="Gossip" className="aspect-square h-[40px]" />

      {renderIcons()}
      <LogoutButton />
    </div>
  );
};
