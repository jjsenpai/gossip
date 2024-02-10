import GoogleButton from "../component/google-button";
import TestSocket from "../component/main/testsocket";
import BG from "/src/assets/signin/signinbg.jpg";

const Signin = () => {
  return (
    <div className="h-[100vh] w-[100vw] flex">
      {/* <TestSocket /> for testing */}
      <div className="w-[45%] text-center flex flex-col items-center justify-center bg-black text-white relative">
        <p>Signin</p>
        <GoogleButton />
      </div>
      <div className="w-[55%] aspect-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />
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
