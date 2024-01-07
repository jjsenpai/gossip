import { useAuth } from "../contexts/authContext";

const GoogleButton = () => {
  const auth = useAuth();
  return (
    <button
      onClick={() => {
        if (auth.login) auth.login();
      }}
    >
      SigninwithGOogle
    </button>
  );
};

export default GoogleButton;
