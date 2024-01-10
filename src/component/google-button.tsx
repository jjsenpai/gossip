import { useAuth } from "../contexts/authContext";
import { useEffect } from "react";
import { GoogleAuthProvider } from "firebase/auth";

type ResponseObject = {
  clientId: string;
  client_id: string;
  credential: string;
};

const GoogleButton = () => {
  const auth = useAuth();

  function handleCallBackResponse(response: ResponseObject) {
    console.log(response);
    if (response) {
      const cred = GoogleAuthProvider.credential(response.credential);
      if (auth.loginWithToken) {
        auth.loginWithToken(cred);
      }
    }
  }
  useEffect(() => {
    const google = window["google"];
    google.accounts.id.initialize({
      client_id:
        "32536139861-r8ujabrn0a8ma2hjnd80it8da5qmsb5i.apps.googleusercontent.com",
      callback: handleCallBackResponse,
      cancel_on_tap_outside: false,
    });
    google.accounts.id.renderButton(document.getElementById("signInDiv"), {
      theme: "outline",
      size: "large",
    });
    google.accounts.id.prompt();
  }, []);

  // useGoogleOneTapLogin({
  //   onSuccess: (response: IGoogleEndPointResponse) => {
  //     console.log(response);
  //     if (auth.loginWithToken) {
  //       auth.loginWithToken(response.sub);
  //     }
  //   },
  //   onError: (response: string | Error | undefined) => console.log(response),
  //   googleAccountConfigs: {
  //     client_id:
  //       "32536139861-r8ujabrn0a8ma2hjnd80it8da5qmsb5i.apps.googleusercontent.com",
  //   },
  // });
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

export default GoogleButton;
