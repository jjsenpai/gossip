import { signOut } from "firebase/auth";
import { auth as newauth } from "../firebase";
import Signout from "../assets/logo/signout.svg";
const LogoutButton = () => {
  return (
    <button
      onClick={async () => {
        const res = await signOut(newauth);
        window.location.reload();
        console.log({ res });
      }}
    >
      <img src={Signout} alt="Logo" className="h-7 w-7" />
    </button>
  );
};

export default LogoutButton;
