import { signOut } from "firebase/auth";
import { auth as newauth } from "../firebase";

type LogoutButtonProps = {
  state: boolean;
};

const LogoutButton = ({ state }: LogoutButtonProps) => {
  return (
    state && (
      <button
        onClick={async () => {
          const res = await signOut(newauth);
          window.location.reload();
          console.log({ res });
        }}
      >
        Signout
      </button>
    )
  );
};

export default LogoutButton;
