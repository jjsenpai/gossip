import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
import { addDoc, collection, getFirestore, query, Timestamp, where, doc, getDoc, getDocs } from "firebase/firestore";
import { messageType, roomDetailsType, userType, useStore } from './store'

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
  console.log(user);
  const { uid, displayName, email, photoURL } = user;
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
        roomsJoined: [],
        photo: photoURL,
      });
      console.log("New candidate document created for user:", uid);
    } else {
      console.log("Candidate document already exists for user:", uid);
    }

    querySnapshot.forEach(async (doc) => {
      const userData = doc.data();
      const userDetails : userType = {
        userId: userData.userId,
        displayName: userData.displayName,
        email: userData.email,
        createdOn: userData.createdOn.toDate(),
        roomsJoined: userData.roomsJoined || [],
        photo: photoURL,
      };

      useStore.getState().setUserDetails(userDetails);
    });
    const {userDetails} = useStore.getState();
    const roomDetailsPara: roomDetailsType[] = [];

    userDetails.roomsJoined.forEach(async roomId => {
      const document = doc(db, "rooms", roomId);
      const docSnapshot = await getDoc(document);
      const msgSnapshot = await getDocs(collection(db,"rooms",roomId,"messageList"));
      const singleRoomDetail : roomDetailsType ={users:[], messages:[]};
      const msgList = [];
      msgSnapshot.forEach((msgItem)=>{
        const singleMessage : messageType = {
          sentBy: msgItem.data().sentBy,
          timeStamp: msgItem.data().timeStamp,
          message: msgItem.data().message,
          messageId: msgItem.id
        }
        msgList.push(singleMessage);
      })
      singleRoomDetail.users = docSnapshot.data().users;
      singleRoomDetail.messages = msgList;
      singleRoomDetail.roomId = docSnapshot.id;
      roomDetailsPara.push(singleRoomDetail);
    });

    useStore.getState().setRoomDetails(roomDetailsPara);
  } catch (error) {
    console.error("Error creating or checking candidate document:", error);
  }
};
