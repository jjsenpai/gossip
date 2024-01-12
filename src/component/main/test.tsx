import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export const Test = () => {
  const fetchPost = async () => {
    await getDocs(collection(db, "test")).then((querySnapshot) => {
      console.log(querySnapshot);
    });
  };

  return (
    <div>
      Test
      <button onClick={fetchPost} className="border bg-green-500 p-4">
        CLICK ME!!
      </button>
    </div>
  );
};
