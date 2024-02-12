import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import SearchIcon from '../../assets/main/search.svg';

export const User = () => {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState('');

    const fetchUser = async () => {
        const usersSnapshot = await getDocs(collection(db, "candidates"));
        const userList = [];
        usersSnapshot.forEach((doc) => {
            userList.push({ id: doc.id, ...doc.data() });
        });
        console.log(userList);
        setUsers(userList);
    };
    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div>
            <h2 className="text-xl mb-4 mx-5">Chat</h2>
            <div className='flex flex-col items-start justify-start'>
                <div className='my-4 mx-2 relative'>
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-[35px] h-[40px] rounded-xl bg-white placeholder:text-black placeholder:text-[14px]" placeholder="search user" />
                    <img
                        src={SearchIcon}
                        alt="search icon"
                        className="absolute top-1/2 transform -translate-y-1/2 left-2 w-5 h-5 text-gray-500"
                        aria-hidden="true"
                    />
                </div>
                {(query.length != 0 ? users.filter(user => user.displayName.toLowerCase().startsWith(query.toLowerCase())) : users).map((user, index) => (
                    <div onClick={() => console.log(`user - ${user.userId}`)} className="text-gray-600 px-4 py-3 bg-blue-300 rounded-md mb-5" key={user.id}>
                        {index + 1} - {user.displayName}
                    </div>
                ))}
            </div>
        </div>
    );
};
