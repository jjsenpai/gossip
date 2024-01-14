import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged} from "firebase/auth";
import { addDoc, collection, getDocs, getFirestore, query, Timestamp, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3soWse3iz1DxiEGfICC3UrEZHr71UE8A",
  authDomain: "gossip-gossip.firebaseapp.com",
  projectId: "gossip-gossip",
  storageBucket: "gossip-gossip.appspot.com",
  messagingSenderId: "32536139861",
  appId: "1:32536139861:web:cac40dcfca6539664b5cdc",
  measurementId: "G-PFBTCGDLS3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export {auth, provider};

export const createCandidateDocument = async (user) => {
  const { uid, displayName, email } = user;
  const candidatesCollection = collection(db, "candidates");

  try {
    const querySnapshot = await getDocs(
      query(candidatesCollection, where("userId", "==", uid))
    );

    if (querySnapshot.empty) {
      await addDoc(candidatesCollection, {
        userId: uid,
        displayName,
        email,
        createdOn: Timestamp.fromDate(new Date()),
      });
      console.log("New candidate document created for user:", uid);
    } else {
      console.log("Candidate document already exists for user:", uid);
    }
  } catch (error) {
    console.error("Error creating or checking candidate document:", error);
  }
};