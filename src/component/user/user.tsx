import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import SearchIcon from '../../assets/main/search.svg';
import { UserData } from "./interface/user";
import { useState } from "react";

export const User = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [email, setEmail] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchUser = async () => {
        setLoading(true);
        const q = query(collection(db, "candidates"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        const userList: UserData[] = [];
        querySnapshot.forEach((doc) => {
            userList.push(doc.data() as UserData);
        });
        if (userList.length > 0) {
            setUser(userList[0]);
        } else {
            setUser(null);
        }
        setSearchQuery(true);
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-xl mb-4 mx-5">Chat</h2>
            <div className='flex flex-col items-start justify-start'>
                <div className='my-4 mx-2 relative w-[75%]'>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-[35px] h-[40px] rounded-xl bg-white placeholder:text-black placeholder:text-[14px]"
                        placeholder="Search user"
                    />
                    <img onClick={fetchUser}
                        src={SearchIcon}
                        alt="search icon"
                        className="absolute top-1/2 transform -translate-y-1/2 left-2 w-5 h-5 text-gray-500"
                        aria-hidden="true"
                    />
                </div>
            </div>
            <div className="container">
                {!loading ? (
                    searchQuery ? (
                        user ? (
                            <div onClick={() => console.log(`user - ${user.userId}`)} className="text-gray-600 px-5 py-4 w-[36%] bg-blue-300 rounded-md mb-5">
                                {user.displayName}
                            </div>
                        ) : (
                            <div className="text-gray-600 px-4 py-3 mb-5">user not found</div>
                        )
                    ) : (
                        <div className="text-gray-600 px-4 py-3 mb-5">
                            search for user
                        </div>
                    )
                ) : (
                    <div className="text-gray-600 px-4 py-3 mb-5">
                        <div className="flex items-start space-x-4">
                            <div className="bg-gray-300 h-12 w-20 rounded-full animate-pulse"></div>
                            <div className="bg-gray-300 h-12 rounded animate-pulse w-[20%]"></div>
                        </div>
                    </div>
                )
                }
            </div>
        </div>

    );
};
