import BG from "/src/assets/signin/signinbg.jpg";
import { useEffect } from "react";
import {
    GoogleAuthProvider,
    OAuthCredential,
    onAuthStateChanged,
    signInWithCredential,
} from "firebase/auth";
import { Navigate } from "react-router-dom";
import { useStore } from "../store";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useQueryParams } from "../component/hooks/allHooks";
import Gossip from "../assets/logo/Gossip.svg";

type ResponseObject = {
    clientId: string;
    client_id: string;
    credential: string;
};
const GoogleButton = () => {
    async function loginWithToken(token: OAuthCredential) {
        await signInWithCredential(auth, token);
    }

    function handleCallBackResponse(response: ResponseObject) {
        console.log(response);
        if (response) {
            const cred = GoogleAuthProvider.credential(response.credential);
            loginWithToken(cred);
        }
    }
    useEffect(() => {
        const google = window["google"];
        google.accounts.id.initialize({
            client_id:
                "462896730623-iluoff5jna8t5ep6h3aa14qj1a94v5p1.apps.googleusercontent.com",
            callback: handleCallBackResponse,
            cancel_on_tap_outside: false,
        });
        google.accounts.id.renderButton(document.getElementById("signInDiv"), {
            theme: "outline",
            size: "large",
        });
        google.accounts.id.prompt();
    }, []);
    const { redirect } = useQueryParams();
    const currentUser = useStore((state) => state.currentUser);
    if (currentUser) return <Navigate to={redirect || "/"} />;
    return (
        // <button
        //   onClick={() => {
        //     if (auth.login) auth.login();
        //   }}
        // >
        //   SigninwithGOogle
        // </button>
        <div className="App">
            <div id="signInDiv"></div>
        </div>
    );
};

const Signin = () => {
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

    return (
        <div className="flex h-[100vh] w-[100vw]">
            <div className="flex w-[45%] gap-5 flex-col items-center justify-center bg-black text-center text-white">
                <img src={Gossip} alt="Gossip" className="h-[200px]" />
                <p className="text-center w-[40%]">
                    Gossip is a real-time chat application built using React,
                    Tailwind CSS, and Firebase
                </p>
                <GoogleButton />
            </div>
            <div className="relative aspect-auto w-[55%]">
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black to-transparent" />
                <img
                    src={BG}
                    alt="bgimage"
                    loading="lazy"
                    className="h-[100%] w-[100%] object-fill"
                />
            </div>
        </div>
    );
};

export default Signin;
