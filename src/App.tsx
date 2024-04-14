import { FC, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

import BarWave from "react-cssfx-loading/src/BarWave";
import { onAuthStateChanged } from "firebase/auth";
import { useStore } from "./store";
import { auth, db } from "./firebase";
import PrivateRoute from "./component/PrivateRoute";
import Home from "./pages/home";
import Signin from "./pages/signin";
import Chat from "./pages/chat";

const App: FC = () => {
    const currentUser = useStore((state) => state.currentUser);
    const setCurrentUser = useStore((state) => state.setCurrentUser);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    phoneNumber:
                        user.phoneNumber || user.providerData?.[0]?.phoneNumber,
                });
            } else setCurrentUser(null);
        });
    }, []);

    if (typeof currentUser === "undefined")
        return (
            <div className="flex min-h-screen items-center justify-center">
                <BarWave />
            </div>
        );

    return (
        <Routes>
            <Route
                index
                element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                }
            />
            <Route path="sign-in" element={<Signin />} />
            <Route
                path=":id"
                element={
                    <PrivateRoute>
                        <Chat />
                    </PrivateRoute>
                }
            />
        </Routes>
    );
};

export default App;
