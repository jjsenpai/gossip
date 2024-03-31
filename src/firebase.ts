import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
import { addDoc, collection, getDocs, getFirestore, query, Timestamp, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID,
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
        rooms: null,
      });
      console.log("New candidate document created for user:", uid);
    } else {
      console.log("Candidate document already exists for user:", uid);
    }
  } catch (error) {
    console.error("Error creating or checking candidate document:", error);
  }
};