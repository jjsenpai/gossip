import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import {useEffect, useState } from "react";

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
            <h2 className="text-xl mb-4">Users - search users</h2>
            <div className='flex flex-col items-start justify-start'>
                <div className='my-4 mx-2'>
                    <input type="text" value={query} onChange={(e)=>setQuery(e.target.value)} className="px-2 py-2 rounded-md bg-white" placeholder="search user" />
                </div>
                {(query.length!=0 ? users.filter(user=>user.displayName.startsWith(query)):users).map((user, index) => (
                    <div onClick={() => console.log(`user - ${user.userId}`)} className="text-gray-600 px-3 py-3 bg-blue-300 rounded-md mb-5" key={user.id}>
                        {index + 1} - {user.displayName}
                    </div>
                ))}
            </div>
        </div>
    );
};
