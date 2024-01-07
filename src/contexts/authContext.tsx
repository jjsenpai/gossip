import {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactNode,
} from "react";
import { auth, provider } from "../firebase";
import { User, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<{
  currentUser?: User | null;
  login?: () => void;
  logout?: () => void;
}>({});

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  async function login() {
    const data = await signInWithPopup(auth, provider);
    console.log(data.user);
    if (data.user) {
      navigate("/home", { replace: true });
    }
  }
  function logout() {
    auth
      .signOut()
      .then(() => {
        return;
      })
      .catch((e) => {
        console.log(e);
      });
  }

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const value = {
    currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
