import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3soWse3iz1DxiEGfICC3UrEZHr71UE8A",
  authDomain: "gossip-gossip.firebaseapp.com",
  projectId: "gossip-gossip",
  storageBucket: "gossip-gossip.appspot.com",
  messagingSenderId: "32536139861",
  appId: "1:32536139861:web:cac40dcfca6539664b5cdc",
  measurementId: "G-PFBTCGDLS3"
};

initializeApp(firebaseConfig);
const auth = getAuth();

const provider = new GoogleAuthProvider();

export {auth, provider};
